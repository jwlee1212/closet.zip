// 서버 전용: 옷 사진 → 속성 추출 (보고서 VI-2 "추상화 계층")
// 라우트 핸들러는 analyzeClothing()만 호출한다. 모델·공급자를 바꿀 때는 이 파일만 고치면 된다.
// API 키를 읽으므로 클라이언트 컴포넌트에서 import하지 말 것.
import { ApiError, GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { CATEGORIES, COLORS, KINDS, MATERIALS, SEASONS, type Category } from '@/data/mock';

export type AnalyzeResult = {
  category: Category;
  kind: string;
  color: string;
  material: string;
  season: string;
  confidence: number;
  /** 한 줄 설명 (실제 분석일 때만) */
  note?: string;
  /** gemini: 실제 API 분석, mock: 임의 값, sample: 사진 없는 체험 */
  source: 'gemini' | 'mock' | 'sample';
  /** mock·sample일 때 화면 배지에 보여줄 이유 */
  notice?: string;
};

/** 사용자에게 그대로 보여줄 수 있는 실패 (status는 HTTP 상태) */
export class AnalyzeError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const ALL_KINDS = [...new Set(Object.values(KINDS).flat())];
const asTuple = (arr: readonly string[]) => arr as [string, ...string[]];

// 구조화 출력 스키마 — 앱이 쓰는 값 목록(enum) 안에서만 고르게 해 후처리를 줄인다.
// 같은 스키마로 JSON 스키마를 만들어 모델에 주고, 응답 검증에도 쓴다.
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
const JSON_SCHEMA: Record<string, unknown> = { ...z.toJSONSchema(Schema) };
delete JSON_SCHEMA.$schema;

const SYSTEM = `당신은 디지털 옷장 앱의 의류 분석기입니다. 사용자가 올린 옷 사진 한 장을 보고 속성을 추출합니다.
- 사진에 여러 아이템이 있으면 가장 크게, 가운데에 보이는 하나만 분석합니다.
- 모든 값은 스키마에 주어진 목록에서 고릅니다. 정확히 맞는 값이 없으면 가장 가까운 값을 고릅니다.
- kind는 반드시 category에 속하는 종류여야 합니다.
- 조명 때문에 색이 애매하면 실제 옷의 색을 추정해 고르고 confidence를 낮춥니다.
- 옷이 아니거나 너무 흐려 판단할 수 없으면 is_clothing을 false로 두고 나머지는 가장 가까운 값으로 채웁니다.`;

// 무료 등급 하루 한도가 넉넉한 Flash-Lite를 먼저 쓰고, 혼잡(503)·한도 초과(429)면 다음 모델로 넘어간다.
// 모델마다 무료 한도가 따로라 여러 개를 두면 시연 중 막힐 일이 줄어든다.
// 쓸 수 있는 모델 이름은 계정마다 다를 수 있다 (AI Studio 또는 models.list로 확인). GEMINI_MODEL로 첫 모델을 바꿀 수 있다.
const MODELS = [...new Set([process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'])];

/** API 키가 없거나 AI_ANALYZE_MODE=mock이면 목업으로 동작 */
export const isAiConfigured = () => process.env.AI_ANALYZE_MODE !== 'mock' && !!process.env.GEMINI_API_KEY;

let client: GoogleGenAI | undefined;
const getClient = () => (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));

export async function analyzeClothing(image: { mediaType: string; base64: string }): Promise<AnalyzeResult> {
  let text: string | undefined;
  let lastBusy = 0; // 마지막으로 받은 429/5xx
  for (const model of MODELS) {
    try {
      const res = await getClient().models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ inlineData: { mimeType: image.mediaType, data: image.base64 } }, { text: '이 옷을 분석해 주세요.' }],
          },
        ],
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: 'application/json',
          responseJsonSchema: JSON_SCHEMA,
          abortSignal: AbortSignal.timeout(20_000),
        },
      });
      text = res.text;
      break;
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 429 || e.status >= 500) {
          console.warn(`[analyze] ${model} ${e.status} → 다음 모델 시도:`, e.message.slice(0, 160));
          lastBusy = e.status;
          continue;
        }
        console.error(`[analyze] ${model} 오류 ${e.status}:`, e.message);
        if (e.status === 401 || e.status === 403 || /API key/i.test(e.message)) {
          throw new AnalyzeError('AI 분석 서버 설정에 문제가 있어요 (API 키 확인)', 500);
        }
        throw new AnalyzeError('이 사진은 분석할 수 없어요. 다른 사진으로 시도해 주세요', 400);
      }
      if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
        console.warn(`[analyze] ${model} 시간 초과 → 다음 모델 시도`);
        lastBusy = 504;
        continue;
      }
      throw e;
    }
  }
  // 모든 모델이 혼잡·한도 초과면 시연이 끊기지 않도록 목업으로 넘긴다
  if (text === undefined && lastBusy) {
    return mockAnalyze(false, lastBusy === 429 ? '무료 사용량 초과 · 데모 분석' : 'AI 서버 혼잡 · 데모 분석');
  }

  let json: unknown;
  try {
    json = JSON.parse(text ?? '');
  } catch {
    json = undefined;
  }
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    console.error('[analyze] 응답 형식이 스키마와 달라요:', text);
    throw new AnalyzeError('AI 분석 결과를 읽지 못했어요. 다시 시도해 주세요', 502);
  }
  const out = parsed.data;
  if (!out.is_clothing) throw new AnalyzeError('옷이 잘 보이지 않아요. 옷 전체가 나오게 다시 찍어 주세요', 422);

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
    source: 'gemini',
  };
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
