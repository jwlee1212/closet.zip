'use client';
// 06 옷 상세 (다른 사람의 옷) · 내 옷이면 관리용 버튼

import { useRef, useState } from 'react';
import { resizeUpload } from '@/lib/resizeUpload';
import Link from 'next/link';
import { Plus, Shirt } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Badge, Button, ButtonPair, Chip, Page, Row } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { itemName, recommendSize } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const found = app.findItem(id);
  if (!found) return <Page title="옷 상세"><p className="text-sm">옷을 찾을 수 없어요</p></Page>;
  const { item, closet } = found;
  const mine = app.isMine(closet.id);

  const upload = async (file?: File) => {
    if (!file || !mine) return;
    setSaving(true);
    try {
      const uri = await resizeUpload(file, 800);
      if (app.setWornPhoto(item.id, uri)) app.toast('착용샷을 저장했어요');
      else app.toast('저장 공간이 부족해요. 더 작은 사진으로 시도해 주세요');
    } catch {
      app.toast('사진을 읽지 못했어요. 다른 파일을 선택해 주세요');
    } finally {
      setSaving(false);
    }
  };

  const tryOn = () => {
    if (!app.subscribed) return router.push('/subscribe');
    app.bumpUsage('mannequin');
    // 내 옷이면 그 옷으로 바로, 남의 옷이면 그 느낌을 살린 "내 옷" 코디로 (가진 옷만으로 추천)
    router.push(mine ? `/mannequin?closetId=${closet.id}&itemId=${item.id}` : `/mannequin?ref=${closet.id}&focus=${item.id}`);
  };

  const keep = () => {
    const target = app.activeCloset;
    const ok = app.addItem({ category: item.category, kind: item.kind, color: item.color, material: item.material, season: item.season, fit: item.fit });
    if (ok) app.toast(`${target.name}에 담았어요 (${target.items.length + 1}/${target.capacity})`);
    else {
      app.toast('옷장이 가득 찼어요. 옷장을 늘려 주세요');
      router.push('/expand');
    }
  };

  const shopUrl = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(itemName(item))}`;

  return (
    <Page
      title="옷 상세"
      footer={
        mine ? (
          <ButtonPair>
            <Button label="옷장에서 빼기" variant="danger" onClick={() => { app.removeItem(item.id); app.toast('옷장에서 뺐어요'); router.back(); }} />
            <Button label="입혀보기" icon={Shirt} variant="accent" pro={!app.subscribed} onClick={tryOn} />
          </ButtonPair>
        ) : (
          <ButtonPair>
            <Button label="옷장에 담기" icon={Plus} variant="outline" onClick={keep} />
            <Button label="입혀보기" icon={Shirt} variant="accent" pro={!app.subscribed} onClick={tryOn} />
          </ButtonPair>
        )
      }
    >
      <ClothThumb item={item} height={280} />
      <div className="flex flex-col gap-2.5">
        <h2 className="text-[22px] font-bold tracking-tight">{itemName(item)}</h2>
        <div className="flex flex-wrap gap-1.5">
          {[item.category, item.color, item.material, item.season, item.fit].filter(Boolean).map((t) => <Chip key={t} label={t!} small />)}
        </div>
      </div>

      {(mine || item.wornPhoto) && (
        <section className="flex flex-col gap-2.5" aria-label="착용샷">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">착용샷</h3>
            {mine && <button type="button" disabled={saving} className="text-sm font-semibold text-accent" onClick={() => fileInput.current?.click()}>
              {saving ? '저장 중…' : item.wornPhoto ? '사진 교체' : '사진 추가'}
            </button>}
          </div>
          {mine && item.wornPhoto && <button type="button" disabled={saving} className="self-end text-xs text-sub underline" onClick={() => {
            if (app.setWornPhoto(item.id, undefined)) app.toast('착용샷을 삭제했어요');
            else app.toast('착용샷을 삭제하지 못했어요');
          }}>착용샷 삭제</button>}
          {mine && <input ref={fileInput} type="file" accept="image/*" aria-label="착용샷 파일" hidden onChange={e => {
            const file = e.target.files?.[0]; e.target.value = ''; void upload(file);
          }} />}
          {item.wornPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- 사용자 사진 또는 로컬 룩북
            <img src={item.wornPhoto} alt={`${itemName(item)} 착용샷`} className="max-h-[460px] w-full rounded-xl bg-surface object-contain" />
          ) : <p className="rounded-xl bg-surface p-4 text-sm text-sub">이 옷을 입은 사진을 추가해 보세요.</p>}
        </section>
      )}
      {!mine && (
        <Link href={`/c/${closet.id}`} className="flex items-center gap-2.5">
          <Avatar size={28} />
          <span className="flex-1 text-[15px] font-semibold">{closet.name}</span>
          <span className="text-[13px] text-sub">옷장 보기 ›</span>
        </Link>
      )}

      <div>
        <Row label="브랜드" value={item.brand ?? '정보 없음'} />
        {item.category !== '액세서리' && (
          recommendSize(item.category, app.body)
            ? <Row label="내 추천 사이즈" value={recommendSize(item.category, app.body)} />
            : <Row label="내 추천 사이즈" value="신체 정보 입력하기" href="/body-spec?mode=edit" />
        )}
        <Row label="이 옷이 들어간 코디" value={`${item.coordiCount}개`} />
        {!mine && <Row label="구매 링크" value={item.brand ? '제휴 링크' : '판매처 검색'} onClick={() => window.open(shopUrl, '_blank', 'noopener')} />}
      </div>
      {!mine && item.brand && (
        <div className="flex items-center gap-1.5">
          <Badge label="제휴" tone="brand" />
          <span className="text-xs text-sub">구매 시 옷장 운영자에게 수수료가 지급될 수 있어요</span>
        </div>
      )}
    </Page>
  );
}
