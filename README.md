# 내 옷장 (closet)

인공지능융합플랫폼 2분반 · 팀 이벤져스 — 디지털 옷장 서비스 프로토타입

| 폴더 | 내용 |
|---|---|
| [`web/`](web/) | **웹 데모 (React + Next.js)** — 21개 화면, Gemini API를 이용한 옷 사진 AI 분석. 시연은 이쪽을 사용 |
| [`app/`](app/) | 초기 모바일 프로토타입 (React Native · Expo) |

## 웹 데모 실행

```bash
cd web
npm install
cp .env.example .env.local   # GEMINI_API_KEY 입력 (없으면 목업 분석으로 동작)
npm run dev                  # http://localhost:3000
```

자세한 내용은 [web/README.md](web/README.md)를 참고하세요.
