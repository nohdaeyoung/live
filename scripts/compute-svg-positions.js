#!/usr/bin/env node
// Compute absolute positions for key SVG elements (text, circle, use)
// Strategy: traverse DOM, accumulate transforms from parent nodes (simple translate/scale), resolve <use> by cloning referenced element
const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = require('path');

function parseTransform(t){
  if(!t) return {tx:0,ty:0, sx:1, sy:1};
  const res = {tx:0,ty:0, sx:1, sy:1};
  // handle translate(x,y) and scale(sx,sy)
  const tr = t.match(/translate\(([^)]+)\)/);
  if(tr){ const parts = tr[1].split(/[ ,]+/).map(parseFloat); res.tx = parts[0]||0; res.ty = parts[1]||0; }
  const sc = t.match(/scale\(([^)]+)\)/);
  if(sc){ const parts = sc[1].split(/[ ,]+/).map(parseFloat); res.sx = parts[0]||1; res.sy = parts[1]||res.sx; }
  return res;
}

function accumulateTransforms(node){
  let cur = node;
  let tx=0, ty=0, sx=1, sy=1;
  while(cur && cur.nodeName && cur.nodeName.toLowerCase()!=='#document'){
    if(cur.getAttribute){
      const t = cur.getAttribute('transform');
      if(t){ const p = parseTransform(t); tx = tx + p.tx * sx; ty = ty + p.ty * sy; sx = sx * p.sx; sy = sy * p.sy; }
      const x = cur.getAttribute('x') || cur.getAttribute('dx');
      const y = cur.getAttribute('y');
      if(x) tx += parseFloat(x)||0;
      if(y) ty += parseFloat(y)||0;
    }
    cur = cur.parentNode;
  }
  return {tx,ty,sx,sy};
}

function resolveUse(el, doc){
  // find referenced element by href or xlink:href
  const href = el.getAttribute('href') || el.getAttribute('xlink:href') || el.getAttribute('xlink:href');
  if(!href) return null;
  const id = href.replace(/^#/, '');
  const sym = doc.getElementById(id);
  return sym ? sym.cloneNode(true) : null;
}

const IN = process.argv[2] || 'assets/svg/Seoul_subway_linemap_en.svg';
const OUT = process.argv[3] || 'data/seoul-positions.json';
if(!fs.existsSync(IN)){ console.error('SVG not found', IN); process.exit(2); }
const txt = fs.readFileSync(IN,'utf8');
const dom = new JSDOM(txt);
const doc = dom.window.document;
const svg = doc.querySelector('svg');
if(!svg){ console.error('no svg root'); process.exit(3); }

const results = [];

// handle circles
const circles = Array.from(svg.querySelectorAll('circle'));
for(const c of circles){
  const center = getCircleCenter(c);
  const acc = accumulateTransforms(c);
  results.push({type:'circle', cx: center.cx*acc.sx + acc.tx, cy: center.cy*acc.sy + acc.ty, raw: {cx:center.cx,cy:center.cy}, class: c.getAttribute('class')});
}

function getCircleCenter(c){
  const cx = parseFloat(c.getAttribute('cx')||'0');
  const cy = parseFloat(c.getAttribute('cy')||'0');
  return {cx,cy};
}

// handle <use>
const uses = Array.from(svg.querySelectorAll('use'));
for(const u of uses){
  const acc = accumulateTransforms(u);
  const ref = resolveUse(u, doc);
  let bbox = {x:0,y:0};
  if(ref){
    const c = ref.querySelector && ref.querySelector('circle');
    if(c) bbox = getCircleCenter(c);
    else {
      const x = parseFloat(ref.getAttribute('x')||ref.getAttribute('dx')||'0');
      const y = parseFloat(ref.getAttribute('y')||'0');
      bbox = {x,y};
    }
  } else {
    bbox = {x: parseFloat(u.getAttribute('x')||'0'), y: parseFloat(u.getAttribute('y')||'0')};
  }
  results.push({type:'use', x: bbox.x*acc.sx + acc.tx, y: bbox.y*acc.sy + acc.ty, refId: u.getAttribute('href')||u.getAttribute('xlink:href'), class: u.getAttribute('class')});
}

// handle text nodes
const texts = Array.from(svg.querySelectorAll('text'));
for(const t of texts){
  const acc = accumulateTransforms(t);
  const x = parseFloat(t.getAttribute('x')||t.getAttribute('dx')||'0');
  const y = parseFloat(t.getAttribute('y')||'0');
  const name = (t.textContent||'').trim().replace(/\s+/g,' ');
  results.push({type:'text', x: x*acc.sx + acc.tx, y: y*acc.sy + acc.ty, text: name, class: t.getAttribute('class')});
}

fs.writeFileSync(OUT, JSON.stringify(results, null, 2),'utf8');
console.log('Wrote', OUT, 'items:', results.length);
