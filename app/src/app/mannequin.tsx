// 16 마네킹(아바타) 미리보기 — 추천 착장 · 아이템 교체 · 추천 이유 · 원본 옷장
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, Button, ButtonPair, Card, ChipRow, Screen, TextAction } from '@/components/ui';
import { Mannequin } from '@/components/Mannequin';
import { Category, ClothingItem, itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

type Slot = '아우터' | '상의' | '하의' | '신발';
const SLOTS: Slot[] = ['아우터', '상의', '하의', '신발'];

export default function MannequinScreen() {
  const { closetId, itemId } = useLocalSearchParams<{ closetId: string; itemId?: string }>();
  const app = useApp();
  const closet = app.findCloset(closetId) ?? app.activeCloset;
  const mine = app.isMine(closet.id);
  const [view, setView] = useState<'정면' | '측면' | '후면'>('정면');

  const pool = useMemo(() => {
    const p: Record<Slot, ClothingItem[]> = { 아우터: [], 상의: [], 하의: [], 신발: [] };
    closet.items.forEach((i) => { if (i.category in p) p[i.category as Slot].push(i); });
    return p;
  }, [closet]);

  const [pick, setPick] = useState<Record<Slot, number>>(() => {
    const init: Record<Slot, number> = { 아우터: -1, 상의: 0, 하의: 0, 신발: 0 };
    const target = itemId ? closet.items.find((i) => i.id === itemId) : undefined;
    if (target && (SLOTS as Category[]).includes(target.category)) {
      init[target.category as Slot] = pool[target.category as Slot].findIndex((i) => i.id === target.id);
    }
    return init;
  });

  const cur = (s: Slot) => (pick[s] >= 0 ? pool[s][pick[s]] : undefined);
  const swap = (s: Slot) => {
    const n = pool[s].length;
    if (!n) return app.toast(`이 옷장에는 ${s}가 없어요`);
    // 아우터는 '없음' 상태(-1)도 순환
    setPick({ ...pick, [s]: s === '아우터' ? (pick[s] + 2) % (n + 1) - 1 : (pick[s] + 1) % n });
  };

  const top = cur('상의'), bottom = cur('하의'), shoes = cur('신발'), outer = cur('아우터');
  const reason = `추구미 "${app.styles[0] ?? closet.theme}"에 맞춰 ${top?.color ?? '뉴트럴'} 톤 상의와 ${bottom?.fit === '와이드' ? '와이드' : bottom?.kind ?? ''} 하의를 조합했어요.${outer ? ` ${outer.kind}로 레이어드해 일교차에 대비했어요.` : ''}`;

  return (
    <Screen
      title="마네킹 미리보기"
      right={<TextAction label="저장" onPress={() => { app.saveOutfit({ top: top?.id, bottom: bottom?.id, shoes: shoes?.id, outer: outer?.id, sourceClosetId: closet.id }); app.toast('착장을 저장했어요'); }} />}
      footer={
        <ButtonPair>
          <Button label={mine ? '내 옷장 보기' : '원본 옷장 보기'} variant="outline" onPress={() => router.push(mine ? '/closet' : `/closet/${closet.id}`)} />
          <Button
            label="착장 저장"
            onPress={() => {
              app.saveOutfit({ top: top?.id, bottom: bottom?.id, shoes: shoes?.id, outer: outer?.id, sourceClosetId: closet.id });
              app.toast('저장한 착장에 추가했어요');
            }}
          />
        </ButtonPair>
      }
    >
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={styles.stage}>
          <Mannequin top={top?.color} bottom={bottom?.color} shoes={shoes?.color} outer={outer?.color} view={view} height={300} />
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={type.h3}>착장 구성</Text>
          {SLOTS.map((s) => {
            const it = cur(s);
            return (
              <Pressable key={s} style={styles.item} onPress={() => swap(s)}>
                <View style={{ flex: 1 }}>
                  <Text style={type.caption}>{s}</Text>
                  <Text style={[type.body, { fontSize: 13, fontWeight: '600' }]} numberOfLines={2}>
                    {it ? itemName(it) : s === '아우터' ? '없음' : '-'}
                  </Text>
                </View>
                <Text style={[type.caption, { color: colors.accent, fontWeight: '700' }]}>교체</Text>
              </Pressable>
            );
          })}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Avatar size={20} />
            <Text style={type.caption} numberOfLines={1}>출처: {closet.name}</Text>
          </View>
        </View>
      </View>

      <ChipRow items={['정면', '측면', '후면']} value={view} onChange={(v) => setView(v as typeof view)} />

      <Card style={{ backgroundColor: colors.surface, borderColor: colors.surface }}>
        <Text style={type.h3}>추천 이유</Text>
        <Text style={type.body}>{reason}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { width: 170, height: 330, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 10 },
});
