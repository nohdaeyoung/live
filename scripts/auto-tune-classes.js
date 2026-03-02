#!/usr/bin/env node
// Auto-tune: find class names near matched station texts and write preferred-classes.json
const fs = require('fs');
const { JSDOM } = require('jsdom');
const SVG = 'assets/svg/Seoul_subway_linemap_en.svg';
const MATCH = 'data/seoul-final-stations.json';
const OUT = 'data/preferred-classes.json';
if(!fs.existsSync(SVG) || !fs.existsSync(MATCH)){ console.error('Missing inputs'); process.exit(1); }
const svgText = fs.readFileSync(SVG,'utf8');
const dom = new JSDOM(svgText);
const doc = dom.window.document;
const svg = doc.querySelector('svg');
const matches = JSON.parse(fs.readFileSync(MATCH,'utf8'));
const classes = new Set();
for(const m of matches){
  // find text elements with similar text content
  const texts = Array.from(svg.querySelectorAll('text'));
  for(const t of texts){
    const txt = (t.textContent||'').trim().replace(/\s+/g,' ');
    if(!txt) continue;
    if(txt.toLowerCase().includes((m.name||'').toLowerCase().split(' ')[0])){
      const cls = t.getAttribute('class')||'';
      if(cls) cls.split(/\s+/).forEach(c=>c && classes.add(c));
      // also parent group
      const g = t.closest && t.closest('g');
      if(g){ const gc = g.getAttribute('class')||''; if(gc) gc.split(/\s+/).forEach(c=>c && classes.add(c)); }
    }
  }
}
const arr = Array.from(classes).slice(0,50);
fs.writeFileSync(OUT, JSON.stringify(arr,null,2),'utf8');
console.log('Wrote', OUT, 'classes:', arr.length);
