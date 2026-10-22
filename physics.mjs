import * as T from 'three';

// Continuous separating-axis test for an axis-aligned player hull and a triangle.
// Sweeping the hull avoids tunnelling; this uses the game's exported collision mesh.
export function sweepTriangle(center,half,delta,a,b,c){
 const edges=[b.clone().sub(a),c.clone().sub(b),a.clone().sub(c)];
 const axes=[new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1),edges[0].clone().cross(edges[1])];
 for(const edge of edges)for(const axis of [new T.Vector3(1,0,0),new T.Vector3(0,1,0),new T.Vector3(0,0,1)])axes.push(edge.clone().cross(axis));
 let enter=-Infinity,exit=Infinity,normal=null;
 for(const axis of axes){if(axis.lengthSq()<1e-12)continue;axis.normalize();const values=[a.dot(axis),b.dot(axis),c.dot(axis)],min=Math.min(...values),max=Math.max(...values),radius=Math.abs(axis.x)*half.x+Math.abs(axis.y)*half.y+Math.abs(axis.z)*half.z,origin=center.dot(axis),speed=delta.dot(axis);
  if(Math.abs(speed)<1e-10){if(origin+radius<min-1e-7||origin-radius>max+1e-7)return null;continue;}
  let near=(min-radius-origin)/speed,far=(max+radius-origin)/speed;if(near>far)[near,far]=[far,near];
  if(near>enter){enter=near;normal=axis.clone().multiplyScalar(speed>0?-1:1);}exit=Math.min(exit,far);if(enter>exit+1e-8)return null;
 }
 if(!normal||enter<-.0001||exit<0||enter>1)return null;
 return {fraction:Math.max(0,enter),normal};
}

export class HullWorld{
 constructor(root){this.meshes=[];root.updateMatrixWorld(true);root.traverse(o=>{if(o.isMesh&&o.visible){const materials=Array.isArray(o.material)?o.material:[o.material];if(materials.some(m=>m.transparent||/foliage|grass|weed|decal|spray|glass|sky|effect|lightshaft|dust_00|trigger|nav_attribute|cs_place/i.test(m.name)))return;const g=o.geometry.clone(),position=o.geometry.attributes.position,array=new Float32Array(position.count*3),v=new T.Vector3();for(let i=0;i<position.count;i++){v.fromBufferAttribute(position,i).applyMatrix4(o.matrixWorld);array[i*3]=v.x;array[i*3+1]=v.y;array[i*3+2]=v.z;}g.setAttribute('position',new T.BufferAttribute(array,3));g.computeBoundsTree({maxLeafTris:12});g.computeBoundingBox();this.meshes.push(g);}});}
 trace(feet,delta,height=72*.0254,radius=16*.0254){
  const half=new T.Vector3(radius,height/2,radius),center=new T.Vector3(feet.x,feet.y+height/2,feet.z),move=new T.Vector3(delta.x,delta.y,delta.z),box=new T.Box3().setFromCenterAndSize(center,half.clone().multiplyScalar(2));box.union(new T.Box3().setFromCenterAndSize(center.clone().add(move),half.clone().multiplyScalar(2))).expandByScalar(.002);
  let result={fraction:1,normal:null};
  for(const geometry of this.meshes){if(!box.intersectsBox(geometry.boundingBox))continue;geometry.boundsTree.shapecast({intersectsBounds:b=>box.intersectsBox(b),intersectsTriangle:tri=>{const hit=sweepTriangle(center,half,move,tri.a,tri.b,tri.c);if(hit&&hit.fraction<result.fraction)result=hit;return false;}});}
  return result;
 }
 slide(position,velocity,dt,height){
  const p={...position},v={...velocity};let left=dt,grounded=false,blocked=false;const planes=[];
  for(let bump=0;bump<4&&left>1e-6;bump++){
   const delta={x:v.x*left,y:v.y*left,z:v.z*left},hit=this.trace(p,delta,height),len=Math.hypot(delta.x,delta.y,delta.z),fraction=Math.max(0,hit.fraction-(hit.normal?.001/(len||1):0));
   p.x+=delta.x*fraction;p.y+=delta.y*fraction;p.z+=delta.z*fraction;if(!hit.normal)break;
   blocked=true;left*=1-hit.fraction;if(hit.normal.y>.7)grounded=true;planes.push(hit.normal);
   for(const n of planes){const into=v.x*n.x+v.y*n.y+v.z*n.z;if(into<0){v.x-=n.x*into;v.y-=n.y*into;v.z-=n.z*into;}}
  }
  return {position:p,velocity:v,grounded,blocked};
 }
 move(position,velocity,dt,height,onGround){
  const direct=this.slide(position,velocity,dt,height);let result=direct;
  if(onGround&&direct.blocked&&Math.hypot(velocity.x,velocity.z)>.01){
   const up=this.trace(position,{x:0,y:18*.0254,z:0},height);
   if(up.fraction>.99){const elevated={...position,y:position.y+18*.0254},stepped=this.slide(elevated,{...velocity,y:0},dt,height),down=this.trace(stepped.position,{x:0,y:-18*.0254-.05,z:0},height);
    if(down.normal?.y>.7){stepped.position.y-=(18*.0254+.05)*down.fraction;stepped.velocity.y=0;stepped.grounded=true;
     if(Math.hypot(stepped.position.x-position.x,stepped.position.z-position.z)>Math.hypot(direct.position.x-position.x,direct.position.z-position.z)+.0001)result=stepped;}
   }
  }
  if(velocity.y<=0){const down=this.trace(result.position,{x:0,y:onGround?-.05:-.025,z:0},height);if(down.normal?.y>.7){result.position.y-=Math.max(0,down.fraction*(onGround?.05:.025)-.001);result.velocity.y=0;result.grounded=true;}}
  Object.assign(position,result.position);Object.assign(velocity,result.velocity);return result;
 }
}
