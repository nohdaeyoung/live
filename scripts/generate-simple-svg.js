#!/usr/bin/env node
// Generate a simple SVG from matched stations JSON
const fs = require('fs');
const path = require('path');
const IN = process.argv[2] || 'data/seoul-final-stations.json';
const OUT = process.argv[3] || 'public/preview-subway-seoul.svg';
if(!fs.existsSync(IN)){ console.error('input missing', IN); process.exit(2); }
const stations = JSON.parse(fs.readFileSync(IN,'utf8'));
if(stations.length===0){ console.error('no stations'); process.exit(3); }
const xs = stations.map(s=>s.x||s.cx||s.text_x||0);
const ys = stations.map(s=>s.y||s.cy||s.text_y||0);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const pad = 20;
const width = 1200, height = 900;
function mapX(v){ return pad + ( (v - minX) / (maxX - minX || 1) ) * (width - pad*2); }
function mapY(v){ return pad + ( (v - minY) / (maxY - minY || 1) ) * (height - pad*2); }
let svg = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<style>text{font-family:Arial,sans-serif;font-size:12px;fill:#222} .station{fill:#ff6b6b;stroke:#fff;stroke-width:2}</style>\n<rect width="100%" height="100%" fill="#f8f6f2"/>\n`;
for(const s of stations){
  const rawX = s.x||s.cx||s.text_x||0;
  const rawY = s.y||s.cy||s.text_y||0;
  const x = mapX(rawX);
  const y = mapY(rawY);
  const name = (s.name||s.id||'').replace(/\n/g,' ');
  svg += `<circle class="station" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/>\n`;
  svg += `<text x="${(x+8).toFixed(1)}" y="${(y+4).toFixed(1)}">${name}</text>\n`;
}
svg += '</svg>';
fs.mkdirSync(path.dirname(OUT), {recursive:true});
fs.writeFileSync(OUT, svg,'utf8');
console.log('Wrote', OUT);
