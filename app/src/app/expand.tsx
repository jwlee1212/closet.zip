// 18 옷장 늘리기 (유료) — 옷장 +1 / 옷 용량 +30 / 비즈니스 옷장 패키지
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Label, OptionCard, Screen } from '@/components/ui';
import { PRICES, won } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

type Opt = 'closet' | 'capacity' | 'business';

export default function Expand() {
  const app = useApp();
  const c = app.activeCloset;
  const [opt, setOpt] = useState<Opt>('closet');
  const price = { closet: `월 ${won(PRICES.closetPlusOne)}`, capacity: won(PRICES.capacityPlus30), business: `월 ${won(PRICES.businessPackage)}` }[opt];

  // TODO(백엔드): 결제 후 서버에서 슬롯·용량 상태를 갱신
  const pay = () => {
    if (opt === 'capacity') {
      app.addCapacity(30);
      app.toast(`${c.name} 용량이 ${c.capacity + 30}벌로 늘었어요`);
      router.back();
    } else {
      app.buySlots(opt === 'business' ? 3 : 1, opt === 'business');
      app.toast(opt === 'business' ? '비즈니스 옷장 3개가 열렸어요' : '옷장 슬롯 1개가 추가됐어요');
      router.replace(opt === 'business' ? '/new-closet?type=광고' : '/new-closet');
    }
  };

  return (
    <Screen title="옷장 늘리기" left="close" footer={<Button label={`${price} 결제하기`} onPress={pay} />}>
      <View style={styles.usage}>
        <Text style={type.h3}>현재 옷장 {app.myClosets.length} / {app.closetSlots}개</Text>
        <Text style={type.sub}>{c.name} · 옷 {c.items.length} / {c.capacity}벌</Text>
      </View>
      <Label>옵션 선택</Label>
      <OptionCard
        title="옷장 +1개" desc="새 테마 1개 · 옷 30벌" right={`월 ${won(PRICES.closetPlusOne)}`}
        selected={opt === 'closet'} onPress={() => setOpt('closet')}
      />
      <OptionCard
        title="옷 용량 +30벌" desc={`지금 옷장(${c.theme})에 30벌 추가`} right={won(PRICES.capacityPlus30)}
        selected={opt === 'capacity'} onPress={() => setOpt('capacity')}
      />
      <OptionCard
        title="비즈니스 옷장 패키지" desc="옷장 3개 · 유형 뱃지 · 구매 링크 · 노출 통계" right={`월 ${won(PRICES.businessPackage)}`}
        selected={opt === 'business'} onPress={() => setOpt('business')}
        extra={<Badge label="광고주·인플루언서" tone="brand" />}
      />
      <Text style={type.caption}>옷장 데이터가 쌓일수록 AI 추천이 정교해져요. 가격은 프로토타입 임시값이에요.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  usage: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, gap: 4 },
});
