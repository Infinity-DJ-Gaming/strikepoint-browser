export const PROTOCOL_VERSION=1;
export const REGIONS=[['us_east','North America · East'],['us_west','North America · West'],['eu','Europe'],['asia','Asia'],['oceania','Oceania'],['south_america','South America']];
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomCode(length=8,crypto=globalThis.crypto){const bytes=crypto.getRandomValues(new Uint8Array(length));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');}
export function cleanCode(code){return String(code).toUpperCase().replace(/[\s-]/g,'');}
export function validCode(code){return /^[A-HJ-NP-Z2-9]{8}$/.test(code);}
export function cleanName(name){return String(name).replace(/[\x00-\x1f<>]/g,'').trim().slice(0,24)||'Player';}
export const teamForSlot=slot=>+slot%2?'CT':'T';
export function members(room){return Object.entries(room?.slots||{}).filter(([,s])=>s?.uid).map(([slot,s])=>({...s,slot:+slot,team:teamForSlot(slot)})).sort((a,b)=>a.slot-b.slot);}
export function canStart(room){const list=members(room);return room?.meta?.phase==='waiting'&&list.length>=2&&list.every(s=>s.ready)&&new Set(list.map(s=>s.team)).size===2;}
export function availableSlot(room,team='auto'){const occupied=room?.slots||{};const teams={T:0,CT:0};members(room).forEach(s=>teams[s.team]++);const preferred=team==='auto'?(teams.T<=teams.CT?'T':'CT'):team;for(let i=0;i<10;i++)if(!occupied[i]&&teamForSlot(i)===preferred)return i;return -1;}
export function readPacket(data){if(typeof data!=='string'||data.length>196608)return null;try{const p=JSON.parse(data);return p&&p.v===PROTOCOL_VERSION&&typeof p.type==='string'&&p.type.length<24?p:null;}catch{return null;}}
export function sanitizeInput(p,lastSeq=-1){
 if(!p||!Number.isSafeInteger(p.seq)||p.seq<=lastSeq||p.seq>2**31||!Number.isFinite(p.yaw)||!Number.isFinite(p.pitch))return null;
 const axis=n=>Number.isFinite(n)?Math.max(-1,Math.min(1,n)):0;
 return {seq:p.seq,yaw:((p.yaw%(Math.PI*2))+Math.PI*2)%(Math.PI*2),pitch:Math.max(-1.4,Math.min(1.4,p.pitch)),f:axis(p.f),s:axis(p.s),jump:!!p.jump,crouch:!!p.crouch,walk:!!p.walk,attack:!!p.attack,use:!!p.use,weapon:typeof p.weapon==='string'?p.weapon.slice(0,32):'',zoom:Math.min(2,Math.max(0,+p.zoom||0)),burst:!!p.burst,silenced:!!p.silenced};
}
export function safeAction(p){return p&&['shoot','reload','buy','equip','throw','inspect','secondary','drop'].includes(p.action)&&(!p.weapon||/^[a-z0-9_]{1,32}$/.test(p.weapon))?{action:p.action,weapon:p.weapon,heavy:!!p.heavy,burst:!!p.burst,underhand:!!p.underhand}:null;}
export function makePacket(type,payload={}){return JSON.stringify({v:PROTOCOL_VERSION,type,...payload});}
