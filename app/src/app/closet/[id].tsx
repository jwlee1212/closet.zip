// 05 옷장 상세 (다른 사람)
import React, { useState } from 'react';
import { Share, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Avatar, Badge, Button, ButtonPair, ChipRow, InfoBox, ItemGrid, Screen, TextAction, typeTone } from '@/components/ui';
import { CATEGORIES, compact } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { type } from '@/theme';

export default function ClosetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const closet = app.findCloset(id);
  const [cat, setCat] = useState('전체');
  if (!closet) return <Screen title="옷장"><Text>옷장을 찾을 수 없어요</Text></Screen>;

  const following = app.following.includes(closet.id);
  const items = closet.items.filter((i) => cat === '전체' || i.category === cat);
  const pro = (go: () => void) => (app.subscribed ? go() : router.push('/subscribe'));

  return (
    <Screen
      title={closet.name}
      right={<TextAction label="공유" onPress={() => Share.share({ message: `내 옷장 앱에서 ${closet.name}을 구경해 보세요` }).catch(() => {})} />}
      footer={
        <Button
          label="아바타로 미리보기"
          pro={!app.subscribed}
          variant="accent"
          onPress={() => pro(() => { app.bumpUsage('mannequin'); router.push(`/mannequin?closetId=${closet.id}`); })}
        />
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar size={56} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={type.h2}>{closet.owner}</Text>
            <Badge label={closet.type} tone={typeTone(closet.type)} />
          </View>
          <Text style={type.sub}>
            테마 {closet.theme} · 옷 {closet.items.length}/{closet.capacity} · 팔로워 {compact(closet.followers + (following ? 1 : 0))}
          </Text>
        </View>
      </View>

      <ButtonPair>
        <Button
          label={following ? '팔로잉' : '팔로우'}
          variant={following ? 'outline' : 'primary'}
          onPress={() => app.toggleFollow(closet.id)}
        />
        <Button
          label="AI 요약"
          variant="secondary"
          pro
          onPress={() => pro(() => { app.bumpUsage('summaries'); router.push(`/summary/${closet.id}`); })}
        />
      </ButtonPair>

      {closet.type === '브랜드' && <InfoBox>브랜드가 운영하는 옷장이에요. 구매 링크는 제휴 링크일 수 있어요.</InfoBox>}

      <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={setCat} />
      <ItemGrid items={items} onPress={(it) => router.push(`/item/${it.id}`)} />
    </Screen>
  );
}
