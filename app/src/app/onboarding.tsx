// 02 온보딩 (3장)
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Screen, TextAction } from '@/components/ui';
import { ClosetCover, ClothThumb } from '@/components/ClothArt';
import { Mannequin } from '@/components/Mannequin';
import { PUBLIC_CLOSETS } from '@/data/mock';
import { colors, radius, type } from '@/theme';

const SLIDES = [
  {
    title: '내 옷장을 올려요',
    desc: '옷 사진 한 장이면 AI가 종류·색상·소재를 분석해\n카테고리별로 정리해 줘요. 옷장은 1개, 테마는 1개!',
  },
  {
    title: '다른 사람의 옷장을 구경해요',
    desc: '일반 사용자부터 인플루언서·브랜드 옷장까지\n테마와 카테고리별로 둘러보고 착장에 참고해요.',
  },
  {
    title: 'AI가 골라주는 내 스타일',
    desc: '구독하면 공개 옷장을 AI가 요약하고, 내 추구미에\n맞는 착장을 마네킹으로 미리 보여줘요.',
  },
];

function Illustration({ step }: { step: number }) {
  if (step === 0) {
    const items = PUBLIC_CLOSETS[0].items.slice(0, 6);
    return (
      <View style={styles.ill}>
        <View style={styles.grid}>
          {items.map((it) => <ClothThumb key={it.id} item={it} height={92} style={{ width: 92, backgroundColor: '#fff' }} />)}
        </View>
        <View style={styles.aiTag}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>상의 · 네이비 · 코튼 · 가을</Text>
        </View>
      </View>
    );
  }
  if (step === 1) {
    return (
      <View style={[styles.ill, { gap: 12, padding: 20 }]}>
        {PUBLIC_CLOSETS.slice(0, 2).map((c) => (
          <View key={c.id} style={{ width: '100%', gap: 6 }}>
            <ClosetCover items={c.items} height={110} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={type.h3}>{c.name}</Text>
              <Badge label={c.type} tone={c.type === '브랜드' ? 'brand' : 'influencer'} />
            </View>
          </View>
        ))}
      </View>
    );
  }
  return (
    <View style={[styles.ill, { flexDirection: 'row', gap: 16 }]}>
      <Mannequin top="네이비" bottom="베이지" shoes="화이트" height={280} />
      <View style={{ gap: 8 }}>
        <Badge label="PRO" tone="pro" />
        <Text style={type.h3}>추구미 일치 92%</Text>
        <Text style={type.sub}>미니멀 · 뉴트럴 톤</Text>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const last = step === SLIDES.length - 1;
  const next = () => (last ? router.replace('/style-setup') : setStep(step + 1));
  return (
    <Screen
      title=""
      left={step === 0 ? 'none' : 'back'}
      right={<TextAction label="건너뛰기" color={colors.sub} onPress={() => router.replace('/style-setup')} />}
      footer={<Button label={last ? '시작하기' : '다음'} onPress={next} />}
      scroll={false}
    >
      <Illustration step={step} />
      <Text style={[type.title, { marginTop: 8 }]}>{SLIDES[step].title}</Text>
      <Text style={[type.sub, { fontSize: 14, lineHeight: 21 }]}>{SLIDES[step].desc}</Text>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => <View key={i} style={[styles.dot, i === step && styles.dotOn]} />)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ill: { height: 380, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: 296, justifyContent: 'center' },
  aiTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, marginTop: 18 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong },
  dotOn: { width: 20, backgroundColor: colors.primary },
});
