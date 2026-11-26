'use client';
// 17 구독 관리 — 다음 결제일 · 결제 수단 · 이용 현황 · 해지

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, BottomSheet, Button, Card, Page, Row, SectionHeader, StatGrid } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function Subscription() {
  const app = useApp();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  const nextStr = `${next.getFullYear()}.${String(next.getMonth() + 1).padStart(2, '0')}.${String(next.getDate()).padStart(2, '0')}`;

  if (!app.subscribed) {
    return (
      <Page title="구독 관리">
        <p className="text-sm">이용 중인 구독이 없어요.</p>
        <Button label="AI 추천 구독 알아보기" variant="accent" href="/subscribe" />
      </Page>
    );
  }

  return (
    <Page
      title="구독 관리"
      footer={
        <>
          <Button label="구독 해지" variant="danger" onClick={() => setConfirm(true)} />
          <p className="text-center text-xs text-muted">해지해도 다음 결제일 전까지 PRO 기능을 이용할 수 있어요.</p>
        </>
      }
      overlay={
        <BottomSheet open={confirm} onClose={() => setConfirm(false)}>
          <h2 className="text-lg font-bold">구독을 해지할까요?</h2>
          <p className="text-[13px] leading-5 text-sub">다음 결제일({nextStr})부터 청구되지 않아요. AI 옷장 요약과 마네킹 미리보기를 더 이상 쓸 수 없어요.</p>
          <Button label="계속 이용하기" onClick={() => setConfirm(false)} />
          <Button label="해지하기" variant="danger" onClick={() => { app.unsubscribe(); setConfirm(false); app.toast('구독을 해지했어요'); router.back(); }} />
        </BottomSheet>
      }
    >
      <Card tone="accent">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">AI 추천 PRO</span>
          <Badge label="이용 중" tone="pro" />
        </div>
        <span className="text-[13px] text-sub">월간 정기결제</span>
      </Card>
      <div>
        <Row label="결제 금액" value={`월 ${won(PRICES.subscription)}`} />
        <Row label="다음 결제일" value={nextStr} />
        <Row label="결제 수단" value={app.payMethod} />
        <Row label="결제 내역" onClick={() => app.toast('데모에서는 준비 중이에요')} />
      </div>
      <SectionHeader title="이번 달 이용 현황" />
      <StatGrid
        stats={[
          { value: `${app.usage.summaries}회`, label: 'AI 요약' },
          { value: `${app.usage.recs}개`, label: '맞춤 추천' },
          { value: `${app.usage.mannequin}회`, label: '마네킹' },
        ]}
      />
    </Page>
  );
}
