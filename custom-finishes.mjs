// User-requested original finish. This is browser artwork, not a Valve catalog item.
export const BLACK_ICE_ID='custom-ak47-black-ice';
export const CUSTOM_SKINS=[{id:BLACK_ICE_ID,weapon:'ak47',runtimeWeapon:'rifle',weaponName:'AK-47',paintKit:-9001,paintName:'strikepoint_black_ice',name:'Black Ice',rarity:'covert',kind:'gun',wearMin:0,wearMax:1,style:0,legacyModel:false,canStatTrak:true,customFinish:'black-ice',preview:'./assets/custom/black-ice-preview.webp',previews:{light:'./assets/custom/black-ice-preview.webp',medium:'./assets/custom/black-ice-preview.webp',heavy:'./assets/custom/black-ice-preview.webp'}}];
export function grantCustomFinishes(progress){
 if(progress.state.items.some(i=>i.skinId===BLACK_ICE_ID))return false;
 progress.state.items.unshift({uid:'strikepoint-black-ice',skinId:BLACK_ICE_ID,wear:.02,seed:1,statTrak:false,origin:'Update 9 · Community finish',acquired:Date.now()});progress.save();return true;
}
