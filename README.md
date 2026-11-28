# 내 옷장 (closet)

인공지능융합플랫폼 2분반 · 팀 이벤져스 — **내 옷장 기반 코디 추천 웹/앱** 프로토타입

옷 사진을 올리면 AI가 종류·색상·소재를 분석해 디지털 옷장을 만들고, 오늘 날씨와 상황에 맞춰 **내가 가진 옷으로** 코디를 추천합니다. 다른 사람의 공개 옷장을 둘러보고, 그 스타일을 내 옷으로 따라 입어 볼 수 있습니다.

- 웹 데모 코드: [`web/`](web/) (React + Next.js) — 화면 구성과 구조는 [web/README.md](web/README.md)
- 로그인·결제·서버 저장은 목업이고, 데모 상태는 브라우저에 저장됩니다

---

## 1. 준비물

- [Node.js](https://nodejs.org) **20.9 이상** (LTS 권장) — 터미널에서 `node -v`로 확인
- Git

## 2. 코드 받기 · 설치

```bash
git clone https://github.com/jwlee1212/closet.zip.git
cd closet.zip/web
npm install
```

## 3. API 키 넣기

```bash
cp .env.example .env.local
```

`web/.env.local`을 열어 값을 채웁니다. 이 파일은 `.gitignore`에 들어 있어 GitHub에 올라가지 않습니다.

| 변수 | 필수 | 설명 |
|---|---|---|
| `OPENAI_API_KEY` | 선택 | [OpenAI API 키](https://platform.openai.com/api-keys). **비워 두면 모든 AI 기능이 목업으로 동작**해서 키 없이도 화면을 볼 수 있어요 |
| `OPENAI_TEXT_MODEL` | 선택 | 사진 분석·코디 추천 모델 (기본 `gpt-6.2-sol`) |
| `OPENAI_IMAGE_MODEL` | 선택 | 상품 사진·아바타 착장 이미지 모델 (기본 `gpt-image-2.6-flare`) |
| `OPENAI_IMAGE_QUALITY` | 선택 | `low` · `medium`(기본) · `high` — 높을수록 비쌈 |
| `AI_MODE` | 선택 | `mock`으로 두면 키가 있어도 목업으로 동작 (요금 없이 화면만 볼 때) |

- 날씨는 [Open-Meteo](https://open-meteo.com)를 쓰므로 **키가 필요 없습니다.**
- 이미지 생성(상품 사진·아바타 착장)은 OpenAI **조직 인증(Organization Verification)** 을 마쳐야 동작합니다.
- 키 사용량에 따라 요금이 나옵니다. OpenAI 대시보드에서 **월 사용 한도**를 걸어 두세요. (1회 예상 비용은 [web/README.md](web/README.md#ai-기능-켜기) 참고)
- `.env.local`을 고친 뒤에는 서버를 **다시 시작**해야 반영됩니다.

## 4. 실행하기

### 개발 모드 — 코드를 고치면 바로 반영

```bash
npm run dev          # http://localhost:3000
```

### 웹 빌드 — 시연용 (더 빠르고 실제 배포와 같은 상태)

```bash
npm run build        # 프로덕션 빌드
npm run start        # http://localhost:3000
```

- 포트를 바꾸려면 `npm run start -- -p 3100`
- 코드를 고쳤다면 `npm run build`부터 다시 해야 반영됩니다.

### 휴대폰으로 보기

PC와 휴대폰을 **같은 와이파이**에 연결하고, 휴대폰 브라우저에서 `http://<PC의 IP 주소>:3000`으로 접속합니다. 모바일 화면 기준으로 만들어서 휴대폰에서 가장 자연스럽고, 카메라로 옷을 바로 찍어 올릴 수 있습니다.

- PC IP 확인 — macOS: `ipconfig getifaddr en0` · Windows: `ipconfig`의 IPv4 주소
- 서버를 켜면 터미널에 표시되는 `Network:` 주소를 그대로 써도 됩니다.

## 5. 인터넷에 배포하기 (Vercel, 무료)

> GitHub Pages는 정적 파일만 올릴 수 있어서, AI 기능이 들어 있는 서버 API(`/api/*`)가 동작하지 않습니다. Next.js를 만든 회사의 **Vercel**을 쓰면 GitHub 저장소를 연결해 바로 배포할 수 있습니다.

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인 → **Add New… → Project** → 이 저장소 **Import**
2. **Root Directory**를 `web`으로 지정 (Framework는 Next.js로 자동 인식)
3. **Environment Variables**에 `OPENAI_API_KEY` 등 3번 표의 값을 입력 (비워 두면 목업으로 배포)
4. **Deploy** → `https://<프로젝트명>.vercel.app` 주소가 생깁니다

- 이후 `main` 브랜치에 푸시할 때마다 자동으로 다시 배포됩니다.
- 배포 주소는 누구나 열 수 있으므로, 키를 넣었다면 **OpenAI 월 사용 한도**를 꼭 걸어 두고 시연이 끝나면 키를 지우거나 `AI_MODE=mock`으로 바꾸세요. (서버에서 같은 IP의 요청 수를 1분 단위로 제한하고 있지만, 완전한 보호는 아닙니다.)

## 6. 데모 사용 팁

- **처음부터 다시 보기**: 마이 → 하단 "처음 화면으로 (데모 초기화)"
- **구독 기능 보기**: AI 추천 탭 → "AI 추천 구독하고 오늘의 코디 보기" → 결제(목업, 실제 결제 없음)
- **사진 없이 옷 등록 체험**: 내 옷장 → 옷 올리기 → "사진 없이 샘플로 체험하기"
- **남의 스타일을 내 옷으로**: 탐방 → 옷장 선택 → "내 옷으로 따라 입기"

## 7. 문제 해결

| 증상 | 해결 |
|---|---|
| `Port 3000 is in use` | 다른 서버를 끄거나 `npm run dev -- -p 3001` |
| `npm install` 중 `EACCES` 권한 오류 | `sudo chown -R $(whoami) ~/.npm` 후 다시 설치 |
| AI 결과에 "데모 분석 (API 키 미설정)" 표시 | `.env.local`에 `OPENAI_API_KEY`를 넣고 서버 재시작 |
| 이미지 생성에서 "OpenAI 조직 인증 확인" 안내 | OpenAI 대시보드에서 Organization Verification 완료 |
| 화면이 예전 상태로 보임 | 마이 → "처음 화면으로" 또는 브라우저 새로고침 |
