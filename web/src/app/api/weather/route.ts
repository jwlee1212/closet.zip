// 오늘 날씨 API — 기본은 서울, 위치 허용 시 ?lat=&lon= 으로 현재 위치
import { getWeather } from '@/server/weather';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const lat = Number(q.get('lat'));
  const lon = Number(q.get('lon'));
  const custom = Number.isFinite(lat) && Number.isFinite(lon) && q.has('lat') && Math.abs(lat) <= 90 && Math.abs(lon) <= 180;
  const weather = custom ? await getWeather(lat, lon, '현재 위치') : await getWeather(37.5665, 126.978, '서울');
  return weather ? Response.json(weather) : Response.json({ error: '날씨를 불러오지 못했어요' }, { status: 503 });
}
