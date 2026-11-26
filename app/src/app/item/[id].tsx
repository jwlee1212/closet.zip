// 06 옷 상세 (다른 사람의 옷) · 내 옷이면 관리용 버튼
import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, Badge, Button, ButtonPair, Chip, Row, Screen } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function ItemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const found = app.findItem(id);
  if (!found) return <Screen title="옷 상세"><Text>옷을 찾을 수 없어요</Text></Screen>;
  const { item, closet } = found;
  const mine = app.isMine(closet.id);

  const tryOn = () => {
    if (!app.subscribed) return router.push('/subscribe');
    app.bumpUsage('mannequin');
    router.push(`/mannequin?closetId=${closet.id}&itemId=${item.id}`);
  };

  const keep = () => {
    const ok = app.addItem({
      category: item.category, kind: item.kind, color: item.color, material: item.material, season: item.season, fit: item.fit,
    });
    if (ok) app.toast(`${app.activeCloset.name}에 담았어요 (${app.activeCloset.items.length + 1}/${app.activeCloset.capacity})`);
    else {
      app.toast('옷장이 가득 찼어요. 옷장을 늘려 주세요');
      router.push('/expand');
    }
  };

  return (
    <Screen
      title="옷 상세"
      footer={
        mine ? (
          <ButtonPair>
            <Button label="옷장에서 빼기" variant="danger" onPress={() => { app.removeItem(item.id); app.toast('옷장에서 뺐어요'); router.back(); }} />
            <Button label="마네킹에 입혀보기" variant="accent" pro={!app.subscribed} onPress={tryOn} />
          </ButtonPair>
        ) : (
          <ButtonPair>
            <Button label="내 옷장에 담기" variant="outline" onPress={keep} />
            <Button label="아바타에 입혀보기" variant="accent" pro={!app.subscribed} onPress={tryOn} />
          </ButtonPair>
        )
      }
    >
      <ClothThumb item={item} height={260} />
      <View style={{ gap: 10 }}>
        <Text style={type.title}>{itemName(item)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {[item.category, item.color, item.material, item.season, item.fit].filter(Boolean).map((t) => (
            <Chip key={t} label={t!} small />
          ))}
        </View>
      </View>

      {!mine && (
        <Pressable onPress={() => router.push(`/closet/${closet.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar size={28} />
          <Text style={[type.h3, { flex: 1 }]}>{closet.name}</Text>
          <Text style={type.sub}>옷장 보기 ›</Text>
        </Pressable>
      )}

      <View>
        <Row label="브랜드" value={item.brand ?? '정보 없음'} />
        <Row label="이 옷이 들어간 코디" value={`${item.coordiCount}개`} />
        {!mine && (
          <Row
            label="구매 링크"
            value={item.brand ? '제휴 링크' : '판매처 검색'}
            onPress={() => Linking.openURL(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(itemName(item))}`).catch(() => {})}
          />
        )}
      </View>
      {!mine && item.brand && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Badge label="제휴" tone="brand" />
          <Text style={[type.caption, { color: colors.sub }]}>구매 시 옷장 운영자에게 수수료가 지급될 수 있어요</Text>
        </View>
      )}
    </Screen>
  );
}
