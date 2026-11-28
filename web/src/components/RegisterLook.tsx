'use client';

import { useState } from 'react';
import { itemName, type Closet } from '@/data/mock';
import { resizeUpload } from '@/lib/resizeUpload';
import { useApp } from '@/state/AppState';
import { ClothThumb } from './ClothArt';

export function RegisterLook({ closet }: { closet: Closet }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const close = () => { setOpen(false); setPhoto(''); setSelected([]); setError(''); };

  if (!open) return <button type="button" onClick={() => setOpen(true)} className="rounded-xl bg-ink px-4 py-3 font-semibold text-white">+ 착용샷 등록</button>;
  return <section aria-label="착용샷 등록" className="flex flex-col gap-3 rounded-2xl border border-line p-4">
    <h2 className="font-bold">착용샷 등록</h2>
    {photo && <img src={photo} alt="등록할 착용샷" className="max-h-64 w-full rounded-lg bg-surface object-contain" /> /* eslint-disable-line @next/next/no-img-element */}
    <label className="cursor-pointer rounded-lg border border-line p-3 text-center text-sm font-semibold focus-within:ring-2">
      {busy ? '사진 준비 중…' : photo ? '사진 변경' : '사진 선택'}
      <input type="file" accept="image/*" disabled={busy} className="sr-only" onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
        setBusy(true); setError('');
        try { setPhoto(await resizeUpload(file, 800)); }
        catch { setError('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.'); }
        finally { setBusy(false); }
      }} />
    </label>
    <h3 className="text-sm font-semibold">착용한 아이템 선택 · {selected.length}개</h3>
    {closet.items.length === 0 && <p className="text-sm text-sub">먼저 옷장에 아이템을 등록해 주세요.</p>}
    <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto p-1">
      {closet.items.map(it => <button type="button" key={it.id} aria-pressed={selected.includes(it.id)}
        className="rounded-lg border border-line p-1 text-xs aria-pressed:border-accent aria-pressed:bg-accent-soft"
        onClick={() => setSelected(ids => ids.includes(it.id) ? ids.filter(id => id !== it.id) : [...ids, it.id])}>
        <ClothThumb item={it} height={58} /><span>{itemName(it)}</span>
      </button>)}
    </div>
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="flex gap-2">
      <button type="button" disabled={busy} onClick={close} className="flex-1 rounded-lg border border-line p-2">취소</button>
      <button type="button" disabled={!photo || !selected.length || busy} className="flex-1 rounded-lg bg-ink p-2 text-white disabled:opacity-40" onClick={() => {
        if (!app.addLook(closet.id, photo, selected)) return setError('저장할 수 없어요. 남은 공간과 선택한 아이템을 확인해 주세요.');
        close(); app.toast('착용샷을 등록했어요');
      }}>등록하기</button>
    </div>
  </section>;
}
