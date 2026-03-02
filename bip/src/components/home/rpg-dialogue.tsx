"use client";

import { useLiveChat } from "@/hooks/use-live-chat";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";

// 타이핑 효과 훅
function useTypewriter(text: string, speed = 20) {
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const prevText = useRef("");

  useEffect(() => {
    if (text === prevText.current) return;
    prevText.current = text;

    setDisplayed("");
    setIsTyping(true);

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, isTyping };
}

// 상대 시간
function timeAgo(timestamp: string): string {
  try {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = Math.floor((now - then) / 1000);

    if (diff < 10) return "방금 전";
    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  } catch {
    return "";
  }
}

export function RPGDialogue() {
  const { messages, loading } = useLiveChat(3);
  const lastMessage = messages[messages.length - 1];
  
  const rawContent = loading 
    ? "통신 연결 중입니다... 잠시만 기다려주세요." 
    : (lastMessage?.content || "현재 대화 내용이 없습니다.");

  const truncated = rawContent.length > 200 ? rawContent.slice(0, 200) + "..." : rawContent;
  const { displayed, isTyping } = useTypewriter(truncated, 15);

  // 상대 시간
  const [ago, setAgo] = useState("");
  useEffect(() => {
    if (!lastMessage?.timestamp) return;
    setAgo(timeAgo(lastMessage.timestamp));
    const timer = setInterval(() => setAgo(timeAgo(lastMessage.timestamp)), 5000);
    return () => clearInterval(timer);
  }, [lastMessage?.timestamp]);

  // 에이전트별 프로필
  const agent = lastMessage?.agent || "main";
  const isUser = lastMessage?.role === "user" && (agent === "main" || !lastMessage?.agent);

  const avatar = isUser
    ? "/images/profile-daeyoung.png"
    : agent === "secretary"
    ? "/images/profile-secretary.png"
    : agent === "detective"
    ? "/images/profile-detective.png"
    : agent === "judge"
    ? "/images/profile-judge.png"
    : agent === "designer"
    ? "/images/profile-designer.png"
    : "/images/profile-ai.png";

  const displayName = isUser
    ? "마스터 사미사"
    : agent === "secretary"
    ? "비서공주 AI"
    : agent === "detective"
    ? "탐정요정 AI"
    : agent === "judge"
    ? "까칠한판사 AI"
    : agent === "designer"
    ? "감성디자이너 AI"
    : "알프레드";

  const badge = isUser ? "👤 사용자" : "🧠 AI";

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-8 z-10 relative">
      {/* 헤더: 라이브 뱃지 + 전체 보기 링크 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-green-700">실시간 대화</span>
        </div>
        <span className="text-[10px] text-text-muted">지금 이 순간의 개발 로그</span>
      </div>

      {/* 대화 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* 상단: 캐릭터 + 이름 + 시간 */}
        <div className="flex items-center gap-3 p-3 pb-0">
          {/* 캐릭터 아바타 (픽셀 프레임) */}
          <div className="relative w-14 h-14 flex-shrink-0 bg-background border-2 border-text-primary rounded-lg overflow-hidden shadow-[3px_3px_0px_#3D3529] transform -rotate-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-full h-full"
            >
              <img
                src={avatar}
                alt="Character"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* 이름 + 시간 */}
          <div className="flex flex-col justify-center min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-1.5"
              >
                <span className="font-bold text-sm text-text-primary">{displayName}</span>
                <span className="text-[10px] text-text-muted">{ago}</span>
              </motion.div>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px]">{badge}</span>
            </div>
          </div>
        </div>

        {/* 말풍선: 타이핑 효과 */}
        <div className="mx-3 mt-2 mb-2 bg-gray-50 rounded-xl rounded-tl-sm p-3 relative">
          {/* 말꼬리 */}
          <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-gray-50" />

          {/* 역할 배지 */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600">
              💡 답변
            </span>
          </div>

          {/* 텍스트 */}
          <div className="relative h-[64px] overflow-hidden">
            <div className="font-mono text-sm leading-relaxed text-text-primary">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {displayed}
              </ReactMarkdown>
              {isTyping && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-blink" />}
            </div>
            {/* 그라데이션 오버레이 */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-gray-50 to-transparent" />
          </div>
        </div>
      </motion.div>

      {/* 하단: 전체 대화 보기 버튼 */}
      <div className="flex justify-center mt-3">
        <Link
          href="/live"
          className="group relative flex items-center gap-1 text-xs font-bold text-white bg-primary/80 hover:bg-primary px-4 py-1.5 rounded-full overflow-hidden transition-colors shadow-sm"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
          <span className="relative">전체 대화 보기</span>
          <ArrowRight size={12} className="relative group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
