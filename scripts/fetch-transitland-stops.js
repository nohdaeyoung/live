#!/usr/bin/env node
// Query transit.land for feeds matching 'seoul' and attempt to download GTFS and extract stops.txt
const fetch = (...args) => import('node-fetch').then(({default:fetch})=>fetch(...args));
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function run(){
  const q = 'seoul';
  const url = `https://transit.land/api/v2/rest/feeds?per_page=50&q=${encodeURIComponent(q)}`;
  console.log('Querying', url);
  const r = await fetch(url);
  const j = await r.json();
  if(!fs.existsSync('data')) fs.mkdirSync('data');
  fs.writeFileSync('data/transitland-feeds.json', JSON.stringify(j,null,2),'utf8');
  console.log('Feeds found:', j.feeds && j.feeds.length);
  for(const f of (j.feeds||[])){
    if(f.latest_valid_feed && f.latest_valid_feed.url){
      const feedUrl = f.latest_valid_feed.url;
      console.log('Attempt download feed:', feedUrl);
      try{
        const resp = await fetch(feedUrl);
        if(resp.status!==200){ console.log('Failed to download', resp.status); continue; }
        const buf = await resp.buffer();
        const zipPath = path.join('data', (f.onestop_id||f.feed_onestop_id||'feed') + '.zip');
        fs.writeFileSync(zipPath, buf);
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries();
        const stopsEntry = entries.find(e=>/stops\.txt$/i.test(e.entryName));
        if(stopsEntry){
          const stopsText = stopsEntry.getData().toString('utf8');
          const outPath = path.join('data', path.basename(zipPath, '.zip') + '-stops.txt');
          fs.writeFileSync(outPath, stopsText,'utf8');
          console.log('Wrote stops to', outPath);
        } else console.log('No stops.txt in', zipPath);
      }catch(e){ console.log('download error', String(e).slice(0,200)); }
    }
  }
}
run();
