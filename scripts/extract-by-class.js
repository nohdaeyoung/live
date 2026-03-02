#!/usr/bin/env node
const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');
const IN = process.argv[2] || 'assets/svg/Seoul_subway_linemap_en.svg';
const OUT = process.argv[3] || 'data/seoul-class-stations.json';
if(!fs.existsSync(IN)){ console.error('no svg'); process.exit(1); }
const text = fs.readFileSync(IN,'utf8');
const dom = new JSDOM(text);
const doc = dom.window.document;
const svg = doc.querySelector('svg');
if(!svg){ console.error('no svg root'); process.exit(2); }
const texts = Array.from(svg.querySelectorAll('text'));
const targets = texts.filter(t=>{ const cls = t.getAttribute('class')||''; return /\bst49\b/.test(cls); });
console.log('targets', targets.length);
const out = targets.map(t=>{
  const name = (t.textContent||'').trim().replace(/\s+/g,' ');
  let x = parseFloat(t.getAttribute('x')||t.getAttribute('dx')||'0');
  let y = parseFloat(t.getAttribute('y')||'0');
  const transform = t.getAttribute('transform');
  if((!x||!y) && transform){ const m = /translate\(([-0-9\.]+)[ ,]([-0-9\.]+)\)/.exec(transform); if(m){ x = parseFloat(m[1]); y = parseFloat(m[2]); } }
  // find nearest circle in document
  const circles = Array.from(svg.querySelectorAll('circle'));
  let nearest=null; let nd=Infinity;
  for(const c of circles){ const cx = parseFloat(c.getAttribute('cx')||'0'); const cy = parseFloat(c.getAttribute('cy')||'0'); const dx = cx - x; const dy = cy - y; const d = Math.hypot(dx,dy); if(d<nd){ nd=d; nearest={cx,cy}; } }
  return {name,x,y,nearest,dist: Math.round(nd)};
});
fs.writeFileSync(OUT, JSON.stringify(out,null,2));
console.log('wrote', OUT);
