"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const TEAM = [
  {
    name: "대영 마스터",
    role: "CEO",
    icon: "👨‍💻",
    color: "bg-gray-800 text-white border-gray-900",
  },
  {
    name: "비서공주",
    role: "총괄 파이프라인",
    icon: "👸",
    color: "bg-purple-100 text-purple-600 border-purple-300",
  },
  {
    name: "탐정요정",
    role: "기획 · 개발",
    icon: "🧚",
    color: "bg-emerald-100 text-emerald-600 border-emerald-300",
  },
  {
    name: "까칠한판사",
    role: "검수 · 리뷰",
    icon: "🧑‍⚖️",
    color: "bg-amber-100 text-amber-600 border-amber-300",
  },
  {
    name: "감성디자이너",
    role: "UI/UX · 아트",
    icon: "🎨",
    color: "bg-pink-100 text-pink-600 border-pink-300",
  },
];

export function OrgChart() {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 border-t border-dashed border-border">
      {/* 헤드 카피 (숨김)
      <div className="text-center mb-12">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-bold text-text-primary leading-snug"
        >
          1명의 사람과 4명의 AI 요정.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-text-muted/50 leading-snug"
        >
          사미사프로젝트의 어벤저스 팀입니다.
        </motion.p>
      </div>
      */}

      {/* 팀원 카드 (숨김)
      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
        {TEAM.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full border-[3px] ${member.color} shadow-md mb-2 text-2xl`}>
              {member.icon}
            </div>
            <p className="text-xs font-bold text-text-primary leading-tight">{member.name}</p>
            <p className="text-[9px] text-text-muted">{member.role}</p>
          </motion.div>
        ))}
      </div>
      */}
    </div>
  );
}
