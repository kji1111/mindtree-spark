# HANDOFF: 마인드맵 자동 분석 기능

**프로젝트**: MindTree Spark (`/Users/jonginkim/Documents/study_AI_workflow/mindtree-spark`)
**작성일**: 2026-04-01
**상태**: 백엔드 API 완료, 브라우저 UI 테스트 필요

---

## 무엇을 만들었는가

게시물(post) 추가 시 ZAI GLM LLM API를 호출하여 마인드맵 구조를 분석하고, 적절한 부모 카테고리와 연관 형제 노드를 제안하는 기능.

## 완료된 작업

### 백엔드 (모두 완료, API 테스트 통과)

| 커밋 | 내용 |
|------|------|
| `26a4e8d` | `src/types/analysis.ts` — MindmapContext, AnalysisRequest, AnalysisResponse, AnalysisAction 타입 |
| `822467a` | `src/hooks/useAnalysisStore.ts` — 분석 상태 관리 훅 (isLoading, error, result, actions + analyze, toggleAction, acceptAll, rejectAll, reset) |
| `f5554a9` | `src/components/mindmap/AnalysisPreviewDialog.tsx` — 분석 결과 미리보기 다이얼로그 (신뢰도 바, 제안 이유, 액션 체크박스, 승인/건너뛰기) |
| `6b7d2c5` | `src/server.ts` — Vite 커스텀 서버 프록시 + `src/services/analysisService.ts` API 서비스 레이어 |
| `02b9b97` | `useMindmapStore` 확장 (applyAnalysisActions) + AddNodeDialog/NodePanel/MindmapBoard 통합 |
| `a663b37` | vite.config.ts에 loadEnv() 추가하여 .env 파일에서 API 키 로드 |
| `acb01f2` | API URL을 `https://api.z.ai/api/coding/paas/v4/chat/completions`로 변경, 모델을 `glm-5.1`로 변경 |

### API 테스트 결과 (성공)

```bash
curl -s -X POST http://localhost:8080/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"postTitle":"React 상태 관리","postContent":"Redux vs Zustand 비교","mindmapContext":{"categories":[{"id":"cat-1","title":"프론트엔드","childCount":3}],"existingPosts":[{"id":"post-1","title":"컴포넌트 설계","categoryId":"cat-1"}]}}'
```

응답 (신뢰도 95%):
```json
{
  "suggestedParentId": "cat-1",
  "suggestedNewCategories": ["React"],
  "suggestedSiblings": ["post-1"],
  "reasoning": "새 게시물은 React의 상태 관리라는 주제로...",
  "confidence": 0.95
}
```

## 시도했지만 실패한 것들

1. **모델명 `glm-4-flash`** → ZAI API에서 "모델이 존재하지 않음" (1211 에러). 모델이 삭제된 것으로 보임
2. **모델명 `glm-5.1` + 기본 URL** (`open.bigmodel.cn`) → "접근 권한 없음" (403). 이 API 키로는 해당 엔드포인트에서 glm-5.1 접근 불가
3. **환경변수 로드** — `server.ts` 최상위에서 `process.env.ZAI_API_KEY`를 읽으면 Vite가 `.env`를 로드하기 전에 평가되어 `undefined`. getter 함수(`getApiKey()`)로 런타임에 읽도록 수정하여 해결
4. **Vite 미들웨어 URL 매칭** — `server.middlewares.use("/api/analyze", handler)`로 마운트하면 핸들러 내부에서 `req.url`이 `/`가 되어 기존 URL 체크 로직이 실패. URL 체크를 제거하여 해결

## 최종 구성

- **API 키**: `.env` 파일에 저장 (`.gitignore`에 추가됨)
- **엔드포인트**: `https://api.z.ai/api/coding/paas/v4/chat/completions`
- **모델**: `glm-5.1`
- **프론트엔드에서 API 호출**: `fetch('/api/analyze')` → Vite 프록시 → ZAI GLM API

## 남은 작업 (다음 에이전트가 해야 할 일)

### 1. 브라우저 E2E 테스트

서버 실행 후 `http://localhost:8080`에서 다음 시나리오 테스트:

```
npm run dev   # 서버 실행
```

- [ ] 마인드맵에서 카테고리 노드 생성
- [ ] 카테고리 아래에 게시물(post) 추가 → 분석 다이얼로그 자동 열림 확인
- [ ] 분석 결과 미리보기 UI 표시 확인 (신뢰도 바, 제안 이유, 액션 목록)
- [ ] 제안 항목 개별 체크/해제 동작 확인
- [ ] "선택 승인" 클릭 → 노드가 올바른 카테고리로 이동/새 카테고리 생성 확인
- [ ] "건너뛰기" 클릭 → 정상 동작 확인
- [ ] 기존 게시물 선택 → NodePanel에서 Brain 아이콘 버튼 표시 확인
- [ ] Brain 버튼 클릭 → 수동 분석 동작 확인
- [ ] API 키 없이 실행 시 에러 메시지 표시 확인

### 2. 발견된 버그 수정

E2E 테스트에서 발견되는 버그 수정. 예상 가능한 문제:

- **자동 분석 시 post ID 찾기**: `handleAutoAnalyze`에서 `store.nodes.find(n => n.title === title)`로 게시물을 찾는데, 동일 제목의 게시물이 여러 개면 첫 번째 것을 선택함. 최근 생성된 노드를 찾도록 개선 필요할 수 있음
- **분석 중 다이얼로그 닫기**: 분석 로딩 중 다이얼로그가 닫히면 상태가 꼬일 수 있음
- **에러 처리**: API 호출 실패 시 토스트 알림이 스펙에 있지만 아직 구현 안 됨 (현재는 다이얼로그 내 에러 메시지만 표시)

### 3. UI 개선 (선택사항)

- 로딩 인디케이터 위치/스타일 개선
- 분석 결과가 없을 때 빈 상태 UI
- 애니메이션 트랜지션 추가

## 핵심 파일 구조

```
src/
├── types/analysis.ts              # 분석 관련 타입
├── server.ts                      # Vite 프록시 서버 (ZAI GLM API)
├── services/analysisService.ts    # API 호출 + 마인드맵 컨텍스트 빌더
├── hooks/
│   ├── useMindmapStore.ts         # 마인드맵 상태 + applyAnalysisActions
│   └── useAnalysisStore.ts        # 분석 상태 관리
├── components/mindmap/
│   ├── MindmapBoard.tsx           # 메인 보드 (분석 흐름 통합)
│   ├── AddNodeDialog.tsx          # 게시물 추가 (+ 자동 분석 트리거)
│   ├── NodePanel.tsx              # 노드 상세 패널 (+ 수동 분석 버튼)
│   └── AnalysisPreviewDialog.tsx  # 분석 결과 미리보기
├── .env                           # ZAI_API_KEY, ZAI_API_BASE_URL
└── .env.example                   # 환경변수 템플릿
```

## 참고 문서

- 설계 스펙: `docs/superpowers/specs/2026-04-01-auto-analysis-design.md`
- 구현 계획: `docs/superpowers/plans/2026-04-01-auto-analysis.md`
- CLAUDE.md: 프로젝트 명령어 및 아키텍처 가이드
