'use client';
import React, { useEffect, useRef } from 'react';

function slugify(s: string){

  return s.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-_]/g,'');
}

export default function SeoulMapInline({ onStationClick }: { onStationClick?: (id:string,name?:string)=>void }){
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(()=>{
    const root = rootRef.current;
    if(!root) return;

    // fetch the SVG file at runtime instead of importing it (avoids build-time svg module parsing issues)
    fetch('/assets/svg/Seoul_subway_linemap_en.svg').then(r=>r.text()).then(text=>{
      root.innerHTML = text;
      const svg = root.querySelector('svg');
      if(!svg) return;

      // find text elements and assign data-station on nearest group <g>
      const texts = Array.from(svg.querySelectorAll('text')) as HTMLElement[];
    texts.forEach(t=>{
      const name = (t.textContent||'').trim();
      if(!name) return;
      // filter: ignore legend/title/caption by class or small font-size
      const cls = (t.getAttribute('class')||'');
      if(/legend|title|caption|label|note/i.test(cls)) return;
      const fontSizeAttr = t.getAttribute('font-size') || window.getComputedStyle(t as Element).fontSize || '';
      const fontSize = parseFloat(fontSizeAttr) || 0;
      if(fontSize && fontSize < 10) return; // skip tiny labels

      const slug = slugify(name);
      // prefer enclosing <g>, fallback to the text element itself
      const el = t.closest('g') || t;
      if(el && !(el as HTMLElement).dataset.station){
        (el as HTMLElement).dataset.station = slug;
        (el as HTMLElement).dataset.stationName = name;
        // add pointer cursor
        (el as HTMLElement).style.cursor = 'pointer';
      }
    });

    function clickHandler(e: MouseEvent){
      const t = e.target as HTMLElement | null;
      if(!t) return;
      const stationEl = t.closest('[data-station]') as HTMLElement | null;
      if(stationEl){
        const id = stationEl.dataset.station || '';
        const name = stationEl.dataset.stationName || '';
        onStationClick?.(id,name);
      }
    }

      svg.addEventListener('click', clickHandler as any);
      return ()=> svg.removeEventListener('click', clickHandler as any);
    }).catch(err=>{
      console.error('Failed to load SVG:', err);
      root.innerHTML = '<div style="color:#900">SVG 불러오기 실패 — 파일이 assets/svg/Seoul_subway_linemap_en.svg에 있는지 확인하세요.</div>';
    });
  }, [onStationClick]);

  return (
    <div ref={rootRef} style={{maxWidth:1200}} aria-label="Seoul inline subway map" />
  );
}
