// 14 AI 추천 홈 (구독자) · 비구독자는 잠금 미리보기
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, ChipRow, InfoBox, Screen, SectionHeader } from '@/components/ui';
import { ClosetCover } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { CATEGORIES, Category, PUBLIC_CLOSETS, itemName, matchScore, weeklySummary } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

export default function AiHome() {
  const app = useApp();
  const [cat, setCat] = useState<Category | '전체'>('전체');
  const mainStyle = app.styles[0] ?? '미니멀';
  const summary = weeklySummary(mainStyle, cat);

  const recs = useMemo(
    () =>
      PUBLIC_CLOSETS.filter((c) => cat === '전체' || c.items.some((i) => i.category === cat))
        .map((c) => ({ c, score: matchScore(c, app.styles, app.interests) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4),
    [cat, app.styles, app.interests],
  );

  // 오늘의 코디: 내 옷장 기반
  const mine = app.activeCloset.items;
  const today = {
    top: mine.find((i) => i.category === '상의'),
    bottom: mine.find((i) => i.category === '하의'),
    shoes: mine.find((i) => i.category === '신발'),
  };

  if (!app.subscribed) {
    return (
      <Screen title="AI 추천" large left="none" tabScreen>
        <View style={styles.lockHero}>
          <Badge label="PRO" tone="pro" />
          <Text style={[type.title, { textAlign: 'center' }]}>다른 사람들의 옷장을{'\n'}AI가 요약하고 골라드려요</Text>
          <Text style={[type.sub, { textAlign: 'center' }]}>
            내 추구미 &quot;{app.styles.join(' · ')}&quot; 기준으로 맞춤 옷장 {recs.length}개를 찾았어요
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {recs.slice(0, 2).map(({ c, score }) => (
            <View key={c.id} style={{ flex: 1, gap: 6 }}>
              <View>
                <ClosetCover items={c.items} height={120} />
                <View style={styles.blur}><Ionicons name="lock-closed" size={22} color={colors.sub} /></View>
              </View>
              <Text style={type.caption}>추구미 일치 {score}%</Text>
            </View>
          ))}
        </View>
        <Button label="AI 추천 구독 알아보기" variant="accent" onPress={() => router.push('/subscribe')} />
      </Screen>
    );
  }

  return (
    <Screen title="AI 추천" large left="none" tabScreen right={<Badge label="PRO" tone="pro" />}>
      <Pressable style={styles.pref} onPress={() => router.push('/style-setup?mode=edit')}>
        <View>
          <Text style={type.caption}>나의 추구미</Text>
          <Text style={[type.h3, { marginTop: 2 }]}>{app.styles.join(' · ')}</Text>
        </View>
        <Text style={type.sub}>변경 ›</Text>
      </Pressable>

      <ChipRow items={['전체', ...CATEGORIES]} value={cat} onChange={(v) => setCat(v as typeof cat)} />

      <SectionHeader title="오늘의 추천 코디 · 내 옷장" />
      <Card
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
        onPress={() => { app.bumpUsage('mannequin'); router.push(`/mannequin?closetId=${app.activeCloset.id}`); }}
      >
        <Mannequin top={today.top?.color} bottom={today.bottom?.color} shoes={today.shoes?.color} height={150} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={type.h3}>{[today.top, today.bottom, today.shoes].filter(Boolean).map((i) => itemName(i!)).join(' + ') || '옷을 더 올려주세요'}</Text>
          <Text style={type.sub}>오늘 12°C · 맑음. 가진 옷만으로 &quot;{mainStyle}&quot; 무드를 맞췄어요.</Text>
          <Text style={[type.caption, { color: colors.accent, fontWeight: '600' }]}>마네킹으로 보기 ›</Text>
        </View>
      </Card>

      <SectionHeader title="이번 주 AI 요약" />
      <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="sparkles" size={16} color={colors.accent} />
          <Text style={[type.h3, { fontSize: 14 }]}>{summary.title}</Text>
        </View>
        <Text style={type.body}>{summary.body}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {summary.tags.map((t) => <Badge key={t} label={t} tone="outline" />)}
        </View>
      </Card>

      <SectionHeader title="추구미 맞춤 옷장" />
      <View style={styles.recGrid}>
        {recs.map(({ c, score }) => (
          <Pressable
            key={c.id}
            style={{ width: '48.5%', gap: 6 }}
            onPress={() => { app.bumpUsage('summaries'); router.push(`/summary/${c.id}`); }}
          >
            <ClosetCover items={c.items} height={130} />
            <Text style={type.h3} numberOfLines={1}>{c.name}</Text>
            <Text style={[type.caption, { color: colors.accent, fontWeight: '600' }]}>추구미 일치 {score}%</Text>
          </Pressable>
        ))}
      </View>
      <InfoBox>추천 결과는 제휴 여부와 무관하게 산출되며, 광고·제휴 옷장은 별도로 표시돼요.</InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pref: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14 },
  recGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  lockHero: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  blur: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(246,245,242,0.82)', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
