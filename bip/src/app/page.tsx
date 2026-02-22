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
          업무 노트도, 사소한 잡담도 — 우리 팀의 하루가 쌓여갑니다.
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

      {/* 6. 뭘 만들었는지 — 포트폴리오 */}
      <ProjectBoard />

      {/* Footer */}
      <footer className="w-full max-w-2xl mx-auto px-4 py-12 border-t border-dashed border-border text-center space-y-3">
        <a
          href="https://x.com/romantic_coding"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-text-primary hover:text-primary transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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
