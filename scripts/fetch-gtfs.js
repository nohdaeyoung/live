#!/usr/bin/env node
// Attempt to fetch GTFS or station CSVs for Seoul and Busan from known sources
const fetch = require('node-fetch');
const fs = require('fs');

const candidates = [
  {name:'Seoul open data - subway station', url:'https://data.seoul.go.kr/dataList/OA-15470/S/1/datasetView.do'},
  {name:'SeoulGTFS mirror (transitland?)', url:'https://transit.land/feeds/'},
  {name:'GTFS general list', url:'https://old.gtfs.org/resources/data/'},
  {name:'Busan metro - commons', url:'https://data.busan.go.kr'}
];

(async ()=>{
  for(const c of candidates){
    try{
      console.log('HEAD', c.url);
      const r = await fetch(c.url, {method:'HEAD'});
      console.log(c.url, r.status);
    }catch(e){ console.log('ERR', c.url, String(e).slice(0,200)); }
  }
  fs.writeFileSync('data/gtfs-check.json', JSON.stringify({checked: candidates, timestamp:new Date().toISOString()}));
  console.log('Wrote data/gtfs-check.json');
})();
