'use client';
// 브라우저 쪽 AI 도우미 — 서버 API 호출, 결과 캐시, 이미지 축소
// 같은 옷장·같은 날에는 추천·착장 이미지를 다시 만들지 않도록 sessionStorage에 캐시한다 (API 요금 절약)

import { useCallback, useEffect, useState } from 'react';
import type { Recommendation } from '@/app/api/recommend/route';
import type { Weather } from '@/server/weather';
import type { BodySpec, Closet } from '@/data/mock';

export type { Recommendation, Weather };

/** 상황(TPO) 선택지 — AI 추천 화면 칩 */
export const OCCASIONS = ['데일리', '출근', '데이트', '운동', '여행', '하객'] as const;

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

/** 오늘 날씨 — 기본 서울, "내 위치" 허용 시 현재 위치 (위치는 이 기기 sessionStorage에만 기억) */
export function useWeather() {
  const [coords, setCoords] = useState(() => cacheGet<{ lat: number; lon: number }>('geo'));
  const key = `weather:${coords ? `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}` : 'seoul'}:${new Date().getHours()}`;
  const cached = cacheGet<Weather>(key);
  const [state, setState] = useState<{ key?: string; weather?: Weather; failed?: boolean }>({});

  useEffect(() => {
    if (cached) return;
    const ctrl = new AbortController();
    fetch(coords ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}` : '/api/weather', { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error('weather');
        const w = (await r.json()) as Weather;
        cacheSet(key, w);
        setState({ key, weather: w });
      })
      .catch((e: Error) => { if (e.name !== 'AbortError') setState({ key, failed: true }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key가 위치·시간을 담고 있다
  }, [key]);

  const locate = useCallback(() => new Promise<boolean>((resolve) => {
    if (!navigator.geolocation) return resolve(false);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c = { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 };
        cacheSet('geo', c);
        setCoords(c);
        resolve(true);
      },
      () => resolve(false),
      { timeout: 8000, maximumAge: 30 * 60_000 },
    );
  }), []);

  const weather = cached ?? (state.key === key ? state.weather : undefined);
  const failed = state.key === key && !!state.failed;
  return { weather, ready: !!weather || failed, locate };
}

type RecContext = {
  closet: Closet; styles: string[]; interests: string[]; body?: BodySpec; occasion: string; weather?: Weather;
  /** 참고할 다른 사람의 옷장 — 그 스타일을 내 옷으로 재현 */
  reference?: Closet;
  /** 참고 옷장에서 특히 살릴 아이템 id */
  focusId?: string;
};

const recKey = ({ closet, styles, interests, body, occasion, weather, reference, focusId }: RecContext, round: number) =>
  `rec:${closet.id}:${reference ? `ref=${reference.id}/${focusId ?? ''}` : ''}:${new Date().toDateString()}:${occasion}:${weather ? `${weather.temp}${weather.condition}` : '-'}:${round}:${styles.join(',')}:${interests.join(',')}:${body?.fit ?? ''}:${closet.items.map((i) => i.id).join(',')}`;

/** "다시 추천" 하루 횟수 제한 (보고서: 다시 추천은 횟수 제한) — 이 기기 기준 */
export const REROLL_LIMIT = 5;
const rerollKey = () => `rerolls:${new Date().toDateString()}`;
const rerollsUsed = () => {
  try { return Number(localStorage.getItem(rerollKey()) ?? 0); } catch { return 0; }
};

/** 마네킹 화면이 이어받을 마지막 추천 */
export const cachedRecommendation = (closetId: string) => cacheGet<Recommendation>(`rec:last:${closetId}`);

/** 오늘의 추천 코디 — 날씨·상황이 바뀌거나 "다른 코디"를 누르면 다시 받는다 */
export function useRecommendation(ctx: RecContext, enabled: boolean) {
  const [round, setRound] = useState(0);
  const key = recKey(ctx, round);
  const [state, setState] = useState<{ key?: string; rec?: Recommendation; error?: string }>({});
  const cached = cacheGet<Recommendation>(key);
  const [avoid, setAvoid] = useState<string[]>([]);

  useEffect(() => {
    if (cached) { cacheSet(`rec:last:${ctx.closet.id}`, cached); return; }
    if (!enabled || !ctx.closet.items.length) return;
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
        weather: ctx.weather,
        occasion: ctx.occasion,
        avoid: round > 0 ? avoid : [],
        reference: ctx.reference && {
          name: ctx.reference.name,
          theme: ctx.reference.theme,
          summary: ctx.reference.summary,
          items: ctx.reference.items.map(({ category, kind, color, material }) => ({ category, kind, color, material })),
          focus: ctx.focusId ? ctx.reference.items.find((i) => i.id === ctx.focusId) : undefined,
        },
      }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? '추천을 불러오지 못했어요');
        cacheSet(key, data);
        cacheSet(`rec:last:${ctx.closet.id}`, data);
        setState({ key, rec: data });
      })
      .catch((e: Error) => { if (e.name !== 'AbortError') setState({ key, error: e.message }); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key가 옷장·날씨·상황·회차를 모두 담고 있다
  }, [key, enabled]);

  const rec = cached ?? (state.key === key ? state.rec : undefined);
  const [used, setUsed] = useState(rerollsUsed);
  /** 다른 코디 보기: 지금 추천에 쓴 옷은 피해서 다시 받는다. 하루 횟수를 넘으면 false */
  const another = () => {
    if (used >= REROLL_LIMIT) return false;
    if (rec) setAvoid([rec.outerId, rec.topId, rec.bottomId, rec.shoesId].filter((x): x is string => !!x));
    try { localStorage.setItem(rerollKey(), String(used + 1)); } catch { /* 저장 실패는 무시 */ }
    setUsed(used + 1);
    setRound((n) => n + 1);
    return true;
  };
  return {
    rec,
    error: state.key === key ? state.error : undefined,
    loading: enabled && !rec && !(state.key === key && state.error),
    another,
    rerollsLeft: Math.max(0, REROLL_LIMIT - used),
  };
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
