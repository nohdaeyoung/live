// Improved station extraction: match symbols + nearest text, merge multiline text, class heuristics
const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

const IN = process.argv[2] || 'assets/svg/Seoul_subway_linemap_en.svg';
const OUT_JSON = (process.argv[3]) || (path.join('data', path.basename(IN, '.svg') + '-stations.json'));
const OUT_CSV = (process.argv[4]) || (path.join('data', path.basename(IN, '.svg') + '-stations.csv'));

if(!fs.existsSync(IN)){
  console.error('SVG not found:', IN);
  process.exit(2);
}
const text = fs.readFileSync(IN,'utf8');
const dom = new JSDOM(text);
const doc = dom.window.document;
const svg = doc.querySelector('svg');
if(!svg){
  console.error('No <svg> root found');
  process.exit(3);
}

function getElementCenter(el){
  if(!el) return {x:0,y:0};
  // circle
  const circle = el.querySelector && el.querySelector('circle');
  if(circle){
    return {x: parseFloat(circle.getAttribute('cx')||'0'), y: parseFloat(circle.getAttribute('cy')||'0')};
  }
  // use (x,y) attributes
  const use = el.querySelector && el.querySelector('use');
  if(use){
    return {x: parseFloat(use.getAttribute('x')||'0'), y: parseFloat(use.getAttribute('y')||'0')};
  }
  // direct attributes
  if(el.getAttribute){
    const cx = el.getAttribute('cx');
    const cy = el.getAttribute('cy');
    if(cx && cy) return {x: parseFloat(cx), y: parseFloat(cy)};
    const x = el.getAttribute('x') || el.getAttribute('dx');
    const y = el.getAttribute('y');
    if(x || y) return {x: parseFloat(x||'0'), y: parseFloat(y||'0')};
  }
  // transform translate
  const transform = el.getAttribute && el.getAttribute('transform');
  if(transform){
    const m = /translate\(([-0-9\.]+)[ ,]([-0-9\.]+)\)/.exec(transform);
    if(m) return {x:parseFloat(m[1]), y:parseFloat(m[2])};
  }
  return {x:0,y:0};
}

function slugify(name){
  return name.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-_]/g,'');
}

// prefer classes discovered by auto-tune if available
let preferredClasses = [];
try{ preferredClasses = JSON.parse(require('fs').readFileSync('data/preferred-classes.json','utf8')); }catch(e){ preferredClasses = []; }

const stationClassRegex = /\b(st\d+|S\d+|station|stop|stn|station-name)\b/i;
// collect elements with preferred classes first
const stationElems = Array.from(svg.querySelectorAll('*')).filter(e=>{
  const cls = e.getAttribute && e.getAttribute('class')||'';
  if(preferredClasses.length){
    for(const pc of preferredClasses){ if(new RegExp('\\b'+pc+'\\b').test(cls)) return true; }
  }
  return stationClassRegex.test(cls);
});

const symbols = new Set();
stationElems.forEach(e=>{
  // prefer circle/use/path children
  if(e.querySelector('circle')) symbols.add(e.querySelector('circle'));
  else if(e.querySelector('use')) symbols.add(e.querySelector('use'));
  else symbols.add(e);
});
// fallback: general small circles/uses
if(symbols.size===0){
  Array.from(svg.querySelectorAll('circle, use')).forEach(c=>symbols.add(c));
}

const symbolCenters = Array.from(symbols).map(s=>({el:s, c:getElementCenter(s)}));

// collect text nodes
const texts = Array.from(svg.querySelectorAll('text'));
const textItems = texts.map(t=>{
  const txt = (t.textContent||'').trim();
  const fsAttr = t.getAttribute('font-size');
  const cls = t.getAttribute('class')||'';
  const x = parseFloat(t.getAttribute('x')||t.getAttribute('dx')||'0');
  const y = parseFloat(t.getAttribute('y')||'0');
  const transform = t.getAttribute('transform');
  let tx = x, ty = y;
  if((!x || !y) && transform){
    const m = /translate\(([-0-9\.]+)[ ,]([-0-9\.]+)\)/.exec(transform);
    if(m){ tx = parseFloat(m[1]); ty = parseFloat(m[2]); }
  }
  return {el: t, text: txt, x: tx||0, y: ty||0, fontSize: parseFloat(fsAttr)||0, class: cls};
}).filter(t=>t.text);

function isLabelLike(item){
  if(/legend|title|caption|scale|key|note|logo|map/.test(item.class)) return true;
  if(item.fontSize && item.fontSize < 9) return true;
  if(/^\d{4,}$/.test(item.text)) return true;
  return false;
}

// merge nearby text nodes that are vertically stacked
const merged = [];
const used = new Set();
for(let i=0;i<textItems.length;i++){
  if(used.has(i)) continue;
  const a = textItems[i];
  const group = [a];
  for(let j=i+1;j<textItems.length;j++){
    if(used.has(j)) continue;
    const b = textItems[j];
    if(Math.abs(a.x - b.x) < 30 && Math.abs(a.y - b.y) < 24){
      group.push(b); used.add(j);
    }
  }
  used.add(i);
  const name = group.map(g=>g.text).join(' ').replace(/\s+/g,' ').trim();
  merged.push({name, x: group[0].x, y: group[0].y, class: group.map(g=>g.class).join(' '), fontSize: group[0].fontSize});
}

// match symbols to nearest text
const candidates = [];
for(const sym of symbolCenters){
  let nearest = null; let nd = Infinity;
  for(const t of merged){
    const dx = (t.x||0) - (sym.c.x||0);
    const dy = (t.y||0) - (sym.c.y||0);
    const d = Math.hypot(dx,dy);
    if(d < nd){ nd = d; nearest = t; }
  }
  if(nearest && nd < 140 && !isLabelLike(nearest)){
    candidates.push({id: slugify(nearest.name), name: nearest.name, x: sym.c.x, y: sym.c.y, source:'symbol', dist: Math.round(nd)});
  }
}

// include standalone merged texts that look like station names
for(const t of merged){
  if(isLabelLike(t)) continue;
  if(candidates.find(c=>c.name===t.name)) continue;
  candidates.push({id: slugify(t.name), name: t.name, x: t.x, y: t.y, source:'text', dist:0});
}

// final post-process: collapse extremely long concatenated names that look like map legend
const filtered = candidates.filter(c=>{
  if(c.name.length > 300) return false;
  return true;
});

const outMap = new Map();
for(const c of filtered){ if(!outMap.has(c.id)) outMap.set(c.id,c); }
const out = Array.from(outMap.values());

if(!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2),'utf8');
const csv = 'id,name,x,y,source,dist\n' + out.map(o=>`${o.id},"${o.name.replace(/"/g,'""')}",${o.x},${o.y},${o.source},${o.dist||0}`).join('\n');
fs.writeFileSync(OUT_CSV, csv, 'utf8');
console.log('Wrote', OUT_JSON, OUT_CSV, 'stations:', out.length);
