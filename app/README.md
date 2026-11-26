# 내 옷장 — React Native 프로토타입

인공지능융합플랫폼 2분반 · 팀 이벤져스 최종 보고서와 Figma 와이어프레임 v2(21화면)를 기준으로 만든 Expo(React Native) 프로토타입입니다. 백엔드·AI 연동 없이 목업 데이터로 전체 흐름을 클릭해 볼 수 있습니다.

## 실행

```bash
cd app
npm install
npx expo start          # i: iOS 시뮬레이터, a: Android, w: 웹
```

웹(`w`)에서는 390px 폰 프레임 안에 렌더링됩니다. 실기기는 Expo Go 앱으로 QR을 찍으면 됩니다.

## 화면 ↔ 파일

| 번호 | 화면 | 파일 |
|---|---|---|
| 01 | 스플래시·로그인 | `src/app/index.tsx` |
| 02 | 온보딩 3장 | `src/app/onboarding.tsx` |
| 03 | 나의 추구미 설정 | `src/app/style-setup.tsx` |
| 04 | 탐방 홈 | `src/app/(tabs)/explore.tsx` |
| 05 | 옷장 상세(다른 사람) | `src/app/closet/[id].tsx` |
| 06 | 옷 상세 | `src/app/item/[id].tsx` |
| 07 · 10 | 내 옷장 · 가득 참 바텀시트 | `src/app/(tabs)/closet.tsx` |
| 08 | 옷 올리기 | `src/app/upload.tsx` |
| 09 | AI 분석 결과 | `src/app/analysis.tsx` |
| 11 | 옷장 설정 | `src/app/closet-settings.tsx` |
| 12 | AI 추천 구독 소개 | `src/app/subscribe.tsx` |
| 13 | 구독 결제 | `src/app/checkout.tsx` |
| 14 | AI 추천 홈 | `src/app/(tabs)/ai.tsx` |
| 15 | AI 옷장 요약 | `src/app/summary/[id].tsx` |
| 16 | 마네킹 미리보기 | `src/app/mannequin.tsx` |
| 17 | 구독 관리 | `src/app/subscription.tsx` |
| 18 | 옷장 늘리기(유료) | `src/app/expand.tsx` |
| 19 | 새 옷장 만들기 | `src/app/new-closet.tsx` |
| 20 | 내 옷장 관리(여러 옷장) | `src/app/closets.tsx` |
| 21 | 마이페이지 | `src/app/(tabs)/my.tsx` |

## 구조

- `src/data/mock.ts` — 공개 옷장·옷 목업, 추구미 일치도·주간 요약 계산, **가격 임시값(`PRICES`)**
- `src/state/AppState.tsx` — 로그인·추구미·구독·옷장 슬롯·저장 착장 등 앱 상태 (메모리, 새로고침 시 초기화)
- `src/components/` — 공통 UI(앱바·버튼·칩·행·바텀시트), 의류 일러스트(SVG), 마네킹(SVG)

## 백엔드 연동 시 바꿀 곳 (`TODO(백엔드)` 주석)

- `analysis.tsx` `analyzeMock` → 멀티모달 LLM API로 이미지 속성 추출
- `checkout.tsx` / `expand.tsx` → 결제 대행(PG) 정기결제·단건결제
- `mock.ts`의 `PUBLIC_CLOSETS`, `matchScore`, `weeklySummary` → 탐방·추천 API
