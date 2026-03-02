#!/usr/bin/env node
// Export final stations JSON to CSV and GeoJSON (if lat/lon available)
const fs = require('fs');
const path = require('path');
const IN = process.argv[2] || 'data/seoul-final-stations.json';
const OUTCSV = process.argv[3] || 'data/seoul-final-stations.csv';
const OUTGEO = process.argv[4] || 'data/seoul-final-stations.geojson';
if(!fs.existsSync(IN)){ console.error('Missing input', IN); process.exit(1); }
const stations = JSON.parse(fs.readFileSync(IN,'utf8'));
const rows = [];
const features = [];
for(const s of stations){
  const id = s.id||s.slug||'';
  const name = (s.name||'').replace(/\n/g,' ').trim();
  const x = s.x||s.cx||s.text_x||'';
  const y = s.y||s.cy||s.text_y||'';
  rows.push([id, name, x, y]);
  // include only if lat/lon present
  if(s.lat && s.lon){
    features.push({ type:'Feature', properties:{id,name}, geometry:{ type:'Point', coordinates:[s.lon, s.lat] } });
  }
}
const csv = ['id,name,x,y', ...rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
fs.writeFileSync(OUTCSV, csv,'utf8');
fs.writeFileSync(OUTGEO, JSON.stringify({ type:'FeatureCollection', features }, null,2),'utf8');
console.log('Wrote', OUTCSV, OUTGEO);
