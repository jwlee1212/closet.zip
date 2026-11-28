'use client';
// 14 AI 추천 홈 — 핵심: 오늘 날씨와 상황(TPO)에 맞춰 "내 옷장"에서 코디를 골라 준다.
// 보조: 다른 사람 옷장의 AI 요약·추구미 맞춤 옷장. 비구독자는 잠금 미리보기로 효과를 먼저 보여 준다.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Lock, MapPin, RefreshCw, Shirt, Sparkles, Sun, Umbrella, type LucideIcon,
} from 'lucide-react';
import { Badge, Button, Card, ChipRow, InfoBox, Page, SectionHeader } from '@/components/ui';
import { ClosetCover, ClothThumb } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { CATEGORIES, Category, PUBLIC_CLOSETS, itemName, matchScore, weeklySummary } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { OCCASIONS, useRecommendation, useWeather, type Weather } from '@/lib/ai';

const ICON: Record<string, LucideIcon> = { 맑음: Sun, '구름 조금': CloudSun, 흐림: Cloud, 안개: CloudFog, 이슬비: CloudRain, 비: CloudRain, 눈: CloudSnow, 뇌우: CloudLightning };

function WeatherCard({ weather, ready, onLocate }: { weather?: Weather; ready: boolean; onLocate: () => void }) {
  if (!ready) return <div className="skeleton h-[88px] rounded-[20px]" />;
  if (!weather) {
    return (
      <Card tone="muted" className="flex-row! items-center gap-3">
        <Cloud size={28} className="text-muted" />
        <p className="text-[14px] text-sub">날씨를 불러오지 못해 이번 달 계절을 기준으로 추천해요</p>
      </Card>
    );
  }
  const Icon = ICON[weather.condition] ?? Cloud;
  return (
    <Card className="flex-row! items-center gap-4">
      <Icon size={40} strokeWidth={1.6} className="shrink-0 text-ink" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[13px] text-sub">{weather.place} · 오늘</p>
        <p className="text-[22px] font-bold tracking-[-0.02em]">{weather.temp}° <span className="text-[16px] font-semibold">{weather.condition}</span></p>
        <p className="text-[13px] text-sub">체감 {weather.feels}° · {weather.min}°/{weather.max}° · 강수 {weather.rainChance}%</p>
      </div>
      <button onClick={onLocate} className="pressable flex shrink-0 items-center gap-1 self-start rounded-full bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-sub">
        <MapPin size={13} />내 위치
      </button>
    </Card>
  );
}

export default function AiHome() {
  const app = useApp();
  const [cat, setCat] = useState<Category | '전체'>('전체');
  const [occasion, setOccasion] = useState<string>('데일리');
  const mainStyle = app.styles[0] ?? '미니멀';
  const summary = weeklySummary(mainStyle, cat);
  const { weather, ready, locate } = useWeather();

  const recs = useMemo(
    () =>
      PUBLIC_CLOSETS.filter((c) => cat === '전체' || c.items.some((i) => i.category === cat))
        .map((c) => ({ c, score: matchScore(c, app.styles, app.interests) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [cat, app.styles, app.interests],
  );

  // 핵심 기능: 내 옷장 + 날씨 + 상황 → 오늘의 코디 (/api/recommend). 날씨 응답을 기다렸다가 한 번만 요청한다
  const closet = app.activeCloset;
  const { rec, loading, error, another } = useRecommendation(
    { closet, styles: app.styles, interests: app.interests, body: app.body, occasion, weather },
    app.subscribed && ready,
  );
  const byId = (id?: string) => (id ? closet.items.find((i) => i.id === id) : undefined);
  const outfit = rec ? { outer: byId(rec.outerId), top: byId(rec.topId), bottom: byId(rec.bottomId), shoes: byId(rec.shoesId) } : undefined;
  const parts = outfit ? [outfit.outer, outfit.top, outfit.bottom, outfit.shoes].filter((i) => i !== undefined) : [];

  const onLocate = async () => {
    if (!(await locate())) app.toast('위치를 확인하지 못해 서울 날씨로 보여드려요');
  };

  const today = (
    <>
      <WeatherCard weather={weather} ready={ready} onLocate={onLocate} />
      <div className="flex flex-col gap-2.5">
        <p className="text-[14px] font-medium text-sub">오늘 어디 가세요?</p>
        <ChipRow items={OCCASIONS} value={occasion} onChange={setOccasion} />
      </div>
    </>
  );

  if (!app.subscribed) {
    return (
      <Page title="AI 추천" large left="none" tabbed>
        {today}
        {/* 잠금 미리보기: 오늘의 코디가 준비돼 있다는 걸 먼저 보여 준다 */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center gap-4 blur-[3px]">
            <Mannequin top="네이비" bottom="베이지" shoes="화이트" outer={weather && weather.feels <= 12 ? '카키' : undefined} height={170} />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 w-24 rounded-full bg-surface-strong" />
              <div className="h-5 w-36 rounded-full bg-surface-strong" />
              <div className="h-3 w-full rounded-full bg-surface" />
              <div className="h-3 w-4/5 rounded-full bg-surface" />
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-paper/60 px-6 text-center backdrop-blur-[1px]">
            <span className="flex size-11 items-center justify-center rounded-full bg-ink text-white"><Lock size={20} /></span>
            <p className="text-[17px] font-bold tracking-[-0.01em]">
              {weather ? `오늘 ${weather.temp}°C ${weather.condition}` : '오늘 날씨'}, {occasion === '데일리' ? '내 옷장' : `${occasion}`}에 맞춘 코디가 준비됐어요
            </p>
            <p className="text-[13px] text-sub">구독하면 가진 옷만으로 매일 AI가 골라 드려요</p>
          </div>
        </Card>
        <Button label="AI 추천 구독하고 오늘의 코디 보기" href="/subscribe" />

        <SectionHeader title="다른 사람 옷장 AI 요약" />
        <p className="-mt-3 text-[14px] text-sub">내 추구미 &quot;{app.styles.join(' · ')}&quot;에 맞는 옷장 {recs.length}개를 찾았어요</p>
        <div className="grid grid-cols-2 gap-2.5">
          {recs.slice(0, 2).map(({ c, score }) => (
            <div key={c.id} className="flex flex-col gap-1.5">
              <div className="relative overflow-hidden rounded-[20px]">
                <ClosetCover items={c.items} height={130} />
                <div className="absolute inset-0 flex items-center justify-center bg-paper/80 backdrop-blur-[2px]">
                  <Lock size={22} className="text-sub" />
                </div>
              </div>
              <span className="text-[13px] text-muted">추구미 일치 {score}%</span>
            </div>
          ))}
        </div>
      </Page>
    );
  }

  return (
    <Page title="AI 추천" large left="none" tabbed right={<Badge label="PRO" tone="pro" />}>
      {today}

      <SectionHeader title="오늘의 추천 코디" />
      {!closet.items.length ? (
        <Card href="/upload"><p className="text-[15px]">옷을 올리면 내 옷만으로 코디를 추천해 드려요 ›</p></Card>
      ) : loading ? (
        <div className="flex flex-col gap-3 rounded-[20px] bg-white p-5">
          <div className="flex gap-4">
            <div className="skeleton h-[190px] w-[95px] rounded-2xl" />
            <div className="flex flex-1 flex-col gap-2.5 pt-2">
              <div className="skeleton h-4 w-24 rounded-full" />
              <div className="skeleton h-6 w-40 rounded-full" />
              <div className="skeleton h-10 w-full rounded-xl" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          </div>
          <p className="flex items-center gap-1.5 text-[13px] text-sub"><Sparkles size={14} className="animate-pulse" />AI가 날씨와 상황을 보고 내 옷장에서 고르는 중</p>
        </div>
      ) : error || !rec || !outfit ? (
        <Card><p className="text-[15px] text-sub">{error ?? '추천을 불러오지 못했어요'}</p></Card>
      ) : (
        <div key={`${rec.title}-${rec.topId}`} className="animate-[rise-in_480ms_var(--ease-out)] flex flex-col gap-4 rounded-[20px] bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <Badge label={rec.source === 'openai' ? `AI 추천 · ${rec.basis}` : `${rec.basis} 기준`} tone={rec.source === 'openai' ? 'influencer' : 'neutral'} />
            <p className="text-[20px] font-bold tracking-[-0.02em]">{rec.title}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex w-[100px] shrink-0 items-end justify-center rounded-2xl bg-surface py-2">
              <Mannequin top={outfit.top?.color} bottom={outfit.bottom?.color} shoes={outfit.shoes?.color} outer={outfit.outer?.color} height={180} body={app.body} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {parts.map((it) => (
                <Link key={it.id} href={`/item/${it.id}`} className="pressable flex items-center gap-2.5 rounded-xl active:bg-surface">
                  <ClothThumb item={it} height={40} className="w-10 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[12px] text-muted">{it.category}</span>
                    <span className="block truncate text-[14px] font-semibold">{itemName(it)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <p className="text-[15px] leading-[23px]">{rec.reason}</p>
          {rec.tip && <InfoBox icon={weather && weather.rainChance >= 50 ? Umbrella : Sparkles}>{rec.tip}</InfoBox>}
          <div className="flex flex-col items-center gap-1">
            <Button label="아바타로 입혀보기" icon={Shirt} href={`/mannequin?closetId=${closet.id}&rec=1`} />
            <button onClick={another} className="pressable flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-semibold text-sub active:bg-surface">
              <RefreshCw size={15} />다른 코디 추천받기
            </button>
          </div>
        </div>
      )}

      <SectionHeader title="다른 사람 옷장 AI 요약" />
      <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={(v) => setCat(v as typeof cat)} />
      <Card tone="accent">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold"><Sparkles size={16} className="text-accent" />{summary.title}</p>
        <p className="text-[15px] leading-[23px]">{summary.body}</p>
        <div className="flex gap-1.5">{summary.tags.map((t) => <Badge key={t} label={t} tone="outline" />)}</div>
      </Card>

      <SectionHeader title="추구미 맞춤 옷장" />
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
        {recs.map(({ c, score }) => (
          <Link key={c.id} href={`/summary/${c.id}`} onClick={() => app.bumpUsage('summaries')} className="pressable flex flex-col gap-1.5">
            <div className="overflow-hidden rounded-[20px]"><ClosetCover items={c.items} height={140} /></div>
            <span className="truncate text-[15px] font-semibold">{c.name}</span>
            <span className="text-[13px] font-semibold text-accent">추구미 일치 {score}%</span>
          </Link>
        ))}
      </div>
      <InfoBox>추천 결과는 제휴 여부와 무관하게 산출되며, 광고·제휴 옷장은 별도로 표시돼요.</InfoBox>
    </Page>
  );
}
