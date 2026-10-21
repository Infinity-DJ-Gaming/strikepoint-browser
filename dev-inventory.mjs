import {SKINS,SKIN_BY_ID,CASES} from './cosmetics-data.mjs?v=20261020-7';
const testerDigest='b9419cc0a0792d81839db4c9fc0d7dd01b0188dce0f7df3d55a3ca287d873370';
export async function isInventoryTester(user){if(!user?.emailVerified||!user.email)return false;const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user.email.trim().toLowerCase()));return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('')===testerDigest;}
export async function syncDeveloperInventory(progress,user){
 const permitted=await isInventoryTester(user),before=progress.state.items.length;
 progress.state.items=progress.state.items.filter(item=>!item.developerGrant);
 if(permitted){const saved=JSON.parse(progress.storage.getItem('cs-developer-inventory-'+user.uid)||'null');let items=saved?.items;
  if(!items||SKINS.some(s=>!items.some(i=>i.skinId===s.id))){items=SKINS.map((skin,i)=>({uid:'developer-'+user.uid+'-'+skin.id,skinId:skin.id,wear:Math.max(skin.wearMin,Math.min(skin.wearMax,.02)),seed:1+i%1000,statTrak:false,origin:'Developer test inventory',developerGrant:user.uid}));
   for(const weapon of new Set(SKINS.map(s=>s.runtimeWeapon||s.weapon))){const skin=SKINS.find(s=>(s.runtimeWeapon||s.weapon)===weapon&&s.paintKit!==0);if(!skin)continue;for(const wear of [.02,.1,.25,.42,.8])if(wear>=skin.wearMin&&wear<=skin.wearMax)items.push({uid:'developer-'+user.uid+'-'+skin.id+'-'+wear,skinId:skin.id,wear,seed:321,statTrak:skin.kind==='gun',origin:'Developer wear sample',developerGrant:user.uid});}
   progress.storage.setItem('cs-developer-inventory-'+user.uid,JSON.stringify({items}));}
  progress.state.items.push(...items);if(!saved?.casesGranted){for(const box of CASES)progress.state.cases[box.id]=(progress.state.cases[box.id]||0)+3;progress.state.coins+=100000;progress.storage.setItem('cs-developer-inventory-'+user.uid,JSON.stringify({items,casesGranted:true}));}
 }
 const owned=new Set(progress.state.items.map(i=>i.uid));for(const [slot,uid] of Object.entries(progress.state.equipped))if(!owned.has(uid))delete progress.state.equipped[slot];
 progress.devActive=permitted;progress.save();return{permitted,count:progress.state.items.filter(i=>i.developerGrant).length,changed:before!==progress.state.items.length};
}
