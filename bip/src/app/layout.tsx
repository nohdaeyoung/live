import type { Metadata } from "next";
import "./globals.css";
import { ReactionBar } from "@/components/ui/reaction-bar";

export const metadata: Metadata = {
  title: "324 프로젝트 — AI 에이전트와의 대화, 전 과정 실시간 공개",
  description: "기획부터 배포까지, AI와 나누는 모든 대화를 실시간으로 공개합니다.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👸</text></svg>",
  },
  openGraph: {
    title: "324 프로젝트 — 바이브 코딩, 전 과정 실시간 공개",
    description: "기획부터 배포까지, AI와 나누는 모든 대화를 실시간으로 공개합니다.",

    type: "website",
    url: "https://324-company-bip.web.app",
    images: [
      {
        url: "https://324-company-bip.web.app/og-image.jpg?v=1771808365",
        width: 1280,
        height: 676,
        alt: "324 프로젝트 — 바이브 코딩 라이브",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "324 프로젝트 — 바이브 코딩, 전 과정 실시간 공개",
    description: "기획부터 배포까지, AI와 나누는 모든 대화를 실시간으로 공개합니다.",
    images: ["https://324-company-bip.web.app/og-image.jpg?v=1771808365"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`antialiased bg-background text-text-primary selection:bg-primary/20 font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
