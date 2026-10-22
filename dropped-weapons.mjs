import * as T from 'three';

// Small swept rigid props use the same exported map collision as the player.
// A conservative box bounds the rotating mesh; 128 Hz sweeps prevent tunnelling.
const tick=1/128,gravity=20.32,skin=.003;
export function createDropBody(root,velocity={x:0,y:0,z:0},spin={x:2,y:3,z:1}){
 const rotation=root.quaternion.clone();root.quaternion.identity();root.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(root),center=box.getCenter(new T.Vector3()),half=box.getSize(new T.Vector3()).multiplyScalar(.5);
 // Recenter the visual so the collision body and its rotations share an origin.
 const offset=root.worldToLocal(center.clone());for(const child of root.children)child.position.sub(offset);
 root.position.copy(center);root.quaternion.copy(rotation);root.updateMatrixWorld(true);
 return {velocity:{...velocity},spin:{...spin},half:new T.Vector3(Math.max(.025,half.x),Math.max(.025,half.y),Math.max(.025,half.z)),accum:0,quiet:0,sleeping:false,bounces:0,age:0,landing:new T.Quaternion().setFromUnitVectors(half.x<half.y&&half.x<half.z?new T.Vector3(1,0,0):half.z<half.y?new T.Vector3(0,0,1):new T.Vector3(0,1,0),new T.Vector3(0,1,0))};
}
export function stepDrop(item,world,dt,onImpact=()=>{}){
 const b=item.body;if(!b||b.sleeping)return;
 b.accum+=Math.min(.25,Math.max(0,dt));
 while(b.accum>=tick){b.accum-=tick;b.age+=tick;const v=b.velocity;
  v.y-=gravity*tick;
  const m=new T.Matrix4().makeRotationFromQuaternion(item.root.quaternion).elements,h=b.half;
  const extents=new T.Vector3(Math.abs(m[0])*h.x+Math.abs(m[4])*h.y+Math.abs(m[8])*h.z,Math.abs(m[1])*h.x+Math.abs(m[5])*h.y+Math.abs(m[9])*h.z,Math.abs(m[2])*h.x+Math.abs(m[6])*h.y+Math.abs(m[10])*h.z),radius=Math.max(extents.x,extents.z),height=extents.y*2;
  let left=tick,contact=false;
  for(let bump=0;bump<4&&left>1e-6;bump++){
   const delta={x:v.x*left,y:v.y*left,z:v.z*left},feet={x:item.root.position.x,y:item.root.position.y-extents.y,z:item.root.position.z},hit=world.trace(feet,delta,height,radius,extents);
   const length=Math.hypot(delta.x,delta.y,delta.z),fraction=Math.max(0,hit.fraction-(hit.normal?skin/Math.max(length,.001):0));
   item.root.position.x+=delta.x*fraction;item.root.position.y+=delta.y*fraction;item.root.position.z+=delta.z*fraction;
   if(!hit.normal)break;
   const n=hit.normal,into=v.x*n.x+v.y*n.y+v.z*n.z;
   item.root.position.addScaledVector(n,skin);left*=1-hit.fraction;
   if(into<0){const impact=-into,restitution=impact>1?.28:0;v.x-=(1+restitution)*into*n.x;v.y-=(1+restitution)*into*n.y;v.z-=(1+restitution)*into*n.z;
    const normalSpeed=v.x*n.x+v.y*n.y+v.z*n.z,friction=n.y>.55?.65:.87;v.x=normalSpeed*n.x+(v.x-normalSpeed*n.x)*friction;v.y=normalSpeed*n.y+(v.y-normalSpeed*n.y)*friction;v.z=normalSpeed*n.z+(v.z-normalSpeed*n.z)*friction;
    b.spin.x*=.62;b.spin.y*=.73;b.spin.z*=.62;if(impact>1.1){b.bounces++;onImpact(item,impact);}
   }if(n.y>.55)contact=true;
  }
  if(Math.abs(v.y)<.3){const support=world.trace({x:item.root.position.x,y:item.root.position.y-extents.y,z:item.root.position.z},{x:0,y:-.012,z:0},height,radius,extents);if(support.normal?.y>.55){contact=true;v.y=0;item.root.position.y-=Math.max(0,.012*support.fraction-skin);v.x*=Math.exp(-7*tick);v.z*=Math.exp(-7*tick);}}
  if(contact){item.root.quaternion.slerp(b.landing,Math.min(1,9*tick));}else{item.root.rotateX(b.spin.x*tick);item.root.rotateY(b.spin.y*tick);item.root.rotateZ(b.spin.z*tick);}
  const e=new T.Matrix4().makeRotationFromQuaternion(item.root.quaternion).elements,newY=Math.abs(e[1])*h.x+Math.abs(e[5])*h.y+Math.abs(e[9])*h.z;
  if(contact)item.root.position.y+=newY-extents.y;
  else if(newY>extents.y){const growth=newY-extents.y,rotationHit=world.trace({x:item.root.position.x,y:item.root.position.y-extents.y,z:item.root.position.z},{x:0,y:-growth,z:0},height,radius,extents);if(rotationHit.normal?.y>.55){item.root.position.y+=growth*(1-rotationHit.fraction)+skin;if(v.y<0){const impact=-v.y;v.y=impact*.28;if(impact>1.1){b.bounces++;onImpact(item,impact);}}}}
  const drag=Math.exp(-(contact?8:.12)*tick);for(const axis of ['x','y','z'])b.spin[axis]*=drag;
  if(contact&&Math.hypot(v.x,v.y,v.z)<.18&&Math.hypot(b.spin.x,b.spin.y,b.spin.z)<.45)b.quiet+=tick;else b.quiet=0;
  if(b.quiet>.35){b.sleeping=true;v.x=v.y=v.z=0;b.spin.x=b.spin.y=b.spin.z=0;}
  item.x=item.root.position.x;item.y=item.root.position.y;item.z=item.root.position.z;
 }
}
export function disposeDrop(item){item.root.removeFromParent();item.root.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
