'use client';
// 07 내 옷장 · 10 옷장 가득 참(바텀시트)

import { ClosetGallery } from '@/components/ClosetGallery';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Minus } from 'lucide-react';
import {
  Badge, BottomSheet, Button, ButtonPair, Card, Chip, ChipRow, ItemGrid, Page, ProgressBar, TextAction, typeTone,
} from '@/components/ui';
import { CATEGORIES, itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function MyCloset() {
  const app = useApp();
  const router = useRouter();
  const closet = app.activeCloset;
  const [cat, setCat] = useState('전체');
  const [sheet, setSheet] = useState(false);
  const [tidy, setTidy] = useState(false);

  const used = closet.items.length;
  const full = used >= closet.capacity;
  const items = closet.items.filter((i) => cat === '전체' || i.category === cat);
  const paid = app.closetSlots > 1 || closet.capacity > 30;
  const hasFreeSlot = app.myClosets.length < app.closetSlots;

  return (
    <Page
      title="내 옷장"
      large
      left="none"
      tabbed
      right={tidy ? <TextAction label="완료" onClick={() => setTidy(false)} /> : <TextAction label="설정" href="/closet-settings" />}
      footer={
        !tidy && (
          <ButtonPair>
            <Button label="+ 옷 올리기" onClick={() => (full ? setSheet(true) : router.push('/upload'))} />
            <Button label="옷장 추가" variant="outline" href={hasFreeSlot ? '/new-closet' : '/expand'} />
          </ButtonPair>
        )
      }
      overlay={
        <BottomSheet open={sheet} onClose={() => setSheet(false)}>
          <h2 className="text-lg font-bold">옷장이 가득 찼어요 ({used}/{closet.capacity})</h2>
          <p className="text-[13px] leading-5 text-sub">
            무료 옷장에는 옷을 {closet.capacity}벌까지 올릴 수 있어요. 옷장을 추가하면 새 테마로 30벌을 더 올릴 수 있어요.
          </p>
          <Button label="옷장 늘리기" href="/expand" />
          <Button label="옷 정리하기" variant="outline" onClick={() => { setSheet(false); setTidy(true); }} />
          <button onClick={() => setSheet(false)} className="self-center p-1.5 text-[13px] text-sub">닫기</button>
        </BottomSheet>
      }
    >
      {app.myClosets.length > 1 && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ChipRow
              items={app.myClosets.map((c) => c.name)}
              value={closet.name}
              onChange={(n) => app.setActiveCloset(app.myClosets.find((c) => c.name === n)!.id)}
            />
          </div>
          <Link href="/closets" aria-label="옷장 관리" className="p-1"><LayoutGrid size={20} /></Link>
        </div>
      )}

      <Card tone="muted">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold">{closet.name} · 옷장 {app.myClosets.length} / {app.closetSlots}개 사용 중</span>
          <Badge label={paid ? '유료' : '무료'} tone={paid ? 'pro' : 'neutral'} />
        </div>
        <div className="flex justify-between text-[13px] text-sub">
          <span>옷 {used} / {closet.capacity}벌</span>
          <span className={full ? 'font-semibold text-danger' : ''}>{full ? '가득 참' : `남은 칸 ${closet.capacity - used}`}</span>
        </div>
        <ProgressBar value={used} max={closet.capacity} tone={full ? 'danger' : 'primary'} />
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-sub">테마</span>
          <Chip label={closet.theme} selected small />
          {closet.type !== '일반' && <Badge label={closet.type} tone={typeTone(closet.type)} />}
          <span className="ml-auto text-xs text-muted">옷장당 1개 · {closet.visibility}</span>
        </div>
      </Card>

      <ClosetGallery key={closet.id + String(tidy)} items={closet.items} itemsOnly={tidy} ownCloset={closet}>
        <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={setCat} />

        {tidy && <p className="text-[13px] text-sub">정리할 옷을 눌러 옷장에서 빼세요.</p>}
        <ItemGrid
          items={items}
          onPick={tidy ? (it) => { app.removeItem(it.id); app.toast(`${itemName(it)}을(를) 옷장에서 뺐어요`); } : undefined}
          renderBadge={tidy ? () => (
            <span className="absolute top-1.5 right-1.5 flex size-[22px] items-center justify-center rounded-full bg-danger text-white"><Minus size={14} /></span>
          ) : undefined}
        />
        {items.length === 0 && (
          <p className="my-8 text-center text-[13px] text-sub">{used === 0 ? '첫 옷을 올려 옷장을 시작해 보세요' : '이 카테고리에는 옷이 없어요'}</p>
        )}
      </ClosetGallery>
    </Page>
  );
}
