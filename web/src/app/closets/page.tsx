'use client';
// 20 내 옷장 관리 (여러 옷장) — 유형 뱃지 · 조회수 · 팔로워 · 링크 클릭

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Badge, Button, InfoBox, Page, SectionHeader, StatGrid, TextAction, typeTone } from '@/components/ui';
import { compact } from '@/data/mock';
import { useApp } from '@/state/AppState';

// 비즈니스 통계는 MVP 이후 기능 — 데모에서는 옷장 순서별 고정 목업 수치를 쓴다
const mockStats = (i: number) => ({ views: [5100, 4800, 2500, 1200][i % 4], followers: [1800, 900, 500, 200][i % 4], clicks: [120, 80, 860, 40][i % 4] });

export default function Closets() {
  const app = useApp();
  const router = useRouter();
  const addHref = app.myClosets.length < app.closetSlots ? '/new-closet' : '/expand';
  const totals = app.myClosets.reduce(
    (acc, _c, i) => { const m = mockStats(i); return { v: acc.v + m.views, f: acc.f + m.followers, l: acc.l + m.clicks }; },
    { v: 0, f: 0, l: 0 },
  );

  return (
    <Page title="내 옷장 관리" right={<TextAction label="추가" href={addHref} />} footer={<Button label="+ 옷장 추가하기" href={addHref} />}>
      <StatGrid stats={[{ value: compact(totals.v), label: '조회수' }, { value: compact(totals.f), label: '팔로워' }, { value: compact(totals.l), label: '링크 클릭' }]} />
      <SectionHeader title={`내 옷장 ${app.myClosets.length} / ${app.closetSlots}`} />
      {app.myClosets.map((c, i) => {
        const m = mockStats(i);
        const active = c.id === app.activeClosetId;
        return (
          <button
            key={c.id}
            onClick={() => { app.setActiveCloset(c.id); router.push('/closet'); }}
            className={`flex items-center rounded-2xl border p-4 text-left ${active ? 'border-ink' : 'border-line'}`}
          >
            <span className="flex flex-1 flex-col gap-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold">{c.name}</span>
                <Badge label={c.type} tone={typeTone(c.type)} />
                {active && <Badge label="사용 중" tone="outline" />}
              </span>
              <span className="text-[13px] text-sub">
                테마 {c.theme} · 옷 {c.items.length}/{c.capacity} · {c.type === '광고' ? `링크 클릭 ${m.clicks}` : `조회 ${compact(m.views)}`}
              </span>
            </span>
            <ChevronRight size={18} className="text-muted" />
          </button>
        );
      })}
      <InfoBox>옷장마다 테마가 달라 탐방에서 각각 노출돼요.</InfoBox>
    </Page>
  );
}
