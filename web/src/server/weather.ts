// 서버 전용: 오늘 날씨 (Open-Meteo — API 키 없이 쓰는 무료 날씨 API)
// 코디 추천의 기준이 된다. 실패하면 계절 기준으로 추천하도록 null을 돌려준다.

export type Weather = {
  place: string;
  temp: number; // 현재 기온 °C
  feels: number; // 체감 온도
  min: number;
  max: number;
  rainChance: number; // 오늘 강수 확률 %
  condition: string; // 맑음·구름 많음·비 …
  code: number; // WMO 날씨 코드
};

/** WMO 날씨 코드 → 한국어 */
function conditionOf(code: number) {
  if (code === 0) return '맑음';
  if (code <= 2) return '구름 조금';
  if (code === 3) return '흐림';
  if (code === 45 || code === 48) return '안개';
  if (code >= 51 && code <= 57) return '이슬비';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return '비';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '눈';
  if (code >= 95) return '뇌우';
  return '흐림';
}

const cache = new Map<string, { at: number; data: Weather }>();

export async function getWeather(lat: number, lon: number, place: string): Promise<Weather | null> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.data; // 10분 캐시

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Seoul',
    forecast_days: '1',
  }).toString();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const code = Number(j.current?.weather_code ?? 3);
    const data: Weather = {
      place,
      temp: Math.round(j.current.temperature_2m),
      feels: Math.round(j.current.apparent_temperature),
      min: Math.round(j.daily.temperature_2m_min[0]),
      max: Math.round(j.daily.temperature_2m_max[0]),
      rainChance: Math.round(j.daily.precipitation_probability_max?.[0] ?? 0),
      condition: conditionOf(code),
      code,
    };
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (e) {
    console.warn('[weather] 날씨를 불러오지 못했어요:', e instanceof Error ? e.message : e);
    return null;
  }
}
