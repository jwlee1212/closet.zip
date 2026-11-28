'use client';
// 16 마네킹(아바타) 미리보기 — 추천 착장 · 아이템 교체 · 추천 이유 · 원본 옷장

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Avatar, Button, ButtonPair, Card, ChipRow, Page, TextAction } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { Category, ClothingItem, itemName, itemPhotoSrc, recommendSize } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { cachedRecommendation, cachedTryOn, requestTryOn, type TryOnPart } from '@/lib/ai';

type Slot = '아우터' | '상의' | '하의' | '신발';
const SLOTS: Slot[] = ['아우터', '상의', '하의', '신발'];
type View = '정면' | '측면' | '후면';

export default function MannequinPage() {
  const params = useSearchParams();
  const app = useApp();
  const router = useRouter();
  const closet = app.findCloset(params.get('closetId') ?? undefined) ?? app.activeCloset;
  // AI 홈의 "오늘의 추천 코디"에서 왔으면 같은 추천 결과로 시작한다
  const rec = params.get('rec') ? cachedRecommendation({ closet, styles: app.styles, interests: app.interests, body: app.body }) : undefined;
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
    if (rec) {
      const recIds: Record<Slot, string | undefined> = { 아우터: rec.outerId, 상의: rec.topId, 하의: rec.bottomId, 신발: rec.shoesId };
      for (const s of SLOTS) {
        const idx = pool[s].findIndex((i) => i.id === recIds[s]);
        if (idx >= 0 || s === '아우터') init[s] = idx;
      }
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
  const isRec = !!rec && rec.outerId === outer?.id && rec.topId === top?.id && rec.bottomId === bottom?.id && rec.shoesId === shoes?.id;

  // AI 아바타 착장: 고른 옷의 실제 사진을 보내 마네킹이 입은 이미지를 만든다
  const parts: TryOnPart[] = SLOTS.flatMap((s) => {
    const it = cur(s);
    return it ? [{ slot: s, name: `${itemName(it)}${it.material ? ` (${it.material})` : ''}`, photo: itemPhotoSrc(it) }] : [];
  });
  const [tryOn, setTryOn] = useState<{ loading?: boolean; showBasic?: boolean }>({});
  const aiImage = cachedTryOn(parts, app.body);
  const showAi = !!aiImage && !tryOn.showBasic;
  const dress = async () => {
    if (!app.subscribed) return router.push('/subscribe');
    if (!parts.length) return app.toast('입힐 옷이 없어요');
    setTryOn({ loading: true });
    app.bumpUsage('mannequin');
    try {
      const { image, notice } = await requestTryOn(parts, app.body);
      if (!image && notice) app.toast(notice);
    } catch (e) {
      app.toast((e as Error).message);
    }
    setTryOn({});
  };

  const ruleReason = `추구미 "${app.styles[0] ?? closet.theme}"에 맞춰 ${top?.color ?? '뉴트럴'} 톤 상의와 ${bottom?.fit === '와이드' ? '와이드' : bottom?.kind ?? ''} 하의를 조합했어요.${outer ? ` ${outer.kind}로 레이어드해 일교차에 대비했어요.` : ''}${app.body?.fit ? ` 선호하시는 ${app.body.fit} 실루엣에 맞췄어요.` : ''}`;
  const sizes = ([['상의', top], ['하의', bottom], ['신발', shoes]] as const).flatMap(([label, it]) => {
    const size = it && recommendSize(it.category, app.body);
    return size ? [[label, size] as const] : [];
  });
  const reason = isRec ? rec!.reason : ruleReason;
  const save = () => {
    app.saveOutfit({ top: top?.id, bottom: bottom?.id, shoes: shoes?.id, outer: outer?.id, sourceClosetId: closet.id, image: aiImage });
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
        <div className="relative flex h-[330px] w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface">
          {showAi ? (
            // eslint-disable-next-line @next/next/no-img-element -- AI가 만든 착장 이미지(data URL)
            <img src={aiImage} alt="AI가 옷을 입힌 아바타" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <Mannequin top={top?.color} bottom={bottom?.color} shoes={shoes?.color} outer={outer?.color} view={view} height={300} body={app.body} />
          )}
          {tryOn.loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/80 px-3 text-center backdrop-blur-[2px]">
              <Loader2 size={28} className="animate-spin text-accent" />
              <span className="text-xs font-semibold">AI가 옷을 입히는 중</span>
              <span className="text-[11px] text-sub">20~60초 걸려요</span>
            </div>
          )}
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

      {aiImage ? (
        <ChipRow items={['AI 착장', '기본 마네킹']} value={showAi ? 'AI 착장' : '기본 마네킹'} onChange={(v) => setTryOn({ showBasic: v === '기본 마네킹' })} />
      ) : (
        <>
          <Button label={tryOn.loading ? 'AI가 옷을 입히는 중…' : 'AI로 실제 옷 입혀보기'} icon={Sparkles} variant="accent" pro={!app.subscribed} disabled={tryOn.loading} onClick={dress} />
          <ChipRow items={['정면', '측면', '후면']} value={view} onChange={(v) => setView(v as View)} />
        </>
      )}

      <Card tone="muted">
        <span className="text-[15px] font-semibold">{isRec && rec?.source === 'openai' ? 'AI 추천 이유' : '추천 이유'}</span>
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
