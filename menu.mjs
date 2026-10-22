const $=id=>document.getElementById(id);
const panes=['home','play','inventory','loadout','store','news','online'];
let activeTab='home',launchMode='bomb',launchCallback=null,queueTimer=null,elapsed=0,toastTimer=null;

function emit(name,detail={}){document.dispatchEvent(new CustomEvent(name,{detail}));}
function audio(key){emit('cs:menu-audio',{key});}
function toast(message){clearTimeout(toastTimer);$('menuToast').textContent=message;$('menuToast').classList.remove('hidden');toastTimer=setTimeout(()=>$('menuToast').classList.add('hidden'),4000);}

export function selectMenuTab(tab){
 if(tab==='settings'){$('openSettings').click();audio('menuAccept');return;}
 if(!panes.includes(tab))return;
 activeTab=tab;$('menu').dataset.menuTab=tab;
 for(const name of panes)$(name+'Pane')?.classList.toggle('hidden',name!==tab);
 document.querySelectorAll('.lobby-header [data-tab]').forEach(button=>button.classList.toggle('selected',button.dataset.tab===tab));
 emit('cs:menu-tab',{tab});
}

function cancelQueue(){clearInterval(queueTimer);queueTimer=null;launchCallback=null;$('queueOverlay').classList.add('hidden');audio('menuBack');}

export function installMenu({start,explore}){
 document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{audio('menuAccept');selectMenuTab(button.dataset.tab);});
 document.querySelectorAll('[data-play-mode]').forEach(button=>button.onclick=()=>{
  if(button.dataset.playMode==='practice')return;
  if(button.dataset.playMode==='competitive'){selectMenuTab('online');return;}audio('menuInvalid');toast(button.dataset.playMode==='competitive'?'Online matchmaking is available in the official Counter-Strike 2 game.':'Workshop maps are available in the official Counter-Strike 2 game.');
 });
 document.querySelectorAll('[data-practice-mode]').forEach(button=>button.onclick=()=>{
  launchMode=button.dataset.practiceMode;
  document.querySelectorAll('[data-practice-mode]').forEach(other=>other.classList.toggle('selected',other===button));
  const exploreMode=launchMode==='explore';
  $('practiceDescription').innerHTML=exploreMode?'Explore the original Dust II.<br>No bots. No round timer. Buy equipment freely.':'Plant the bomb at A or B.<br>Eliminate the CTs or protect the bomb until it explodes.';
  $('launchHint').textContent=exploreMode?'Free exploration · No bots or round timer':'Local practice · Desktop keyboard and mouse';
  document.querySelector('.map-card>span').textContent=exploreMode?'Free Exploration':'Bomb Defusal';audio('menuAccept');
 });
 const inventory=[['ak47','AK-47','RIFLE'],['awp','AWP','SNIPER RIFLE'],['glock','Glock-18','PISTOL'],['deagle','Desert Eagle','PISTOL'],['knife','Knife','MELEE'],['c4','C4 Explosive','EQUIPMENT'],['smokegrenade','Smoke Grenade','GRENADE'],['flashbang','Flashbang','GRENADE'],['hegrenade','HE Grenade','GRENADE'],['molotov','Molotov','GRENADE']];
 $('inventoryCards').innerHTML=inventory.map(([icon,label,type])=>`<button class="inventory-item" data-inventory="${label}"><span class="item-quality"></span><small>${type}</small><img src="assets/ui/${icon}.svg" alt="${label}"><b>${label}</b><span>Stock equipment</span></button>`).join('');
 document.querySelectorAll('[data-inventory]').forEach(button=>button.onclick=()=>{audio('menuAccept');if(['AK-47','AWP'].includes(button.dataset.inventory))selectMenuTab('loadout');else toast(button.dataset.inventory+' · Available in the practice buy menu.');});
 $('deploy').onclick=()=>{
  if($('deploy').disabled)return;
  audio('menuAccept');elapsed=0;launchCallback=launchMode==='explore'?explore:start;
  $('queueMode').textContent=launchMode==='explore'?'Free Exploration · No bots':'Bomb Defusal · Local bots';
  $('queueTitle').textContent='PREPARING YOUR SESSION';$('queueTime').textContent='00:00';
  $('queueSearching').classList.remove('hidden');$('queueAccept').classList.add('hidden');$('queueOverlay').classList.remove('hidden');
  clearInterval(queueTimer);queueTimer=setInterval(()=>{elapsed++;$('queueTime').textContent='00:'+String(elapsed).padStart(2,'0');if(elapsed>=2){clearInterval(queueTimer);queueTimer=null;$('queueSearching').classList.add('hidden');$('queueAccept').classList.remove('hidden');$('queueTitle').textContent='YOUR MATCH IS READY';audio('matchReady');$('acceptSession').focus();}},1000);
 };
 $('practice').onclick=()=>{audio('menuAccept');explore();};
 $('cancelQueue').onclick=cancelQueue;
 $('acceptSession').onclick=()=>{
  const callback=launchCallback;if(!callback)return;launchCallback=null;
  $('queueOverlay').classList.add('hidden');$('mapLoading').classList.remove('hidden');audio('menuAccept');
  // Start during the click so the browser can grant pointer lock and audio.
  callback();setTimeout(()=>$('mapLoading').classList.add('hidden'),650);
 };
 document.addEventListener('keydown',event=>{if(event.code==='Escape'&&!$('queueOverlay').classList.contains('hidden')){event.preventDefault();cancelQueue();}});
 // Menu input is the user gesture that lets native menu music begin.
 $('menu').addEventListener('pointerdown',()=>emit('cs:menu-interaction'));
 document.querySelectorAll('button').forEach(button=>button.addEventListener('mouseenter',()=>{if(!$('menu').classList.contains('hidden'))audio('menuFocus');}));
 window.CSMenu={get tab(){return activeTab;},select:selectMenuTab,cancelQueue};
 selectMenuTab('home');
}
