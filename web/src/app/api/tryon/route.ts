// AI 아바타 착장 API — 고른 옷(실제 사진) → 마네킹이 입은 이미지
import { isAiConfigured, isBusy, rateLimited, toAiError } from '@/server/openai';
import { generateTryOn, type TryOnBody, type TryOnPart } from '@/server/tryon';

// 이미지 생성은 수십 초가 걸릴 수 있다 (배포 환경 함수 실행 시간 상한, 초)
export const maxDuration = 150;

const SLOTS = ['아우터', '상의', '하의', '신발'];
const str = (v: unknown, max = 40) => (typeof v === 'string' && v ? v.slice(0, max) : undefined);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { parts?: unknown; body?: Record<string, unknown> };
  const parts: TryOnPart[] = (Array.isArray(body.parts) ? body.parts : [])
    .map((p: Record<string, unknown>) => ({
      slot: str(p?.slot) ?? '',
      name: str(p?.name) ?? '',
      // data URL(업로드 사진) 또는 /looks/*.webp(카탈로그 사진)만 받는다. 형식 검사는 toUpload가 한다
      photo: typeof p?.photo === 'string' ? p.photo : undefined,
    }))
    .filter((p) => SLOTS.includes(p.slot) && p.name)
    .slice(0, 4);
  if (!parts.length) return Response.json({ error: '입힐 옷을 골라 주세요' }, { status: 400 });

  const b = body.body ?? {};
  const height = Number(b.height);
  const figure: TryOnBody = {
    height: height >= 120 && height <= 220 ? Math.round(height) : undefined,
    build: str(b.build),
    bodyType: str(b.bodyType),
    fit: str(b.fit),
  };

  if (!isAiConfigured()) return Response.json({ notice: 'API 키가 없어 기본 마네킹으로 보여드려요' });
  // 이미지 생성은 비싸서 분석보다 더 촘촘하게 제한
  if (rateLimited(request, 'tryon', 5)) return Response.json({ error: '요청이 많아요. 1분 뒤에 다시 시도해 주세요' }, { status: 429 });

  try {
    return Response.json({ image: await generateTryOn(parts, figure, new URL(request.url).origin) });
  } catch (e) {
    if (isBusy(e)) return Response.json({ notice: 'AI 사용량 한도·혼잡으로 기본 마네킹으로 보여드려요' });
    const err = toAiError(e, 'tryon');
    return Response.json({ error: err.message }, { status: err.status });
  }
}
