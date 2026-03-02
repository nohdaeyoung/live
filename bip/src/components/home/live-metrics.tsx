"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiveMetrics() {
  const [dDay, setDDay] = useState(1);

  useEffect(() => {
    const startDate = new Date("2026-02-22T00:00:00+09:00");
    const now = new Date();
    const diff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    setDDay(Math.max(1, diff));
  }, []);

  // 정적 데이터
  const totalChats = 1250;
  const cheerCount = 42;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-16 border-t border-dashed border-border">
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg font-bold text-text-primary leading-relaxed"
        >
          <span className="text-primary font-mono">D+{dDay}</span>일째,{" "}
          <span className="text-primary font-mono">{totalChats.toLocaleString()}</span>번의 대화.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg font-bold text-text-muted/60 leading-relaxed"
        >
          멈추지 않고 만들어가는 중.
        </motion.p>
        {cheerCount > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-text-muted mt-3"
          >
            ❤️ 지금까지 <span className="font-bold text-reaction-heart">{cheerCount.toLocaleString()}</span>번의 응원을 받았어요
          </motion.p>
        )}
      </div>
    </div>
  );
}
