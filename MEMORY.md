# MEMORY.md — 알프레드의 장기 기억

_마지막 업데이트: 2026-02-24_

---

## 👤 사용자

- **이름:** 대영 마스터님
- **말투:** 다정하고 따뜻하게
- **타임존:** Asia/Seoul

---

## 🏢 사미사프로젝트 (1인 + 4 AI 팀)

**구성원:**
- 대영 마스터 (총괄)
- 비서공주 (기획·운영)
- 탐정요정 (리서치)
- 까칠한판사 (검수·QA)
- 감성디자이너 (디자인)
- 감성엔지니어 (개발) + Logger/모니터 역할

---

## 🗂️ 프로젝트 목록

### 1. 사미사 AI 팀 웹사이트 (BIP)
- **개요:** 사미사프로젝트 팀 소개 + 실시간 AI 대화 파이프라인 웹앱
- **기획:** 팀 멤버 소개, RPGDialogue(실시간 대화), 조직도 등
- **기술스택:** Next.js (정적 export), Firebase Hosting, Firestore
- **GitHub:** https://github.com/nohdaeyoung/live
- **배포:** https://324-company-bip.firebaseapp.com/
- **주요 작업 이력:**
  - Next.js 정적 export 모드 전환 + Firebase Hosting 배포
  - 캐시 정책(Cache-Control: no-cache) 설정
  - GitHub Actions 자동 배포 워크플로우 추가 (`.github/workflows/deploy.yml`)
  - 팀 멤버 섹션 추가 + 아바타 이미지 교체
  - RPGDialogue 컴포넌트 `next/image` → `<img>` 교체 (정적 export 대응)
  - 지브리 스타일 프로필 시안 6장 적용
  - DEPLOY_TASKS.md, CONTRIBUTORS.md, AI_CONTRACTOR_POSTING.md 문서화
  - logger.py → Firestore chat_logs 업로드 정상 작동 확인
- **남은 작업:**
  - GitHub Actions 시크릿 (GCP_CREDENTIALS) 등록 → 자동 배포 활성화
  - useLiveChat 실시간 구독 근본 복구
  - 최종 고퀄 아바타 이미지 교체 (WebP)
  - debug_reports 규칙 롤백 및 컬렉션 정리

---

### 2. 사미사 Stock 포트폴리오
- **개요:** 사미사프로젝트 ETF/주식 포트폴리오 실시간 시세 대시보드
- **기획:** 15개 종목 시세 (현재가·등락·시가·고가·저가·PER·EPS·PBR), 30초 자동 갱신
- **기술스택:** Vercel Serverless Function, 네이버 금융 API (API 키 불필요)
- **GitHub:** https://github.com/nohdaeyoung/stock-ticker
- **배포:** https://stock-ticker-eosin.vercel.app/
- **주요 작업 이력:**
  - Alpha Vantage → Yahoo Finance → 네이버 금융 API로 순차 교체 (안정성 확보)
  - basic + integration API 병렬 호출로 전 데이터 수집
  - 15개 ETF/종목 구성 (중복 제거 후)
- **종목 목록:** 맥쿼리인프라(088980), ACE 미국S&P500(360200), KODEX 미국S&P500(379800), KODEX Top10동일가중(395170), TIGER 코리아TOP10(292150), TIGER 리츠부동산인프라(329200), TIGER 2차전지TOP10(364980), TIGER 미국S&P500(360750), TIGER 미국필라델피아반도체나스닥(381180), RISE 200(148020), PLUS 고배당주(161510), RISE 코스피(302450), TIGER 미국테크TOP10 INDXX(381170), KODEX 머니마켓액티브(488770), KODEX 200(069500)

---

### 3. 사진 포트폴리오 사이트 (기획 단계)
- **개요:** 대영 마스터님 사진 작품 포트폴리오 사이트
- **기획:** 메인, Works(시리즈), Moment(순간 사진), About, Contact 구성
- **레퍼런스:** Cargo.com 템플릿 스타일
- **기존 사이트:** https://324.ing (분석 완료)
- **상태:** 기획서 초안 완료, 개발 미착수

---

## 🔑 주요 인프라

- **로컬 repo:** `/Users/dyno/daeyoung-openclaw-main` → `origin: https://github.com/nohdaeyoung/live.git`
- **알프레드가 직접 수정·commit·push 가능한 상태**
- **Firebase:** `324-company-bip` 프로젝트
- **Vercel:** `nohdaeyoung` 계정, `stock-ticker` 프로젝트

---

## 📝 기타 기억

- 파일 정리: `/Volumes/DAS_5TB/다운로드` → 6개 카테고리로 분류 완료 (2026-02-22)
- 핵심 규칙: 마스터 명시적 허락 없이 로컬 파일/이메일 접근 금지 (SOUL.md 반영)
- 텔레그램 봇: `@youngD_bot` 연동 완료
