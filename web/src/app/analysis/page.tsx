'use client';
// 09 AI 분석 결과 — 멀티모달 LLM 분석 → 속성 확인·수정 → 저장

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Badge, Button, InfoBox, Page, PickerSheet, Row, TextAction } from '@/components/ui';
import { ClothGlyph } from '@/components/ClothArt';
import { CATEGORIES, COLORS, Category, KINDS, MATERIALS, SEASONS, itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import type { AnalyzeResult } from '@/server/analyze';

async function thumbnail(uri: string) {
  const img = new Image();
  img.src = uri;
  await img.decode();
  const scale = Math.min(1, 480 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 읽지 못했어요');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.85);
}

type Attr = Omit<AnalyzeResult, 'productPhoto' | 'generationNotice' | 'confidence' | 'note' | 'source' | 'notice'>;
type Meta = Pick<AnalyzeResult, 'confidence' | 'note' | 'source' | 'notice'>;

const FIELDS: { key: keyof Attr; label: string }[] = [
  { key: 'category', label: '카테고리' },
  { key: 'kind', label: '세부 종류' },
  { key: 'color', label: '색상' },
  { key: 'material', label: '소재' },
  { key: 'season', label: '시즌' },
];

export default function Analysis() {
  const app = useApp();
  const router = useRouter();
  const closet = app.activeCloset;
  const pending = app.pending;
  const [generated, setGenerated] = useState<string>();
  const [noticeText, setNoticeText] = useState<string>();
  const [useOriginal, setUseOriginal] = useState(false);
  const photo = (!useOriginal && generated) || pending?.photoUri;
  const [attr, setAttr] = useState<Attr | null>(null);
  const [meta, setMeta] = useState<Meta>();
  const [error, setError] = useState<string>();
  const [editing, setEditing] = useState<keyof Attr | null>(null);

  useEffect(() => {
    if (!pending) return;
    const ctrl = new AbortController();
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending.sample ? { sample: true } : { image: pending.photoUri }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? '분석에 실패했어요');
        const { confidence, note, source, notice, productPhoto, generationNotice, ...a } = data as AnalyzeResult;
        if (ctrl.signal.aborted) return;
        const preview = productPhoto?.startsWith('/looks/') ? productPhoto
          : productPhoto ? await thumbnail(productPhoto).catch(() => undefined) : undefined;
        if (ctrl.signal.aborted) return;
        setGenerated(preview);
        setNoticeText(generationNotice);
        setAttr(a);
        setMeta({ confidence, note, source, notice });
      })
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message); });
    return () => ctrl.abort();
  }, [pending]);

  const options = (k: keyof Attr): readonly string[] =>
    k === 'category' ? CATEGORIES : k === 'kind' ? KINDS[attr!.category] : k === 'color' ? COLORS : k === 'material' ? MATERIALS : SEASONS;

  const save = () => {
    if (!attr) return;
    const ok = app.addItem({ ...attr, photoUri: photo });
    if (!ok) { app.toast('옷장이 가득 찼어요'); return router.replace('/expand'); }
    app.setPending(undefined);
    app.toast(`${closet.name}에 저장했어요 (${closet.items.length + 1}/${closet.capacity})`);
    router.replace('/closet');
  };

  if (!pending) {
    return (
      <Page title="AI 분석">
        <p className="text-sm text-sub">분석할 사진이 없어요.</p>
        <Button label="옷 올리러 가기" href="/upload" />
      </Page>
    );
  }

  if (error || !attr) {
    return (
      <Page title="AI 분석">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          {error ? (
            <>
              <p className="text-[15px] font-semibold">{error}</p>
              <Button label="다시 시도" variant="outline" onClick={() => router.back()} className="w-40" />
            </>
          ) : (
            <>
              <Loader2 size={36} className="animate-spin text-accent" />
              <p className="text-[15px] font-semibold">AI가 옷을 분석하고 있어요</p>
              <p className="text-[13px] text-sub">옷의 특징을 확인하고 AI 상품 사진을 만드는 중</p>
            </>
          )}
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="AI 분석 결과"
      right={<TextAction label="다시" onClick={() => router.back()} />}
      footer={<Button label="옷장에 저장" onClick={save} />}
      overlay={
        <PickerSheet
          open={!!editing}
          title={FIELDS.find((f) => f.key === editing)?.label ?? ''}
          options={editing ? options(editing) : []}
          value={editing ? attr[editing] : undefined}
          onClose={() => setEditing(null)}
          onPick={(v) => {
            if (!editing) return;
            if (editing === 'category') setAttr({ ...attr, category: v as Category, kind: KINDS[v as Category][0] });
            else setAttr({ ...attr, [editing]: v });
          }}
        />
      }
    >
      <div className="flex flex-col gap-3.5">
        <div className="relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
          {photo
            // eslint-disable-next-line @next/next/no-img-element -- 업로드 사진(data URL)
            ? <img src={photo} alt={generated && !useOriginal ? "AI가 생성한 상품 사진" : "원본 사진"} className="absolute inset-0 h-full w-full object-contain" />
            : <ClothGlyph category={attr.category} color={attr.color} size={100} />}
        </div>
        <div className="flex flex-col gap-2">
          {meta?.source === 'gemini'
            ? <Badge label={`AI 분석 완료 · 확신도 ${meta.confidence}%`} tone="success" />
            : <Badge label={meta?.notice ?? '데모 분석'} tone="brand" />}
          <span className="text-[15px] font-semibold">{itemName(attr)}</span>
          {meta?.note && <span className="text-[13px] leading-5">{meta.note}</span>}
          <span className="text-[13px] text-sub">분석된 속성은 직접 수정할 수 있어요</span>
        </div>
      </div>

      {generated ? <div className="flex items-center justify-between rounded-xl bg-surface p-3 text-sm">
        <span>{useOriginal ? '원본 사진' : pending.sample ? 'AI 상품 사진 · 샘플' : 'AI 상품 사진'}</span>
        <TextAction label={useOriginal ? 'AI 상품 사진 보기' : '원본 보기'} onClick={() => setUseOriginal(!useOriginal)} />
      </div> : <InfoBox>{noticeText ?? (pending.sample ? '샘플 상품 사진이에요. 직접 올린 옷은 AI가 상품 사진을 만들어요.' : '원본 사진으로 저장해요.')}</InfoBox>}
      <div>
        {FIELDS.map((f) => <Row key={f.key} label={f.label} value={attr[f.key]} onClick={() => setEditing(f.key)} />)}
      </div>
      <InfoBox>저장하면 {closet.name}이 {closet.items.length + 1} / {closet.capacity}벌이 돼요</InfoBox>
    </Page>
  );
}
