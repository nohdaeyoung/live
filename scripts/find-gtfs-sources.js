#!/usr/bin/env node
// Attempt to find GTFS or station CSVs from known public portals for Seoul and Busan
const fetchP = (...args)=>import('node-fetch').then(m=>m.default(...args));
const fs = require('fs');
const urls = [
  'https://data.seoul.go.kr',
  'https://www.ktdb.go.kr',
  'https://data.busan.go.kr',
  'https://old.gtfs.org/resources/data/',
  'https://datahub.io/core/gtfs'
];
(async ()=>{
  const results = [];
  for(const u of urls){
    try{
      const r = await fetchP(u,{method:'HEAD'});
      results.push({url:u,status:r.status});
    }catch(e){ results.push({url:u,error:String(e).slice(0,200)}); }
  }
  fs.writeFileSync('data/gtfs-portals-check.json', JSON.stringify(results,null,2));
  console.log('Wrote data/gtfs-portals-check.json');
})();
