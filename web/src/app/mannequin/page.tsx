'use client';
// 16 마네킹(아바타) 미리보기 — 추천 착장 · 아이템 교체 · 추천 이유 · 원본 옷장

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar, Button, ButtonPair, Card, ChipRow, Page, TextAction } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { Category, ClothingItem, itemName, recommendSize } from '@/data/mock';
import { useApp } from '@/state/AppState';

type Slot = '아우터' | '상의' | '하의' | '신발';
const SLOTS: Slot[] = ['아우터', '상의', '하의', '신발'];
type View = '정면' | '측면' | '후면';

export default function MannequinPage() {
  const params = useSearchParams();
  const app = useApp();
  const closet = app.findCloset(params.get('closetId') ?? undefined) ?? app.activeCloset;
  const itemId = params.get('itemId');
  const mine = app.isMine(closet.id);
  const [view, setView] = useState<View>('정면');

  const pool = useMemo(() => {
    const p: Record<Slot, ClothingItem[]> = { 아우터: [], 상의: [], 하의: [], 신발: [] };
    closet.items.forEach((i) => { if (i.category in p) p[i.category as Slot].push(i); });
    return p;
  }, [closet]);

  const [pick, setPick] = useState<Record<Slot, number>>(() => {
    const init: Record<Slot, number> = { 아우터: -1, 상의: 0, 하의: 0, 신발: 0 };
    const target = itemId ? closet.items.find((i) => i.id === itemId) : undefined;
    if (target && (SLOTS as Category[]).includes(target.category)) {
      init[target.category as Slot] = pool[target.category as Slot].findIndex((i) => i.id === target.id);
    }
    return init;
  });

  const cur = (s: Slot) => (pick[s] >= 0 ? pool[s][pick[s]] : undefined);
  const swap = (s: Slot) => {
    const n = pool[s].length;
    if (!n) return app.toast(`이 옷장에는 ${s}가 없어요`);
    // 아우터는 '없음'(-1)도 순환
    setPick({ ...pick, [s]: s === '아우터' ? ((pick[s] + 2) % (n + 1)) - 1 : (pick[s] + 1) % n });
  };

  const top = cur('상의'), bottom = cur('하의'), shoes = cur('신발'), outer = cur('아우터');
  const reason = `추구미 "${app.styles[0] ?? closet.theme}"에 맞춰 ${top?.color ?? '뉴트럴'} 톤 상의와 ${bottom?.fit === '와이드' ? '와이드' : bottom?.kind ?? ''} 하의를 조합했어요.${outer ? ` ${outer.kind}로 레이어드해 일교차에 대비했어요.` : ''}${app.body?.fit ? ` 선호하시는 ${app.body.fit} 실루엣에 맞췄어요.` : ''}`;
  const sizes = ([['상의', top], ['하의', bottom], ['신발', shoes]] as const).flatMap(([label, it]) => {
    const size = it && recommendSize(it.category, app.body);
    return size ? [[label, size] as const] : [];
  });
  const save = () => {
    app.saveOutfit({ top: top?.id, bottom: bottom?.id, shoes: shoes?.id, outer: outer?.id, sourceClosetId: closet.id });
    app.toast('저장한 착장에 추가했어요');
  };

  return (
    <Page
      title="마네킹 미리보기"
      right={<TextAction label="저장" onClick={save} />}
      footer={
        <ButtonPair>
          <Button label={mine ? '내 옷장 보기' : '원본 옷장 보기'} variant="outline" href={mine ? '/closet' : `/c/${closet.id}`} />
          <Button label="착장 저장" onClick={save} />
        </ButtonPair>
      }
    >
      <div className="flex gap-3">
        <div className="flex h-[330px] w-[170px] shrink-0 items-center justify-center rounded-2xl bg-surface">
          <Mannequin top={top?.color} bottom={bottom?.color} shoes={shoes?.color} outer={outer?.color} view={view} height={300} body={app.body} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-[15px] font-semibold">착장 구성</span>
          {SLOTS.map((s) => {
            const it = cur(s);
            return (
              <button key={s} onClick={() => swap(s)} className="flex items-center gap-1.5 rounded-xl border border-line p-2.5 text-left active:bg-surface">
                {it && <ClothThumb item={it} height={34} className="w-8 shrink-0" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted">{s}</span>
                  <span className="line-clamp-2 text-[13px] font-semibold">{it ? itemName(it) : s === '아우터' ? '없음' : '-'}</span>
                </span>
                <span className="text-xs font-bold text-accent">교체</span>
              </button>
            );
          })}
          <span className="flex items-center gap-1.5 text-xs text-muted"><Avatar size={20} /><span className="truncate">출처: {closet.name}</span></span>
        </div>
      </div>

      <ChipRow items={['정면', '측면', '후면']} value={view} onChange={(v) => setView(v as View)} />

      <Card tone="muted">
        <span className="text-[15px] font-semibold">추천 이유</span>
        <p className="text-sm leading-5">{reason}</p>
      </Card>

      {sizes.length > 0 ? (
        <Card>
          <span className="text-[15px] font-semibold">내 추천 사이즈</span>
          <div className="flex flex-col gap-1 text-sm">
            {sizes.map(([label, size]) => (
              <div key={label} className="flex justify-between"><span className="text-sub">{label}</span><span className="font-medium">{size}</span></div>
            ))}
          </div>
        </Card>
      ) : (
        <Link href="/body-spec?mode=edit" className="text-[13px] text-accent">신체 정보를 입력하면 마네킹 비율과 추천 사이즈를 맞춰 드려요 ›</Link>
      )}
    </Page>
  );
}
