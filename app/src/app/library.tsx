// 마이페이지 하위: 관심 옷장 · 팔로잉 · 저장한 착장
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, ClosetCard, Screen } from '@/components/ui';
import { Mannequin } from '@/components/Mannequin';
import { itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function Library() {
  const { kind } = useLocalSearchParams<{ kind: 'liked' | 'following' | 'outfits' }>();
  const app = useApp();
  const title = kind === 'liked' ? '관심 옷장' : kind === 'following' ? '팔로잉' : '저장한 착장';

  if (kind === 'outfits') {
    return (
      <Screen title={title}>
        {app.savedOutfits.length === 0 && <Text style={type.sub}>마네킹 미리보기에서 착장을 저장해 보세요.</Text>}
        {app.savedOutfits.map((o) => {
          const get = (id?: string) => (id ? app.findItem(id)?.item : undefined);
          const parts = [get(o.outer), get(o.top), get(o.bottom), get(o.shoes)].filter(Boolean);
          const src = app.findCloset(o.sourceClosetId);
          return (
            <Card key={o.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }} onPress={() => router.push(`/mannequin?closetId=${o.sourceClosetId}`)}>
              <Mannequin top={get(o.top)?.color} bottom={get(o.bottom)?.color} shoes={get(o.shoes)?.color} outer={get(o.outer)?.color} height={120} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={type.h3}>{parts.map((p) => itemName(p!)).join(' + ')}</Text>
                <Text style={type.caption}>출처: {src?.name}</Text>
              </View>
            </Card>
          );
        })}
      </Screen>
    );
  }

  const ids = kind === 'liked' ? app.liked : app.following;
  const list = ids.map((id) => app.findCloset(id)).filter(Boolean);
  return (
    <Screen title={title}>
      {list.length === 0 && (
        <Pressable onPress={() => router.navigate('/explore')}>
          <Text style={[type.sub, { color: colors.accent }]}>탐방에서 마음에 드는 옷장을 찾아보세요 ›</Text>
        </Pressable>
      )}
      {list.map((c) => (
        <ClosetCard key={c!.id} closet={c!} onPress={() => router.push(`/closet/${c!.id}`)} />
      ))}
    </Screen>
  );
}
