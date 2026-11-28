'use client';
// 온보딩 2/2 · 나의 신체 정보 (마이페이지에서 수정 가능)
// 마네킹 비율과 사이즈 추천에만 쓰고, 공개 옷장에는 노출하지 않는다 (보고서 VI-2: 체형 정보 최소 수집·비공개)

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button, ChipRow, InfoBox, Label, Page, TextAction } from '@/components/ui';
import { Mannequin } from '@/components/Mannequin';
import { BODY_TYPES, BOTTOM_SIZES, BUILDS, BodySpec, FITS, TOP_SIZES } from '@/data/mock';
import { useApp } from '@/state/AppState';

function Slider({ label, unit, value, min, max, step = 1, onChange, onClear }: {
  label: string; unit: string; value?: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; onClear?: () => void;
}) {
  const shown = value ?? Math.round((min + max) / 2 / step) * step;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="flex items-baseline gap-2">
          <span className={`text-lg font-bold ${value === undefined ? 'text-muted' : ''}`}>
            {value === undefined ? '-' : value}
            <span className="ml-0.5 text-sm font-medium text-sub">{unit}</span>
          </span>
          {onClear && value !== undefined && (
            <button onClick={onClear} className="text-xs text-muted underline">지우기</button>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={shown}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-2 w-full cursor-pointer accent-ink"
      />
      <div className="flex justify-between text-[11px] text-muted"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

export default function BodySpecPage() {
  const editing = useSearchParams().get('mode') === 'edit';
  const app = useApp();
  const router = useRouter();
  const [b, setB] = useState<BodySpec>(app.body ?? {});
  const set = <K extends keyof BodySpec>(k: K, v: BodySpec[K]) => setB((prev) => ({ ...prev, [k]: v }));
  const toggle = <K extends keyof BodySpec>(k: K, v: string) => set(k, (b[k] === v ? undefined : v) as BodySpec[K]);

  const finish = (save: boolean) => {
    if (save) app.setBody(Object.values(b).some((v) => v !== undefined) ? b : undefined);
    if (editing) {
      if (save) app.toast('신체 정보를 저장했어요');
      router.back();
    } else {
      router.replace('/ai');
    }
  };

  return (
    <Page
      title="나의 신체 정보"
      left={editing ? 'back' : 'none'}
      right={!editing ? <TextAction label="건너뛰기" muted onClick={() => finish(false)} /> : undefined}
      footer={<Button label={editing ? '저장하기' : '완료하고 시작하기'} onClick={() => finish(true)} />}
    >
      {!editing && <p className="text-xs font-semibold text-sub">2 / 2 단계 · 모든 항목은 선택이에요</p>}

      {/* 입력하는 대로 마네킹 비율이 바뀌는 미리보기 */}
      <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
        <div className="flex h-[200px] w-[96px] shrink-0 items-end justify-center">
          <Mannequin top="화이트" bottom="데님" shoes="화이트" height={200} body={b} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[15px] font-semibold">내 마네킹 미리보기</p>
          <p className="text-[13px] leading-5 text-sub">키와 체형을 입력하면 추천 착장을 내 비율에 맞춰 보여드려요.</p>
        </div>
      </div>

      <Label>마네킹 체형</Label>
      <ChipRow items={BODY_TYPES} value={b.bodyType ?? ''} onChange={(v) => toggle('bodyType', v)} wrap />

      <Slider label="키" unit="cm" value={b.height} min={140} max={200} onChange={(v) => set('height', v)} onClear={() => set('height', undefined)} />
      <Slider label="몸무게" unit="kg" value={b.weight} min={35} max={120} onChange={(v) => set('weight', v)} onClear={() => set('weight', undefined)} />

      <Label>체형</Label>
      <ChipRow items={BUILDS} value={b.build ?? ''} onChange={(v) => toggle('build', v)} wrap />

      <Label>평소 상의 사이즈</Label>
      <ChipRow items={TOP_SIZES} value={b.topSize ?? ''} onChange={(v) => toggle('topSize', v)} wrap />

      <Label>평소 하의 사이즈 <span className="text-xs font-normal text-muted">(허리 인치)</span></Label>
      <ChipRow items={BOTTOM_SIZES} value={b.bottomSize ?? ''} onChange={(v) => toggle('bottomSize', v)} />

      <Slider label="신발 사이즈" unit="mm" value={b.shoeSize} min={220} max={300} step={5} onChange={(v) => set('shoeSize', v)} onClear={() => set('shoeSize', undefined)} />

      <Label>선호 핏</Label>
      <ChipRow items={FITS} value={b.fit ?? ''} onChange={(v) => toggle('fit', v)} wrap />

      <InfoBox icon={Lock}>
        신체 정보는 나에게만 보이고 공개 옷장에는 표시되지 않아요. 마네킹 비율과 사이즈 추천에만 쓰고, 마이페이지에서 언제든 수정하거나 지울 수 있어요.
      </InfoBox>
      {editing && (
        <button
          onClick={() => { app.setBody(undefined); app.toast('신체 정보를 지웠어요'); router.back(); }}
          className="self-center p-2 text-[13px] text-danger"
        >
          신체 정보 모두 지우기
        </button>
      )}
    </Page>
  );
}
