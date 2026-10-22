import * as T from 'three';
// Analytic ice veins stay sharp at every zoom level and need no raster upscaling.
// Native UVs, surface normals, receiver details and substrate remain intact.
export function applyBlackIce(root,item={}){
 root.traverse(mesh=>{if(!mesh.isMesh)return;if(!mesh.userData.originalFinishMaterials)mesh.userData.originalFinishMaterials=mesh.material;const original=mesh.userData.originalFinishMaterials,owned=[];
  const list=(Array.isArray(original)?original:[original]).map(source=>{
   if(source.transparent||/bare_arm|sleeve|sticker|scope|glass|lens/i.test(source.name))return source;
   const mat=source.clone();owned.push(mat);mat.color.set(0xffffff);mat.roughness=.45;mat.metalness=.12;mat.roughnessMap=null;mat.metalnessMap=null;mat.envMapIntensity=.4;
   mat.onBeforeCompile=shader=>{
    shader.uniforms.iceWear={value:T.MathUtils.clamp(item.wear||0,0,1)};
    shader.vertexShader='varying vec3 icePosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nicePosition=position;');
    shader.fragmentShader=`varying vec3 icePosition;uniform float iceWear;
vec2 iceHash(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float iceNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(iceHash(i).x,iceHash(i+vec2(1,0)).x,f.x),mix(iceHash(i+vec2(0,1)).x,iceHash(i+vec2(1,1)).x,f.x),f.y);}
vec2 iceCells(vec2 p){vec2 cell=floor(p),f=fract(p);float a=10.0,b=10.0;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 n=vec2(float(x),float(y));vec2 d=n+iceHash(cell+n)-f;float r=dot(d,d);if(r<a){b=a;a=r;}else if(r<b)b=r;}return vec2(sqrt(a),sqrt(b)-sqrt(a));}
`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
vec3 stockColor=diffuseColor.rgb;vec2 ip=icePosition.xy*35.0+icePosition.zy*11.0;
float cloud=iceNoise(ip*.7)*.6+iceNoise(ip*2.1)*.3+iceNoise(ip*6.0)*.1;
vec2 cell=iceCells(ip+vec2(iceNoise(ip*1.3),iceNoise(ip*1.3+8.0))*.7);
float fine=iceCells(ip*3.6).y;float vein=1.0-smoothstep(.008,.045,cell.y),hairline=(1.0-smoothstep(.003,.014,fine))*.42;
vec3 ice=mix(vec3(.003,.012,.018),vec3(.008,.085,.115),smoothstep(.32,.72,cloud));
float frost=smoothstep(.58,.83,iceNoise(ip*.27+5.0));ice=mix(ice,vec3(.24,.46,.52),frost*.52);ice=mix(ice,vec3(.36,.68,.75),max(vein*.8,hairline));
// Preserve dark steel (magazine, barrel and controls) using original substrate chroma.
float warm=max(stockColor.r-stockColor.b,0.0);float body=1.0-smoothstep(.75,.86,abs(icePosition.z));
body=clamp(body,0.0,1.0);float scratches=smoothstep(.66,.88,iceNoise(ip*19.0))*iceWear*.8;
diffuseColor.rgb=mix(stockColor,ice*mix(.6,1.0,stockColor.r*1.2+.5),body*(1.0-scratches));`);
   };mat.customProgramCacheKey=()=> 'strikepoint-black-ice-v9';mat.needsUpdate=true;return mat;
  });mesh.material=Array.isArray(original)?list:list[0];mesh.userData.ownedFinishMaterials=owned;mesh.userData.finishApplied=owned.length>0;
 });
}
