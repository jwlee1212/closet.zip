// 19 새 옷장 만들기 — 이름 · 테마 1개 · 유형
import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, ChipRow, InfoBox, Input, Label, OptionCard, Screen } from '@/components/ui';
import { ClosetType, STYLES, Style } from '@/data/mock';
import { useApp } from '@/state/AppState';

const TYPES: { type: ClosetType; title: string; desc: string }[] = [
  { type: '일반', title: '일반', desc: '취미로 내 스타일 공유' },
  { type: '인플루언서', title: '셀프 브랜딩 · 인플루언서', desc: '인플루언서 뱃지 · 팔로워·조회 통계' },
  { type: '광고', title: '광고주 · 브랜드', desc: '브랜드 뱃지 · 구매 링크 · 노출 통계' },
];

export default function NewCloset() {
  const params = useLocalSearchParams<{ type?: string }>();
  const app = useApp();
  const used = new Set(app.myClosets.map((c) => c.theme));
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<Style>(STYLES.find((s) => !used.has(s)) ?? '클래식');
  const [kind, setKind] = useState<ClosetType>((params.type as ClosetType) ?? '인플루언서');
  const hasSlot = app.myClosets.length < app.closetSlots;

  const create = () => {
    if (!hasSlot) return router.replace('/expand');
    app.createCloset(name.trim() || `${theme} 옷장`, theme, kind);
    app.toast('새 옷장을 만들었어요');
    router.dismissTo('/closets');
  };

  return (
    <Screen title="새 옷장 만들기" footer={<Button label={hasSlot ? '옷장 만들기' : '옷장 슬롯 구매하기'} onPress={create} />}>
      <View style={{ flexDirection: 'row' }}>
        <Badge label={`추가 옷장 · 유료 슬롯 (${app.myClosets.length}/${app.closetSlots})`} tone="pro" />
      </View>
      <Input label="옷장 이름" value={name} onChangeText={setName} placeholder={`예: ${theme} 출근룩`} />
      <Label>테마 (1개)</Label>
      <ChipRow items={STYLES} value={theme} onChange={(v) => setTheme(v as Style)} wrap />
      {used.has(theme) && <InfoBox>이미 같은 테마의 옷장이 있어요. 탐방에서는 옷장마다 따로 노출돼요.</InfoBox>}
      <Label>옷장 유형</Label>
      {TYPES.map((t) => (
        <OptionCard key={t.type} title={t.title} desc={t.desc} selected={kind === t.type} onPress={() => setKind(t.type)} />
      ))}
    </Screen>
  );
}
