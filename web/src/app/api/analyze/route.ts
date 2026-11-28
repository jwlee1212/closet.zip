// AI 의류 분석 API — 사진 → 속성 추출 → (성공하면) 상품 사진 생성
// API 키는 서버(.env.local)에만 있고, 실제 모델 호출은 src/server/가 맡는다.
import { analyzeClothing, generateProductPhoto, mockAnalyze } from '@/server/analyze';
import { isAiConfigured, parseDataUrl, rateLimited, toAiError } from '@/server/openai';

export type { AnalyzeResult } from '@/server/analyze';

// 분석 + 이미지 생성까지 한 요청에서 하므로 넉넉하게 (배포 환경 함수 실행 시간 상한, 초)
export const maxDuration = 150;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { image?: unknown; sample?: unknown };

  if (body.sample === true) return Response.json({ ...await mockAnalyze(true), productPhoto: '/looks/studio-sweater.webp' });

  const image = parseDataUrl(body.image);
  if (!image) return Response.json({ error: '사진이 없거나 용량이 너무 커요' }, { status: 400 });

  if (!isAiConfigured()) return Response.json(await mockAnalyze(false));
  if (rateLimited(request, 'analyze', 10)) return Response.json({ error: '요청이 많아요. 1분 뒤에 다시 시도해 주세요' }, { status: 429 });

  try {
    const result = await analyzeClothing(image);
    if (result.source === 'openai') {
      try {
        result.productPhoto = await generateProductPhoto(image, result);
      } catch (e) {
        // 상품 사진은 부가 기능이라 실패해도 분석 결과는 그대로 돌려준다
        const err = toAiError(e, 'product-photo');
        result.generationNotice = `상품 사진을 만들지 못했어요 (${err.message}). 원본 사진으로 저장할 수 있어요.`;
      }
    }
    return Response.json(result);
  } catch (e) {
    const err = toAiError(e, 'analyze');
    return Response.json({ error: err.message }, { status: err.status });
  }
}
