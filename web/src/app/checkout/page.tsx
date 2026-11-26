'use client';
// 13 구독 결제 — 월간 정기결제 · 결제 수단 · 자동 갱신 동의

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { Button, Page, PickerSheet, Row } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';

const METHODS = ['신용카드 (****1234)', '카카오페이', '네이버페이', '토스페이'];
const fmt = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

export default function Checkout() {
  const app = useApp();
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [picker, setPicker] = useState(false);
  const [paying, setPaying] = useState(false);
  const today = new Date();
  const next = new Date(today);
  next.setMonth(next.getMonth() + 1);

  // TODO(백엔드): 결제 대행(PG) 정기결제 연동 + 결제 결과 웹훅(Route Handler). 데모는 결제 성공으로 처리
  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      app.subscribe();
      app.toast('AI 추천 PRO 구독을 시작했어요');
      router.replace('/ai');
    }, 900);
  };

  return (
    <Page
      title="구독 결제"
      footer={<Button label={paying ? '결제 중…' : `월 ${won(PRICES.subscription)} 결제하기`} disabled={!agree || paying} onClick={pay} />}
      overlay={<PickerSheet open={picker} title="결제 수단" options={METHODS} value={app.payMethod} onPick={(v) => app.patch({ payMethod: v })} onClose={() => setPicker(false)} />}
    >
      <div className="flex items-center rounded-2xl border-[1.5px] border-accent p-4">
        <div className="flex-1">
          <p className="text-[15px] font-semibold">AI 추천 PRO · 월간</p>
          <p className="text-[13px] text-sub">매월 자동 결제 · 언제든 해지</p>
        </div>
        <CheckCircle2 size={24} className="fill-accent text-white" />
      </div>
      <div>
        <Row label="결제 금액" value={`월 ${won(PRICES.subscription)}`} />
        <Row label="첫 결제일" value={fmt(today)} />
        <Row label="다음 결제일" value={fmt(next)} />
        <Row label="결제 수단" value={app.payMethod} onClick={() => setPicker(true)} />
      </div>
      <button onClick={() => setAgree(!agree)} className="flex items-center gap-2.5 text-left text-sm">
        {agree ? <CheckSquare size={22} /> : <Square size={22} className="text-muted" />}
        정기결제 및 자동 갱신에 동의합니다 (필수)
      </button>
      <p className="text-xs text-muted">해지하면 다음 결제일부터 청구되지 않고, 남은 기간까지 이용할 수 있어요.</p>
    </Page>
  );
}
