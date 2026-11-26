import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLOR_HEX, Category, ClothingItem } from '@/data/mock';
import { colors, radius } from '@/theme';

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
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {category === '상의' && (
        <Path {...p} d="M31 17 L42 11 Q50 19 58 11 L69 17 L87 33 L77 45 L68 39 L68 89 L32 89 L32 39 L23 45 L13 33 Z" />
      )}
      {category === '하의' && <Path {...p} d="M29 10 L71 10 L75 90 L56 90 L50 38 L44 90 L25 90 Z" />}
      {category === '아우터' && (
        <>
          <Path {...p} d="M32 13 L44 9 L50 22 L56 9 L68 13 L85 30 L87 78 L77 78 L72 44 L72 92 L28 92 L28 44 L23 78 L13 78 L15 30 Z" />
          <Path d="M50 22 L50 92" stroke={stroke} strokeWidth={2} />
          <Circle cx={54} cy={44} r={2} fill={stroke} />
          <Circle cx={54} cy={60} r={2} fill={stroke} />
        </>
      )}
      {category === '신발' && (
        <>
          <Path {...p} d="M8 64 L13 40 Q25 43 34 36 L45 45 Q64 53 85 56 Q93 58 93 66 L93 70 L8 70 Z" />
          <Rect x={8} y={70} width={85} height={8} rx={3} fill={shade(fill, fill === '#F5F3EE' ? -18 : 50)} stroke={stroke} strokeWidth={2} />
        </>
      )}
      {category === '액세서리' && (
        <>
          <Path d="M36 40 Q36 18 50 18 Q64 18 64 40" fill="none" stroke={stroke} strokeWidth={4} />
          <Rect {...p} x={22} y={38} width={56} height={46} rx={6} />
        </>
      )}
    </Svg>
  );
}

export function ClothThumb({ item, height = 120, style, rounded = radius.md }: {
  item: Pick<ClothingItem, 'category' | 'color' | 'photoUri'>; height?: number; style?: ViewStyle; rounded?: number;
}) {
  return (
    <View style={[styles.thumb, { height, borderRadius: rounded }, style]}>
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <ClothGlyph category={item.category} color={item.color} size={Math.min(height * 0.62, 150)} />
      )}
    </View>
  );
}

/** 옷장 카드 커버: 대표 아이템 4개 콜라주 */
export function ClosetCover({ items, height = 150 }: { items: ClothingItem[]; height?: number }) {
  const picks = pickCover(items);
  return (
    <View style={[styles.cover, { height }]}>
      {picks.map((it, i) => (
        <View key={it.id + i} style={styles.coverCell}>
          <ClothGlyph category={it.category} color={it.color} size={height * 0.52} />
        </View>
      ))}
      {picks.length === 0 && <Text style={{ color: colors.muted }}>아직 옷이 없어요</Text>}
    </View>
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

const styles = StyleSheet.create({
  thumb: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cover: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8,
  },
  coverCell: { flex: 1, alignItems: 'center' },
});
