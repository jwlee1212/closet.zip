// 서버 전용: 내 옷장 + 추구미 + 계절 → 오늘의 코디 추천 (OpenAI)
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { TEXT_MODEL, getClient, isBusy, seasonOf, toAiError } from './openai';

export type RecItem = { id: string; category: string; kind: string; color: string; material?: string; season?: string; fit?: string };

export type RecommendInput = {
  items: RecItem[];
  styles: string[];
  interests: string[];
  fit?: string;
  month: number;
};

export type Recommendation = {
  outerId?: string;
  topId?: string;
  bottomId?: string;
  shoesId?: string;
  title: string;
  reason: string;
  /** 추천 기준 (예: "11월 · 가을") */
  basis: string;
  /** openai: 실제 AI, rule: API 키가 없거나 실패해 규칙으로 고름 */
  source: 'openai' | 'rule';
};

const Schema = z.object({
  outer_id: z.string().nullable().describe('아우터 id. 계절상 필요 없거나 옷장에 없으면 null'),
  top_id: z.string().nullable(),
  bottom_id: z.string().nullable(),
  shoes_id: z.string().nullable(),
  title: z.string().describe('코디 한 줄 제목 (20자 이내). 예: "네이비 니트로 차분한 출근룩"'),
  reason: z.string().describe('왜 이 조합인지 한국어 2문장. 추구미·계절·색 조합을 근거로'),
});

const SYSTEM = `당신은 디지털 옷장 앱의 스타일리스트입니다. 사용자가 가진 옷 목록 안에서만 오늘 입을 코디 한 벌을 고릅니다.
- 반드시 목록에 있는 id만 씁니다. 없는 옷을 지어내지 않습니다.
- 상의·하의·신발을 하나씩 고르고, 계절상 필요하면 아우터를 더합니다. 해당 카테고리가 목록에 없으면 null로 둡니다.
- 계절에 맞지 않는 옷(예: 겨울에 반팔만, 여름에 패딩)은 피합니다.
- 사용자의 추구미(스타일)와 관심 카테고리, 선호 핏을 최대한 반영하고, 색 조합이 자연스럽게 맞도록 고릅니다.
- 추천 이유는 친근한 존댓말로 짧게 씁니다.`;

const SLOT = { 아우터: 'outer', 상의: 'top', 하의: 'bottom', 신발: 'shoes' } as const;

export async function recommendOutfit(input: RecommendInput): Promise<Recommendation> {
  const season = seasonOf(input.month);
  const basis = `${input.month}월 · ${season}`;
  const items = input.items.filter((i) => i.category in SLOT);
  let out: z.infer<typeof Schema> | null;
  try {
    const res = await getClient().responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: 'low' },
      instructions: SYSTEM,
      input: JSON.stringify({
        오늘: `${basis} (날씨 정보 없음, 계절 기준으로 판단)`,
        추구미: input.styles,
        관심_카테고리: input.interests,
        선호_핏: input.fit ?? '정보 없음',
        내_옷장: items.map(({ id, category, kind, color, material, season: s, fit }) => ({ id, category, kind, color, material, season: s, fit })),
      }),
      text: { format: zodTextFormat(Schema, 'outfit_recommendation') },
    });
    out = res.output_parsed;
  } catch (e) {
    if (isBusy(e)) {
      console.warn('[recommend] OpenAI 혼잡·한도 → 규칙 추천으로 대체');
      return ruleRecommend(input);
    }
    throw toAiError(e, 'recommend');
  }
  if (!out) return ruleRecommend(input);

  // 모델이 다른 카테고리의 id를 넣었으면 버린다
  const valid = (id: string | null, category: string) => (id && items.some((i) => i.id === id && i.category === category) ? id : undefined);
  const rec: Recommendation = {
    outerId: valid(out.outer_id, '아우터'),
    topId: valid(out.top_id, '상의'),
    bottomId: valid(out.bottom_id, '하의'),
    shoesId: valid(out.shoes_id, '신발'),
    title: out.title,
    reason: out.reason,
    basis,
    source: 'openai',
  };
  if (!rec.topId && !rec.bottomId) return ruleRecommend(input);
  return rec;
}

/** API 키가 없을 때·실패했을 때의 대체 추천: 계절이 맞는 옷을 카테고리별로 하나씩 */
export function ruleRecommend(input: RecommendInput): Recommendation {
  const season = seasonOf(input.month);
  const fits = (i: RecItem) => !i.season || i.season === season || i.season === '사계절';
  const first = (category: string) => {
    const pool = input.items.filter((i) => i.category === category);
    return (pool.find(fits) ?? pool[0])?.id;
  };
  const cold = season === '겨울' || season === '가을';
  return {
    outerId: cold ? first('아우터') : undefined,
    topId: first('상의'),
    bottomId: first('하의'),
    shoesId: first('신발'),
    title: `${input.styles[0] ?? '데일리'} 무드 코디`,
    reason: `${season}에 맞는 옷 중에서 골랐어요. 가진 옷만으로 "${input.styles[0] ?? '데일리'}" 무드를 맞췄어요.`,
    basis: `${input.month}월 · ${season}`,
    source: 'rule',
  };
}
