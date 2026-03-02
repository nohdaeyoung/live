#!/usr/bin/env node
// Run render (puppeteer) then match, producing final stations file
const { execSync } = require('child_process');
const path = require('path');
const IN = process.argv[2] || 'assets/svg/Seoul_subway_linemap_en.svg';
const RENDER_OUT = process.argv[3] || 'data/seoul-rendered-positions.json';
const MATCH_OUT = process.argv[4] || 'data/seoul-final-stations.json';

console.log('Rendering SVG to positions...');
execSync(`node scripts/render-svg-positions.js ${IN} ${RENDER_OUT}`, {stdio:'inherit'});
console.log('Matching rendered positions to stations...');
execSync(`node scripts/match-rendered.js ${RENDER_OUT} ${MATCH_OUT}`, {stdio:'inherit'});
console.log('Done. Final stations:', MATCH_OUT);
