# 내 옷장 — 웹 데모 (React + Next.js)

인공지능융합플랫폼 2분반 · 팀 이벤져스 최종 보고서와 Figma 와이어프레임 v2(21화면)를 기준으로 만든 웹 데모입니다. **옷 사진 AI 분석은 Gemini API(무료 등급)로 실제 동작**하고(키가 없으면 목업), 로그인·결제·서버 저장은 목업이며, 데모 상태는 브라우저 localStorage에 저장됩니다(마이 → "처음 화면으로"로 초기화).

## 실행

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

### AI 분석 켜기

```bash
cp .env.example .env.local   # GEMINI_API_KEY= 에 키 입력 후 dev 서버 재시작
```

- 키는 [Google AI Studio](https://aistudio.google.com/apikey)에서 카드 등록 없이 무료로 발급합니다. 서버에서만 읽고 브라우저로 보내지 않습니다.
- 무료 등급은 분당·하루 호출 수 제한이 있습니다(AI Studio에서 확인). 모델이 혼잡(503)하거나 한도를 넘으면(429) `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3.8-flash` 순으로 다른 모델을 시도하고, 모두 실패하면 시연이 끊기지 않게 목업 분석으로 넘어가며 배지에 이유가 표시됩니다.
- 무료 등급에 보낸 데이터는 Google이 서비스 개선에 쓸 수 있으니 시연용 사진만 쓰세요.
- 키가 없으면 분석 화면에 "데모 분석 (API 키 미설정)"이 뜨고 임의 값이 채워집니다. 같은 IP에서 1분에 10회까지만 받습니다.

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
- `src/components/` — 공통 UI, 의류 일러스트·마네킹(SVG)
- `src/app/api/analyze/route.ts` — AI 의류 분석 API (입력 검증·요청 제한·목업 전환)
- `src/server/analyze.ts` — Gemini API 호출 (JSON 스키마 출력으로 앱의 카테고리·색상·소재 목록 안에서만 값을 받음). 모델을 바꿀 때는 이 파일만 수정

## Next.js를 쓰는 이유가 드러나는 부분

- **공유 링크 미리보기**: `/c/[id]`는 서버에서 `generateMetadata`로 제목·설명·OG 태그를 만들어, 카톡·인스타에 링크를 붙이면 미리보기 카드가 뜹니다(보고서 2-1 유입 전략). 공개 옷장은 빌드 시 정적 생성됩니다.
- **AI API 키 보호**: 클라이언트는 `/api/analyze`만 호출하고, LLM 호출은 서버(Route Handler)에서 합니다. 별도 백엔드 서버 없이 같은 프로젝트에서 돌고, Vercel에 배포하면 서버리스 함수가 됩니다. 모델을 바꿔도 클라이언트는 그대로입니다(보고서 VI-2 추상화 계층).

## 백엔드 연동 시 바꿀 곳 (`TODO(백엔드)` 주석)

- `src/app/api/analyze/route.ts` → 요청 제한을 공유 저장소(예: Redis)로 이전, 로그인 사용자만 분석 허용
- `src/app/login/` → 카카오/Google OAuth 리다이렉트 + 콜백 Route Handler, 이메일 로그인 API (모의 화면은 비밀번호를 받지 않거나 저장하지 않음)
- `src/app/checkout/page.tsx`, `src/app/expand/page.tsx` → PG 결제 + 결제 웹훅 Route Handler
- `src/data/mock.ts` → 탐방·추천 API, `src/state/AppState.tsx` → 서버 상태
