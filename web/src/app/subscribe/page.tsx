'use client';
// 12 AI 추천 구독 소개

import { Compass, PersonStanding, Sparkles, type LucideIcon } from 'lucide-react';
import { Badge, Button, Page, useGoBack } from '@/components/ui';
import { PRICES, won } from '@/data/mock';

const BENEFITS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Sparkles, title: 'AI 옷장 요약', desc: '공개 옷장의 스타일과 핵심 아이템을 한눈에' },
  { icon: Compass, title: '추구미 · 카테고리 맞춤 추천', desc: '내 추구미에 맞는 옷장과 옷만 골라서' },
  { icon: PersonStanding, title: '마네킹(아바타) 미리보기', desc: '추천 착장을 마네킹에 입혀 미리 확인' },
];

export default function Subscribe() {
  const goBack = useGoBack();
  return (
    <Page
      title="AI 추천 구독"
      left="close"
      footer={
        <>
          <Button label="구독 시작하기" variant="accent" href="/checkout" />
          <button onClick={goBack} className="self-center p-1.5 text-[13px] text-sub">다음에 할게요</button>
        </>
      }
    >
      <div className="flex flex-col gap-2.5 rounded-2xl bg-accent-soft p-5">
        <Badge label="PRO" tone="pro" className="self-start" />
        <h2 className="text-2xl leading-8 font-bold tracking-tight">다른 사람들의 옷장을<br />AI가 요약하고 골라드려요</h2>
        <p className="text-[13px] text-sub">월 정기결제 · 언제든 해지</p>
      </div>
      {BENEFITS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-3.5 py-1.5">
          <span className="flex size-[42px] items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={20} /></span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] font-semibold">{title}</span>
            <span className="text-[13px] text-sub">{desc}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-2xl border-[1.5px] border-accent p-4">
        <div>
          <p className="text-[15px] font-semibold">월간 구독</p>
          <p className="text-xs text-muted">매월 자동 결제</p>
        </div>
        <span className="text-lg font-bold">월 {won(PRICES.subscription)}</span>
      </div>
    </Page>
  );
}
