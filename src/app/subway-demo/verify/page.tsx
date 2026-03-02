'use client';
import React, { useEffect, useState, useRef } from 'react';

export default function VerifyPage(){
  const [svgText, setSvgText] = useState('');
  const [stations, setStations] = useState([] as any[]);
  const svgContainer = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{el: SVGElement|null, idx:number|null, offsetX:number, offsetY:number}>({el:null, idx:null, offsetX:0, offsetY:0});

  useEffect(()=>{
    fetch('/assets/svg/Seoul_subway_linemap_en.svg').then(r=>r.text()).then(t=>setSvgText(t));
    fetch('/data/seoul-extracted-stations.json').then(r=>r.json()).then(j=>setStations(j)).catch(()=>{
      fetch('/data/seoul-stations.json').then(r=>r.json()).then(j=>setStations(j)).catch(()=>{});
    });
  },[]);

  useEffect(()=>{
    if(!svgText || !svgContainer.current) return;
    const root = svgContainer.current;
    root.innerHTML = svgText;
    const svg = root.querySelector('svg') as SVGSVGElement | null;
    if(!svg) return;
    Array.from(svg.querySelectorAll('.station-marker')).forEach(n=>n.remove());
    stations.forEach((s,idx)=>{
      const ns = document.createElementNS('http://www.w3.org/2000/svg','circle');
      ns.setAttribute('cx', String(s.x||0));
      ns.setAttribute('cy', String(s.y||0));
      ns.setAttribute('r','8');
      ns.setAttribute('fill','#ff6b6b');
      ns.setAttribute('stroke','#fff');
      ns.setAttribute('stroke-width','2');
      ns.classList.add('station-marker');
      ns.style.cursor = 'grab';
      ns.addEventListener('mousedown', (e)=>{
        e.preventDefault();
        const pt = svg.createSVGPoint();
        pt.x = (e as MouseEvent).clientX; pt.y = (e as MouseEvent).clientY;
        const ctm = svg.getScreenCTM()?.inverse();
        const loc = pt.matrixTransform(ctm as any);
        dragState.current = {el: ns, idx, offsetX: loc.x - (s.x||0), offsetY: loc.y - (s.y||0)};
        ns.style.cursor = 'grabbing';
      });
      svg.appendChild(ns);
      const t = document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x', String((s.x||0) + 10));
      t.setAttribute('y', String((s.y||0) + 4));
      t.setAttribute('font-size','12');
      t.setAttribute('fill','#222');
      t.textContent = s.name;
      t.classList.add('station-marker');
      svg.appendChild(t);
    });

    function onMouseMove(e: MouseEvent){
      if(!dragState.current.el) return;
      const svg = root.querySelector('svg') as SVGSVGElement | null;
      if(!svg) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const ctm = svg.getScreenCTM()?.inverse();
      const loc = pt.matrixTransform(ctm as any);
      const {idx, offsetX, offsetY} = dragState.current;
      if(idx==null) return;
      const nx = loc.x - offsetX; const ny = loc.y - offsetY;
      dragState.current.el!.setAttribute('cx', String(nx));
      dragState.current.el!.setAttribute('cy', String(ny));
      // move corresponding text label
      const texts = Array.from(svg.querySelectorAll('.station-marker')) as SVGElement[];
      const labels = texts.filter(el=>el.tagName.toLowerCase()==='text');
      const label = labels[idx];
      if(label) { label.setAttribute('x', String(nx+10)); label.setAttribute('y', String(ny+4)); }
      setStations(prev=>{
        const copy = prev.slice(); copy[idx] = {...copy[idx], x: nx, y: ny}; return copy;
      });
    }
    function onMouseUp(){
      if(dragState.current.el) dragState.current.el.style.cursor='grab';
      dragState.current = {el:null, idx:null, offsetX:0, offsetY:0};
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return ()=>{ window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  },[svgText, stations]);

  async function save(){
    const filename = 'seoul-extracted-stations.json';
    const res = await fetch('/api/save-stations', {method:'POST', body: JSON.stringify({filename, stations}), headers:{'content-type':'application/json'}});
    const j = await res.json();
    if(j.ok) alert('저장 완료: '+j.path);
    else alert('저장 실패: '+(j.error||JSON.stringify(j)));
  }

  function addMarker(){
    const x = 100, y = 100; // default pos
    setStations(s=>[...s,{id:`manual-${Date.now()}`, name:'New Station', x, y, source:'manual'}]);
  }

  function remove(idx:number){ setStations(s=>s.filter((_,i)=>i!==idx)); }

  function downloadCSV(){
    const csv = 'id,name,x,y,source\n' + stations.map(o=>`${o.id},"${o.name.replace(/"/g,'""')}",${o.x},${o.y},${o.source}`).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download='seoul-stations.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <main style={{fontFamily:'serif',padding:20,background:'#f8f6f2',minHeight:'100vh'}}>
      <h1 style={{color:'#6b4a07'}}>지도 검증 도구 (Seoul)</h1>
      <p>지도 위 마커를 드래그해 좌표를 보정하거나, 추가/제거 후 저장 또는 CSV 다운로드하세요.</p>
      <div style={{display:'flex',gap:16}}>
        <div style={{flex:1,border:'1px solid #ddd',padding:8,background:'#fff'}} ref={svgContainer} />
        <div style={{width:360}}>
          <h3>추출된 스테이션 ({stations.length})</h3>
          <button onClick={addMarker} style={{marginBottom:8}}>마커 추가</button>
          <button onClick={save} style={{marginBottom:8, marginLeft:8}}>변경 저장</button>
          <button onClick={downloadCSV} style={{marginBottom:8, marginLeft:8}}>CSV 다운로드</button>
          <ul>
            {stations.map((s,i)=>(
              <li key={i} style={{marginBottom:8}}>
                <strong>{s.name}</strong><br/>
                <small>{Math.round(s.x)},{Math.round(s.y)} — {s.source||s.class}</small><br/>
                <button onClick={()=>remove(i)} style={{marginTop:6}}>제거</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
