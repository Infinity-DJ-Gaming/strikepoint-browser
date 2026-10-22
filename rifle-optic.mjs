import * as T from 'three';
const opticalWindow={value:0},resolution={value:new T.Vector2()};
// Move the existing animated native rifle mesh onto its optical axis. The glass
// material alone is hidden so the scene remains visible through the actual ring.
export function updateRifleOptic(viewRoot,gun,camera,enabled,renderer){
 opticalWindow.value=enabled?1:0;resolution.value.set(renderer.domElement.width,renderer.domElement.height);
 if(!gun?.root)return;
 const lenses=[];gun.root.traverse(o=>{if(o.isMesh&&(Array.isArray(o.material)?o.material:[o.material]).some(m=>/lens/i.test(m.name)))lenses.push(o)});
 for(const mesh of lenses)mesh.visible=!enabled;
 viewRoot.rotation.set(0,Math.PI,0);
 if(!enabled||!lenses.length)return;
 // Source's optic stencil exposes the world through the rear lens rather than
 // drawing the inside of the barrel as a narrowing tunnel.
 gun.root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.rifleOpticWindow)continue;m.userData.rifleOpticWindow=true;const previous=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(shader,...args){previous.call(this,shader,...args);shader.uniforms.csOpticWindow=opticalWindow;shader.uniforms.csOpticResolution=resolution;shader.fragmentShader='uniform float csOpticWindow;uniform vec2 csOpticResolution;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('void main() {','void main() { if(csOpticWindow>.5 && distance(gl_FragCoord.xy,csOpticResolution*.5)<csOpticResolution.y*.255)discard;');};m.customProgramCacheKey=()=>key()+'-rifle-optical-window';m.needsUpdate=true;}});
 viewRoot.updateMatrixWorld(true);const points=[];let axis=new T.Vector3(0,0,-1),largest=0;
 for(const mesh of lenses){if(mesh.isSkinnedMesh)mesh.skeleton.update();const a=mesh.geometry.attributes.position,local=[];for(let i=0;i<a.count;i++)local.push(mesh.getVertexPosition(i,new T.Vector3()).applyMatrix4(mesh.matrixWorld));points.push(...local);const index=mesh.geometry.index;
  for(let i=0;i<(index?.count||a.count);i+=3){const v=j=>local[index?index.getX(j):j],normal=v(i+1).clone().sub(v(i)).cross(v(i+2).clone().sub(v(i))),area=normal.lengthSq();if(area>largest){largest=area;axis.copy(normal).normalize();}}
 }
 if(axis.z>0)axis.negate();const bounds=new T.Box3().setFromPoints(points),extent=bounds.getSize(new T.Vector3()),eye=bounds.getCenter(new T.Vector3());
 const align=new T.Quaternion().setFromUnitVectors(axis,new T.Vector3(0,0,-1));viewRoot.quaternion.premultiply(align);
 const rotatedEye=eye.clone().sub(viewRoot.position).applyQuaternion(align).add(viewRoot.position),radius=Math.max(.008,Math.min(extent.x,extent.y)*.5),distance=radius/(Math.tan(camera.fov*Math.PI/360)*.59);
 viewRoot.position.add(new T.Vector3(-rotatedEye.x,-rotatedEye.y,-distance-rotatedEye.z));viewRoot.updateMatrixWorld(true);
}
