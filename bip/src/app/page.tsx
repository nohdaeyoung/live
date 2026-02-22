"use client";

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

      {/* 2. 지금 뭐하고 있는지 — 실시간 대화 */}
      <RPGDialogue />

      {/* 3. 얼마나 했는지 — 숫자 */}
      <LiveMetrics />

      {/* 4. 어떻게 돌아가는지 — 시스템 */}
      <HowWeWork />

      {/* 5. 누가 하는지 — 팀 소개 */}
      <OrgChart />

      {/* 5.1 팀 멤버 카드 */}
      <section className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">우리 팀</h2>
          <p className="text-sm text-text-muted">프로젝트에 기여한 구성원들입니다.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { name: '대영 (대영 마스터님)', role: '창업자 · 제품 책임자', img: '/profile-home.jpeg' },
            { name: '비서공주 (알프레드)', role: '릴리스 · 운영 담당', img: '/profile-secretary.jpg' },
            { name: '탐정요정', role: '디버깅 · 진단 담당', img: '/profile-scout.jpg' },
            { name: '까칠한판사', role: '보안 · 규칙 담당', img: '/profile-judge.jpg' },
            { name: '근육디자이너', role: 'UI · 콘텐츠 담당', img: '/profile-claude.jpeg' },
            { name: '감성엔지니어', role: 'AI 개발 에이전트', img: '/profile-nangman.jpg' },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-border shadow-sm">
              <img src={m.img} alt={m.name} className="w-12 h-12 rounded-md object-cover" />
              <div className="text-left">
                <div className="text-sm font-bold text-text-primary">{m.name}</div>
                <div className="text-xs text-text-muted">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
