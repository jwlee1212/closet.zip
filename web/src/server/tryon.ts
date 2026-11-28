// 서버 전용: 실제 옷 사진 → AI 아바타(마네킹) 착장 이미지 (OpenAI 이미지 편집)
// 첫 번째 참고 이미지는 앱의 기본 마네킹, 그 뒤는 사용자가 고른 옷 사진이다.
import type { Uploadable } from 'openai/uploads';
import { IMAGE_MODEL, IMAGE_QUALITY, firstImage, getClient, toUpload } from './openai';

export type TryOnPart = { slot: string; name: string; photo?: string };
export type TryOnBody = { height?: number; build?: string; bodyType?: string; fit?: string };

const SLOT_EN: Record<string, string> = { 아우터: 'outerwear (worn open over the top)', 상의: 'top', 하의: 'bottoms', 신발: 'shoes' };
const BUILD_EN: Record<string, string> = { 슬림: 'slim', 보통: 'average', 탄탄: 'athletic', 넉넉: 'broad, relaxed' };
const TYPE_EN: Record<string, string> = { 여성형: 'female-form', 남성형: 'male-form' };
const FIT_EN: Record<string, string> = { 슬림핏: 'slim fit', 레귤러핏: 'regular fit', 오버핏: 'oversized fit' };

export async function generateTryOn(parts: TryOnPart[], body: TryOnBody, origin: string) {
  const mannequin = await toUpload('/looks/front.webp', 'mannequin', origin);
  const images: Uploadable[] = mannequin ? [mannequin] : [];
  const lines: string[] = [];
  for (const [i, p] of parts.entries()) {
    const file = p.photo ? await toUpload(p.photo, `garment-${i + 1}`, origin) : null;
    if (file) images.push(file);
    lines.push(`- ${SLOT_EN[p.slot] ?? p.slot}: ${p.name}${file ? ` (reference image ${images.length})` : ' (no photo; render a plain, realistic version from this description)'}`);
  }

  const figure = [
    body.bodyType && TYPE_EN[body.bodyType],
    body.build && `${BUILD_EN[body.build] ?? 'average'} build`,
    body.height && `proportioned for a ${body.height} cm person`,
  ].filter(Boolean).join(', ');

  const prompt = `Photorealistic full-body fashion catalog photo of ${mannequin ? 'the same faceless display mannequin shown in reference image 1' : 'a faceless matte display mannequin'}${figure ? ` (${figure})` : ''}, standing straight and facing the camera, centered on a plain light warm-gray studio background with soft even lighting.
Dress the mannequin in exactly these garments, reproducing each reference photo faithfully — same color, pattern, fabric texture, length, collar, buttons and other details:
${lines.join('\n')}
${body.fit && FIT_EN[body.fit] ? `Style the clothes with a ${FIT_EN[body.fit]} silhouette where it suits the garment.` : ''}
Show the whole figure from head to shoes with some margin. Do not add any other clothing, accessories, logos, text or people.`;

  const res = await getClient().images.edit({
    model: IMAGE_MODEL,
    image: images.length === 1 ? images[0] : images,
    prompt,
    size: '1024x1536',
    quality: IMAGE_QUALITY,
    output_format: 'webp',
  });
  return firstImage(res);
}
