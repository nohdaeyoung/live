Project: 324-company-bip — 작업 분담 및 자동화/디버그 프롬프트

목적
- 지금까지 진행한 작업을 정리하고 각 작업을 누가 담당했는지, 그리고 향후 동일한 작업을 재현하거나 자동화할 수 있도록 사용한(또는 사용할) 프롬프트를 기록합니다.
- 이 파일은 깃허브에서 공개 링크로 참조할 수 있으며, 라이브 페이지에 ‘무엇을 했는지’ 링크로 연결됩니다.

요약 (간단)
- 디버그 패널 제거, 히어로 문구 변경, 푸터 링크/아이콘 변경
- Firebase Hosting에 수동/자동 배포 정비 (out/ static export)
- Firebase Firestore 디버그 수집 임시 규칙 적용 및 추적
- 로컬 개발서버 기동 및 세부 빌드/배포 절차 문서화
- GitHub Actions 워크플로우 추가 (자동 빌드 → export → firebase deploy)

작업별 담당 & 프롬프트

1) UI 변경 — 히어로 문구 / 푸터 링크 및 아이콘
- 담당: Frontend Engineer (마스터 사미사)
- 파일: bip/src/app/page.tsx
- 할 일: 히어로 서브라인을 "프로젝트 진행도, 사소한 잡담도<br/>우리 팀의 하루가 쌓여갑니다."로 변경하고, 푸터 링크를 https://iloveyouicantforgetyou.neocities.org/ 로 변경, X 아이콘을 지구(글로브) 아이콘으로 교체.
- 재현 프롬프트 (프론트엔드에게 전달할 텍스트):
  "page.tsx의 hero 서브라인을 정확히 '프로젝트 진행도, 사소한 잡담도<br/>우리 팀의 하루가 쌓여갑니다.'로 수정하고 줄바꿈을 유지하십시오. footer의 외부 링크를 https://iloveyouicantforgetyou.neocities.org/ 로 바꾸고 X 아이콘을 globe 아이콘(간단한 svg)으로 교체하세요. 변경 후 로컬 빌드와 배포로 동작 확인하세요."

2) 임시 디버그 패널 제거
- 담당: Frontend Engineer (마스터 사미사)
- 파일: bip/src/app/page.tsx, bip/src/hooks/use-live-chat.ts, bip/src/lib/firebase.ts
- 할 일: DebugPanel 컴포넌트 및 window.__liveChatDebug 노출 코드를 제거(혹은 주석 처리)하여 프로덕션 노출 방지.
- 재현 프롬프트:
  "DebugPanel 컴포넌트와 window.__liveChatDebug를 작성한 모든 클라이언트 사이드 디버깅 노출을 제거하십시오. 빌드에 아무런 디버그 UI/스크립트가 포함되지 않도록 확실히 하고, 소스 커밋 후 정식 빌드를 수행해 결과를 확인하세요."

3) 정적 export 빌드 설정 (Next.js)
- 담당: Build/Infra Engineer
- 파일: bip/next.config.js, bip/package.json, .github/workflows/deploy.yml
- 할 일: Next.js 앱을 static export(output: 'export') 모드로 설정하고, 빌드 명령이 out/ 디렉터리를 생성하도록 구성. GitHub Actions로 push 시 자동으로 빌드→export→firebase deploy 되도록 워크플로우 추가.
- 재현 프롬프트:
  "Next.js 프로젝트를 정적 export 모드(output: 'export')로 설정하고, 깃허브 워크플로우를 만들어 main 브랜치 푸시 시 bip 디렉토리에서 npm ci, npm run build, npx next export(또는 next 빌드에서 export를 수행) 후 npx firebase-tools deploy --only hosting --project <PROJECT>를 실행하도록 구성하세요. 워크플로우가 동작하려면 GitHub Secret 'GCP_CREDENTIALS'에 base64(service-account-json) 값이 필요합니다."

4) Firebase Hosting 배포 (수동/긴급 패치)
- 담당: Release Engineer (알프레드)
- 파일/위치: bip/out/ (배포 산출물), firebase.json
- 할 일: 긴급할 때는 out/index.html을 직접 수정하여 빠르게 캐시를 무력화하고 Firebase Hosting에 업로드(배포)할 수 있어야 함. 다만 이 방식은 임시 패치이며, 반드시 소스 기반 빌드로 복구할 것.
- 재현 프롬프트:
  "긴급 패치가 필요하면 현재 배포된 index.html을 다운로드한 뒤 필요한 텍스트 수정(예: hero 문구 교체)을 적용하고 bip/out/index.html로 저장한 뒤 npx firebase-tools deploy --only hosting --project <PROJECT>로 배포하세요. 배포가 끝나면 소스에 동일한 수정을 반영하고 CI 파이프라인으로 재배포되도록 조치하세요."

5) Firestore 임시 디버그 수집
- 담당: Backend Engineer (마스터 사미사 / 알프레드 협업)
- 파일: bip/firestore.rules
- 할 일: debug_reports 컬렉션에 대해 한시적으로 엄격한 스키마(필드: ts, payload; payload 길이 <= 2000)로 unauthenticated create를 허용. 진단이 끝나면 즉시 규칙 롤백 및 컬렉션 삭제 권장.
- 재현 프롬프트:
  "debug_reports 컬렉션에 대해 unauthenticated create를 한시적으로 허용하되, request.resource.data는 { ts: string, payload: string }를 만족하고 payload 길이는 0 < len <= 2000 이어야 합니다. 진단이 끝나면 규칙을 원래 상태로 되돌리고 컬렉션을 삭제하세요."

6) 로컬 개발서버 및 디버그 재현
- 담당: Developer (마스터 사미사)
- 명령:
  - npm run dev (bip 디렉토리)
  - http://localhost:3000 로 접속해 변경 사항 확인
- 재현 프롬프트:
  "로컬 개발 환경에서 npm run dev를 실행하고 브라우저(시크릿 또는 캐시 무시)로 http://localhost:3000을 열어 변경된 히어로 문구와 푸터 링크가 반영되는지 확인하세요. 문제가 있으면 콘솔 오류를 캡처해 공유하세요."

7) GitHub Actions 토큰/Secret 등록
- 담당: Repository Admin (마스터 사미사 또는 승인된 관리자)
- 절차:
  - 서비스 계정 키(JSON)를 base64로 인코딩
  - GitHub → Settings → Secrets and variables → Actions → New repository secret
  - Name: GCP_CREDENTIALS
  - Value: base64-encoded service account JSON
- 메모: 토큰은 만료(1일)로 생성해 테스트 후 폐기 권장.

커밋/푸시 정책
- 빌드 산출물(.next, out 등)은 기본적으로 커밋하지 마세요. CI가 생성해야 합니다. 예외적으로 긴급 패치(out/index.html 직접 배포)는 배포 후 소스에 동일한 변경을 적용하고 CI로 재배포한 뒤 임시 파일은 삭제하세요.

라이선스 및 저작권
- 프로젝트 저장소의 기존 라이선스를 따릅니다.

문의
- 문제가 있거나 추가 작업이 필요하면 이 이슈에 코멘트로 알려 주세요.

조직 구성원 및 역할

아래는 프로젝트에 참여하는 조직 구성원과 각자 역할(간단 설명)입니다.

- 대영 (마스터 사미사님)
  - 역할: 창업자 / 제품 책임자 / 깃허브 관리자
  - 책임: 제품 전략, 주요 승인, 서비스 계정·보안 정책 최종 결정

- 비서공주 (알프레드)
  - 역할: 릴리스·운영 담당 (Release / Ops)
  - 책임: 배포 실행·검증, 긴급 패치, 배포 로그 보고

- 탐정요정
  - 역할: 디버깅·진단 담당 (Debug / SRE)
  - 책임: 배포 불일치/네트워크·캐시 문제 조사, 로그·헤더 분석

- 까칠한판사
  - 역할: 보안·규칙 담당 (Security / Policy)
  - 책임: Firestore 규칙·IAM 검토, 임시 규칙 적용시 만료/롤백 관리

- 근육디자이너
  - 역할: UI·콘텐츠 담당 (Design / UX)
  - 책임: 히어로 문구·레이아웃·아이콘/이미지 검수 및 시각적 폴리싱

- 감성엔지니어
  - 역할: AI 개발 에이전트 (Automation Agent)
  - 책임: 빌드·배포 자동화, PR/커밋 대행(관리자 승인 기반), 문서화 자동화

- Logger / 모니터
  - 역할: 로그 수집 및 업로더 운영
  - 책임: 서버 로그 수집, Firestore 업로드, 모니터링

운영 절차(권장)
- 배포 승인: 마스터 사미사 승인 → 비서공주(알프레드) 배포 실행 → 탐정요정 검증 → 완료 보고
- 보안 변경: 까칠한판사 승인 → 규칙 적용(기간 명시) → 검증 → 롤백
- 자동화: 감성엔지니어(AI)는 관리자 승인 후 자동 PR/배포 가능

원하시면 이 섹션을 CONTRIBUTORS.md, AI_CONTRACTOR_POSTING.md에도 동기화해 드릴게요.