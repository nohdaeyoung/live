import React, { useEffect } from 'react';

// Simple wrapper that inlines the raw SVG and attaches click/hover handlers to elements with data-station
// For a production conversion we would parse the SVG and assign stable ids/slugs to each <g> or <text> element.

export default function SeoulMapReact({ onStationClick }: { onStationClick?: (id: string)=>void }){
  useEffect(()=>{
    const root = document.getElementById('seoul-map-root');
    if(!root) return;
    // delegate clicks on elements that have data-station attribute
    function handler(e: MouseEvent){
      const t = e.target as HTMLElement | null;
      if(!t) return;
      const stationEl = t.closest('[data-station]') as HTMLElement | null;
      if(stationEl){
        const id = stationEl.getAttribute('data-station') || ''; 
        onStationClick?.(id);
      }
    }
    root.addEventListener('click', handler);
    return ()=> root.removeEventListener('click', handler);
  }, [onStationClick]);

  // NOTE: This inlines a reference to the saved SVG file. For brevity the SVG is referenced via <img> tag.
  // If you want full inline SVG so we can attach ids to elements, replace the <img> with the raw SVG content.
  return (
    <div id="seoul-map-root" style={{maxWidth:900}}>
      <img src="/assets/svg/Seoul_subway_linemap_en.svg" alt="Seoul subway map" style={{width:'100%',height:'auto'}}/>
      <p style={{fontSize:12,color:'#666'}}>상단 지도를 클릭하면 (데모) 콘솔에 data-station 값을 찍습니다. 실제 작업 시 각 역에 data-station 속성을 부여해야 합니다.</p>
    </div>
  );
}
