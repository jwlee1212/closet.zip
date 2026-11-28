// 서버 전용: OpenAI 클라이언트와 공통 도구 (보고서 VI-2 "추상화 계층")
// AI 기능(분석·상품 사진·추천·아바타 착장)은 모두 이 파일의 클라이언트를 거친다.
// 모델을 바꿀 때는 아래 상수나 .env.local만 고치면 되고, 화면 코드는 그대로 둔다.
// API 키를 읽으므로 클라이언트 컴포넌트에서 import하지 말 것.
import OpenAI, { toFile } from 'openai';

/** 사진 분석·코디 추천 (텍스트 + 이미지 입력) */
export const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-6.2-sol';
/** 상품 사진·아바타 착장 생성 */
export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.6-flare';
/** 이미지 품질 — 품질이 높을수록 비싸다 (low ≈ $0.01, medium ≈ $0.05, high ≈ $0.2 / 장) */
export const IMAGE_QUALITY = (['low', 'medium', 'high'] as const).find((q) => q === process.env.OPENAI_IMAGE_QUALITY) ?? 'medium';

/** API 키가 없거나 AI_MODE=mock이면 모든 AI 기능이 목업으로 동작 */
export const isAiConfigured = () => process.env.AI_MODE !== 'mock' && !!process.env.OPENAI_API_KEY;

let client: OpenAI | undefined;
export const getClient = () => (client ??= new OpenAI({ timeout: 120_000, maxRetries: 1 }));

/** 사용자에게 그대로 보여줄 수 있는 실패 (status는 HTTP 상태) */
export class AiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** 시연이 끊기지 않도록 목업으로 넘겨도 되는 실패 (사용량 한도·서버 혼잡) */
export const isBusy = (e: unknown) =>
  e instanceof OpenAI.RateLimitError || e instanceof OpenAI.InternalServerError || e instanceof OpenAI.APIConnectionError;

/** OpenAI 오류를 화면용 메시지로 바꾼다 */
export function toAiError(e: unknown, what: string): AiError {
  if (e instanceof AiError) return e;
  if (e instanceof OpenAI.AuthenticationError) {
    console.error(`[${what}] OpenAI 인증 실패 — OPENAI_API_KEY를 확인하세요:`, e.message);
    return new AiError('AI 서버 설정에 문제가 있어요 (API 키 확인)', 500);
  }
  if (e instanceof OpenAI.PermissionDeniedError) {
    // GPT Image는 OpenAI 조직 인증(Organization Verification)을 마쳐야 쓸 수 있다
    console.error(`[${what}] OpenAI 권한 없음 — 조직 인증·모델 접근 권한을 확인하세요:`, e.message);
    return new AiError('이 AI 기능을 쓸 권한이 없어요 (OpenAI 조직 인증 확인)', 403);
  }
  if (e instanceof OpenAI.RateLimitError) return new AiError('AI 사용량 한도를 넘었어요. 잠시 후 다시 시도해 주세요', 429);
  if (e instanceof OpenAI.BadRequestError) {
    console.error(`[${what}] 잘못된 요청:`, e.message);
    return new AiError('이 사진으로는 처리할 수 없어요. 다른 사진으로 시도해 주세요', 400);
  }
  if (e instanceof OpenAI.APIConnectionError) return new AiError('AI 서버에 연결하지 못했어요. 다시 시도해 주세요', 503);
  if (e instanceof OpenAI.APIError) {
    console.error(`[${what}] OpenAI 오류 ${e.status}:`, e.message);
    return new AiError('AI 처리 중 오류가 났어요. 다시 시도해 주세요', 502);
  }
  console.error(`[${what}] 예상하지 못한 오류:`, e);
  return new AiError('AI 처리 중 오류가 났어요. 다시 시도해 주세요', 500);
}

const DATA_URL = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;
export const MAX_BASE64 = 5 * 1024 * 1024; // 클라이언트는 480px 이미지(수십 KB)를 보내므로 넉넉한 상한

export type InlineImage = { mediaType: string; base64: string };

export function parseDataUrl(src: unknown): InlineImage | null {
  const m = typeof src === 'string' ? DATA_URL.exec(src) : null;
  return m && m[2].length <= MAX_BASE64 ? { mediaType: m[1], base64: m[2] } : null;
}

const LOOK_PATH = /^\/looks\/[a-z0-9-]+\.webp$/;
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

/** data URL 또는 앱에 들어 있는 카탈로그 사진(/looks/*.webp) → 이미지 편집 API 업로드용 파일 */
export async function toUpload(src: string, name: string, origin: string) {
  const inline = parseDataUrl(src);
  if (inline) return toFile(Buffer.from(inline.base64, 'base64'), `${name}.${EXT[inline.mediaType]}`, { type: inline.mediaType });
  if (LOOK_PATH.test(src)) {
    // public 폴더 파일은 배포 환경에서 함수 파일시스템에 없을 수 있어 자기 서버에서 받아온다
    const res = await fetch(new URL(src, origin));
    if (res.ok) return toFile(Buffer.from(await res.arrayBuffer()), `${name}.webp`, { type: 'image/webp' });
  }
  return null;
}

/** 이미지 API 응답 → data URL */
export function firstImage(res: OpenAI.ImagesResponse, format = 'webp') {
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new AiError('AI가 이미지를 만들지 못했어요. 다시 시도해 주세요', 502);
  return `data:image/${format};base64,${b64}`;
}

// 공개 엔드포인트라 API 요금 남용을 막는 최소한의 IP별 제한 (서버 인스턴스 메모리 기준)
// TODO(백엔드): 여러 인스턴스로 배포하면 Upstash Redis 같은 공유 저장소로, 로그인 사용자 기준으로 옮긴다
const hits = new Map<string, number[]>();
export function rateLimited(request: Request, bucket: string, limitPerMinute: number) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limitPerMinute;
}

/** 월 → 계절 (추천에 쓰는 날씨 대신의 기준) */
export function seasonOf(month: number) {
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}
