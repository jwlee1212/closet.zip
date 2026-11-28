// AI 의류 분석 API — 클라이언트는 이 엔드포인트만 호출한다.
// API 키는 서버(.env.local)에만 있고, 실제 모델 호출은 src/server/analyze.ts가 맡는다.
import { AnalyzeError, generateProductPhoto, analyzeClothing, mockAnalyze, isAiConfigured } from '@/server/analyze';

export type { AnalyzeResult } from '@/server/analyze';

// 배포 환경(Vercel 등)에서 함수 실행 시간 상한 (초)
export const maxDuration = 150;

const DATA_URL = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
const MAX_BASE64 = 5 * 1024 * 1024; // 클라이언트는 480px JPEG(수십 KB)를 보내므로 넉넉한 상한

// 공개 엔드포인트라 API 요금 남용을 막는 최소한의 IP별 제한 (서버 인스턴스 메모리 기준)
// TODO(백엔드): 여러 인스턴스로 배포하면 Upstash Redis 같은 공유 저장소로 옮긴다
const WINDOW_MS = 60_000;
const LIMIT = 10;
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { image?: unknown; sample?: unknown };

  if (body.sample === true) return Response.json({ ...await mockAnalyze(true), productPhoto: '/looks/studio-sweater.webp' });

  const match = typeof body.image === 'string' ? DATA_URL.exec(body.image) : null;
  if (!match) return Response.json({ error: '이미지가 필요해요' }, { status: 400 });
  const [, mediaType, base64] = match;
  if (base64.length > MAX_BASE64) return Response.json({ error: '사진 용량이 너무 커요' }, { status: 413 });

  if (!isAiConfigured()) return Response.json(await mockAnalyze(false));

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (rateLimited(ip)) return Response.json({ error: '요청이 많아요. 1분 뒤에 다시 시도해 주세요' }, { status: 429 });

  try {
    const image = { mediaType, base64 };
    const result = await analyzeClothing(image);
    if (result.source === 'gemini') {
      try {
        result.productPhoto = await generateProductPhoto(image, result);
      } catch (error) {
        const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
        console.warn('[product-photo] generation failed', status);
        result.generationNotice = status === 429 ? '이미지 생성 한도를 초과했어요. 원본 사진으로 저장하거나 나중에 다시 시도해 주세요.' : '상품 사진을 생성하지 못했어요. 원본 사진으로 저장할 수 있어요.';
      }
    }
    return Response.json(result);
  } catch (e) {
    if (e instanceof AnalyzeError) return Response.json({ error: e.message }, { status: e.status });
    console.error('[analyze] 예상하지 못한 오류:', e);
    return Response.json({ error: 'AI 분석 중 오류가 났어요. 다시 시도해 주세요' }, { status: 500 });
  }
}
