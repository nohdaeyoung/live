#!/usr/bin/env node
// Render SVG in headless Chromium and extract getBBox positions for station symbols and texts
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async ()=>{
  const IN = process.argv[2] || 'assets/svg/Seoul_subway_linemap_en.svg';
  const OUT = process.argv[3] || 'data/seoul-rendered-positions.json';
  if(!fs.existsSync(IN)){ console.error('SVG not found', IN); process.exit(2); }
  const svgContent = fs.readFileSync(IN,'utf8');

  const browser = await puppeteer.launch({args:['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${svgContent}</body></html>`, {waitUntil:'networkidle0'});
  const results = await page.evaluate(()=>{
    const items = [];
    const svg = document.querySelector('svg');
    if(!svg) return items;
    // collect elements: circles, uses (resolved), texts
    const circles = Array.from(svg.querySelectorAll('circle'));
    circles.forEach(c=>{
      const bb = c.getBBox();
      items.push({type:'circle', cx: bb.x + bb.width/2, cy: bb.y + bb.height/2, class: c.getAttribute('class')});
    });
    const texts = Array.from(svg.querySelectorAll('text'));
    texts.forEach(t=>{
      const bb = t.getBBox();
      items.push({type:'text', x: bb.x + bb.width/2, y: bb.y + bb.height/2, text: t.textContent.trim(), class: t.getAttribute('class')});
    });
    const uses = Array.from(svg.querySelectorAll('use'));
    uses.forEach(u=>{
      try{ const bb = u.getBBox(); items.push({type:'use', x: bb.x + bb.width/2, y: bb.y + bb.height/2, ref: u.getAttribute('href')||u.getAttribute('xlink:href'), class: u.getAttribute('class')}); }catch(e){}
    });
    return items;
  });
  fs.writeFileSync(OUT, JSON.stringify(results,null,2),'utf8');
  console.log('Wrote', OUT, 'items:', results.length);
  await browser.close();
})();
