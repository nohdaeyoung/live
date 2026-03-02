"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// 정적 예시 대화 데이터
const SAMPLE_DIALOGUE = {
  agent: "알프레드",
  content: "오늘도 새로운 기능을 만들어볼까요? 팀 프로젝트 진행 상황을 확인하고 있습니다.",
  timestamp: new Date().toISOString(),
};

export function RPGDialogue() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 border-t border-dashed border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-text-primary"
          >
            실시간 대화
          </motion.p>
          <p className="text-xs text-text-muted">지금 이 순간의 개발 로그</p>
        </div>
        <Link
          href="/live"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <span>전체 대화 보기</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 대화 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-border rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <img
            src="/images/profile-ai.png"
            alt={SAMPLE_DIALOGUE.agent}
            className="w-10 h-10 rounded-md object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-text-primary">
                {SAMPLE_DIALOGUE.agent}
              </span>
              <span className="text-xs text-text-muted">· AI</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {SAMPLE_DIALOGUE.content}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
