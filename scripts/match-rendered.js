#!/usr/bin/env node
// Match rendered texts to nearest rendered circles to produce station candidates
const fs = require('fs');
const path = require('path');
const IN = process.argv[2] || 'data/seoul-rendered-positions.json';
const OUT = process.argv[3] || 'data/seoul-matched-stations.json';
if(!fs.existsSync(IN)){ console.error('input not found', IN); process.exit(2); }
const items = JSON.parse(fs.readFileSync(IN,'utf8'));
const texts = items.filter(i=>i.type==='text' && i.text && i.text.length>1);
const circles = items.filter(i=>i.type==='circle' || i.type==='use');

function slugify(s){ return s.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-_]/g,''); }

const matches = [];
for(const t of texts){
  let nearest=null; let nd=Infinity;
  for(const c of circles){
    const dx = (t.x||0) - (c.cx||c.x||0);
    const dy = (t.y||0) - (c.cy||c.y||0);
    const d = Math.hypot(dx,dy);
    if(d<nd){ nd=d; nearest=c; }
  }
  if(nearest && nd < 30){ // threshold px
    matches.push({id: slugify(t.text), name: t.text, x: nearest.cx||nearest.x, y: nearest.cy||nearest.y, dist: Math.round(nd), text_x:t.x, text_y:t.y});
  }
}
// dedupe by id
const map=new Map();
for(const m of matches){ if(!map.has(m.id)) map.set(m.id,m); }
const out=Array.from(map.values());
fs.writeFileSync(OUT, JSON.stringify(out,null,2),'utf8');
console.log('Wrote', OUT, 'stations:', out.length);
