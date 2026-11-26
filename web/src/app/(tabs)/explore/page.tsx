'use client';
// 04 탐방 홈 (공개 옷장 피드)

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Lock, Search, Sparkles, X } from 'lucide-react';
import { ChipRow, ClosetCard, Page } from '@/components/ui';
import { Closet, PUBLIC_CLOSETS, STYLES, matchScore } from '@/data/mock';
import { useApp } from '@/state/AppState';

const SORTS = ['추천', '인기', '팔로잉', '최신'] as const;
type Sort = (typeof SORTS)[number];

export default function Explore() {
  const app = useApp();
  const [sort, setSort] = useState<Sort>('추천');
  const [theme, setTheme] = useState('전체');
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let l = PUBLIC_CLOSETS.filter((c) => theme === '전체' || c.theme === theme);
    const query = q.trim();
    if (query) l = l.filter((c) => `${c.name} ${c.theme} ${c.tags.join(' ')}`.includes(query));
    if (sort === '팔로잉') l = l.filter((c) => app.following.includes(c.id));
    const by: Record<Sort, (a: Closet, b: Closet) => number> = {
      추천: (a, b) => matchScore(b, app.styles, app.interests) - matchScore(a, app.styles, app.interests),
      인기: (a, b) => b.likes - a.likes,
      팔로잉: (a, b) => a.updatedRank - b.updatedRank,
      최신: (a, b) => a.updatedRank - b.updatedRank,
    };
    return [...l].sort(by[sort]);
  }, [sort, theme, q, app.following, app.styles, app.interests]);

  const mainStyle = app.styles[0] ?? '미니멀';
  const matchCount = PUBLIC_CLOSETS.filter((c) => matchScore(c, app.styles, app.interests) >= 80).length;

  return (
    <Page
      title="탐방"
      large
      left="none"
      tabbed
      right={
        <button aria-label="검색" onClick={() => { setSearching((v) => !v); setQ(''); }} className="p-1">
          {searching ? <X size={22} /> : <Search size={22} />}
        </button>
      }
    >
      {searching && (
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="옷장 이름, 테마, 키워드 검색"
          className="h-11 rounded-xl bg-surface px-3.5 text-sm outline-none placeholder:text-muted"
        />
      )}
      <div className="flex flex-col gap-2">
        <ChipRow items={SORTS} value={sort} onChange={(v) => setSort(v as Sort)} />
        <ChipRow items={['전체', ...STYLES]} value={theme} onChange={setTheme} />
      </div>

      <Link href={app.subscribed ? '/ai' : '/subscribe'} className="flex items-center gap-3 rounded-2xl bg-accent-soft p-3.5">
        <div className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold">AI 추천 · 내 추구미 &quot;{mainStyle}&quot;에 맞는 옷장 {matchCount}개</span>
          <span className="text-xs font-semibold text-accent">{app.subscribed ? '추천 보러 가기 ›' : '구독하고 확인하기 ›'}</span>
        </div>
        {app.subscribed ? <Sparkles size={20} className="text-accent" /> : <Lock size={20} className="text-accent" />}
      </Link>

      {list.map((c) => (
        <ClosetCard key={c.id} closet={c} href={`/c/${c.id}`} liked={app.liked.includes(c.id)} onLike={() => app.toggleLike(c.id)} />
      ))}
      {list.length === 0 && (
        <p className="mt-10 text-center text-[13px] text-sub">
          {sort === '팔로잉' ? '팔로우한 옷장이 아직 없어요' : '조건에 맞는 옷장이 없어요'}
        </p>
      )}
    </Page>
  );
}
