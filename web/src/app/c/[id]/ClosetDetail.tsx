'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, ButtonPair, ChipRow, InfoBox, ItemGrid, Page, TextAction, typeTone } from '@/components/ui';
import { CATEGORIES, compact } from '@/data/mock';
import { useApp } from '@/state/AppState';

export function ClosetDetail({ id }: { id: string }) {
  const app = useApp();
  const router = useRouter();
  const closet = app.findCloset(id);
  const [cat, setCat] = useState('전체');
  if (!closet) return <Page title="옷장"><p className="text-sm">옷장을 찾을 수 없어요</p></Page>;

  const following = app.following.includes(closet.id);
  const items = closet.items.filter((i) => cat === '전체' || i.category === cat);
  const pro = (go: () => void) => (app.subscribed ? go() : router.push('/subscribe'));

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: closet.name, url });
      else {
        await navigator.clipboard.writeText(url);
        app.toast('옷장 링크를 복사했어요');
      }
    } catch {
      /* 공유 취소 */
    }
  };

  return (
    <Page
      title={closet.name}
      right={<TextAction label="공유" onClick={share} />}
      footer={
        <Button
          label="아바타로 미리보기"
          variant="accent"
          pro={!app.subscribed}
          onClick={() => pro(() => { app.bumpUsage('mannequin'); router.push(`/mannequin?closetId=${closet.id}`); })}
        />
      }
    >
      <div className="flex items-center gap-3.5">
        <Avatar size={56} />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold">{closet.owner}</span>
            <Badge label={closet.type} tone={typeTone(closet.type)} />
          </div>
          <span className="text-[13px] text-sub">
            테마 {closet.theme} · 옷 {closet.items.length}/{closet.capacity} · 팔로워 {compact(closet.followers + (following ? 1 : 0))}
          </span>
        </div>
      </div>

      <ButtonPair>
        <Button label={following ? '팔로잉' : '팔로우'} variant={following ? 'outline' : 'primary'} onClick={() => app.toggleFollow(closet.id)} />
        <Button
          label="AI 요약"
          variant="secondary"
          pro
          onClick={() => pro(() => { app.bumpUsage('summaries'); router.push(`/summary/${closet.id}`); })}
        />
      </ButtonPair>

      {closet.type === '브랜드' && <InfoBox>브랜드가 운영하는 옷장이에요. 구매 링크는 제휴 링크일 수 있어요.</InfoBox>}

      <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={setCat} />
      <ItemGrid items={items} />
    </Page>
  );
}
