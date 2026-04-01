# MindTree Spark

마인드맵 기반 인터랙티브 게시판입니다. 트리 구조의 노드(루트 → 카테고리 → 게시글)를 시각적으로 배치하고 관리할 수 있습니다. ZAI GLM API를 활용한 AI 자동 분석 기능을 제공합니다.

## 주요 기능

- **마인드맵 시각화** — ReactFlow 기반 드래그 앤 드롭 노드 배치
- **3단계 노드 계층** — 루트 → 카테고리 → 게시글 트리 구조
- **검색 하이라이트** — 매칭 노드, 조상 경로, 형제 노드 3단계 시각 강조
- **AI 자동 분석** — 새 게시글의 최적 카테고리 배치 추천 (ZAI GLM API)
- **로컬 저장** — localStorage 기반 데이터 영속화

## 기술 스택

| 영역 | 기술 |
|------|------|
| 빌드 | Vite 5 + SWC |
| UI | shadcn/ui (Radix) + Tailwind CSS 3 |
| 시각화 | @xyflow/react (ReactFlow) |
| 상태관리 | React Query + 커스텀 훅 |
| 라우팅 | React Router DOM v6 |
| 폼 | React Hook Form + Zod |
| AI | ZAI GLM API (프록시 서버) |
| 테스트 | Vitest + Playwright + Testing Library |

## 시작하기

### 환경 요구사항

- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 ZAI_API_KEY 입력

# 개발 서버 실행 (포트 8080)
npm run dev
```

### 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `ZAI_API_KEY` | ZAI GLM API 키 | AI 분석 기능 사용 시 |
| `ZAI_API_BASE_URL` | ZAI API 엔드포인트 (기본값 제공) | 선택 |

## 스크립트

```bash
npm run dev          # 개발 서버 (포트 8080, HMR)
npm run build        # 프로덕션 빌드
npm run build:dev    # 개발 모드 빌드
npm run lint         # ESLint 검사
npm run test         # Vitest 1회 실행
npm run test:watch   # Vitest 워치 모드
```

## 프로젝트 구조

```
src/
├── components/
│   ├── mindmap/           # 마인드맵 핵심 컴포넌트
│   │   ├── MindmapBoard.tsx    # ReactFlow 브리지
│   │   ├── MindmapNode.tsx     # 커스텀 노드
│   │   ├── AddNodeDialog.tsx   # 노드 추가 다이얼로그
│   │   ├── SearchBar.tsx       # 검색 바
│   │   ├── NodePanel.tsx       # 노드 상세 패널
│   │   └── AnalysisPreviewDialog.tsx  # AI 분석 결과 미리보기
│   └── ui/                # shadcn/ui 프리미티브
├── hooks/
│   ├── useMindmapStore.ts      # 마인드맵 상태 (단일 소스)
│   └── useAnalysisStore.ts     # AI 분석 상태
├── services/
│   └── analysisService.ts      # ZAI API 통신
├── types/
│   ├── mindmap.ts              # 노드/검색 타입
│   └── analysis.ts             # 분석 결과 타입
├── pages/                 # 라우트 페이지
├── server.ts              # Vite 개발 서용 API 프록시 플러그인
└── lib/                   # 유틸리티
```

## 라이선스

MIT
