import {ARSENAL} from './arsenal-data.mjs?v=20261020-6';
import {nativeWeapons} from './weapon-data.mjs?v=20261020-6';
export const UNIT=.0254;
export const MOVEMENT={gravity:800*UNIT,jumpImpulse:301.993377*UNIT,friction:5.2,stopSpeed:80*UNIT,accelerate:5.5,airAccelerate:12,airCap:30*UNIT,step:18*UNIT,height:72*UNIT,crouchHeight:54*UNIT,radius:16*UNIT,eye:64*UNIT,crouchEye:46*UNIT};
export const WEAPONS={};
for(const [key,n] of Object.entries(ARSENAL)){const convert=a=>({...a,maxSpeed:(a.maxSpeed??n.maxSpeed)*UNIT});WEAPONS[key]={...n,reserve:n.reserveClips,maxSpeed:n.maxSpeed*UNIT,scopedSpeed:n.scopedSpeed*UNIT,range:n.range*UNIT,alternate:convert(n.alternate||{}),singleReload:['nova','xm1014','sawedoff'].includes(key)};}
WEAPONS.knife={label:'Knife',animKey:'default_t',icon:'knife',slot:'knife',clip:0,reserve:0,damage:40,cycle:.4,reload:0,deploy:1,maxSpeed:250*UNIT,spread:0,stand:0,crouch:0,moving:0,automatic:false,range:48*UNIT,armorRatio:1.7,headshot:1,rangeModifier:1};
WEAPONS.c4={...WEAPONS.knife,label:'C4 Explosive',animKey:'c4',icon:'c4',slot:'bomb',maxSpeed:250*UNIT};
WEAPONS.smoke={...WEAPONS.knife,label:'Smoke Grenade',animKey:'smoke',icon:'smokegrenade',slot:'grenade',maxSpeed:245*UNIT};
export const SITES=[{name:'A',x:62.992,y:2.44,z:28.2448,r:4},{name:'B',x:68.072,y:0,z:-39.0144,r:4.8}];
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

// Source ground dot-product acceleration and friction, in metres/second.
// Walking and crouching use their native speed multipliers.
export function accelerate(v,wish,maxSpeed,dt,{walk=false,crouch=false,onGround=true,verticalSpeed=0}={}){
 const modifier=crouch?.34:walk?.52:1,wishSpeed=maxSpeed*modifier;
 if(onGround){const speed=Math.hypot(v.x,v.z);if(speed){const next=Math.max(0,speed-Math.max(speed,MOVEMENT.stopSpeed)*MOVEMENT.friction*dt);v.x*=next/speed;v.z*=next/speed;}}
 if(!wish.x&&!wish.z)return;
 const projected=v.x*wish.x+v.z*wish.z;
 const cap=onGround?wishSpeed:Math.min(wishSpeed,MOVEMENT.airCap),add=cap-projected;
 if(add<=0)return;
 const surface= !onGround&&verticalSpeed>0&&verticalSpeed<140*UNIT?.25:1;
 const scale=onGround?(crouch||walk?250*UNIT*modifier:maxSpeed):wishSpeed;
 const amount=Math.min(add,(onGround?MOVEMENT.accelerate:MOVEMENT.airAccelerate)*scale*dt*surface);
 v.x+=wish.x*amount;v.z+=wish.z*amount;
}

export function inaccuracy(w,{speed=0,crouch=false,walk=false,air=false,verticalSpeed=0,penalty=0,scoped=false}={}){
 const base=scoped?(crouch?w.scopedCrouch:w.scopedStand):(crouch?w.crouch:w.stand);
 const max=scoped?w.scopedSpeed:w.maxSpeed;
 let move=clamp((speed-max*.34)/(max*(.95-.34)),0,1);if(!walk)move=Math.pow(move,.25);
 const airExtra=air?(w.jump??.1)+clamp((Math.sqrt(Math.abs(verticalSpeed)/UNIT)-Math.sqrt(301.993377)*.25)/(Math.sqrt(301.993377)*.75),0,2)*(w.jumpInitial??.1):0;
 return Math.min(1,(base??0)+move*(w.moving??0)+airExtra+penalty);
}

// Current CS2 magazine rule (Valve, March 18 2026): discard remaining rounds.
export function completeReload(ammo,reserve,clip){return reserve>0?{ammo:clip,reserve:reserve-1,discarded:ammo}:{ammo,reserve,discarded:0};}
export function fovFor(weapon,zoom=0){const horizontal=zoom>0&&weapon.zoomLevels?(zoom===1?weapon.zoom1:weapon.zoom2):90;return 2*Math.atan(Math.tan(horizontal*Math.PI/360)*.75)*180/Math.PI;}
export function canScope(weapon){return weapon.zoomLevels>0;}

// The same shuffled Park-Miller stream used for Source's seeded recoil table.
export class SourceRandom{
 constructor(seed){this.seed=-Math.abs(seed);this.last=0;this.shuffle=new Int32Array(32);}
 next(){let k;if(this.seed<=0||!this.last){this.seed=Math.max(1,-this.seed);for(let j=39;j>=0;j--){k=Math.trunc(this.seed/127773);this.seed=16807*(this.seed-k*127773)-2836*k;if(this.seed<0)this.seed+=2147483647;if(j<32)this.shuffle[j]=this.seed;}this.last=this.shuffle[0];}k=Math.trunc(this.seed/127773);this.seed=16807*(this.seed-k*127773)-2836*k;if(this.seed<0)this.seed+=2147483647;const i=Math.trunc(this.last/67108864);this.last=this.shuffle[i];this.shuffle[i]=this.seed;return Math.min(this.last/2147483647,1-1.2e-7);}
}
export function recoilPattern(weapon){const random=new SourceRandom(weapon.recoilSeed??1),table=[];let angle=0,magnitude=0;for(let i=0;i<64;i++){const nextAngle=(weapon.recoilAngle??0)+(random.next()*2-1)*(weapon.recoilVariance??0),nextMagnitude=(weapon.recoilMagnitude??0);random.next();angle=weapon.automatic&&i?angle*.45+nextAngle*.55:nextAngle;magnitude=weapon.automatic&&i?magnitude*.45+nextMagnitude*.55:nextMagnitude;if(weapon.automatic&&i<4)magnitude*=.75+i/4*.25;table.push({x:Math.sin(angle*Math.PI/180)*magnitude,y:Math.cos(angle*Math.PI/180)*magnitude});}return table;}

export function hitDamage(base,part,armor,ratio=1.55,headshot=4,helmet=true){let value=base*(part==='head'?headshot:part==='leg'?.75:part==='stomach'?1.25:1),absorbed=0;if(armor>0&&part!=='leg'&&(part!=='head'||helmet)){absorbed=Math.min(armor,Math.max(0,value-value*ratio*.5)*.5);value-=absorbed*2;}return {damage:value,absorbed};}
const bombTargets=[{"min": [59.334399999999995, 2.4383999999999997, 24.790399999999998], "max": [66.64959999999999, 4.876799999999999, 31.699199999999998]}, {"min": [63.398399999999995, 0.0, -43.8912], "max": [72.7456, 2.4383999999999997, -34.1376]}];
export function siteAt(p){const i=bombTargets.findIndex(b=>p.x>=b.min[0]&&p.x<=b.max[0]&&p.z>=b.min[2]&&p.z<=b.max[2]&&p.y>=b.min[1]-.15&&p.y<=b.max[1]);return i<0?undefined:SITES[i];}
export function outcome({health,alive,planted,time,bombTime,defuse,defuseLength=10}){if(planted&&defuse>=defuseLength)return {win:false,reason:'Bomb defused'};if(planted&&bombTime<=0)return {win:true,reason:'Target bombed'};if(alive===0)return {win:true,reason:'Counter-Terrorists eliminated'};if(health<=0&&!planted)return {win:false,reason:'Terrorists eliminated'};if(!planted&&time<=0)return {win:false,reason:'Time expired'};return null;}

for(const [key,label,animKey,icon,price] of [['flash','Flashbang','flashbang','flashbang',200],['he','HE Grenade','hegrenade','hegrenade',300],['molotov','Molotov','molotov','molotov',400]])WEAPONS[key]={...WEAPONS.smoke,label,animKey,icon,price};

WEAPONS.decoy={...WEAPONS.smoke,...ARSENAL.decoy,range:WEAPONS.smoke.range,maxSpeed:245*UNIT,slot:"grenade"};WEAPONS.incendiary={...WEAPONS.smoke,...ARSENAL.incendiary,range:WEAPONS.smoke.range,maxSpeed:245*UNIT,slot:"grenade"};
