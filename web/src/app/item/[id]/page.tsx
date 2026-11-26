'use client';
// 06 옷 상세 (다른 사람의 옷) · 내 옷이면 관리용 버튼

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Badge, Button, ButtonPair, Chip, Page, Row } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { itemName, recommendSize } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const app = useApp();
  const router = useRouter();
  const found = app.findItem(id);
  if (!found) return <Page title="옷 상세"><p className="text-sm">옷을 찾을 수 없어요</p></Page>;
  const { item, closet } = found;
  const mine = app.isMine(closet.id);

  const tryOn = () => {
    if (!app.subscribed) return router.push('/subscribe');
    app.bumpUsage('mannequin');
    router.push(`/mannequin?closetId=${closet.id}&itemId=${item.id}`);
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
            <Button label="마네킹에 입혀보기" variant="accent" pro={!app.subscribed} onClick={tryOn} />
          </ButtonPair>
        ) : (
          <ButtonPair>
            <Button label="내 옷장에 담기" variant="outline" onClick={keep} />
            <Button label="아바타에 입혀보기" variant="accent" pro={!app.subscribed} onClick={tryOn} />
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
