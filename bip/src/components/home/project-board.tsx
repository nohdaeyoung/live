"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  url?: string;
  type: string;
  order: number;
}

interface Product {
  id: string;
  title: string;
  desc: string;
  status: "dev" | "shipped" | "hold";
  link?: string;
  order: number;
  works: WorkItem[];
}

const STATUS_COLOR: Record<string, string> = {
  dev: "bg-primary/10 text-primary",
  shipped: "bg-green-100 text-green-700",
  hold: "bg-gray-100 text-text-muted",
};

const STATUS_LABEL: Record<string, string> = {
  dev: "개발중",
  shipped: "완료",
  hold: "보류",
};

const TYPE_STYLE: Record<string, string> = {
  "기획": "bg-blue-100 text-blue-700",
  "설계": "bg-purple-100 text-purple-700",
  "개발": "bg-amber-100 text-amber-700",
  "배포": "bg-green-100 text-green-700",
};

const DEFAULT_PROJECTS: Product[] = [
  {
    id: "bip",
    title: "사미사 프로젝트 (BIP)",
    desc: "1명의 마스터 + 5명의 AI 요정이 만드는 실시간 코딩 로그 사이트",
    status: "shipped",
    link: "https://324-company-bip.web.app",
    order: 1,
    works: [
      { id: "w1", title: "요구사항 수집 · 기획", url: "https://github.com/nohdaeyoung/live/blob/main/docs/how-we-work/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD-%EC%88%98%EC%A7%91.md", type: "기획", order: 1 },
      { id: "w2", title: "UI/UX 디자인", url: "https://github.com/nohdaeyoung/live/blob/main/docs/how-we-work/%EB%94%94%EC%9E%90%EC%9D%B8.md", type: "설계", order: 2 },
      { id: "w3", title: "프론트엔드 · 백엔드 개발", url: "https://github.com/nohdaeyoung/live/blob/main/docs/how-we-work/%EA%B0%9C%EB%B0%9C.md", type: "개발", order: 3 },
      { id: "w4", title: "QA · 보안 검증", url: "https://github.com/nohdaeyoung/live/blob/main/docs/how-we-work/QA-%EA%B2%80%EC%A6%9D.md", type: "개발", order: 4 },
      { id: "w5", title: "Firebase Hosting 배포", url: "https://github.com/nohdaeyoung/live/blob/main/docs/how-we-work/%EB%B0%B0%ED%8F%AC.md", type: "배포", order: 5 },
    ],
  },
  {
    id: "logger",
    title: "324-OS Logger",
    desc: "OpenClaw 세션 로그 → Firestore 실시간 업로드 시스템",
    status: "shipped",
    link: "https://github.com/nohdaeyoung/live/tree/main/324-os",
    order: 2,
    works: [
      { id: "l1", title: "Logger 설계 · 기능 명세", url: "https://github.com/nohdaeyoung/live/blob/main/docs/core/AGENT_SPEC.md", type: "기획", order: 1 },
      { id: "l2", title: "Python 구현 (174 unit tests)", url: "https://github.com/nohdaeyoung/live/blob/main/324-os/logger.py", type: "개발", order: 2 },
      { id: "l3", title: "민감정보 마스킹 · 필터링", type: "개발", order: 3 },
    ],
  },
  {
    id: "stock",
    title: "사미사 Stock 포트폴리오",
    desc: "15개 ETF/주식 실시간 시세 대시보드 (현재가·등락·시가·고가·저가·PER·EPS·PBR)",
    status: "shipped",
    link: "https://stock-ticker-eosin.vercel.app/",
    order: 3,
    works: [
      { id: "s1", title: "종목 선정 · 기획", type: "기획", order: 1 },
      { id: "s2", title: "Vercel Serverless API 설계", type: "설계", order: 2 },
      { id: "s3", title: "네이버 금융 API 연동 개발", url: "https://github.com/nohdaeyoung/stock-ticker/blob/main/api/quotes.js", type: "개발", order: 3 },
      { id: "s4", title: "Vercel 배포", url: "https://stock-ticker-eosin.vercel.app/", type: "배포", order: 4 },
    ],
  },
  {
    id: "planner",
    title: "PO 기획 에이전트 (Planner)",
    desc: "시장 조사 → 1-Pager 기획서 자동 생성 파이프라인",
    status: "dev",
    link: "https://github.com/nohdaeyoung/live/tree/main/324-os/planner",
    order: 4,
    works: [
      { id: "p1", title: "Researcher 에이전트 (시장 조사)", type: "기획", order: 1 },
      { id: "p2", title: "Planner 에이전트 (5-Phase 기획)", type: "기획", order: 2 },
    ],
  },
];

export function ProjectBoard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  // 1회 로딩 (onSnapshot 대신 getDocs — 포트폴리오는 자주 안 바뀜)
  useEffect(() => {
    if (!db) {
      // Firestore 미연결 시 기본 프로젝트 표시
      setProducts(DEFAULT_PROJECTS);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const projSnap = await getDocs(query(collection(db, "projects"), orderBy("order", "asc")));
        
        if (projSnap.docs.length === 0) {
          // Firestore에 데이터 없으면 기본 프로젝트 표시
          setProducts(DEFAULT_PROJECTS);
          setLoading(false);
          return;
        }

        // 모든 서브컬렉션 쿼리를 병렬로
        const list = await Promise.all(
          projSnap.docs.map(async (d) => {
            const data = d.data();
            const worksSnap = await getDocs(
              query(collection(db, "projects", d.id, "works"), orderBy("order", "asc"))
            );
            return {
              id: d.id,
              title: data.title || "",
              desc: data.desc || "",
              status: data.status || "dev",
              link: data.link || "",
              order: data.order || 0,
              works: worksSnap.docs.map((w) => ({ id: w.id, ...w.data() })) as WorkItem[],
            };
          })
        );
        
        setProducts(list);
      } catch (err) {
        console.error("ProjectBoard fetch error:", err);
        setProducts(DEFAULT_PROJECTS);
      }
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 border-t border-dashed border-border">
      <div className="text-center mb-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-bold text-text-primary leading-snug"
        >
          우리가 직접 만든 것들.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-text-muted/60 leading-snug"
        >
          기획서부터 배포까지 전부.
        </motion.p>
      </div>

      <div className="space-y-3">
        {products.map((product, i) => {
          const isOpen = openId === product.id;
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-border rounded-xl overflow-hidden"
            >
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[product.status]}`}>
                      {STATUS_LABEL[product.status]}
                    </span>
                    <h3 className="font-bold text-sm text-text-primary">{product.title}</h3>
                  </div>
                  <p className="text-xs text-text-muted">{product.desc}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {product.link && (
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-text-muted/40 hover:text-primary transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {product.works.length > 0 && (
                    <button
                      onClick={() => setOpenId(isOpen ? null : product.id)}
                      className="flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors"
                    >
                      <span>{product.works.length}건</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* 문서 목록 */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-1.5 border-t border-border/50 pt-3">
                      {product.works.map((work) => (
                        <div key={work.id} className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${TYPE_STYLE[work.type] || "bg-gray-100 text-text-muted"}`}>
                            {work.type}
                          </span>
                          {work.url ? (
                            <a
                              href={work.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-text-primary hover:text-primary hover:underline transition-colors"
                            >
                              {work.title}
                            </a>
                          ) : (
                            <span className="text-xs text-text-primary">{work.title}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
