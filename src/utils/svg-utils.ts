import { JSDOM } from 'jsdom';
import fs from 'fs';

export function loadSvgText(path: string){
  return fs.readFileSync(path,'utf8');
}

export function parseSvg(svgText: string){
  const dom = new JSDOM(svgText);
  const doc = dom.window.document;
  const svg = doc.querySelector('svg');
  return { doc, svg };
}
