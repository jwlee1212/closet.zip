// 03 나의 추구미 설정 (최초 튜토리얼 · AI 추천 홈에서 변경)
import React, { useState } from 'react';
import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, ChipRow, InfoBox, Label, Screen, TextAction } from '@/components/ui';
import { CATEGORIES, Category, STYLES, Style } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function StyleSetup() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const editing = mode === 'edit';
  const app = useApp();
  const [styles, setStyles] = useState<Style[]>(editing ? app.styles : []);
  const [cats, setCats] = useState<Category[]>(editing ? app.interests : []);

  const toggleStyle = (v: string) => {
    const st = v as Style;
    if (styles.includes(st)) setStyles(styles.filter((x) => x !== st));
    else if (styles.length < 3) setStyles([...styles, st]);
    else app.toast('추구미는 최대 3개까지 고를 수 있어요');
  };
  const toggleCat = (v: string) => {
    const c = v as Category;
    setCats(cats.includes(c) ? cats.filter((x) => x !== c) : [...cats, c]);
  };
  const done = () => {
    app.setPrefs(styles.length ? styles : app.styles, cats.length ? cats : app.interests);
    if (editing) {
      app.toast('추구미를 바꿨어요. 다음 추천부터 반영돼요');
      router.back();
    } else router.replace('/explore');
  };

  return (
    <Screen
      title="나의 추구미"
      right={!editing ? <TextAction label="건너뛰기" color={colors.sub} onPress={() => router.replace('/explore')} /> : undefined}
      footer={<Button label={editing ? '저장하기' : '완료하고 시작하기'} onPress={done} disabled={styles.length === 0} />}
    >
      <Label>
        닮고 싶은 스타일을 골라주세요 <Text style={type.caption}>(최대 3개 · {styles.length}/3)</Text>
      </Label>
      <ChipRow items={STYLES} value={styles} onChange={toggleStyle} wrap />
      <Label>관심 카테고리</Label>
      <ChipRow items={CATEGORIES} value={cats} onChange={toggleCat} wrap />
      <InfoBox icon="sparkles-outline" tone="accent">
        AI 추천 구독을 시작하면 추구미와 카테고리에 맞는 옷장을 요약해서 추천해 드려요.
      </InfoBox>
    </Screen>
  );
}
