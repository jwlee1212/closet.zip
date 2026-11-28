'use client';
// 브라우저 쪽 AI 도우미 — 서버 API 호출, 결과 캐시, 이미지 축소
// 같은 옷장·같은 날에는 추천·착장 이미지를 다시 만들지 않도록 sessionStorage에 캐시한다 (API 요금 절약)

import { useEffect, useState } from 'react';
import type { Recommendation } from '@/app/api/recommend/route';
import type { BodySpec, Closet } from '@/data/mock';

export type { Recommendation };

const cacheGet = <T,>(key: string): T | undefined => {
  try {
    const v = sessionStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : undefined;
  } catch {
    return undefined;
  }
};
const cacheSet = (key: string, v: unknown) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(v));
  } catch {
    // 용량 초과 등은 무시 (캐시일 뿐)
  }
};

type RecContext = { closet: Closet; styles: string[]; interests: string[]; body?: BodySpec };

const recKey = ({ closet, styles, interests, body }: RecContext) =>
  `rec:${closet.id}:${new Date().toDateString()}:${styles.join(',')}:${interests.join(',')}:${body?.fit ?? ''}:${closet.items.map((i) => i.id).join(',')}`;

/** 오늘의 추천 코디 — 마네킹 화면에서 같은 결과를 다시 쓸 수 있게 캐시를 공유한다 */
export const cachedRecommendation = (ctx: RecContext) => cacheGet<Recommendation>(recKey(ctx));

export function useRecommendation(ctx: RecContext, enabled: boolean) {
  const key = recKey(ctx);
  const [state, setState] = useState<{ key?: string; rec?: Recommendation; error?: string }>({});
  const cached = cacheGet<Recommendation>(key);

  useEffect(() => {
    if (!enabled || cached || !ctx.closet.items.length) return;
    const ctrl = new AbortController();
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: ctx.closet.items.map(({ id, category, kind, color, material, season, fit }) => ({ id, category, kind, color, material, season, fit })),
        styles: ctx.styles,
        interests: ctx.interests,
        fit: ctx.body?.fit,
        month: new Date().getMonth() + 1,
      }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? '추천을 불러오지 못했어요');
        cacheSet(key, data);
        setState({ key, rec: data });
      })
      .catch((e: Error) => { if (e.name !== 'AbortError') setState({ key, error: e.message }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key가 옷장·추구미 변화를 모두 담고 있다
  }, [key, enabled]);

  const rec = cached ?? (state.key === key ? state.rec : undefined);
  return { rec, error: state.key === key ? state.error : undefined, loading: enabled && !rec && !(state.key === key && state.error) };
}

export type TryOnPart = { slot: string; name: string; photo?: string };

const tryOnKey = (parts: TryOnPart[], body?: BodySpec) =>
  `tryon:${parts.map((p) => `${p.slot}=${p.name}|${p.photo?.slice(-40) ?? ''}`).join(';')}:${body?.height ?? ''}:${body?.build ?? ''}:${body?.bodyType ?? ''}`;

export const cachedTryOn = (parts: TryOnPart[], body?: BodySpec) => cacheGet<string>(tryOnKey(parts, body));

/** AI 아바타 착장 이미지 생성 — 결과는 480px로 줄여 캐시한다 */
export async function requestTryOn(parts: TryOnPart[], body?: BodySpec): Promise<{ image?: string; notice?: string }> {
  const key = tryOnKey(parts, body);
  const hit = cacheGet<string>(key);
  if (hit) return { image: hit };
  const r = await fetch('/api/tryon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parts, body }),
  });
  const data = (await r.json()) as { image?: string; notice?: string; error?: string };
  if (!r.ok) throw new Error(data.error ?? '착장 이미지를 만들지 못했어요');
  if (!data.image) return { notice: data.notice };
  const small = await shrinkImage(data.image, 480).catch(() => data.image!);
  cacheSet(key, small);
  return { image: small };
}

/** 긴 변 max px의 WebP data URL로 줄인다 (localStorage·sessionStorage 용량 절약) */
export async function shrinkImage(uri: string, max = 480): Promise<string> {
  const img = new Image();
  img.src = uri;
  await img.decode();
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 읽지 못했어요');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.85);
}
