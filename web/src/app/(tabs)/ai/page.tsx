'use client';
// 14 AI 추천 홈 (구독자) · 비구독자는 잠금 미리보기

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import { Badge, Button, Card, ChipRow, InfoBox, Page, SectionHeader } from '@/components/ui';
import { ClosetCover } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { CATEGORIES, Category, PUBLIC_CLOSETS, itemName, matchScore, weeklySummary } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { useRecommendation } from '@/lib/ai';

export default function AiHome() {
  const app = useApp();
  const [cat, setCat] = useState<Category | '전체'>('전체');
  const mainStyle = app.styles[0] ?? '미니멀';
  const summary = weeklySummary(mainStyle, cat);

  const recs = useMemo(
    () =>
      PUBLIC_CLOSETS.filter((c) => cat === '전체' || c.items.some((i) => i.category === cat))
        .map((c) => ({ c, score: matchScore(c, app.styles, app.interests) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [cat, app.styles, app.interests],
  );

  // 오늘의 코디: 내 옷장 + 추구미 + 계절 → AI 추천 (/api/recommend)
  const closet = app.activeCloset;
  const { rec, loading, error } = useRecommendation(
    { closet, styles: app.styles, interests: app.interests, body: app.body },
    app.subscribed,
  );
  const byId = (id?: string) => (id ? closet.items.find((i) => i.id === id) : undefined);
  const outfit = rec ? { outer: byId(rec.outerId), top: byId(rec.topId), bottom: byId(rec.bottomId), shoes: byId(rec.shoesId) } : undefined;
  const parts = outfit ? [outfit.outer, outfit.top, outfit.bottom, outfit.shoes].filter((i) => i !== undefined) : [];

  if (!app.subscribed) {
    return (
      <Page title="AI 추천" large left="none" tabbed>
        <div className="flex flex-col items-center gap-2.5 py-6 text-center">
          <Badge label="PRO" tone="pro" />
          <h2 className="text-[22px] leading-8 font-bold tracking-tight">다른 사람들의 옷장을<br />AI가 요약하고 골라드려요</h2>
          <p className="text-[13px] text-sub">내 추구미 &quot;{app.styles.join(' · ')}&quot; 기준으로 맞춤 옷장 {recs.length}개를 찾았어요</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {recs.slice(0, 2).map(({ c, score }) => (
            <div key={c.id} className="flex flex-col gap-1.5">
              <div className="relative">
                <ClosetCover items={c.items} height={120} />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/85 backdrop-blur-[2px]">
                  <Lock size={22} className="text-sub" />
                </div>
              </div>
              <span className="text-xs text-muted">추구미 일치 {score}%</span>
            </div>
          ))}
        </div>
        <Button label="AI 추천 구독 알아보기" variant="accent" href="/subscribe" />
      </Page>
    );
  }

  return (
    <Page title="AI 추천" large left="none" tabbed right={<Badge label="PRO" tone="pro" />}>
      <Link href="/style-setup?mode=edit" className="flex items-center justify-between rounded-2xl bg-surface p-3.5">
        <div>
          <p className="text-xs text-muted">나의 추구미</p>
          <p className="mt-0.5 text-[15px] font-semibold">{app.styles.join(' · ')}</p>
        </div>
        <span className="text-[13px] text-sub">변경 ›</span>
      </Link>

      <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={(v) => setCat(v as typeof cat)} />

      <SectionHeader title="오늘의 추천 코디 · 내 옷장" />
      {!closet.items.length ? (
        <Card href="/upload"><p className="text-sm">옷을 올리면 내 옷만으로 코디를 추천해 드려요 ›</p></Card>
      ) : loading ? (
        <Card className="flex-row! items-center gap-3 py-8">
          <Loader2 size={22} className="animate-spin text-accent" />
          <p className="text-sm text-sub">AI가 내 옷장에서 오늘의 코디를 고르고 있어요</p>
        </Card>
      ) : error || !rec || !outfit ? (
        <Card><p className="text-sm text-sub">{error ?? '추천을 불러오지 못했어요'}</p></Card>
      ) : (
        <Card href={`/mannequin?closetId=${closet.id}&rec=1`} className="flex-row! items-center gap-3.5">
          <Mannequin top={outfit.top?.color} bottom={outfit.bottom?.color} shoes={outfit.shoes?.color} outer={outfit.outer?.color} height={150} body={app.body} />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Badge label={rec.source === 'openai' ? `AI 추천 · ${rec.basis}` : `${rec.basis} 기준`} tone={rec.source === 'openai' ? 'influencer' : 'neutral'} />
            <p className="text-[15px] font-semibold">{rec.title}</p>
            <p className="text-[13px] text-sub">{parts.map((i) => itemName(i)).join(' + ')}</p>
            <p className="text-[13px] leading-5">{rec.reason}</p>
            <p className="text-xs font-semibold text-accent">AI 아바타로 입혀보기 ›</p>
          </div>
        </Card>
      )}

      <SectionHeader title="이번 주 AI 요약" />
      <Card tone="accent">
        <p className="flex items-center gap-1.5 text-sm font-semibold"><Sparkles size={16} className="text-accent" />{summary.title}</p>
        <p className="text-sm leading-5">{summary.body}</p>
        <div className="flex gap-1.5">{summary.tags.map((t) => <Badge key={t} label={t} tone="outline" />)}</div>
      </Card>

      <SectionHeader title="추구미 맞춤 옷장" />
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-4">
        {recs.map(({ c, score }) => (
          <Link key={c.id} href={`/summary/${c.id}`} onClick={() => app.bumpUsage('summaries')} className="flex flex-col gap-1.5">
            <ClosetCover items={c.items} height={130} />
            <span className="truncate text-[15px] font-semibold">{c.name}</span>
            <span className="text-xs font-semibold text-accent">추구미 일치 {score}%</span>
          </Link>
        ))}
      </div>
      <InfoBox>추천 결과는 제휴 여부와 무관하게 산출되며, 광고·제휴 옷장은 별도로 표시돼요.</InfoBox>
    </Page>
  );
}
