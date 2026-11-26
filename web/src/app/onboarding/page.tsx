'use client';
// 02 온보딩 (3장)

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Badge, Button, Page, TextAction } from '@/components/ui';
import { ClosetCover, ClothThumb } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { PUBLIC_CLOSETS } from '@/data/mock';

const SLIDES = [
  { title: '내 옷장을 올려요', desc: '옷 사진 한 장이면 AI가 종류·색상·소재를 분석해 카테고리별로 정리해 줘요. 옷장은 1개, 테마는 1개!' },
  { title: '다른 사람의 옷장을 구경해요', desc: '일반 사용자부터 인플루언서·브랜드 옷장까지 테마와 카테고리별로 둘러보고 착장에 참고해요.' },
  { title: 'AI가 골라주는 내 스타일', desc: '구독하면 공개 옷장을 AI가 요약하고, 내 추구미에 맞는 착장을 마네킹으로 미리 보여줘요.' },
];

function Illustration({ step }: { step: number }) {
  const box = 'flex h-[380px] flex-col items-center justify-center rounded-2xl bg-surface';
  if (step === 0) {
    return (
      <div className={box}>
        <div className="grid grid-cols-3 gap-2.5">
          {PUBLIC_CLOSETS[0].items.slice(0, 6).map((it) => (
            <ClothThumb key={it.id} item={it} height={92} className="w-[92px] bg-white!" />
          ))}
        </div>
        <div className="mt-5 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-accent">
          <Sparkles size={14} /> 상의 · 네이비 · 코튼 · 가을
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className={`${box} gap-3 p-5`}>
        {PUBLIC_CLOSETS.slice(0, 2).map((c) => (
          <div key={c.id} className="flex w-full flex-col gap-1.5">
            <ClosetCover items={c.items} height={110} />
            <div className="flex justify-between">
              <span className="text-[15px] font-semibold">{c.name}</span>
              <Badge label={c.type} tone={c.type === '브랜드' ? 'brand' : 'influencer'} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={`${box} flex-row! gap-4`}>
      <Mannequin top="네이비" bottom="베이지" shoes="화이트" height={280} />
      <div className="flex flex-col gap-2">
        <Badge label="PRO" tone="pro" />
        <span className="text-[15px] font-semibold">추구미 일치 92%</span>
        <span className="text-[13px] text-sub">미니멀 · 뉴트럴 톤</span>
      </div>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const last = step === SLIDES.length - 1;
  return (
    <Page
      title=""
      left="none"
      right={<TextAction label="건너뛰기" muted onClick={() => router.replace('/style-setup')} />}
      footer={<Button label={last ? '시작하기' : '다음'} onClick={() => (last ? router.replace('/style-setup') : setStep(step + 1))} />}
    >
      <Illustration step={step} />
      <h2 className="mt-2 text-[22px] font-bold tracking-tight">{SLIDES[step].title}</h2>
      <p className="text-sm leading-[21px] text-sub">{SLIDES[step].desc}</p>
      <div className="mt-1 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`${i + 1}번째 소개`}
            onClick={() => setStep(i)}
            className={`h-2 rounded transition-all ${i === step ? 'w-5 bg-ink' : 'w-2 bg-surface-strong'}`}
          />
        ))}
      </div>
    </Page>
  );
}
