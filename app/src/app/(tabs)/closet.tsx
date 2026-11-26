// 07 내 옷장 · 10 옷장 가득 참(바텀시트)
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Badge, BottomSheet, Button, ButtonPair, Card, Chip, ChipRow, ItemGrid, ProgressBar, Screen, TextAction, typeTone,
} from '@/components/ui';
import { CATEGORIES, itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function MyCloset() {
  const app = useApp();
  const closet = app.activeCloset;
  const [cat, setCat] = useState('전체');
  const [sheet, setSheet] = useState(false);
  const [tidy, setTidy] = useState(false);

  const used = closet.items.length;
  const full = used >= closet.capacity;
  const items = closet.items.filter((i) => cat === '전체' || i.category === cat);
  const paid = app.closetSlots > 1 || closet.capacity > 30;

  const upload = () => (full ? setSheet(true) : router.push('/upload'));

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="내 옷장"
        large
        left="none"
        tabScreen
        right={tidy
          ? <TextAction label="완료" onPress={() => setTidy(false)} />
          : <TextAction label="설정" onPress={() => router.push('/closet-settings')} />}
        footer={
          !tidy && (
            <ButtonPair>
              <Button label="+ 옷 올리기" onPress={upload} />
              <Button label="옷장 추가" variant="outline" onPress={() => router.push(app.myClosets.length < app.closetSlots ? '/new-closet' : '/expand')} />
            </ButtonPair>
          )
        }
      >
        {app.myClosets.length > 1 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ flex: 1 }}>
              <ChipRow
                items={app.myClosets.map((c) => c.name)}
                value={closet.name}
                onChange={(n) => app.setActiveCloset(app.myClosets.find((c) => c.name === n)!.id)}
              />
            </View>
            <Pressable hitSlop={8} onPress={() => router.push('/closets')}>
              <Ionicons name="grid-outline" size={20} color={colors.text} />
            </Pressable>
          </View>
        )}

        <Card style={{ backgroundColor: colors.surface, borderColor: colors.surface }}>
          <View style={styles.between}>
            <Text style={type.h3}>{closet.name} · 옷장 {app.myClosets.length} / {app.closetSlots}개 사용 중</Text>
            <Badge label={paid ? '유료' : '무료'} tone={paid ? 'pro' : 'neutral'} />
          </View>
          <View style={styles.between}>
            <Text style={type.sub}>옷 {used} / {closet.capacity}벌</Text>
            <Text style={[type.sub, full && { color: colors.danger, fontWeight: '600' }]}>
              {full ? '가득 참' : `남은 칸 ${closet.capacity - used}`}
            </Text>
          </View>
          <ProgressBar value={used} max={closet.capacity} tone={full ? 'danger' : 'primary'} />
          <View style={[styles.between, { justifyContent: 'flex-start', gap: 8 }]}>
            <Text style={type.sub}>테마</Text>
            <Chip label={closet.theme} selected small />
            {closet.type !== '일반' && <Badge label={closet.type} tone={typeTone(closet.type)} />}
            <Text style={[type.caption, { marginLeft: 'auto' }]}>옷장당 1개 · {closet.visibility}</Text>
          </View>
        </Card>

        <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={setCat} />

        {tidy && <Text style={type.sub}>정리할 옷을 눌러 옷장에서 빼세요.</Text>}
        <ItemGrid
          items={items}
          onPress={(it) => {
            if (tidy) {
              app.removeItem(it.id);
              app.toast(`${itemName(it)}을(를) 옷장에서 뺐어요`);
            } else router.push(`/item/${it.id}`);
          }}
          renderBadge={tidy ? () => (
            <View style={styles.remove}><Ionicons name="remove" size={14} color="#fff" /></View>
          ) : undefined}
        />
        {items.length === 0 && (
          <Text style={[type.sub, { textAlign: 'center', marginVertical: 30 }]}>
            {used === 0 ? '첫 옷을 올려 옷장을 시작해 보세요' : '이 카테고리에는 옷이 없어요'}
          </Text>
        )}
      </Screen>

      <BottomSheet visible={sheet} onClose={() => setSheet(false)}>
        <Text style={type.h2}>옷장이 가득 찼어요 ({used}/{closet.capacity})</Text>
        <Text style={type.sub}>
          무료 옷장에는 옷을 {closet.capacity}벌까지 올릴 수 있어요. 옷장을 추가하면 새 테마로 30벌을 더 올릴 수 있어요.
        </Text>
        <Button label="옷장 늘리기" onPress={() => { setSheet(false); router.push('/expand'); }} />
        <Button label="옷 정리하기" variant="outline" onPress={() => { setSheet(false); setTidy(true); }} />
        <Pressable onPress={() => setSheet(false)} style={{ alignSelf: 'center', padding: 6 }}>
          <Text style={type.sub}>닫기</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  remove: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
});
