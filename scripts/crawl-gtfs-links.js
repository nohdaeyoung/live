#!/usr/bin/env node
// Crawl given portal URLs and search for GTFS zip or stops.txt links
const fetchP = (...args)=>import('node-fetch').then(m=>m.default(...args));
const fs = require('fs');
const {JSDOM} = require('jsdom');

const portals = [
  'https://www.ktdb.go.kr',
  'https://data.busan.go.kr',
  'https://data.seoul.go.kr',
  'https://old.gtfs.org/resources/data/'
];

(async ()=>{
  const results = [];
  for(const url of portals){
    try{
      const res = await fetchP(url);
      const html = await res.text();
      const dom = new JSDOM(html);
      const doc = dom.window.document;
      const links = Array.from(doc.querySelectorAll('a')).map(a=>a.href).filter(Boolean);
      const matches = links.filter(h=>/\.zip$|gtfs|stops\.txt|stops/i.test(h));
      results.push({portal:url, status: res.status, matches: Array.from(new Set(matches)).slice(0,50)});
    }catch(e){ results.push({portal:url, error:String(e).slice(0,200)}); }
  }
  fs.writeFileSync('data/gtfs-crawl.json', JSON.stringify(results,null,2),'utf8');
  console.log('Wrote data/gtfs-crawl.json');
})();
