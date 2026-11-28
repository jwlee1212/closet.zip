'use client';
// 15 AI 옷장 요약 — 스타일 요약 · 핵심 아이템 · 추구미 일치도

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Avatar, Badge, Button, ButtonPair, Card, Chip, Page, ProgressBar, SectionHeader, typeTone } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { matchScore } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const closet = app.findCloset(id);
  if (!closet) return <Page title="AI 옷장 요약"><p className="text-sm">옷장을 찾을 수 없어요</p></Page>;
  if (!app.subscribed) {
    return (
      <Page title="AI 옷장 요약">
        <p className="text-sm text-sub">AI 옷장 요약은 PRO 구독 기능이에요.</p>
        <Button label="AI 추천 구독 알아보기" variant="accent" href="/subscribe" />
      </Page>
    );
  }
  const score = matchScore(closet, app.styles, app.interests);
  const keyItems = [...closet.items].sort((a, b) => b.coordiCount - a.coordiCount).slice(0, 3);

  return (
    <Page
      title="AI 옷장 요약"
      right={<Badge label="PRO" tone="pro" />}
      footer={
        <ButtonPair>
          <Button label="옷장 보기" variant="outline" href={`/c/${closet.id}`} />
          <Button label="내 옷으로 입어보기" variant="accent" href={`/mannequin?ref=${closet.id}`} onClick={() => app.bumpUsage('mannequin')} />
        </ButtonPair>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar size={40} />
        <div className="flex-1">
          <p className="text-[15px] font-semibold">{closet.name}</p>
          <p className="text-[13px] text-sub">테마 {closet.theme} · 옷 {closet.items.length}벌</p>
        </div>
        <Badge label={closet.type} tone={typeTone(closet.type)} />
      </div>

      <Card tone="accent">
        <p className="flex items-center gap-1.5 text-sm font-semibold"><Sparkles size={16} className="text-accent" />AI 요약</p>
        <p className="text-sm leading-5">{closet.summary}</p>
      </Card>
      <div className="flex gap-1.5">{closet.tags.map((t) => <Chip key={t} label={t} small />)}</div>

      <SectionHeader title="핵심 아이템" />
      <div className="grid grid-cols-3 gap-2">
        {keyItems.map((it) => (
          <Link key={it.id} href={`/item/${it.id}`} className="flex flex-col gap-1">
            <ClothThumb item={it} height={100} />
            <span className="truncate text-xs text-sub">{it.kind} · {it.coordiCount}코디</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-[15px] font-semibold">
          <span>내 추구미 일치도</span>
          <span className="text-accent">{score}%</span>
        </div>
        <ProgressBar value={score} max={100} tone="accent" />
        <p className="text-xs text-muted">추구미 {app.styles.join('·')} · 관심 카테고리 {app.interests.join('·')} 기준</p>
      </div>
    </Page>
  );
}
