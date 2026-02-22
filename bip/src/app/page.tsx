"use client";

import { useEffect, useState } from "react";
import { RPGDialogue } from "@/components/home/rpg-dialogue";
import { OrgChart } from "@/components/home/org-chart";
import { ProjectBoard } from "@/components/home/project-board";
import { LiveMetrics } from "@/components/home/live-metrics";
import { HowWeWork } from "@/components/home/how-we-work";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* 1. Hero */}
      <section className="pt-24 pb-12 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5 tracking-tight">
          <span className="text-text-primary">오늘의 작업과 수다</span>
        </h1>
        <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
          프로젝트 진행도, 사소한 잡담도<br/>          우리 팀의 하루가 쌓여갑니다.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["#BuildInPublic", "#OpenClaw", "#VibeCoding"].map((tag) => (
            <span key={tag} className="text-[11px] font-mono text-text-muted bg-white/80 border border-border px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Debug / Recovery panel (temporary) */}
      <DebugPanel />

      {/* 2. 지금 뭐하고 있는지 — 실시간 대화 */}
      <RPGDialogue />

      {/* 3. 얼마나 했는지 — 숫자 */}
      <LiveMetrics />

      {/* 4. 어떻게 돌아가는지 — 시스템 */}
      <HowWeWork />

      {/* 5. 누가 하는지 — 팀 소개 */}
      <OrgChart />

      {/* 6. 뭘 만들었는지 — 포트폴리오 */}
      <ProjectBoard />

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-4 py-12 border-t border-dashed border-border text-center space-y-3">
        <a
          href="https://iloveyouicantforgetyou.neocities.org/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-primary transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 7h-3.02a15.9 15.9 0 00-1.07-3.01A8.03 8.03 0 0118.93 9zM12 4.07c.87 1.4 1.5 3.06 1.86 4.93H10.14C10.5 7.13 11.13 5.47 12 4.07zM4.07 12c0-.34.02-.67.05-1h3.27c-.03.33-.05.66-.05 1s.02.67.05 1H4.12c-.05-.33-.05-.66-.05-1zM5.07 9a8.03 8.03 0 01-1.16-1.99A15.9 15.9 0 018.09 9H5.07zM12 19.93c-.87-1.4-1.5-3.06-1.86-4.93h3.72c-.36 1.87-.99 3.53-1.86 4.93zM15.66 15.5H8.34a13.6 13.6 0 01-.9-3.5c0-1.24.32-2.42.9-3.5h7.32c.58 1.08.9 2.26.9 3.5 0 1.24-.32 2.42-.9 3.5zM18.93 15a8.03 8.03 0 01-1.16 1.99c.44-.8.8-1.66 1.02-1.99z"/></svg>
          대영 마스터
        </a>
        <div className="flex items-center justify-center gap-3 text-[10px] text-text-muted/60">
          
          <span>Built with OpenClaw</span>
          <span>·</span>
          <span>© 2026 Daeyoung Company</span>
        </div>
      </footer>
    </main>
  );
}

function DebugPanel() {
  const [dbg, setDbg] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    try {
      const w = (window as any).__liveChatDebug || { lastError: null, firebaseInit: null };
      setDbg(w);

      // try to read Firestore client if available
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fb = require("@/lib/firebase");
      const attemptWithDb = async (dbInstance: any) => {
        try {
          const { collection, query, orderBy, limit, getDocs, addDoc } = await import('firebase/firestore');
          const q = query(collection(dbInstance, 'chat_logs'), orderBy('timestamp', 'desc'), limit(5));
          getDocs(q).then((snap: any) => {
            const rows: any[] = [];
            snap.forEach((d: any) => rows.push({ id: d.id, ...d.data() }));
            setRecent(rows.reverse());
          }).catch(() => {});

          // send one-time debug report
          try {
            const payload = {
              ts: new Date().toISOString(),
              payload: JSON.stringify(w).slice(0, 2000),
            };
            if (!(window as any).__debug_report_sent) {
              await addDoc(collection(dbInstance, 'debug_reports'), payload);
              (window as any).__debug_report_sent = true;
              console.log('[debug] debug_reports written');
            }
          } catch (e) {
            console.log('[debug] debug report failed', e);
          }
        } catch (e) {
          // ignore
        }
      };

      if (fb && fb.db) {
        attemptWithDb(fb.db);
      } else {
        // fallback: try to initialize client-side firebase with exported firebaseConfig
        import('@/lib/firebase').then(({ firebaseConfig }) => {
          if (firebaseConfig && firebaseConfig.apiKey) {
            Promise.all([import('firebase/app'), import('firebase/firestore')])
              .then(([appMod, fsMod]) => {
                try {
                  const app = appMod.initializeApp(firebaseConfig);
                  const dbInstance = fsMod.getFirestore(app);
                  attemptWithDb(dbInstance);
                } catch (e) {
                  console.log('[debug] client init failed', e);
                }
              })
              .catch(() => {});
          }
        }).catch(() => {});
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <div className="font-bold text-sm text-yellow-800 mb-1">디버그 패널 (임시)</div>
        <div className="text-xs text-yellow-900">Firebase Init: {String(dbg?.firebaseInit ?? 'unknown')}</div>
        <div className="text-xs text-yellow-900">Last Error: {dbg?.lastError ? String(dbg.lastError) : 'none'}</div>
        <div className="mt-2 text-xs text-gray-700">최근 메시지 (클라이언트에서 읽을 수 있으면 표시됩니다):</div>
        <ul className="mt-1 text-xs">
          {recent.length === 0 ? <li className="text-gray-500">(없음)</li> : recent.map((r, i) => (
            <li key={i} className="border rounded px-2 py-1 mt-1 bg-white">{r.content?.slice?.(0,120) ?? JSON.stringify(r)}</li>
          ))}
        </ul>
        <div className="mt-2 text-[11px] text-gray-600">주의: 민감 정보는 표시되지 않습니다.</div>
      </div>
    </div>
  );
}
