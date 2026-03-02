#!/usr/bin/env node
// Deep crawl: fetch sitemap.xml or index and scan for candidate GTFS/stops links
const fetchP = (...args)=>import('node-fetch').then(m=>m.default(...args));
const fs = require('fs');
const { JSDOM } = require('jsdom');

const portals = ['https://data.seoul.go.kr','https://data.busan.go.kr','https://www.ktdb.go.kr'];
(async ()=>{
  const results = [];
  for(const portal of portals){
    try{
      const sitemapUrls = [portal+'/sitemap.xml', portal+'/sitemap_index.xml', portal+'/sitemap/sitemap.xml'];
      for(const s of sitemapUrls){
        try{
          const r = await fetchP(s);
          if(r.status!==200) {
            // skip
          } else {
            const text = await r.text();
            // extract loc entries
            const locs = Array.from(text.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m=>m[1]);
            const matches = locs.filter(u=>/stops|gtfs|download|zip|station|지하철|정류장|정차지/i.test(u));
            results.push({portal, sitemap:s, found:matches.slice(0,20)});
          }
        }catch(e){ /* ignore */ }
      }
      // try robots.txt for sitemap link
      try{
        const r2 = await fetchP(portal+'/robots.txt');
        if(r2.status===200){
          const t = await r2.text();
          const m = t.match(/Sitemap:\s*(.+)/i);
          if(m){
            const s = m[1].trim();
            try{
              const r3 = await fetchP(s);
              if(r3.status===200){
                const txt=await r3.text();
                const locs=Array.from(txt.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m=>m[1]);
                const matches=locs.filter(u=>/stops|gtfs|download|zip|station|지하철|정류장|정차지/i.test(u));
                results.push({portal, sitemap_from_robots:s, found:matches.slice(0,20)});
              }
            }catch(e){ /* ignore */ }
          }
        }
      }catch(e){ /* ignore */ }
    }catch(e){ results.push({portal, error:String(e).slice(0,200)}); }
  }
  fs.writeFileSync('data/gtfs-deep-crawl.json', JSON.stringify(results,null,2),'utf8');
  console.log('Wrote data/gtfs-deep-crawl.json');
})();
