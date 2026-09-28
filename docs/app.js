let DATA;
const $ = (id) => document.getElementById(id);
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const projects = () => Object.fromEntries(DATA.projects.map(p => [p.id,p]));
const fmt = (v,u) => v == null ? '—' : (u === '%' ? `${v}%` : u === 'rate' ? String(v) : Number(v).toLocaleString('en-US'));
function flags(r){
  const a=[];
  if(r.current_target == null)a.push('No current target / dropped');
  else if(r.actual == null)a.push('No reported actual');
  else a.push(r.actual < r.current_target ? 'Below current target' : 'At or above current target');
  if(r.original_target != null && r.current_target != null && r.original_target !== r.current_target)a.push('Target revised');
  if(r.kind==='output' && r.level==='PDO')a.push('Review output at PDO level');
  if(r.id==='VN-10')a.push('Non-additive subindicators');
  return a;
}
function source(p,r){return `${p.document}#page=${r.page}`}
function card(r){
  const p=projects()[r.project_id], f=flags(r);
  return `<article class="card"><div class="card-top"><span>${escapeHtml(p.country)} · ${escapeHtml(r.project_id)}</span><span>${escapeHtml(r.id)}</span></div><h3>${escapeHtml(r.name)}</h3><div class="tags"><span class="tag neutral">${escapeHtml(r.level)}</span><span class="tag neutral">${escapeHtml(r.kind)}</span>${f.map(t=>`<span class="tag ${t.startsWith('At or')?'':'warn'}">${escapeHtml(t)}</span>`).join('')}</div><div class="metrics"><div><small>Baseline shown</small><strong>${fmt(r.baseline,r.unit)}</strong></div><div><small>Current target</small><strong>${fmt(r.current_target,r.unit)}</strong></div><div><small>Reported actual</small><strong>${fmt(r.actual,r.unit)}</strong></div></div><p class="card-note">${escapeHtml(r.note)}</p><div class="card-foot"><span>${escapeHtml(p.document_type)} · PDF p. ${r.page}</span><a href="${source(p,r)}" target="_blank" rel="noopener noreferrer" aria-label="Open source for ${escapeHtml(r.id)}, PDF page ${r.page}">Open source page ↗</a></div></article>`;
}
function render(){
  const country=$('country').value,kind=$('kind').value,flag=$('flag').value;
  const rows=DATA.indicators.filter(r=>(country==='all'||projects()[r.project_id].country===country)&&(kind==='all'||r.kind===kind)&&(flag==='all'||flags(r).includes(flag)));
  $('result-count').textContent=`${rows.length} of ${DATA.indicators.length} indicators`;
  $('cards').innerHTML=rows.length?rows.map(card).join(''):'<p>No records match these filters.</p>';
}
const tokens=s=>new Set(s.toLowerCase().match(/[a-z0-9]+/g)?.filter(x=>!['the','of','and','for','with','at','in','a','to','what','which','are','is','by'].includes(x))||[]);
function lookup(q){
  const t=tokens(q), ps=projects();
  return DATA.indicators.map(r=>({r,p:ps[r.project_id],score:[...t].filter(w=>tokens([r.name,r.kind,r.note,ps[r.project_id].country,ps[r.project_id].name,...flags(r)].join(' ')).has(w)).length})).filter(x=>x.score).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id)).slice(0,4);
}
function answer(q){
  const matches=lookup(q);
  if(!matches.length){$('answer').innerHTML='<p>No matching records in this limited pilot. Try a country, condition, or indicator term.</p>';return}
  $('answer').innerHTML=`<p><strong>${matches.length} relevant records</strong> in the curated pilot. This is retrieval, not a generated answer; review the source pages for interpretation.</p><div class="answer-list">${matches.map(({r,p})=>`<div class="answer-item"><strong>${escapeHtml(r.name)}</strong> · ${escapeHtml(p.country)}<br>Current target ${fmt(r.current_target,r.unit)}; reported actual ${fmt(r.actual,r.unit)}. ${escapeHtml(flags(r).join(' · '))}.<br><a href="${source(p,r)}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.id)} · PDF page ${r.page} ↗</a></div>`).join('')}</div>`;
}
async function init(){
  try{const response=await fetch('data/indicators.json');if(!response.ok)throw new Error(`HTTP ${response.status}`);DATA=await response.json();}
  catch(e){$('cards').textContent=`Could not load local data: ${e.message}`;return}
  $('n-projects').textContent=DATA.projects.length;$('n-indicators').textContent=DATA.indicators.length;$('n-linked').textContent=DATA.indicators.length;
  $('n-below').textContent=DATA.indicators.filter(r=>flags(r).includes('Below current target')).length;
  $('n-revised').textContent=DATA.indicators.filter(r=>flags(r).includes('Target revised')).length;
  $('n-dropped').textContent=DATA.indicators.filter(r=>flags(r).includes('No current target / dropped')).length;
  for(const country of [...new Set(DATA.projects.map(p=>p.country))])$('country').add(new Option(country,country));
  for(const kind of [...new Set(DATA.indicators.map(r=>r.kind))].sort())$('kind').add(new Option(kind,kind));
  for(const id of ['country','kind','flag'])$(id).addEventListener('change',render);
  $('search-form').addEventListener('submit',e=>{e.preventDefault();answer($('question').value)});
  document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{$('question').value=b.dataset.query;answer(b.dataset.query)}));
  render();
}
init();
