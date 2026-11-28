import { COLOR_HEX, itemPhotoSrc, Category, ClothingItem } from '@/data/mock';

// 사진 대신 쓰는 의류 일러스트. 실제 서비스에서는 업로드한 옷 사진(누끼)으로 대체된다.
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, v + amt));
  const r = ch(n >> 16), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export function ClothGlyph({ category, color, size = 64 }: { category: Category; color: string; size?: number }) {
  const fill = COLOR_HEX[color] ?? '#BBBBBB';
  const stroke = shade(fill, -40);
  const p = { fill, stroke, strokeWidth: 2, strokeLinejoin: 'round' as const };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {category === '상의' && (
        <path {...p} d="M31 17 L42 11 Q50 19 58 11 L69 17 L87 33 L77 45 L68 39 L68 89 L32 89 L32 39 L23 45 L13 33 Z" />
      )}
      {category === '하의' && <path {...p} d="M29 10 L71 10 L75 90 L56 90 L50 38 L44 90 L25 90 Z" />}
      {category === '아우터' && (
        <>
          <path {...p} d="M32 13 L44 9 L50 22 L56 9 L68 13 L85 30 L87 78 L77 78 L72 44 L72 92 L28 92 L28 44 L23 78 L13 78 L15 30 Z" />
          <path d="M50 22 L50 92" stroke={stroke} strokeWidth={2} />
          <circle cx={54} cy={44} r={2} fill={stroke} />
          <circle cx={54} cy={60} r={2} fill={stroke} />
        </>
      )}
      {category === '신발' && (
        <>
          <path {...p} d="M8 64 L13 40 Q25 43 34 36 L45 45 Q64 53 85 56 Q93 58 93 66 L93 70 L8 70 Z" />
          <rect x={8} y={70} width={85} height={8} rx={3} fill={shade(fill, fill === '#F5F3EE' ? -18 : 50)} stroke={stroke} strokeWidth={2} />
        </>
      )}
      {category === '액세서리' && (
        <>
          <path d="M36 40 Q36 18 50 18 Q64 18 64 40" fill="none" stroke={stroke} strokeWidth={4} />
          <rect {...p} x={22} y={38} width={56} height={46} rx={6} />
        </>
      )}
    </svg>
  );
}

export function ClothThumb({ item, height = 120, className = '' }: {
  item: Pick<ClothingItem, 'category' | 'color' | 'photoUri'> & Partial<Pick<ClothingItem, 'kind'>>; height?: number; className?: string;
}) {
  const photo = itemPhotoSrc(item);
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-surface ${className}`} style={{ height }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- 사용자가 올린 data URL
        <img src={photo} alt="" className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <ClothGlyph category={item.category} color={item.color} size={Math.min(height * 0.62, 170)} />
      )}
    </div>
  );
}

/** 옷장 카드 커버: 대표 아이템 4개 콜라주 */
export function ClosetCover({ items, height = 150 }: { items: ClothingItem[]; height?: number }) {
  const covers: Record<string, string> = { minji: 'closet', seoyun: 'boutique', hana: 'closet', moodlab: 'rack', yujin: 'rack', trail: 'rack', soy: 'boutique', dowon: 'closet' };
  const cover = covers[items[0]?.closetId];
  if (cover) return <div className="rounded-xl bg-cover bg-center" style={{ height, backgroundImage: `url(/looks/${cover}.webp)` }} />;
  const picks = pickCover(items);
  return (
    <div className="flex items-center justify-around overflow-hidden rounded-xl bg-surface px-2" style={{ height }}>
      {picks.map((it, i) => (
        <div key={it.id + i} className="flex flex-1 justify-center">
          <ClothGlyph category={it.category} color={it.color} size={height * 0.52} />
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
