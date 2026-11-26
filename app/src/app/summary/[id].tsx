// 15 AI 옷장 요약 — 스타일 요약 · 핵심 아이템 · 추구미 일치도
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Badge, Button, ButtonPair, Card, Chip, ProgressBar, Screen, SectionHeader, typeTone } from '@/components/ui';
import { ClothThumb } from '@/components/ClothArt';
import { matchScore } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const closet = app.findCloset(id);
  if (!closet) return <Screen title="AI 옷장 요약"><Text>옷장을 찾을 수 없어요</Text></Screen>;
  const score = matchScore(closet, app.styles, app.interests);
  const keyItems = [...closet.items].sort((a, b) => b.coordiCount - a.coordiCount).slice(0, 3);

  return (
    <Screen
      title="AI 옷장 요약"
      right={<Badge label="PRO" tone="pro" />}
      footer={
        <ButtonPair>
          <Button label="옷장 보기" variant="outline" onPress={() => router.push(`/closet/${closet.id}`)} />
          <Button
            label="마네킹에 입혀보기"
            variant="accent"
            onPress={() => { app.bumpUsage('mannequin'); router.push(`/mannequin?closetId=${closet.id}`); }}
          />
        </ButtonPair>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar size={40} />
        <View style={{ flex: 1 }}>
          <Text style={type.h3}>{closet.name}</Text>
          <Text style={type.sub}>테마 {closet.theme} · 옷 {closet.items.length}벌</Text>
        </View>
        <Badge label={closet.type} tone={typeTone(closet.type)} />
      </View>

      <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={[type.h3, { fontSize: 14 }]}>AI 요약</Text>
        </View>
        <Text style={type.body}>{closet.summary}</Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {closet.tags.map((t) => <Chip key={t} label={t} small />)}
      </View>

      <SectionHeader title="핵심 아이템" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {keyItems.map((it) => (
          <Pressable key={it.id} style={{ flex: 1, gap: 4 }} onPress={() => router.push(`/item/${it.id}`)}>
            <ClothThumb item={it} height={100} />
            <Text style={[type.caption, { color: colors.sub }]} numberOfLines={1}>{it.kind} · {it.coordiCount}코디</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={type.h3}>내 추구미 일치도</Text>
          <Text style={[type.h3, { color: colors.accent }]}>{score}%</Text>
        </View>
        <ProgressBar value={score} max={100} tone="accent" />
        <Text style={type.caption}>추구미 {app.styles.join('·')} · 관심 카테고리 {app.interests.join('·')} 기준</Text>
      </View>
    </Screen>
  );
}
