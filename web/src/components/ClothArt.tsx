import { itemPhotoSrc, Category, ClothingItem } from '@/data/mock';

export function ClothThumb({ item, height = 120, className = '' }: {
  item: Pick<ClothingItem, 'category' | 'color' | 'photoUri'> & Partial<Pick<ClothingItem, 'kind'>>; height?: number; className?: string;
}) {
  const photo = itemPhotoSrc(item);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-surface ${className}`} style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 카탈로그와 사용자 사진을 함께 표시 */}
      <img src={photo} alt={`${item.color} ${item.kind ?? item.category}`} className="absolute inset-0 h-full w-full object-contain" />
    </div>
  );
}

/** 옷장 카드 커버: 대표 아이템 4개 콜라주 */
export function ClosetCover({ items, height = 150 }: { items: ClothingItem[]; height?: number }) {
  const cover = items.find(it => it.wornPhoto)?.wornPhoto;
  if (cover) return (
    // eslint-disable-next-line @next/next/no-img-element -- 대표 착용샷은 사용자 업로드일 수 있다
    <img src={cover} alt="옷장 대표 착용샷" className="w-full rounded-xl bg-surface object-cover object-[center_32%]" style={{ height }} />
  );
  const picks = pickCover(items);
  return (
    <div className="flex items-center justify-around overflow-hidden rounded-xl bg-surface px-2" style={{ height }}>
      {picks.map((it, i) => (
        <div key={it.id + i} className="flex flex-1 justify-center">
          <ClothThumb item={it} height={height * 0.65} className="w-full" />
        </div>
      ))}
      {picks.length === 0 && <span className="text-sm text-muted">아직 옷이 없어요</span>}
    </div>
  );
}

function pickCover(items: ClothingItem[]) {
  const order: Category[] = ['아우터', '상의', '하의', '신발'];
  const out: ClothingItem[] = [];
  for (const c of order) {
    const f = items.find((i) => i.category === c);
    if (f) out.push(f);
  }
  for (const i of items) if (out.length < 4 && !out.includes(i)) out.push(i);
  return out.slice(0, 4);
}
