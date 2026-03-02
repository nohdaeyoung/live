#!/usr/bin/env node
// Try portal search pages with common keywords to find downloadable GTFS/stops datasets
const fetchP = (...args)=>import('node-fetch').then(m=>m.default(...args));
const fs = require('fs');

const portals = [
  'https://data.seoul.go.kr',
  'https://data.busan.go.kr',
  'https://www.ktdb.go.kr'
];
const queries = ['gtfs','stops','정차지','정류장','지하철','역','subway','station','stops.txt'];
(async ()=>{
  const results = [];
  for(const portal of portals){
    for(const q of queries){
      const urlsToTry = [
        `${portal}/search?q=${encodeURIComponent(q)}`,
        `${portal}/api/search?q=${encodeURIComponent(q)}`,
        `${portal}/openapi/search?q=${encodeURIComponent(q)}`,
        `${portal}/dataset?q=${encodeURIComponent(q)}`,
        `${portal}/catalog?q=${encodeURIComponent(q)}`
      ];
      for(const url of urlsToTry){
        try{
          const r = await fetchP(url,{redirect:'follow'});
          const text = await r.text();
          const found = /(stops\.txt|\.zip|gtfs|정차지|정류장|지하철|역|station)/i.test(text);
          results.push({portal,query:q,url,status:r.status,found});
          if(found){
            const snippet = text.slice(0,400);
            results.push({portal,query:q,url,snippet});
            console.log('Found candidate at', url);
          }
        }catch(e){ results.push({portal,query:q,url,error:String(e).slice(0,200)}); }
      }
    }
  }
  fs.writeFileSync('data/gtfs-search-results.json', JSON.stringify(results,null,2),'utf8');
  console.log('Wrote data/gtfs-search-results.json');
})();
