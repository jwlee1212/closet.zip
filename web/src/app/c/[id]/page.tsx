// 05 옷장 상세 (다른 사람) — 공유 링크의 진입점
// 서버에서 메타데이터를 만들어 카카오톡·인스타 등에 링크를 붙였을 때 미리보기 카드가 뜨게 한다 (보고서 2-1 유입 전략)
import type { Metadata } from 'next';
import { PUBLIC_CLOSETS } from '@/data/mock';
import { ClosetDetail } from './ClosetDetail';

export function generateStaticParams() {
  return PUBLIC_CLOSETS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<'/c/[id]'>): Promise<Metadata> {
  const { id } = await params;
  const closet = PUBLIC_CLOSETS.find((c) => c.id === id);
  if (!closet) return { title: '옷장을 찾을 수 없어요' };
  const description = `테마 ${closet.theme} · 옷 ${closet.items.length}벌 — ${closet.summary}`;
  return {
    title: closet.name,
    description,
    openGraph: { title: `${closet.name} | 내 옷장`, description, type: 'profile' },
    twitter: { card: 'summary', title: closet.name, description },
  };
}

export default async function Page({ params }: PageProps<'/c/[id]'>) {
  const { id } = await params;
  return <ClosetDetail id={id} />;
}
