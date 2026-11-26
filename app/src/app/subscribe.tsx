// 12 AI 추천 구독 소개
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Screen } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { colors, radius, type } from '@/theme';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }[] = [
  { icon: 'sparkles-outline', title: 'AI 옷장 요약', desc: '공개 옷장의 스타일과 핵심 아이템을 한눈에' },
  { icon: 'compass-outline', title: '추구미 · 카테고리 맞춤 추천', desc: '내 추구미에 맞는 옷장과 옷만 골라서' },
  { icon: 'body-outline', title: '마네킹(아바타) 미리보기', desc: '추천 착장을 마네킹에 입혀 미리 확인' },
];

export default function Subscribe() {
  return (
    <Screen
      title="AI 추천 구독"
      left="close"
      footer={
        <>
          <Button label="구독 시작하기" variant="accent" onPress={() => router.push('/checkout')} />
          <Pressable onPress={() => router.back()} style={{ alignSelf: 'center', padding: 6 }}>
            <Text style={type.sub}>다음에 할게요</Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.hero}>
        <Badge label="PRO" tone="pro" />
        <Text style={[type.title, { fontSize: 24, lineHeight: 32 }]}>다른 사람들의 옷장을{'\n'}AI가 요약하고 골라드려요</Text>
        <Text style={type.sub}>월 정기결제 · 언제든 해지</Text>
      </View>
      {BENEFITS.map((b) => (
        <View key={b.title} style={styles.benefit}>
          <View style={styles.icon}><Ionicons name={b.icon} size={20} color={colors.accent} /></View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={type.h3}>{b.title}</Text>
            <Text style={type.sub}>{b.desc}</Text>
          </View>
        </View>
      ))}
      <View style={styles.price}>
        <View>
          <Text style={type.h3}>월간 구독</Text>
          <Text style={type.caption}>매월 자동 결제</Text>
        </View>
        <Text style={type.h2}>월 {won(PRICES.subscription)}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 10, backgroundColor: colors.accentSoft, borderRadius: radius.lg, padding: 20 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6 },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  price: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.lg, padding: 16 },
});
