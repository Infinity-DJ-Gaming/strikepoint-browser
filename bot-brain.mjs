// Browser bot profiles: perception, weapon handling and utility improve separately.
export const BOT_SKILLS=[
 {name:'Easy',reaction:.95,turn:2.5,aim:.075,head:0,burst:1,rest:.6,memory:1.4,utility:.03,wallbang:false,walk:false},
 {name:'Normal',reaction:.55,turn:4,aim:.035,head:.06,burst:3,rest:.35,memory:2.5,utility:.3,wallbang:false,walk:false},
 {name:'Hard',reaction:.28,turn:6,aim:.016,head:.18,burst:4,rest:.22,memory:4,utility:.65,wallbang:true,walk:true},
 {name:'Expert',reaction:.17,turn:8,aim:.006,head:.35,burst:5,rest:.12,memory:5,utility:.9,wallbang:true,walk:true}
];
export function botWeapon(team,index,round,difficulty){const guns=team==='CT'?['m4a1','mp9','aug','awp','famas']:['rifle','mac10','sg556','awp','galilar'];return guns[(index+(round-1))%guns.length];}
export function strategy(team,index,round,difficulty){const attackA=round%2===1;if(team==='T')return {site:attackA?0:1,role:difficulty===0?'rush':index===3?'flank':index===4?'support':'entry'};return {site:index%2,role:index===4?'rotate':'anchor'};}
export function turnToward(current,target,speed,dt){const delta=Math.atan2(Math.sin(target-current),Math.cos(target-current));return current+Math.max(-speed*dt,Math.min(speed*dt,delta));}
