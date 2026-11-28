'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { itemName, type Closet, type ClothingItem } from '@/data/mock';
import { ClothThumb } from './ClothArt';

import { RegisterLook } from './RegisterLook';

export function ClosetGallery({ items, children, startWithLooks = false, itemsOnly = false, ownCloset }: {
  items: ClothingItem[];
  children: ReactNode;
  startWithLooks?: boolean;
  itemsOnly?: boolean;
  ownCloset?: Closet;
}) {
  const looks = new Map<string, ClothingItem[]>();
  for (const item of items) {
    if (!item.wornPhoto) continue;
    const group = looks.get(item.wornPhoto);
    if (group) group.push(item);
    else looks.set(item.wornPhoto, [item]);
  }
  const cards = [
    ...(ownCloset?.looks ?? []).map(look => ({
      id: look.id, src: look.photo, pieces: items.filter(it => look.itemIds.includes(it.id)),
    })),
    ...Array.from(looks, ([src, pieces]) => ({ id: pieces[0].id, src, pieces })),
  ];
  const [view, setView] = useState(startWithLooks && looks.size ? '착용샷' : '아이템');
  if (itemsOnly) return children;
  return <>
    <div className="flex border-b border-line" role="group" aria-label="옷장 보기 방식">
      {(['아이템', '착용샷'] as const).map(label => (
        <button key={label} type="button" aria-pressed={view === label} onClick={() => setView(label)}
          className={`flex-1 border-b-2 py-3 text-sm font-semibold ${view === label ? 'border-ink text-ink' : 'border-transparent text-sub'}`}>
          {label} <span className="ml-1 tabular-nums">{label === '착용샷' ? cards.length : items.length}</span>
        </button>
      ))}
    </div>
    {view === '착용샷' && ownCloset && <RegisterLook closet={ownCloset} />}
    {view === '아이템' ? children : cards.length ? cards.map(({ id, src, pieces }) => (
      <article key={id} className="overflow-hidden rounded-2xl border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element -- 사용자 업로드와 번들 사진 */}
        <img src={src} alt={pieces.map(itemName).join(', ') + ' 착용샷'} className="aspect-square w-full bg-surface object-contain" />
        <div className="p-4">
          <h2 className="mb-2 text-sm font-bold">착용한 아이템</h2>
          {pieces.map(piece => <Link key={piece.id} href={`/item/${piece.id}`} className="flex items-center gap-3 border-b border-line py-2 last:border-0">
            <ClothThumb item={piece} height={48} className="w-12 shrink-0" />
            <span className="flex-1"><span className="block text-sm font-semibold">{itemName(piece)}</span>
              <span className="text-xs text-sub">{piece.category} · {piece.material}</span></span>
            <span aria-hidden className="text-sub">›</span>
          </Link>)}
        </div>
      </article>
    )) : <p className="py-8 text-center text-sm text-sub">아직 등록된 착용샷이 없어요.</p>}
  </>;
}
