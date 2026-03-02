import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request){
  try{
    const body = await req.json();
    const { filename, stations } = body;
    if(!filename || !stations) return NextResponse.json({error:'filename and stations required'}, {status:400});
    const dataDir = path.join(process.cwd(),'data');
    if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    const outPath = path.join(dataDir, filename);
    fs.writeFileSync(outPath, JSON.stringify(stations, null, 2), 'utf8');
    return NextResponse.json({ok:true, path: `/data/${filename}`});
  }catch(e:any){
    return NextResponse.json({error: String(e)}, {status:500});
  }
}
