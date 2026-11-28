// 서버 전용: 내 옷장 + 오늘 날씨 + 상황(TPO) + 추구미 → 오늘의 코디 추천 (OpenAI)
// 이 앱 AI 추천의 핵심 기능. 날씨를 못 받으면 계절 기준으로 고른다.
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { TEXT_MODEL, getClient, isBusy, seasonOf, toAiError } from './openai';
import type { Weather } from './weather';

export type RecItem = { id: string; category: string; kind: string; color: string; material?: string; season?: string; fit?: string };

export type RecommendInput = {
  items: RecItem[];
  styles: string[];
  interests: string[];
  fit?: string;
  month: number;
  weather?: Pick<Weather, 'temp' | 'feels' | 'min' | 'max' | 'rainChance' | 'condition'>;
  /** 상황: 데일리·출근·데이트·운동·여행·하객 등 */
  occasion?: string;
  /** "다른 코디 보기"로 다시 요청할 때 직전 추천에서 쓴 옷 id (겹치지 않게) */
  avoid?: string[];
};

export type Recommendation = {
  outerId?: string;
  topId?: string;
  bottomId?: string;
  shoesId?: string;
  title: string;
  reason: string;
  /** 날씨 대응 한 줄 팁 (예: "일교차가 커요. 아우터는 벗기 쉬운 걸로") */
  tip?: string;
  /** 추천 기준 (예: "6°C 맑음 · 출근") */
  basis: string;
  /** openai: 실제 AI, rule: API 키가 없거나 실패해 규칙으로 고름 */
  source: 'openai' | 'rule';
};

const Schema = z.object({
  outer_id: z.string().nullable().describe('아우터 id. 날씨상 필요 없거나 옷장에 없으면 null'),
  top_id: z.string().nullable(),
  bottom_id: z.string().nullable(),
  shoes_id: z.string().nullable(),
  title: z.string().describe('코디 한 줄 제목 (20자 이내). 예: "쌀쌀한 아침 출근룩"'),
  reason: z.string().describe('왜 이 조합인지 한국어 2문장. 날씨·상황·추구미·색 조합을 근거로'),
  tip: z.string().describe('오늘 날씨에 맞춘 짧은 팁 한 문장 (30자 이내). 예: "오후엔 따뜻해져요. 아우터는 가볍게"'),
});

const SYSTEM = `당신은 디지털 옷장 앱의 퍼스널 스타일리스트입니다. 사용자가 이미 가진 옷 목록 안에서만, 오늘 날씨와 상황에 맞는 코디 한 벌을 고릅니다.
- 반드시 목록에 있는 id만 씁니다. 없는 옷을 지어내지 않습니다.
- 상의·하의·신발을 하나씩 고르고, 날씨상 필요하면 아우터를 더합니다. 해당 카테고리가 목록에 없으면 null로 둡니다.
- 기온 기준: 체감 5°C 이하는 패딩·코트 같은 두꺼운 아우터, 6~11°C는 코트·재킷, 12~16°C는 가벼운 아우터나 니트, 17~22°C는 긴팔 한 겹, 23°C 이상은 반팔·얇은 소재. 일교차가 크면 벗기 쉬운 아우터를 고릅니다.
- 비·눈 소식이 있으면 젖어도 괜찮은 소재와 신발(부츠·러닝화 등)을 우선하고 스웨이드·밝은 색 신발은 피합니다.
- 상황(TPO)에 맞춥니다: 출근은 단정하게, 데이트는 분위기 있게, 운동은 활동성, 여행은 편안함과 레이어드, 하객은 격식 있게.
- 사용자의 추구미(스타일)와 선호 핏을 반영하고, 색 조합이 자연스럽게 맞도록 고릅니다.
- 피해야 할 옷 id가 주어지면 가능한 한 다른 조합을 고릅니다.
- 추천 이유와 팁은 친근한 존댓말로 짧게 씁니다.`;

const SLOT = { 아우터: 'outer', 상의: 'top', 하의: 'bottom', 신발: 'shoes' } as const;

const basisOf = (input: RecommendInput) => {
  const w = input.weather;
  const when = w ? `${w.temp}°C ${w.condition}` : `${input.month}월 · ${seasonOf(input.month)}`;
  return input.occasion && input.occasion !== '데일리' ? `${when} · ${input.occasion}` : when;
};

export async function recommendOutfit(input: RecommendInput): Promise<Recommendation> {
  const items = input.items.filter((i) => i.category in SLOT);
  const w = input.weather;
  let out: z.infer<typeof Schema> | null;
  try {
    const res = await getClient().responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: 'low' },
      instructions: SYSTEM,
      input: JSON.stringify({
        오늘_날씨: w
          ? { 현재: `${w.temp}°C`, 체감: `${w.feels}°C`, 최저: `${w.min}°C`, 최고: `${w.max}°C`, 하늘: w.condition, 강수확률: `${w.rainChance}%` }
          : `날씨 정보 없음 — ${input.month}월(${seasonOf(input.month)}) 기준으로 판단`,
        상황: input.occasion ?? '데일리',
        추구미: input.styles,
        관심_카테고리: input.interests,
        선호_핏: input.fit ?? '정보 없음',
        피해야_할_옷_id: input.avoid ?? [],
        내_옷장: items.map(({ id, category, kind, color, material, season, fit }) => ({ id, category, kind, color, material, season, fit })),
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
    tip: out.tip,
    basis: basisOf(input),
    source: 'openai',
  };
  if (!rec.topId && !rec.bottomId) return ruleRecommend(input);
  return rec;
}

/** API 키가 없을 때·실패했을 때의 대체 추천: 기온(없으면 계절)에 맞는 옷을 카테고리별로 하나씩 */
export function ruleRecommend(input: RecommendInput): Recommendation {
  const w = input.weather;
  const season = w ? (w.feels <= 9 ? '겨울' : w.feels <= 16 ? '가을' : w.feels <= 22 ? '봄' : '여름') : seasonOf(input.month);
  const fits = (i: RecItem) => !i.season || i.season === season || i.season === '사계절';
  const avoid = new Set(input.avoid ?? []);
  const first = (category: string) => {
    const pool = input.items.filter((i) => i.category === category);
    return (pool.find((i) => fits(i) && !avoid.has(i.id)) ?? pool.find(fits) ?? pool[0])?.id;
  };
  const needOuter = w ? w.feels <= 16 || w.max - w.min >= 10 : season === '겨울' || season === '가을';
  const style = input.styles[0] ?? '데일리';
  const occasion = input.occasion && input.occasion !== '데일리' ? `${input.occasion}룩` : '코디';
  return {
    outerId: needOuter ? first('아우터') : undefined,
    topId: first('상의'),
    bottomId: first('하의'),
    shoesId: first('신발'),
    title: `${style} 무드 ${occasion}`,
    reason: w
      ? `오늘 ${w.temp}°C(체감 ${w.feels}°C)라 ${season} 옷 중에서 골랐어요. 가진 옷만으로 "${style}" 무드를 맞췄어요.`
      : `${season}에 맞는 옷 중에서 골랐어요. 가진 옷만으로 "${style}" 무드를 맞췄어요.`,
    tip: w && w.rainChance >= 50 ? `강수 확률 ${w.rainChance}%예요. 우산 챙기세요` : w && w.max - w.min >= 10 ? '일교차가 커요. 겉옷을 챙기세요' : undefined,
    basis: basisOf(input),
    source: 'rule',
  };
}
