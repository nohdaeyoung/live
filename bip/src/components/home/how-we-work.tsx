"use client";

import { motion } from "framer-motion";

const TRACKS = [
  {
    trigger: { icon: "💡", label: "아이디어 · 기획" },
    ai: { icon: "👸 🧚", name: "비서공주 & 탐정요정" },
    tasks: ["텔레그램 지시 접수", "관련 자료 조사", "구조 및 설계 기획"],
    color: {
      card: "bg-purple-50/60 border-purple-100",
      trigger: "bg-purple-100/60 text-purple-700",
      dot: "bg-purple-300",
      arrow: "text-purple-300",
    },
    docLink: undefined,
  },
  {
    trigger: { icon: "🎨", label: "디자인" },
    ai: { icon: "🎨", name: "근육디자이너" },
    tasks: ["UI 감성 디자인", "프로토타입 제작", "디자인 가이드 정립"],
    color: {
      card: "bg-rose-50/60 border-rose-100",
      trigger: "bg-rose-100/60 text-rose-700",
      dot: "bg-rose-300",
      arrow: "text-rose-300",
    },
  },
  {
    trigger: { icon: "🛠️", label: "개발" },
    ai: { icon: "👨‍💻 🤖", name: "개발팀 & 감성엔지니어" },
    tasks: ["구현", "유닛/통합 테스트", "코드 리뷰 및 병합"],
    color: {
      card: "bg-green-50/60 border-green-100",
      trigger: "bg-green-100/60 text-green-700",
      dot: "bg-green-300",
      arrow: "text-green-300",
    },
  },
  {
    trigger: { icon: "🔎", label: "QA · 검증" },
    ai: { icon: "🧪 🧑‍⚖️", name: "QA & 까칠한판사" },
    tasks: ["자동화 테스트 실행", "크로스브라우저 검증", "보안·규정 점검"],
    color: {
      card: "bg-yellow-50/60 border-yellow-100",
      trigger: "bg-yellow-100/60 text-yellow-700",
      dot: "bg-yellow-300",
      arrow: "text-yellow-300",
    },
  },
  {
    trigger: { icon: "🚀", label: "배포" },
    ai: { icon: "📦", name: "릴리스 파이프라인" },
    tasks: ["노션 문서화", "정적 사이트 배포", "모니터링 및 알림"],
    color: {
      card: "bg-white",
      trigger: "bg-gray-100/60 text-text-primary",
      dot: "bg-gray-300",
      arrow: "text-gray-300",
    },
  },
];

export function HowWeWork() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 border-t border-dashed border-border">
      {/* 헤드 카피 */}
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-bold text-text-primary leading-snug"
        >
          CEO의 말 한마디면 충분합니다.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-text-muted/50 leading-snug"
        >
          4명의 AI 요정이 분업하여 완성합니다.
        </motion.p>
      </div>

      {/* 2트랙 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {TRACKS.map((track, i) => (
          <motion.div
            key={track.ai.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`border rounded-2xl overflow-hidden ${track.color.card}`}
          >
            {/* 트리거 영역 */}
            <div className={`${track.color.trigger} px-4 py-3 text-center`}>
              <span className="text-2xl block mb-1">{track.trigger.icon}</span>
              <p className="text-[11px] font-bold tracking-wide">{track.trigger.label}</p>
            </div>

            {/* 화살표 */}
            <div className={`text-center py-1.5 text-lg ${track.color.arrow}`}>↓</div>

            {/* AI + 업무 영역 */}
            <div className="px-4 pb-4 text-center">
              <div className="mb-3">
                <span className="text-2xl block mb-1">{track.ai.icon}</span>
                <p className="text-sm font-bold text-text-primary">{track.ai.name}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {track.tasks.map((task) => (
                  <div key={task} className="flex items-center justify-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${track.color.dot}`} />
                    <p className="text-[11px] text-text-muted">{task}</p>
                  </div>
                ))}
              </div>

              {/* 문서 버튼 (노션 링크가 없으면 비활성화) */}
              <div className="mt-3">
                {track.docLink ? (
                  <a
                    href={track.docLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-bold text-white bg-primary px-3 py-1 rounded-full shadow-sm"
                  >
                    문서 보기
                  </a>
                ) : (
                  <span className="inline-block text-xs font-bold text-white bg-gray-300 px-3 py-1 rounded-full opacity-70 cursor-not-allowed">
                    문서 없음
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 수렴 — 배포 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 text-text-muted/30">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gray-300" />
          <span className="text-xs">↘</span>
          <span className="text-xs">↙</span>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gray-300" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
          <span className="text-lg">🚀</span>
          <p className="text-xs font-bold text-text-primary">노션 문서화 & 실시간 웹 배포</p>
        </div>
        <p className="text-[11px] text-text-muted">대영 마스터님은 결재만 하세요. 나머지는 저희가 합니다.</p>
      </motion.div>
    </div>
  );
}
