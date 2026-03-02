#!/usr/bin/env node
// Puppeteer-based crawler to render portal pages and search for GTFS/zip/stops links
const fs = require('fs');
const puppeteer = require('puppeteer');
const portals = [
  'https://data.seoul.go.kr',
  'https://data.busan.go.kr',
  'https://www.ktdb.go.kr'
];
(async ()=>{
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const results = [];
  for(const portal of portals){
    try{
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(30000);
      console.log('Visiting', portal);
      await page.goto(portal,{waitUntil:'networkidle2'}).catch(e=>{});
      // collect links from initial page
      const links = await page.$$eval('a', as=>as.map(a=>a.href).filter(Boolean));
      let candidates = links.filter(h=>/\.zip$|gtfs|stops\.txt|stops/i.test(h));
      // try clicking search fields and waiting for results if present
      // attempt to find input[type=search] or form
      try{
        const searchSelector = await page.$('input[type=search], input[name*=search], input[id*=search]');
        if(searchSelector){
          await searchSelector.type('지하철');
          await Promise.all([page.keyboard.press('Enter'), page.waitForTimeout(1500)]);
          const links2 = await page.$$eval('a', as=>as.map(a=>a.href).filter(Boolean));
          candidates = candidates.concat(links2.filter(h=>/\.zip$|gtfs|stops\.txt|stops/i.test(h)));
        }
      }catch(e){}
      // also render some internal links (first 20) and scan
      const internal = links.filter(h=>h.startsWith(portal)).slice(0,20);
      for(const u of internal){
        try{
          await page.goto(u,{waitUntil:'networkidle2', timeout:15000});
          const l = await page.$$eval('a', as=>as.map(a=>a.href).filter(Boolean));
          candidates = candidates.concat(l.filter(h=>/\.zip$|gtfs|stops\.txt|stops/i.test(h)));
        }catch(e){}
      }
      candidates = Array.from(new Set(candidates));
      results.push({portal, count:candidates.length, candidates:candidates.slice(0,50)});
      await page.close();
    }catch(e){ results.push({portal, error:String(e).slice(0,200)}); }
  }
  await browser.close();
  fs.writeFileSync('data/gtfs-pw-crawl.json', JSON.stringify(results,null,2),'utf8');
  console.log('Wrote data/gtfs-pw-crawl.json');
})();
