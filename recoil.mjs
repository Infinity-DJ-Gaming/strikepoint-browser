import * as T from 'three';
import {NATIVE_RECOIL_PROFILES,generateRecoilTable,decayAimPunch,decayRecoilIndex,recoveryTime,SOURCE_RECOIL_DEFAULTS} from './recoil-data.mjs?v=20261022-9';
const aliases={rifle:'ak47',pistol:'deagle'},tables=new Map(),radians=Math.PI/180;
// Source-compatible punch integration. Current CS2 closed integration is not
// publicly verifiable; see RECOIL-PROVENANCE.md for the precise boundary.
export const VIEW_RECOIL_TRACKING=.45;
export function profileFor(key){return NATIVE_RECOIL_PROFILES['weapon_'+(aliases[key]||key)];}
export function nativeRecoilTable(key,mode=0){const id=key+':'+mode;if(!tables.has(id)){const profile=profileFor(key);tables.set(id,profile?generateRecoilTable(profile,{mode}):Array.from({length:64},()=>({x:0,y:0,angle:0,magnitude:0})));}return tables.get(id);}
export function createRecoil(){return {angle:{x:0,y:0},velocity:{x:0,y:0},index:0,lastShot:-100,accum:0};}
export function resetRecoil(state){Object.assign(state,createRecoil());}
export function kickRecoil(state,key,time,mode=0){const kick=nativeRecoilTable(key,mode)[Math.floor(state.index)%64];state.velocity.x+=kick.x*SOURCE_RECOIL_DEFAULTS.recoilScale;state.velocity.y+=kick.y*SOURCE_RECOIL_DEFAULTS.recoilScale;state.index++;state.lastShot=time;return kick;}
export function stepRecoil(state,key,dt,time){const profile=profileFor(key);if(!profile)return;state.accum+=Math.min(dt,.25);while(state.accum>=1/128){state.accum-=1/128;decayAimPunch(state.angle,state.velocity,1/128);const cycle=Array.isArray(profile.cycleTime)?profile.cycleTime[0]:profile.cycleTime;state.index=decayRecoilIndex(state.index,1/128,time-state.lastShot,cycle);if(state.index<.0001)state.index=0;}}
export function recoilRecovery(key,state,{crouching=false,airborne=false}={}){const profile=profileFor(key);return profile?recoveryTime(profile,state.index,{crouching,airborne}):.3;}
export function recoilMode(key,{zoom=0,burst=false,silenced=true,secondary=false}={}){return ['aug','sg556','awp','ssg08','scar20','g3sg1'].includes(key)?+(zoom>0):['famas','glock'].includes(key)?+burst:['m4a1_silencer','usp_silencer'].includes(key)?+!silenced:key==='revolver'?+secondary:0;}
export function shotQuaternion(yaw,pitch,state){return new T.Quaternion().setFromEuler(new T.Euler(-pitch+state.angle.y*radians,yaw-state.angle.x*radians,0,'YXZ'));}
export function shotDirection(yaw,pitch,state){return new T.Vector3(0,0,-1).applyQuaternion(shotQuaternion(yaw,pitch,state));}
export function recoilCrosshairOffset(camera,direction,width,height){camera.updateMatrixWorld(true);const projected=direction.clone().multiplyScalar(100).add(camera.position).project(camera);return {x:projected.x*width*.5,y:-projected.y*height*.5};}
