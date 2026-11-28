'use client';
// 마이페이지 하위: 관심 옷장 · 팔로잉 · 저장한 착장

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, ClosetCard, Page } from '@/components/ui';
import { Mannequin } from '@/components/Mannequin';
import { itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function Library() {
  const kind = useSearchParams().get('kind') ?? 'liked';
  const app = useApp();
  const title = kind === 'liked' ? '관심 옷장' : kind === 'following' ? '팔로잉' : '저장한 착장';

  if (kind === 'outfits') {
    const get = (id?: string) => (id ? app.findItem(id)?.item : undefined);
    return (
      <Page title={title}>
        {app.savedOutfits.length === 0 && <p className="text-[13px] text-sub">마네킹 미리보기에서 착장을 저장해 보세요.</p>}
        {app.savedOutfits.map((o) => {
          const parts = [get(o.outer), get(o.top), get(o.bottom), get(o.shoes)].filter(Boolean);
          return (
            <Card key={o.id} href={`/mannequin?closetId=${o.sourceClosetId}`} className="flex-row! items-center gap-3">
              {o.image
                // eslint-disable-next-line @next/next/no-img-element -- 저장한 AI 착장 이미지(data URL)
                ? <img src={o.image} alt="AI 착장" className="h-[120px] w-[80px] shrink-0 rounded-lg object-cover" />
                : <Mannequin top={get(o.top)?.color} bottom={get(o.bottom)?.color} shoes={get(o.shoes)?.color} outer={get(o.outer)?.color} height={120} body={app.body} />}
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[15px] font-semibold">{parts.map((p) => itemName(p!)).join(' + ')}</span>
                <span className="text-xs text-muted">출처: {app.findCloset(o.sourceClosetId)?.name}</span>
              </div>
            </Card>
          );
        })}
      </Page>
    );
  }

  const ids = kind === 'liked' ? app.liked : app.following;
  const list = ids.map((id) => app.findCloset(id)).filter((c) => c !== undefined);
  return (
    <Page title={title}>
      {list.length === 0 && <Link href="/explore" className="text-[13px] text-accent">탐방에서 마음에 드는 옷장을 찾아보세요 ›</Link>}
      {list.map((c) => <ClosetCard key={c.id} closet={c} href={`/c/${c.id}`} />)}
    </Page>
  );
}
