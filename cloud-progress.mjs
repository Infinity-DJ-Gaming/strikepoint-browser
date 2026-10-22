// Private, account-partitioned saves with a persistent offline outbox. Each batch
// is rebased in a Firebase transaction, rather than overwriting another device.
const clone=value=>JSON.parse(JSON.stringify(value));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const safeNumber=n=>Number.isFinite(n)?n:0;
export function cleanProgress(state){
 const out=clone(state);delete out.pendingDrop;
 out.items=Array.isArray(out.items)?out.items:[];out.cases=out.cases||{};out.equipped=out.equipped||{};out.stats=out.stats||{};out.musicKits=out.musicKits||[];out.coins=Math.max(0,Math.floor(safeNumber(out.coins)));out.log=(out.log||[]).slice(0,50);return out;
}
export function progressDelta(before,after){
 const delta={coins:safeNumber(after.coins)-safeNumber(before.coins)},maps=['cases','stats'];
 for(const key of maps){delta[key]={};for(const id of new Set([...Object.keys(before[key]||{}),...Object.keys(after[key]||{})])){const n=safeNumber(after[key]?.[id])-safeNumber(before[key]?.[id]);if(n)delta[key][id]=n;}}
 const old=new Map((before.items||[]).map(i=>[i.uid,i])),current=new Map((after.items||[]).map(i=>[i.uid,i]));delta.items=[];delta.removed=[];delta.kills={};
 for(const [uid,item]of current){if(!old.has(uid))delta.items.push(item);else if(!equal(old.get(uid),item)){const prior=old.get(uid);if(safeNumber(item.kills)!==safeNumber(prior.kills))delta.kills[uid]=safeNumber(item.kills)-safeNumber(prior.kills);}}
 for(const uid of old.keys())if(!current.has(uid))delta.removed.push(uid);
 for(const key of ['equipped','settings','loadout']){delta[key]={};for(const id of new Set([...Object.keys(before[key]||{}),...Object.keys(after[key]||{})]))if(!equal(before[key]?.[id],after[key]?.[id]))delta[key][id]=after[key]?.[id]??null;}
 delta.musicKits=(after.musicKits||[]).filter(id=>!(before.musicKits||[]).includes(id));
 for(const key of ['selectedMusic','developerBenefitsGranted'])if(!equal(before[key],after[key]))delta[key]=after[key]??null;
 delta.damageBank=safeNumber(after.damageBank)-safeNumber(before.damageBank);
 delta.log=(after.log||[]).filter(row=>!(before.log||[]).some(old=>equal(old,row))).slice(0,50);
 return delta;
}
export function hasProgressDelta(d){return d.coins!==0||d.damageBank!==0||['cases','stats','kills','equipped','settings','loadout'].some(k=>Object.keys(d[k]).length)||d.items.length||d.removed.length||d.musicKits.length||d.log.length||'selectedMusic'in d||'developerBenefitsGranted'in d;}
export function applyProgressDelta(input,delta){
 const state=cleanProgress(input);delta=clone(delta);
 // One-time grants and music ownership are account-wide, even if two devices
 // perform their first synchronization/purchase at the same moment.
 if(delta.developerBenefitsGranted===true&&state.developerBenefitsGranted){delta.coins=0;delta.cases={};}
 if(delta.coins<0&&delta.musicKits.length&&delta.musicKits.every(id=>state.musicKits.includes(id)))return state;
 // A stale device may not spend the same coins/case twice. Reject the whole
 // purchase/open operation so its reward cannot be kept without its payment.
 if(state.coins+delta.coins<0||Object.entries(delta.cases).some(([k,n])=>(state.cases[k]||0)+n<0))return null;
 state.coins+=delta.coins;state.damageBank=Math.max(0,safeNumber(state.damageBank)+delta.damageBank);
 for(const key of ['cases','stats'])for(const [id,n]of Object.entries(delta[key]))state[key][id]=Math.max(0,safeNumber(state[key][id])+n);
 const items=new Map(state.items.map(i=>[i.uid,i]));for(const uid of delta.removed)items.delete(uid);for(const item of delta.items)if(!items.has(item.uid))items.set(item.uid,clone(item));for(const [uid,n]of Object.entries(delta.kills))if(items.has(uid))items.get(uid).kills=Math.max(0,safeNumber(items.get(uid).kills)+n);state.items=[...items.values()];
 for(const key of ['equipped','settings','loadout']){state[key]||={};for(const [id,value]of Object.entries(delta[key])){if(value===null)delete state[key][id];else state[key][id]=clone(value);}}
 state.musicKits=[...new Set([...state.musicKits,...delta.musicKits])];for(const key of ['selectedMusic','developerBenefitsGranted'])if(key in delta)state[key]=delta[key];state.log=[...delta.log,...state.log].slice(0,50);const owned=new Set(state.items.map(i=>i.uid));for(const [slot,uid]of Object.entries(state.equipped))if(!owned.has(uid))delete state.equipped[slot];if(!state.musicKits.includes(state.selectedMusic))state.selectedMusic=state.musicKits[0]||'valve_cs2_01';return state;
}
export function mergeProgressBatch(remote,initial,operations,device,now=Date.now()){
 let state=remote?.state?cleanProgress(JSON.parse(remote.state)):cleanProgress(initial);const devices={...remote?.devices},rejected=[];
 for(const operation of operations){const writer=operation.device||device;if(operation.seq<=(devices[writer]||0))continue;const next=applyProgressDelta(state,operation.delta);if(next)state=next;else rejected.push(operation.seq);devices[writer]=Math.max(devices[writer]||0,operation.seq);}
 return {record:{schema:1,state:JSON.stringify(state),revision:(remote?.revision||0)+1,updatedAt:now,devices:Object.keys(devices).length?devices:{[device]:0}},rejected};
}
export class CloudProgress extends EventTarget{
 constructor(progress,service,{storage=progress.storage,onApply=()=>{}}={}){
  super();this.progress=progress;this.service=service;this.storage=storage;this.onApply=onApply;this.uid=null;this.queue=[];this.seq=0;this.ready=false;this.applying=false;this.status='guest';this.device=globalThis.crypto.randomUUID();this.browser=storage.getItem('cs-cloud-browser')||globalThis.crypto.randomUUID();storage.setItem('cs-cloud-browser',this.browser);this.guest=cleanProgress(progress.state);this.base=cleanProgress(progress.state);progress.cloudCapture=()=>this.capture();
  this.onConnection=()=>{if(service.connected&&this.uid){if(this.ready)this.flush().catch(()=>{});else this.retry().catch(()=>{});}};service.addEventListener('connection',this.onConnection);
 }
 emit(status,message=''){this.status=status;this.message=message;this.dispatchEvent(new Event('status'));}
 key(uid=this.uid){return 'cs-cloud-progress-v1:'+uid;}
 persist(){if(!this.uid)return;this.storage.setItem(this.key(),JSON.stringify({state:cleanProgress(this.progress.state),initial:this.initial}));const key='cs-cloud-outbox-v1:'+this.uid+':'+this.device;if(this.queue.length)this.storage.setItem(key,JSON.stringify(this.queue));else this.storage.removeItem(key);}
 readOutboxes(uid){const prefix='cs-cloud-outbox-v1:'+uid+':',found=new Map();for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i);if(!key?.startsWith(prefix))continue;try{for(const op of JSON.parse(this.storage.getItem(key)||'[]'))if(op.device&&Number.isSafeInteger(op.seq))found.set(op.device+':'+op.seq,op);}catch{}}return [...found.values()].sort((a,b)=>a.seq-b.seq);}
 retry(){if(!this.uid||!this.service.user)return Promise.resolve();if(this.ready)return this.flush();this.uid=null;return this.attach(this.service.user);}
 replace(state){this.applying=true;try{this.progress.state=cleanProgress(state);this.progress.save();this.base=cleanProgress(state);this.onApply(state);}finally{this.applying=false;}this.persist();}
 capture(){if(this.applying)return;if(!this.uid){this.guest=cleanProgress(this.progress.state);return;}const state=cleanProgress(this.progress.state),delta=progressDelta(this.base,state);this.base=state;if(hasProgressDelta(delta)){this.queue.push({device:this.device,seq:++this.seq,delta});this.persist();this.emit(this.ready?'pending':'loading');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush().catch(()=>{}),1200);}}
 async attach(user){
  const uid=user?.uid||null;if(uid===this.uid)return this.attachTask;
  this.generation=(this.generation||0)+1;const generation=this.generation;
  this.unsub?.();this.unsub=null;clearTimeout(this.timer);clearTimeout(this.retryTimer);this.persist();this.uid=uid;this.ready=false;this.queue=[];this.seq=0;
  if(!uid){this.progress.key='cs-browser-inventory-v1';this.replace(this.guest);this.emit('guest');return;}
  const saved=JSON.parse(this.storage.getItem(this.key())||'null'),claimed=this.storage.getItem('cs-cloud-guest-owner');
  if(!claimed)this.storage.setItem('cs-cloud-guest-owner',uid);
  const blank={...this.guest,coins:250,items:[],cases:{},equipped:{},stats:Object.fromEntries(Object.keys(this.guest.stats).map(k=>[k,0])),damageBank:0,log:[],musicKits:['valve_cs2_01','valve_02'],selectedMusic:'valve_cs2_01',developerBenefitsGranted:false};
  const canImport=!claimed||claimed===uid,legacy=cleanProgress(canImport?this.guest:blank);legacy.items=legacy.items.filter(item=>!item.developerGrant||item.developerGrant===uid);const previousDev=JSON.parse(this.storage.getItem('cs-developer-inventory-'+uid)||'null');if(previousDev?.casesGranted)legacy.developerBenefitsGranted=true;
  const initial=saved?.state||legacy;this.initial=saved?.initial||cleanProgress(blank);this.queue=this.readOutboxes(uid);this.seq=0;
  if(!saved&&canImport){const delta=progressDelta(blank,legacy),writer='guest-'+this.browser;if(hasProgressDelta(delta)&&!this.queue.some(op=>op.device===writer))this.queue.unshift({device:writer,seq:1,delta});}
  this.progress.key='cs-browser-inventory-v1:'+uid;this.replace(initial);this.emit('loading');
  this.attachTask=(async()=>{const {ref,get,onValue}=this.service.D,path=ref(this.service.db,'playerSaves/'+uid);const snapshot=await get(path);if(this.uid!==uid||this.generation!==generation)return;
   if(snapshot.exists())this.accept(snapshot.val());this.ready=true;await this.flush(true);if(this.uid!==uid||this.generation!==generation)return;this.dispatchEvent(new Event('ready'));
   this.unsub=onValue(path,s=>{if(s.exists()&&this.uid===uid&&this.generation===generation)this.accept(s.val());},error=>this.emit('error',error.message));
  })().catch(error=>{if(this.uid===uid&&this.generation===generation){this.ready=false;this.emit('error',error.message);clearTimeout(this.retryTimer);this.retryTimer=setTimeout(()=>this.retry().catch(()=>{}),5000);}throw error;});return this.attachTask;
 }
 accept(remote){if(!remote?.state)return;let state=cleanProgress(JSON.parse(remote.state));this.seq=Math.max(this.seq,remote.devices?.[this.device]||0);this.queue=this.queue.filter(op=>op.seq>(remote.devices?.[op.device||this.device]||0));const prefix='cs-cloud-outbox-v1:'+this.uid+':';for(let i=this.storage.length-1;i>=0;i--){const key=this.storage.key(i);if(!key?.startsWith(prefix))continue;try{const remaining=JSON.parse(this.storage.getItem(key)||'[]').filter(op=>op.seq>(remote.devices?.[op.device]||0));if(!remaining.length)this.storage.removeItem(key);}catch{}}for(const op of this.queue)state=applyProgressDelta(state,op.delta)||state;this.remote=remote;this.replace(state);this.emit(this.queue.length?'pending':'saved');}
 async flush(create=false){
  if(!this.uid||!this.ready||(!create&&!this.queue.length))return;
  if(this.inFlight&&this.inFlightAccount===this.uid+':'+this.generation){await this.inFlight;if(this.queue.length)return this.flush();return;}
  const uid=this.uid,generation=this.generation,ops=clone(this.queue),initial=clone(this.initial),device=this.device,{ref,runTransaction,serverTimestamp}=this.service.D;this.emit('saving');let rejected=[];
  const work=(async()=>{const result=await runTransaction(ref(this.service.db,'playerSaves/'+uid),value=>{const merged=mergeProgressBatch(value,initial,ops,device,serverTimestamp());rejected=merged.rejected;return merged.record;},{applyLocally:false});
   if(this.uid!==uid||this.generation!==generation)return;
   if(!result.committed)throw Error('Cloud save was not committed. Your local backup is safe.');this.accept(result.snapshot.val());if(rejected.length)this.emit('conflict','Another device already spent those coins or cases. Its purchases were kept; this device has refreshed.');
  })();this.inFlight=work;this.inFlightAccount=uid+':'+generation;try{await work;}catch(error){if(this.uid===uid)this.emit('error',error.message);throw error;}finally{if(this.inFlight===work)this.inFlight=null;}
  if(this.queue.length&&this.uid===uid)this.timer=setTimeout(()=>this.flush().catch(()=>{}),1000);
 }
}
export function installCloudSaveStatus(cloud){
 const node=document.createElement('div');node.id='cloudSaveStatus';node.className='cloud-save-status';node.setAttribute('role','status');
 const label=document.createElement('span'),button=document.createElement('button');button.type='button';button.className='text-button';button.textContent='RETRY';button.onclick=()=>{if(!cloud.ready&&cloud.uid){const user=cloud.service.user;cloud.uid=null;cloud.attach(user).catch(()=>{});}else cloud.flush(true).catch(()=>{});};node.append(label,button);document.querySelector('.party-rail').append(node);
 const text={guest:'LOCAL SAVE · Sign in to sync devices',loading:'Loading account save…',pending:'Progress saved locally · Sync pending',saving:'Saving account progress…',saved:'CLOUD SAVED · All devices',error:'Cloud unavailable · Local backup kept',conflict:'Save refreshed · Purchase conflict'};
 cloud.addEventListener('status',()=>{label.textContent=text[cloud.status];node.dataset.status=cloud.status;node.title=cloud.message||text[cloud.status];button.hidden=!['error','conflict'].includes(cloud.status);});cloud.emit('guest');
}
