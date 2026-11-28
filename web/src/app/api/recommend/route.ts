// AI 코디 추천 API — 내 옷장 목록 + 오늘 날씨 + 상황 + 추구미 → 오늘의 코디
import { isAiConfigured, rateLimited, toAiError } from '@/server/openai';
import { recommendOutfit, ruleRecommend, type RecItem, type RecommendInput, type RefCloset } from '@/server/recommend';

export type { Recommendation } from '@/server/recommend';

export const maxDuration = 60;

const str = (v: unknown, max = 40) => (typeof v === 'string' ? v.slice(0, max) : undefined);
const strs = (v: unknown) => (Array.isArray(v) ? v.map((x) => str(x)).filter((x): x is string => !!x).slice(0, 10) : []);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const items: RecItem[] = (Array.isArray(body.items) ? body.items : [])
    .slice(0, 80)
    .map((i: Record<string, unknown>) => ({
      id: str(i?.id) ?? '',
      category: str(i?.category) ?? '',
      kind: str(i?.kind) ?? '',
      color: str(i?.color) ?? '',
      material: str(i?.material),
      season: str(i?.season),
      fit: str(i?.fit),
    }))
    .filter((i) => i.id && i.category);
  if (!items.length) return Response.json({ error: '옷장에 옷이 없어요' }, { status: 400 });

  const month = Number(body.month);
  const w = (body.weather ?? null) as Record<string, unknown> | null;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : undefined);
  const weather = w && num(w.temp) !== undefined
    ? { temp: num(w.temp)!, feels: num(w.feels) ?? num(w.temp)!, min: num(w.min) ?? num(w.temp)!, max: num(w.max) ?? num(w.temp)!, rainChance: num(w.rainChance) ?? 0, condition: str(w.condition, 12) ?? '' }
    : undefined;
  const refRaw = (body.reference ?? null) as Record<string, unknown> | null;
  const refItem = (i: Record<string, unknown>) => ({ category: str(i?.category) ?? '', kind: str(i?.kind) ?? '', color: str(i?.color) ?? '', material: str(i?.material) });
  const reference: RefCloset | undefined = refRaw && str(refRaw.name)
    ? {
        name: str(refRaw.name)!,
        theme: str(refRaw.theme) ?? '',
        summary: str(refRaw.summary, 200),
        items: (Array.isArray(refRaw.items) ? refRaw.items : []).slice(0, 40).map(refItem).filter((i) => i.category),
        focus: refRaw.focus && typeof refRaw.focus === 'object' ? refItem(refRaw.focus as Record<string, unknown>) : undefined,
      }
    : undefined;
  const input: RecommendInput = {
    items,
    styles: strs(body.styles),
    interests: strs(body.interests),
    fit: str(body.fit),
    month: month >= 1 && month <= 12 ? month : new Date().getMonth() + 1,
    weather,
    occasion: str(body.occasion, 12),
    avoid: strs(body.avoid),
    reference,
  };

  if (!isAiConfigured()) return Response.json(ruleRecommend(input));
  if (rateLimited(request, 'recommend', 10)) return Response.json(ruleRecommend(input));

  try {
    return Response.json(await recommendOutfit(input));
  } catch (e) {
    const err = toAiError(e, 'recommend');
    return Response.json({ error: err.message }, { status: err.status });
  }
}
