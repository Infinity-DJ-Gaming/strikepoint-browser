import {OnlineTransport} from './online-transport.mjs?v=20261022-9';
// Party negotiation is isolated from match signalling and restricted to its roster.
export class PartyVoiceService extends EventTarget{
 constructor(service){super();this.source=service;this.room=null;this.code=null;}
 get user(){return this.source.user} get config(){return this.source.config}
 iceServers(){return this.source.iceServers()}
 sync(){const s=this.source;this.code=s.partyCode;this.isHost=s.partyLeader;this.room=s.party?{meta:{owner:s.party.meta.owner},slots:Object.fromEntries(Object.entries(s.party.slots||{}).map(([slot,m])=>[slot*2,{...m,party:s.partyCode}]))}:null;this.dispatchEvent(new CustomEvent('room'));}
 watchSignals(callback){const s=this.source,code=this.code,uid=s.user.uid,{ref,onChildAdded,onDisconnect,remove}=s.D,path=ref(s.db,'partySignals/'+code+'/'+uid),seen=new Set(),disconnect=onDisconnect(path);disconnect.remove().catch(()=>{});const unwatch=onChildAdded(path,snapshot=>{const p=snapshot.val();if(!seen.has(snapshot.key)&&p&&Date.now()-p.at<120000){seen.add(snapshot.key);callback(p)}remove(snapshot.ref).catch(()=>{})});return()=>{unwatch();disconnect.cancel().catch(()=>{});remove(path).catch(()=>{})};}
 async signal(to,type,data){if(!this.code)return;const s=this.source;await s.D.push(s.D.ref(s.db,'partySignals/'+this.code+'/'+to),{from:s.user.uid,type,data:JSON.stringify(data),at:s.D.serverTimestamp()});}
}
export function createPartyVoice(service){const context=new PartyVoiceService(service);return{context,transport:new OnlineTransport(context)}}
