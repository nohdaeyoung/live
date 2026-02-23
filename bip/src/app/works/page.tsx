"use client";
import Link from "next/link";

const SAMPLES = [
  { id: 'p1', title: 'Photo Series A', year: '2025', desc: 'A short description of series A.', img: '/images/profile-daeyoung.png', url: '#' },
  { id: 'p2', title: 'Moment B', year: '2024', desc: 'A short description of moment B.', img: '/images/profile-secretary.png', url: '#' },
  { id: 'p3', title: 'Collection C', year: '2023', desc: 'A short description of collection C.', img: '/images/profile-designer.png', url: '#' },
];

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-[#0b0f13] text-gray-200 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Works</h1>
          <p className="text-sm text-gray-400 mt-2">사진 포트폴리오 — 2열 카드형 레이아웃 (다크 테마)</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLES.map((p) => (
            <article key={p.id} className="flex bg-[#0f1720] rounded-lg overflow-hidden shadow-md">
              <div className="w-1/3 md:w-1/3 h-40 flex-shrink-0 relative">
                <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex-1">
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <div className="text-xs text-gray-400 mb-2">{p.year}</div>
                <p className="text-sm text-gray-300 mb-4">{p.desc}</p>
                <div className="flex items-center gap-2">
                  <Link href={p.url} className="text-sm font-bold text-white bg-indigo-600 px-3 py-1 rounded">View</Link>
                  <a href="#" className="text-xs text-gray-400">Share</a>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </main>
  );
}
