'use client';
// 18 옷장 늘리기 (유료) — 옷장 +1 / 옷 용량 +20 / 비즈니스 옷장 패키지

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, Label, OptionCard, Page } from '@/components/ui';
import { CAPACITY_STEP, FREE_CAPACITY, PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';

type Opt = 'closet' | 'capacity' | 'business';

export default function Expand() {
  const app = useApp();
  const router = useRouter();
  const c = app.activeCloset;
  const [opt, setOpt] = useState<Opt>('closet');
  const price = { closet: `월 ${won(PRICES.closetPlusOne)}`, capacity: won(PRICES.capacityPlus20), business: `월 ${won(PRICES.businessPackage)}` }[opt];

  // TODO(백엔드): 결제 후 서버에서 옷장 슬롯·용량 상태를 갱신 (보고서 VI-1: 구독·슬롯 상태는 서버 한곳에서 관리)
  const pay = () => {
    if (opt === 'capacity') {
      app.addCapacity(CAPACITY_STEP);
      app.toast(`${c.name} 용량이 ${c.capacity + CAPACITY_STEP}벌로 늘었어요`);
      router.back();
    } else {
      app.buySlots(opt === 'business' ? 3 : 1, opt === 'business');
      app.toast(opt === 'business' ? '비즈니스 옷장 3개가 열렸어요' : '옷장 슬롯 1개가 추가됐어요');
      router.replace(opt === 'business' ? '/new-closet?type=광고' : '/new-closet');
    }
  };

  return (
    <Page title="옷장 늘리기" left="close" footer={<Button label={`${price} 결제하기`} onClick={pay} />}>
      <div className="flex flex-col gap-1 rounded-xl bg-surface p-3.5">
        <span className="text-[15px] font-semibold">현재 옷장 {app.myClosets.length} / {app.closetSlots}개</span>
        <span className="text-[13px] text-sub">{c.name} · 옷 {c.items.length} / {c.capacity}벌</span>
      </div>
      <Label>옵션 선택</Label>
      <OptionCard title="옷장 +1개" desc={`새 테마 1개 · 옷 ${FREE_CAPACITY}벌`} right={`월 ${won(PRICES.closetPlusOne)}`} selected={opt === 'closet'} onClick={() => setOpt('closet')} />
      <OptionCard title={`옷 용량 +${CAPACITY_STEP}벌`} desc={`지금 옷장(${c.theme})에 ${CAPACITY_STEP}벌 추가`} right={won(PRICES.capacityPlus20)} selected={opt === 'capacity'} onClick={() => setOpt('capacity')} />
      <OptionCard
        title="비즈니스 옷장 패키지"
        desc="옷장 3개 · 유형 뱃지 · 구매 링크 · 노출 통계"
        right={`월 ${won(PRICES.businessPackage)}`}
        selected={opt === 'business'}
        onClick={() => setOpt('business')}
        extra={<Badge label="광고주·인플루언서" tone="brand" />}
      />
      <p className="text-xs text-muted">옷장 데이터가 쌓일수록 AI 추천이 정교해져요. 가격은 데모용 임시값이에요.</p>
    </Page>
  );
}
