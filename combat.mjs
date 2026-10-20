// Browser rules derived from installed weapon data and the Source game rules.
export const UTILITY={
 smoke:{label:'Smoke Grenade',icon:'smokegrenade',price:300,max:1,radius:4.2164,duration:18,fuse:1.5},
 flash:{label:'Flashbang',icon:'flashbang',price:200,max:2,fuse:1.5},
 he:{label:'HE Grenade',icon:'hegrenade',price:300,max:1,fuse:1.5,radius:8.89},
 molotov:{label:'Molotov',icon:'molotov',price:400,max:1,fuse:2,radius:3.81,duration:7,dps:40}
};
export function segmentSphere(a,b,c,r){const x=b.x-a.x,y=b.y-a.y,z=b.z-a.z,l=x*x+y*y+z*z,t=Math.max(0,Math.min(1,((c.x-a.x)*x+(c.y-a.y)*y+(c.z-a.z)*z)/(l||1)));return Math.hypot(a.x+x*t-c.x,a.y+y*t-c.y,a.z+z*t-c.z)<r;}
export function flashExposure(distance,facing){const strength=3*Math.max(0,1-distance/(3000*.0254)),[hold,fade]=facing>=.6?[1.25,2.5]:facing>=.3?[.8,1.75]:facing>=-.2?[.5,1]:[.25,.5],duration=fade*strength/1.4,solid=Math.min(duration,hold*strength*.45);return {hold:solid,fade:duration-solid,strength:strength>0?1:0};}
export function heDamage(distance){const radius=350*.0254;return distance>=radius?0:99*Math.exp(-distance*distance/(2*Math.pow(radius/3,2)));}
export function grenadeArmor(damage,armor){if(!armor)return {damage,absorbed:0};const reduced=damage*.6,cost=(damage-reduced)*.5,absorbed=Math.min(armor,cost);return {damage:damage-absorbed*2,absorbed};}
export function lossIncome(level,planted=false){return 1400+Math.min(4,Math.max(0,level))*500+(planted?600:0);}
export function tagVelocity(value,factor){return Math.min(value,Math.max(.1,Math.min(1,factor)));}
export function applyTag(stack,heldSpeed,large=.4,small=.55){const units=heldSpeed/.0254,next=Math.min(large,stack*small),scale=Math.max(.15,(units-120)/130)*.8+.08,cap=Math.max(.2,(Math.min(1,(units-80)/170)*1.2-.08)/4);return {stack:next,modifier:Math.max(cap,next*scale)};}
export function hitGroup(mesh,face,point,three){
 // The hit triangle's skinning weights identify the actual body region, even
 // when a model is crouched, turning or aiming; height alone cannot do this.
 if(mesh.isSkinnedMesh&&face&&mesh.geometry.attributes.skinIndex){const joints=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight,scores=new Map();const v=new three.Vector3();for(const index of [face.a,face.b,face.c]){mesh.getVertexPosition(index,v);v.applyMatrix4(mesh.matrixWorld);const contribution=1/Math.max(.005,v.distanceTo(point));for(let k=0;k<4;k++){const bone=mesh.skeleton.bones[joints.getComponent(index,k)],weight=weights.getComponent(index,k)*contribution;if(bone)scores.set(bone.name,(scores.get(bone.name)||0)+weight);}}const name=[...scores].sort((a,b)=>b[1]-a[1])[0]?.[0]||'';if(/head|neck|eye/i.test(name))return 'head';if(/leg|foot|ankle|ball_/i.test(name))return 'leg';if(/pelvis|spine_0/i.test(name))return 'stomach';return 'body';}return 'body';
}

UTILITY.decoy={label:"Decoy Grenade",icon:"decoy",price:50,max:1,fuse:2,duration:15};UTILITY.incendiary={...UTILITY.molotov,label:"Incendiary Grenade",icon:"incgrenade",price:500,duration:5.5,radius:2.794};
