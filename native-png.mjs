// Decode packed native material pixels without Canvas' alpha premultiplication.
// Exported Source 2 PNGs use noninterlaced 8-bit gray/RGB/gray-alpha/RGBA.
export async function decodeNativePNG(buffer){
 const bytes=new Uint8Array(buffer),view=new DataView(buffer);
 if(view.getUint32(0)!==0x89504e47||view.getUint32(4)!==0x0d0a1a0a)throw Error('Invalid native PNG');
 let width,height,type,channels,parts=[];
 for(let p=8;p<bytes.length;){const size=view.getUint32(p),tag=String.fromCharCode(...bytes.subarray(p+4,p+8)),start=p+8;
  if(tag==='IHDR'){width=view.getUint32(start);height=view.getUint32(start+4);type=bytes[start+9];channels=({0:1,2:3,4:2,6:4})[type];if(bytes[start+8]!==8||!channels||bytes[start+12]!==0)throw Error('Unsupported native PNG encoding');if(width*height>67108864)throw Error('Native texture exceeds supported size');}
  if(tag==='IDAT')parts.push(bytes.slice(start,start+size));p=start+size+4;if(tag==='IEND')break;
 }
 const stream=new Blob(parts).stream().pipeThrough(new DecompressionStream('deflate')),raw=new Uint8Array(await new Response(stream).arrayBuffer()),stride=width*channels,pixels=new Uint8Array(stride*height);
 if(raw.length!==(stride+1)*height)throw Error('Incomplete native PNG');
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 for(let y=0;y<height;y++){const f=raw[y*(stride+1)],row=y*stride;if(f>4)throw Error('Invalid PNG filter');for(let x=0;x<stride;x++){const a=x>=channels?pixels[row+x-channels]:0,b=y?pixels[row+x-stride]:0,c=y&&x>=channels?pixels[row+x-stride-channels]:0;pixels[row+x]=(raw[y*(stride+1)+1+x]+(f===1?a:f===2?b:f===3?Math.floor((a+b)/2):f===4?paeth(a,b,c):0))&255;}}
 const rgba=new Uint8Array(width*height*4);for(let i=0,j=0;i<pixels.length;i+=channels,j+=4){rgba[j]=pixels[i];rgba[j+1]=channels<3?pixels[i]:pixels[i+1];rgba[j+2]=channels<3?pixels[i]:pixels[i+2];rgba[j+3]=type===4?pixels[i+1]:type===6?pixels[i+3]:255;}
 return {data:rgba,width,height};
}
