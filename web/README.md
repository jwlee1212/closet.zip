# 내 옷장 — 웹 데모 (React + Next.js)

인공지능융합플랫폼 2분반 · 팀 이벤져스 최종 보고서와 Figma 와이어프레임 v2(21화면)를 기준으로 만든 웹 데모입니다. **AI 기능(옷 사진 분석·상품 사진·코디 추천·아바타 착장)은 OpenAI API로 실제 동작**하고(키가 없으면 목업), 로그인·결제·서버 저장은 목업이며, 데모 상태는 브라우저 localStorage에 저장됩니다(마이 → "처음 화면으로"로 초기화).

## 실행

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

### AI 기능 켜기

```bash
cp .env.example .env.local   # OPENAI_API_KEY= 에 키 입력 후 dev 서버 재시작
```

| 기능 | 화면 | API | 모델 | 1회 예상 비용 |
|---|---|---|---|---|
| 옷 사진 분석 | 08 → 09 | `/api/analyze` | `gpt-6.2-sol` | 약 $0.005 |
| 상품 사진 생성 (분석 직후) | 09 | `/api/analyze` | `gpt-image-2.6-flare` | 약 $0.05 (medium) |
| 오늘의 코디 추천 | 14 | `/api/recommend` | `gpt-6.2-sol` | 약 $0.005 |
| 아바타에게 실제 옷 입히기 | 16 | `/api/tryon` | `gpt-image-2.6-flare` | 약 $0.05 (medium) |

- 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급합니다. 서버에서만 읽고 브라우저로 보내지 않습니다. 이미지 생성은 OpenAI **조직 인증**이 필요합니다.
- 비용은 요금표 토큰 단가로 어림한 값입니다. 시연 전 OpenAI 대시보드에서 월 사용 한도를 걸어 두세요.
- 같은 날·같은 옷장의 추천과 같은 착장 이미지는 브라우저에 캐시해 다시 만들지 않습니다.
- 사용량 한도(429)·서버 혼잡일 때는 시연이 끊기지 않게 목업(분석)·규칙 추천·기본 마네킹으로 넘어가고 이유를 표시합니다. 같은 IP에서 1분에 분석·추천 10회, 착장 5회까지 받습니다.
- 키가 없으면 분석은 "데모 분석 (API 키 미설정)", 추천은 계절 규칙, 착장은 기본 마네킹으로 동작합니다.

모바일 우선 레이아웃이라 휴대폰 크기에서 가장 자연스럽고, 데스크톱에서는 가운데 폰 폭 컬럼으로 보입니다.

## 화면 ↔ 경로

| 번호 | 화면 | 경로 | 파일 |
|---|---|---|---|
| 01 | 스플래시·로그인 | `/` | `src/app/page.tsx` |
| 01-1 | 카카오·Google 모의 로그인(계정 선택·정보 제공 동의) | `/login/kakao`, `/login/google` | `src/app/login/[provider]/page.tsx` |
| 01-2 | 이메일 로그인·회원가입(모의) | `/login/email` | `src/app/login/email/page.tsx` |
| 02 | 온보딩 | `/onboarding` | `src/app/onboarding/page.tsx` |
| 03 | 나의 추구미 설정 (온보딩 1/2) | `/style-setup` | `src/app/style-setup/page.tsx` |
| 03-1 | 나의 신체 정보 (온보딩 2/2, 마이에서 수정) | `/body-spec` | `src/app/body-spec/page.tsx` |
| 04 | 탐방 홈 | `/explore` | `src/app/(tabs)/explore/page.tsx` |
| 05 | 옷장 상세(공유 링크) | `/c/[id]` | `src/app/c/[id]/` |
| 06 | 옷 상세 | `/item/[id]` | `src/app/item/[id]/page.tsx` |
| 07 · 10 | 내 옷장 · 가득 참 시트 | `/closet` | `src/app/(tabs)/closet/page.tsx` |
| 08 | 옷 올리기 | `/upload` | `src/app/upload/page.tsx` |
| 09 | AI 분석 결과 | `/analysis` | `src/app/analysis/page.tsx` |
| 11 | 옷장 설정 | `/closet-settings` | `src/app/closet-settings/page.tsx` |
| 12 | AI 추천 구독 소개 | `/subscribe` | `src/app/subscribe/page.tsx` |
| 13 | 구독 결제 | `/checkout` | `src/app/checkout/page.tsx` |
| 14 | AI 추천 홈 | `/ai` | `src/app/(tabs)/ai/page.tsx` |
| 15 | AI 옷장 요약 | `/summary/[id]` | `src/app/summary/[id]/page.tsx` |
| 16 | 마네킹 미리보기 | `/mannequin` | `src/app/mannequin/page.tsx` |
| 17 | 구독 관리 | `/subscription` | `src/app/subscription/page.tsx` |
| 18 | 옷장 늘리기 | `/expand` | `src/app/expand/page.tsx` |
| 19 | 새 옷장 만들기 | `/new-closet` | `src/app/new-closet/page.tsx` |
| 20 | 내 옷장 관리 | `/closets` | `src/app/closets/page.tsx` |
| 21 | 마이페이지 | `/my` | `src/app/(tabs)/my/page.tsx` |

## 구조

- `src/data/mock.ts` — 공개 옷장·옷 목업, 추구미 일치도·주간 요약 계산, **가격 임시값(`PRICES`)**
- `src/state/AppState.tsx` — 앱 상태(로그인·추구미·구독·옷장 슬롯·저장 착장), localStorage 저장
- `src/components/` — 공통 UI, 의류 일러스트·마네킹
- `src/app/api/{analyze,recommend,tryon}/route.ts` — AI API (입력 검증·요청 제한·목업 전환)
- `src/server/openai.ts` — OpenAI 클라이언트·모델 설정·오류 처리 (모델을 바꿀 때는 여기나 `.env.local`만 수정)
- `src/server/analyze.ts` · `recommend.ts` · `tryon.ts` — 기능별 프롬프트. 분석·추천은 구조화 출력(Zod 스키마)으로 앱의 목록 안에서만 값을 받음
- `src/lib/ai.ts` — 브라우저 쪽 API 호출·캐시·이미지 축소

## Next.js를 쓰는 이유가 드러나는 부분

- **공유 링크 미리보기**: `/c/[id]`는 서버에서 `generateMetadata`로 제목·설명·OG 태그를 만들어, 카톡·인스타에 링크를 붙이면 미리보기 카드가 뜹니다(보고서 2-1 유입 전략). 공개 옷장은 빌드 시 정적 생성됩니다.
- **AI API 키 보호**: 클라이언트는 `/api/*`만 호출하고, LLM 호출은 서버(Route Handler)에서 합니다. 별도 백엔드 서버 없이 같은 프로젝트에서 돌고, Vercel에 배포하면 서버리스 함수가 됩니다. 모델을 바꿔도 클라이언트는 그대로입니다(보고서 VI-2 추상화 계층).

## 백엔드 연동 시 바꿀 곳 (`TODO(백엔드)` 주석)

- `src/server/openai.ts` → 요청 제한을 공유 저장소(예: Redis)로 이전, 로그인 사용자만 AI 기능 허용
- `src/app/login/` → 카카오/Google OAuth 리다이렉트 + 콜백 Route Handler, 이메일 로그인 API (모의 화면은 비밀번호를 받지 않거나 저장하지 않음)
- `src/app/checkout/page.tsx`, `src/app/expand/page.tsx` → PG 결제 + 결제 웹훅 Route Handler
- `src/data/mock.ts` → 탐방·추천 API, `src/state/AppState.tsx` → 서버 상태
