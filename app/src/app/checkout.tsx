// 13 구독 결제 — 월간 정기결제 · 결제 수단 · 자동 갱신 동의
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, PickerSheet, Row, Screen } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

const METHODS = ['신용카드 (****1234)', '카카오페이', '네이버페이', '토스페이'];
const fmt = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;

export default function Checkout() {
  const app = useApp();
  const [agree, setAgree] = useState(false);
  const [picker, setPicker] = useState(false);
  const [paying, setPaying] = useState(false);
  const today = new Date();
  const next = new Date(today);
  next.setMonth(next.getMonth() + 1);

  // TODO(백엔드): 결제 대행(PG) 정기결제 연동. 프로토타입은 결제 성공으로 처리
  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      app.subscribe();
      app.toast('AI 추천 PRO 구독을 시작했어요');
      router.dismissAll();
      router.navigate('/ai');
    }, 900);
  };

  return (
    <Screen
      overlay={
        <PickerSheet visible={picker} title="결제 수단" options={METHODS} value={app.payMethod} onPick={(v) => app.patch({ payMethod: v })} onClose={() => setPicker(false)} />
      }
      title="구독 결제"
      footer={
        <Button
          label={paying ? '결제 중…' : `월 ${won(PRICES.subscription)} 결제하기`}
          disabled={!agree || paying}
          onPress={pay}
        />
      }
    >
      <View style={styles.plan}>
        <View style={{ flex: 1 }}>
          <Text style={type.h3}>AI 추천 PRO · 월간</Text>
          <Text style={type.sub}>매월 자동 결제 · 언제든 해지</Text>
        </View>
        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
      </View>
      <View>
        <Row label="결제 금액" value={`월 ${won(PRICES.subscription)}`} />
        <Row label="첫 결제일" value={fmt(today)} />
        <Row label="다음 결제일" value={fmt(next)} />
        <Row label="결제 수단" value={app.payMethod} onPress={() => setPicker(true)} />
      </View>
      <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} onPress={() => setAgree(!agree)}>
        <Ionicons name={agree ? 'checkbox' : 'square-outline'} size={22} color={agree ? colors.primary : colors.muted} />
        <Text style={type.body}>정기결제 및 자동 갱신에 동의합니다 (필수)</Text>
      </Pressable>
      <Text style={type.caption}>해지하면 다음 결제일부터 청구되지 않고, 남은 기간까지 이용할 수 있어요.</Text>
      {paying && <ActivityIndicator color={colors.accent} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.lg, padding: 16 },
});
