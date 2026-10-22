export function installPatchNotes(pane){
 const articles=[...pane.querySelectorAll('article.patch-notes')];
 pane.querySelectorAll('.subnav').forEach(n=>n.remove());
 const heading=document.createElement('div');heading.className='patch-heading';heading.innerHTML='<div><span class="eyebrow">STRIKEPOINT · DEVELOPMENT</span><h1>PATCH NOTES</h1></div><span>Choose an update to read what changed.</span>';pane.prepend(heading);
 for(const [index,article] of articles.entries()){
  const details=document.createElement('details');details.className='patch-update';details.open=index===0;
  const summary=document.createElement('summary'),label=document.createElement('span'),date=document.createElement('small'),title=document.createElement('strong'),hint=document.createElement('span');
  date.textContent=article.querySelector('.eyebrow')?.textContent||'PRACTICE UPDATE';title.textContent=article.querySelector('h1')?.textContent||'Update';hint.className='patch-chevron';hint.setAttribute('aria-hidden','true');hint.textContent='⌄';label.append(date,title);summary.append(label,hint);details.append(summary);article.replaceWith(details);article.querySelector('.eyebrow')?.remove();article.querySelector('h1')?.remove();details.append(article);
 }
}
