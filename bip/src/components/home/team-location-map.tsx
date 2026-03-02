"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  stationId: string;
  stationName: string;
  description: string;
}

interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

const teamMembers: TeamMember[] = [
  {
    id: "master",
    name: "마스터 사미사",
    role: "창업자 · 제품 책임자",
    img: "/images/profile-daeyoung.png",
    stationId: "seoul-station",
    stationName: "Seoul Station",
    description: "모든 노선이 만나는 중심. 프로젝트의 출발점과 도착점."
  },
  {
    id: "secretary",
    name: "비서공주",
    role: "릴리스 · 운영 담당",
    img: "/images/profile-secretary.png",
    stationId: "gangnam",
    stationName: "Gangnam",
    description: "비즈니스의 중심지. 팀의 일정과 리소스를 관리합니다."
  },
  {
    id: "detective",
    name: "탐정요정",
    role: "디버깅 · 진단 담당",
    img: "/images/profile-detective.png",
    stationId: "hongdae",
    stationName: "Hongik Univ",
    description: "창의성과 분석이 공존하는 곳. 문제의 실마리를 찾습니다."
  },
  {
    id: "judge",
    name: "까칠한판사",
    role: "보안 · 규칙 담당",
    img: "/images/profile-judge.png",
    stationId: "gwanghwamun",
    stationName: "Gwanghwamun",
    description: "원칙과 기준이 서 있는 곳. 품질의 문지기입니다."
  },
  {
    id: "designer",
    name: "감성디자이너",
    role: "UI · 콘텐츠 담당",
    img: "/images/profile-designer.png",
    stationId: "itaewon",
    stationName: "Itaewon",
    description: "다양성과 감성이 넘치는 공간. 시각적 경험을 설계합니다."
  },
  {
    id: "engineer",
    name: "감성엔지니어",
    role: "AI 개발 에이전트",
    img: "/images/profile-ai.png",
    stationId: "digital-media-city",
    stationName: "Digital Media City",
    description: "기술과 미디어의 중심. AI의 심장이 뛰는 곳."
  }
];

const stations: Station[] = [
  { id: "seoul-station", name: "Seoul Station", x: 16.29, y: 5.30 },
  { id: "city-hall", name: "City Hall", x: 16.25, y: 5.30 },
  { id: "gangnam", name: "Gangnam", x: 28.73, y: -5.50 },
  { id: "hongdae", name: "Hongik Univ", x: 16.25, y: 5.30 },
  { id: "gwanghwamun", name: "Gwanghwamun", x: 28.73, y: -5.50 },
  { id: "itaewon", name: "Itaewon", x: 20.50, y: 0 },
  { id: "digital-media-city", name: "Digital Media City", x: 16.29, y: 5.30 },
  { id: "dongdaemun", name: "Dongdaemun", x: 21.25, y: -5.50 },
  { id: "yeouido", name: "Yeouido", x: 18.95, y: -5.50 },
  { id: "jamsil", name: "Jamsil", x: 22.94, y: -5.50 }
];

export function TeamLocationMap() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // 좌표 정규화 (SVG 좌표로 변환)
  const normalizeX = (x: number) => {
    const minX = 13, maxX = 30;
    return ((x - minX) / (maxX - minX)) * 100;
  };

  const normalizeY = (y: number) => {
    const minY = -6, maxY = 6;
    return ((y - minY) / (maxY - minY)) * 100;
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">🗺️ 우리는 여기서 만납니다</h2>
        <p className="text-sm text-text-muted">6명의 팀원, 6개의 역. 지하철처럼 연결되어 있습니다.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 지도 영역 */}
        <div className="relative bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl p-6 border border-border min-h-[400px]">
          <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
            {/* 연결선 */}
            {teamMembers.map((member, i) => {
              const nextMember = teamMembers[(i + 1) % teamMembers.length];
              const station = stations.find(s => s.id === member.stationId);
              const nextStation = stations.find(s => s.id === nextMember.stationId);
              if (!station || !nextStation) return null;
              
              return (
                <motion.line
                  key={`line-${member.id}`}
                  x1={normalizeX(station.x)}
                  y1={normalizeY(station.y)}
                  x2={normalizeX(nextStation.x)}
                  y2={normalizeY(nextStation.y)}
                  stroke="url(#lineGradient)"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: i * 0.2 }}
                />
              );
            })}
            
            {/* 그라데이션 정의 */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7b2cbf" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* 역 노드 */}
            {teamMembers.map((member) => {
              const station = stations.find(s => s.id === member.stationId);
              if (!station) return null;
              
              const isSelected = selectedMember?.id === member.id;
              const isHovered = hoveredStation === member.id;
              
              return (
                <g key={member.id}>
                  {/* 외부 링 */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={normalizeX(station.x)}
                      cy={normalizeY(station.y)}
                      r="8"
                      fill="none"
                      stroke="#00d4ff"
                      strokeWidth="0.5"
                      opacity="0.5"
                    >
                      <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  {/* 메인 원 */}
                  <motion.circle
                    cx={normalizeX(station.x)}
                    cy={normalizeY(station.y)}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? "#ff006e" : "#00d4ff"}
                    stroke="#fff"
                    strokeWidth="1"
                    className="cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                    onMouseEnter={() => setHoveredStation(member.id)}
                    onMouseLeave={() => setHoveredStation(null)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  
                  {/* 역 이름 */}
                  <text
                    x={normalizeX(station.x)}
                    y={normalizeY(station.y) + 12}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="3"
                    opacity={isSelected || isHovered ? 1 : 0.7}
                  >
                    {station.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* 범례 */}
          <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#00d4ff]"></div>
              <span>팀원 위치</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ff006e]"></div>
              <span>선택됨</span>
            </div>
          </div>
        </div>

        {/* 팀원 목록 및 상세 정보 */}
        <div className="space-y-4">
          {/* 팀원 카드 목록 */}
          <div className="grid grid-cols-2 gap-3">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedMember?.id === member.id
                    ? "bg-[#00d4ff]/10 border-[#00d4ff]"
                    : "bg-white/5 border-border hover:bg-white/10"
                }`}
                onClick={() => setSelectedMember(member)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7b2cbf] flex items-center justify-center text-white font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text-primary truncate">{member.name}</div>
                    <div className="text-xs text-text-muted">{member.stationName}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 상세 정보 패널 */}
          <AnimatePresence mode="wait">
            {selectedMember && (
              <motion.div
                key={selectedMember.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-br from-[#00d4ff]/10 to-[#7b2cbf]/10 rounded-xl p-5 border border-[#00d4ff]/30"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#7b2cbf] flex items-center justify-center text-white font-bold text-2xl">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary">{selectedMember.name}</h3>
                    <p className="text-sm text-[#00d4ff] mb-2">{selectedMember.role}</p>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                      <span className="bg-white/10 px-2 py-0.5 rounded">🚇 {selectedMember.stationName}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {selectedMember.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedMember && (
            <div className="text-center py-8 text-text-muted text-sm">
              역을 클릭하거나 팀원을 선택해보세요 🎯
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
