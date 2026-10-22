import * as T from 'three';
import {ARSENAL} from './arsenal-data.mjs?v=20261022-9';
import {clone} from './vendor/utils/SkeletonUtils.js';
const base=name=>name.replace(/_\d+$/,'');
const labels={rifle:'ak47',pistol:'deagle',glock:'glock18',awp:'awp',knife:'knife_default_t',c4:'c4',smoke:'smokegrenade',flash:'flashbang',he:'hegrenade',molotov:'molotov'};
export function weaponBranch(model,kind){let found;model.traverse(o=>{const n=o.name.toLowerCase();if(n.includes((ARSENAL[kind]?.branch||labels[kind]||kind).toLowerCase())&&n.includes('vnmskel'))found=o;});return found;}
export function bindNativeWeapon(asset,model,kind){
 model.updateWorldMatrix(true,true);
 const root=clone(asset.scene),branch=weaponBranch(model,kind),target=new Map();branch?.traverse(o=>{if(!o.userData.nativeRetained)target.set(base(o.name),o);});let matched=0,total=0;
 const authored=new Map();function resolve(b){if(!b||b===root)return branch||model;const native=target.get(base(b.name));if(native)return native;if(authored.has(b))return authored.get(b);const retained=b.clone(false);retained.userData={...retained.userData,nativeRetained:true};authored.set(b,retained);resolve(b.parent).add(retained);return retained;}
 root.traverse(o=>{if(!o.isSkinnedMesh)return;const bones=o.skeleton.bones.map(b=>{total++;const native=target.get(base(b.name));if(native)matched++;return native||resolve(b);});const skeleton=new T.Skeleton(bones,o.skeleton.boneInverses.map(m=>m.clone()));o.bind(skeleton,o.bindMatrix.clone());o.frustumCulled=false;});
 root.visible=false;model.add(root);const weapon=target.get('weapon'),anchorInverse=weapon?.matrix.clone().invert()||new T.Matrix4();if(branch)branch.matrixAutoUpdate=false;if(!total&&branch){branch.add(root);if(kind==='c4')root.position.x=.06;}
 // Native weapon tracks are relative to the animated wpn attachment, not
 // the camera origin. Preserve that parent frame while skinning every part.
 return {root,native:true,branch,matched,total,retained:authored.size,retainedBones:[...authored.values()],owner:model,follow:model.getObjectByName('wpn'),anchorInverse,mixer:new T.AnimationMixer(root),clips:asset.animations};
}
export function updateNativeWeapon(g){if(!g?.branch||!g.follow)return;g.owner.updateWorldMatrix(true,true);g.branch.matrix.copy(g.owner.matrixWorld).invert().multiply(g.follow.matrixWorld).multiply(g.anchorInverse);g.branch.matrixWorldNeedsUpdate=true;g.branch.updateWorldMatrix(false,true);}
export function createNativeView(arms,bareArms,weapons,parent,materials){
 const model=clone(arms.scene);parent.add(model);const hidden=[];model.traverse(o=>{if(o.isMesh)hidden.push(o);});hidden.forEach(m=>{m.visible=false;m.frustumCulled=false;});
 const bare=clone(bareArms.scene),armBones=new Map();model.traverse(o=>{if(o.isBone&&!armBones.has(base(o.name)))armBones.set(base(o.name),o);});
 bare.traverse(o=>{if(o.isSkinnedMesh){o.bind(new T.Skeleton(o.skeleton.bones.map(b=>armBones.get(base(b.name))||b),o.skeleton.boneInverses.map(m=>m.clone())),o.bindMatrix.clone());o.frustumCulled=false;}});model.add(bare);materials(bare);
 const views={};for(const [kind,asset] of Object.entries(weapons)){views[kind]=bindNativeWeapon(asset,model,kind);materials(views[kind].root);views[kind].root.visible=false;}
 return {model,mixer:new T.AnimationMixer(model),views,bare,ctMeshes:hidden};
}

export function detachNativeWeapon(g){g?.root.userData.disposeNativeFinish?.();g?.root.removeFromParent();for(const bone of g?.retainedBones||[])bone.removeFromParent();}
