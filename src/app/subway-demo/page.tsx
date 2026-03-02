'use client';
import React from 'react';
import SeoulMapInline from '../../components/SeoulMapInline';

export default function Page(){
  function handleStation(id:string,name?:string){
    // demo: open a modal or alert; keep simple console + alert for now
    console.log('station click', id, name);
    alert(`역 클릭: ${name || id || '[id 없음]'}`);
  }

  return (
    <main style={{fontFamily:'serif',background:'#f8f6f2',minHeight:'100vh',padding:24}}>
      <h1 style={{color:'#6b4a07'}}>지하철 N행시 데모 — Seoul (Inline SVG)</h1>
      <p>데모: 지도를 클릭하면 역 이름/ID를 보여줍니다. (SVG가 인라인으로 주입되어 각 역에 data-station 속성이 자동 부여됩니다.)</p>
      <SeoulMapInline onStationClick={handleStation} />
      <hr />
      <p style={{fontSize:13,color:'#444'}}>이 페이지는 데모용입니다. 다음 단계: 불필요한 레이블 필터링, 좌표 추출, 툴팁 컴포넌트 연결.</p>
    </main>
  );
}
