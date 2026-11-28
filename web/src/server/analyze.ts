// 서버 전용: 옷 사진 → 속성 추출 + 상품 사진 생성 (OpenAI)
// 라우트 핸들러는 analyzeClothing() / generateProductPhoto()만 호출한다.
import { toFile } from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { CATEGORIES, COLORS, KINDS, MATERIALS, SEASONS, type Category } from '@/data/mock';
import { AiError, IMAGE_MODEL, IMAGE_QUALITY, TEXT_MODEL, firstImage, getClient, isBusy, toAiError, type InlineImage } from './openai';

export type AnalyzeResult = {
  category: Category;
  kind: string;
  color: string;
  material: string;
  season: string;
  confidence: number;
  /** 한 줄 설명 (실제 분석일 때만) */
  note?: string;
  /** openai: 실제 API 분석, mock: 임의 값, sample: 사진 없는 체험 */
  source: 'openai' | 'mock' | 'sample';
  /** mock·sample일 때 화면 배지에 보여줄 이유 */
  notice?: string;
  /** AI가 만든 상품 사진 (data URL 또는 /looks 경로) */
  productPhoto?: string;
  /** 상품 사진을 못 만들었을 때 안내 */
  generationNotice?: string;
};

const ALL_KINDS = [...new Set(Object.values(KINDS).flat())];
const asTuple = (arr: readonly string[]) => arr as [string, ...string[]];

// 구조화 출력 스키마 — 앱이 쓰는 값 목록(enum) 안에서만 고르게 해 후처리를 줄인다
const Schema = z.object({
  is_clothing: z.boolean().describe('사진의 주인공이 옷·신발·가방·모자 같은 패션 아이템이면 true'),
  category: z.enum(asTuple(CATEGORIES)),
  kind: z.enum(asTuple(ALL_KINDS)).describe('category에 속하는 세부 종류. 정확히 없으면 가장 가까운 것'),
  color: z.enum(asTuple(COLORS)).describe('가장 넓은 면적을 차지하는 주된 색'),
  material: z.enum(asTuple(MATERIALS)).describe('겉감으로 보이는 소재'),
  season: z.enum(asTuple(SEASONS)).describe('가장 잘 어울리는 계절. 계절을 타지 않으면 사계절'),
  confidence: z.number().describe('분석 확신도 0~100'),
  note: z.string().describe('옷의 특징을 한국어 한 문장(40자 이내)으로. 예: "크루넥 네이비 맨투맨, 도톰한 코튼 소재로 보여요"'),
});

const SYSTEM = `당신은 디지털 옷장 앱의 의류 분석기입니다. 사용자가 올린 옷 사진 한 장을 보고 속성을 추출합니다.
- 사진에 여러 아이템이 있으면 가장 크게, 가운데에 보이는 하나만 분석합니다.
- 모든 값은 스키마에 주어진 목록에서 고릅니다. 정확히 맞는 값이 없으면 가장 가까운 값을 고릅니다.
- kind는 반드시 category에 속하는 종류여야 합니다.
- 조명 때문에 색이 애매하면 실제 옷의 색을 추정해 고르고 confidence를 낮춥니다.
- 옷이 아니거나 너무 흐려 판단할 수 없으면 is_clothing을 false로 두고 나머지는 가장 가까운 값으로 채웁니다.`;

export async function analyzeClothing(image: InlineImage): Promise<AnalyzeResult> {
  let out: z.infer<typeof Schema> | null;
  try {
    const res = await getClient().responses.parse({
      model: TEXT_MODEL,
      reasoning: { effort: 'low' }, // 분류 작업이라 속도를 우선
      instructions: SYSTEM,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_image', detail: 'auto', image_url: `data:${image.mediaType};base64,${image.base64}` },
            { type: 'input_text', text: '이 옷을 분석해 주세요.' },
          ],
        },
      ],
      text: { format: zodTextFormat(Schema, 'clothing_analysis') },
    });
    out = res.output_parsed;
  } catch (e) {
    // 시연이 끊기지 않도록 사용량 한도·서버 혼잡은 목업으로 넘긴다
    if (isBusy(e)) {
      console.warn('[analyze] OpenAI 혼잡·한도 → 목업으로 대체:', e instanceof Error ? e.message : e);
      return mockAnalyze(false, 'AI 사용량 한도·혼잡 · 데모 분석');
    }
    throw toAiError(e, 'analyze');
  }

  if (!out) throw new AiError('AI 분석 결과를 읽지 못했어요. 다시 시도해 주세요', 502);
  if (!out.is_clothing) throw new AiError('옷이 잘 보이지 않아요. 옷 전체가 나오게 다시 찍어 주세요', 422);

  const category = out.category as Category;
  return {
    category,
    // 스키마로 막지 못하는 category–kind 불일치만 보정
    kind: KINDS[category].includes(out.kind) ? out.kind : KINDS[category][0],
    color: out.color,
    material: out.material,
    season: out.season,
    confidence: Math.max(0, Math.min(100, Math.round(out.confidence))),
    note: out.note,
    source: 'openai',
  };
}

/** 업로드한 실제 옷 사진을 참고해 배경 없는 상품 사진을 만든다 */
export async function generateProductPhoto(image: InlineImage, analysis: AnalyzeResult) {
  const file = await toFile(Buffer.from(image.base64, 'base64'), 'garment.jpg', { type: image.mediaType });
  const res = await getClient().images.edit({
    model: IMAGE_MODEL,
    image: file,
    prompt: `Create a photorealistic e-commerce studio photograph of the single garment in the reference photo (${analysis.color} ${analysis.kind}, ${analysis.material}). Keep its exact construction, pattern, hue, closures, neckline and proportions. Show the whole item neatly laid out front-on with generous margins on a seamless off-white background, soft natural shadows. No people, hangers, surroundings, added branding or text.`,
    size: '1024x1024',
    quality: IMAGE_QUALITY,
    output_format: 'webp',
  });
  return firstImage(res);
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function mockAnalyze(sample: boolean, notice = '데모 분석 (API 키 미설정)'): Promise<AnalyzeResult> {
  await new Promise((r) => setTimeout(r, 1200)); // 분석 시간 흉내
  if (sample) {
    return { category: '상의', kind: '맨투맨', color: '네이비', material: '코튼', season: '가을', confidence: 94, source: 'sample', notice: '샘플 체험' };
  }
  const category = pick(CATEGORIES.slice(0, 4));
  return {
    category,
    kind: pick(KINDS[category]),
    color: pick(COLORS.slice(0, 8)),
    material: pick(MATERIALS.slice(0, 5)),
    season: pick(SEASONS),
    confidence: 80 + Math.floor(Math.random() * 15),
    source: 'mock',
    notice,
  };
}
