#!/usr/bin/env node
// Puppeteer deep crawl: navigate portal, monitor network for .zip/gtfs/stops requests, click common dataset links
const fs = require('fs');
const puppeteer = require('puppeteer');
const portals = ['https://data.seoul.go.kr','https://data.busan.go.kr','https://www.ktdb.go.kr'];
(async ()=>{
  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const results = [];
  for(const portal of portals){
    const page = await browser.newPage();
    const hits = new Set();
    try{
      page.setDefaultNavigationTimeout(30000);
      // monitor network
      page.on('response', async res=>{
        try{
          const url = res.url();
          if(/\.zip$|gtfs|stops\.txt|stops/i.test(url)) hits.add(url);
        }catch(e){}
      });
      page.on('request', req=>{
        const url = req.url();
        if(/\.zip$|gtfs|stops\.txt|stops/i.test(url)) hits.add(url);
      });
      console.log('Opening', portal);
      await page.goto(portal,{waitUntil:'networkidle2'}).catch(()=>{});

      // try to click dataset-like links: look for anchors or buttons with dataset, download, 상세, 보기
      const clickSelectors = ["a","button"];
      const anchors = await page.$$eval('a,button', els=>els.map(e=>({text:e.innerText, href:e.href||'', role:e.getAttribute('role')})).slice(0,200));
      // try clicking anchors/buttons that contain dataset-related keywords
      for(const el of anchors){
        const txt = (el.text||'').toLowerCase();
        if(/데이터|다운로드|자료|dataset|download|상세|보기|열람|파일|zip|gtfs|정류장|정차지|정류장정보/.test(txt)){
          try{
            // attempt navigation to href if same-origin
            if(el.href && el.href.startsWith(portal)){
              console.log('Visiting internal candidate', el.href);
              await page.goto(el.href,{waitUntil:'networkidle2', timeout:20000}).catch(()=>{});
            } else {
              // try click by finding element text
              await page.evaluate(t=>{const e=Array.from(document.querySelectorAll('a,button')).find(x=>x.innerText && x.innerText.toLowerCase().includes(t)); if(e) e.click(); }, txt.slice(0,30)).catch(()=>{});
              await page.waitForTimeout(1200);
            }
          }catch(e){}
        }
      }

      // also open a few internal links and monitor
      const links = await page.$$eval('a', as=>as.map(a=>a.href).filter(Boolean));
      const internal = links.filter(h=>h.startsWith(portal)).slice(0,50);
      for(const u of internal){
        try{
          await page.goto(u,{waitUntil:'networkidle2', timeout:15000});
          await page.waitForTimeout(500);
        }catch(e){}
      }

      results.push({portal, hits:Array.from(hits)});
    }catch(e){ results.push({portal, error:String(e).slice(0,200)}); }
    try{ await page.close(); }catch(e){}
  }
  await browser.close();
  fs.writeFileSync('data/gtfs-pw-deep-net-crawl.json', JSON.stringify(results,null,2),'utf8');
  console.log('Wrote data/gtfs-pw-deep-net-crawl.json');
  process.exit(0);
})();
