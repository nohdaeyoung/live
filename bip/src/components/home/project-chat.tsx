"use client";

import React, { useEffect, useRef, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  author: string;
  text: string;
  createdAt?: any;
}

export function ProjectChat({ roomId = "general" }: { roomId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [persona, setPersona] = useState<string>('알프레드');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const author = typeof window !== "undefined" ? (localStorage.getItem("pc_author") || `Guest-${Math.floor(Math.random()*9000)+1000}`) : "Guest";

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "asc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      const list: Message[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setMessages(list);
      // scroll to bottom
      setTimeout(()=> bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, (err) => {
      console.error("ProjectChat snapshot error", err);
    });
    return () => unsub();
  }, [roomId]);

  useEffect(()=>{
    // persist author
    if (typeof window !== 'undefined' && !localStorage.getItem('pc_author')) localStorage.setItem('pc_author', author);
  },[]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const userText = input.trim();
    try {
      // save user message
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        author,
        text: userText,
        createdAt: serverTimestamp(),
        aiGenerated: false,
      });
      setInput("");

      // request AI reply from prototype endpoint
      try {
        const resp = await fetch('/api/ai-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona: '알프레드', prompt: userText })
        });
        if (resp.ok) {
          const j = await resp.json();
          const aiText = j.reply || j.output || '응답을 생성하지 못했습니다.';
          // save AI message
          await addDoc(collection(db, "rooms", roomId, "messages"), {
            author: '알프레드',
            text: aiText,
            createdAt: serverTimestamp(),
            aiGenerated: true,
          });
        } else {
          console.warn('AI reply failed', resp.statusText);
        }
      } catch (err) {
        console.error('AI call failed', err);
      }

    } catch (err) {
      console.error('send message failed', err);
      alert('메시지 전송 실패');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="project-chat border border-border rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-border bg-gray-50 flex items-center justify-between">
        <div className="text-sm font-semibold">프로젝트 채팅</div>
        <div className="text-xs text-text-muted">실시간 대화(기록 보관)</div>
      </div>
      <div className="h-64 overflow-auto p-4" style={{ background: 'linear-gradient(#fff,#fbfbfb)' }}>
        {messages.length===0 && <div className="text-center text-sm text-text-muted">아직 대화가 없습니다. 첫 메시지를 보내보세요.</div>}
        <div className="space-y-2">
          {messages.map((m)=> (
            <div key={m.id} className="flex flex-col">
              <div className="text-[12px] text-text-muted">{m.author}{m.aiGenerated? ' · AI' : ''}</div>
              <div className="text-sm bg-gray-100 inline-block px-3 py-1 rounded-md max-w-[85%]">{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="flex flex-col">
              <div className="text-[12px] text-text-muted">{persona} · AI</div>
              <div className="text-sm bg-gray-100 inline-block px-3 py-1 rounded-md max-w-[85%]">타이핑 중...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <form onSubmit={send} className="p-3 border-t border-border flex gap-2 items-center">
        <select value={persona} onChange={(e)=>setPersona(e.target.value)} className="mr-2 px-2 py-1 border border-border rounded-md">
          <option>알프레드</option>
          <option>비서공주</option>
          <option>탐정요정</option>
          <option>까칠한판사</option>
          <option>감성디자이너</option>
          <option>감성엔지니어</option>
        </select>
        <input className="flex-1 px-3 py-2 border border-border rounded-md" placeholder="메시지를 입력하세요. (익명 기본)" value={input} onChange={(e)=>setInput(e.target.value)} />
        <button type="submit" className="px-3 py-2 bg-primary text-white rounded-md" disabled={sending || !input.trim()}>{sending? '전송중...' : '전송'}</button>
      </form>
    </div>
  );
}
