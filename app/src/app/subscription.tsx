// 17 구독 관리 — 다음 결제일 · 결제 수단 · 이용 현황 · 해지
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, BottomSheet, Button, Card, Row, Screen, SectionHeader, StatGrid } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function Subscription() {
  const app = useApp();
  const [confirm, setConfirm] = useState(false);
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  const nextStr = `${next.getFullYear()}.${String(next.getMonth() + 1).padStart(2, '0')}.${String(next.getDate()).padStart(2, '0')}`;

  if (!app.subscribed) {
    return (
      <Screen title="구독 관리">
        <Text style={type.body}>이용 중인 구독이 없어요.</Text>
        <Button label="AI 추천 구독 알아보기" variant="accent" onPress={() => router.replace('/subscribe')} />
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="구독 관리"
        footer={
          <>
            <Button label="구독 해지" variant="danger" onPress={() => setConfirm(true)} />
            <Text style={[type.caption, { textAlign: 'center' }]}>해지해도 다음 결제일 전까지 PRO 기능을 이용할 수 있어요.</Text>
          </>
        }
      >
        <Card style={{ backgroundColor: colors.accentSoft, borderColor: colors.accentSoft }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={type.h2}>AI 추천 PRO</Text>
            <Badge label="이용 중" tone="pro" />
          </View>
          <Text style={type.sub}>월간 정기결제</Text>
        </Card>
        <View>
          <Row label="결제 금액" value={`월 ${won(PRICES.subscription)}`} />
          <Row label="다음 결제일" value={nextStr} />
          <Row label="결제 수단" value={app.payMethod} />
          <Row label="결제 내역" onPress={() => app.toast('프로토타입에서는 준비 중이에요')} />
        </View>
        <SectionHeader title="이번 달 이용 현황" />
        <StatGrid
          stats={[
            { value: `${app.usage.summaries}회`, label: 'AI 요약' },
            { value: `${app.usage.recs}개`, label: '맞춤 추천' },
            { value: `${app.usage.mannequin}회`, label: '마네킹' },
          ]}
        />
      </Screen>
      <BottomSheet visible={confirm} onClose={() => setConfirm(false)}>
        <Text style={type.h2}>구독을 해지할까요?</Text>
        <Text style={type.sub}>다음 결제일({nextStr})부터 청구되지 않아요. AI 옷장 요약과 마네킹 미리보기를 더 이상 쓸 수 없어요.</Text>
        <Button label="계속 이용하기" onPress={() => setConfirm(false)} />
        <Button
          label="해지하기"
          variant="danger"
          onPress={() => { app.unsubscribe(); setConfirm(false); app.toast('구독을 해지했어요'); router.back(); }}
        />
      </BottomSheet>
    </View>
  );
}
