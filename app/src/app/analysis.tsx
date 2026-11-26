// 09 AI 분석 결과 — 멀티모달 LLM 분석 → 속성 확인·수정 → 저장
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, InfoBox, PickerSheet, Row, Screen, TextAction } from '@/components/ui';
import { ClothGlyph } from '@/components/ClothArt';
import { CATEGORIES, COLORS, Category, KINDS, MATERIALS, SEASONS, itemName } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

type Attr = { category: Category; kind: string; color: string; material: string; season: string };

// TODO(백엔드): 이미지 업로드 후 멀티모달 LLM API(ChatGPT/Gemini/Claude 중 선정) 응답으로 교체
async function analyzeMock(sample: boolean): Promise<Attr & { confidence: number }> {
  await new Promise((r) => setTimeout(r, 1400));
  if (sample) return { category: '상의', kind: '맨투맨', color: '네이비', material: '코튼', season: '가을', confidence: 94 };
  const category = CATEGORIES[Math.floor(Math.random() * 4)];
  const kinds = KINDS[category];
  return {
    category,
    kind: kinds[Math.floor(Math.random() * kinds.length)],
    color: COLORS[Math.floor(Math.random() * 8)],
    material: MATERIALS[Math.floor(Math.random() * 5)],
    season: SEASONS[Math.floor(Math.random() * SEASONS.length)],
    confidence: 80 + Math.floor(Math.random() * 15),
  };
}

const FIELDS: { key: keyof Attr; label: string }[] = [
  { key: 'category', label: '카테고리' },
  { key: 'kind', label: '세부 종류' },
  { key: 'color', label: '색상' },
  { key: 'material', label: '소재' },
  { key: 'season', label: '시즌' },
];

export default function Analysis() {
  const app = useApp();
  const closet = app.activeCloset;
  const pending = app.pending;
  const [attr, setAttr] = useState<Attr | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [editing, setEditing] = useState<keyof Attr | null>(null);

  useEffect(() => {
    let alive = true;
    analyzeMock(!!pending?.sample).then(({ confidence: c, ...a }) => {
      if (alive) { setAttr(a); setConfidence(c); }
    });
    return () => { alive = false; };
  }, [pending]);

  const options = (k: keyof Attr): readonly string[] =>
    k === 'category' ? CATEGORIES : k === 'kind' ? KINDS[attr!.category] : k === 'color' ? COLORS : k === 'material' ? MATERIALS : SEASONS;

  const save = () => {
    if (!attr) return;
    const ok = app.addItem({ ...attr, photoUri: pending?.photoUri });
    if (!ok) { app.toast('옷장이 가득 찼어요'); return router.replace('/expand'); }
    app.setPending(undefined);
    app.toast(`${closet.name}에 저장했어요 (${closet.items.length + 1}/${closet.capacity})`);
    router.dismissTo('/closet');
  };

  if (!attr) {
    return (
      <Screen title="AI 분석" scroll={false}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={type.h3}>AI가 옷을 분석하고 있어요</Text>
          <Text style={type.sub}>종류 · 색상 · 소재 · 시즌을 추출하는 중</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      overlay={
        <PickerSheet
          visible={!!editing}
          title={FIELDS.find((f) => f.key === editing)?.label ?? ''}
          options={editing ? options(editing) : []}
          value={editing ? attr[editing] : undefined}
          onClose={() => setEditing(null)}
          onPick={(v) => {
            if (!editing) return;
            if (editing === 'category') setAttr({ ...attr, category: v as Category, kind: KINDS[v as Category][0] });
            else setAttr({ ...attr, [editing]: v });
          }}
        />
      }
      title="AI 분석 결과"
      right={<TextAction label="다시" onPress={() => router.back()} />}
      footer={<Button label="옷장에 저장" onPress={save} />}
    >
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <View style={styles.photo}>
          {pending?.photoUri
            ? <Image source={{ uri: pending.photoUri }} style={StyleSheet.absoluteFill} />
            : <ClothGlyph category={attr.category} color={attr.color} size={100} />}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          <Badge label={`AI 분석 완료 · ${confidence}%`} tone="success" />
          <Text style={type.h3}>{itemName(attr)}</Text>
          <Text style={type.sub}>분석된 속성은 직접 수정할 수 있어요</Text>
        </View>
      </View>

      <View>
        {FIELDS.map((f) => (
          <Row key={f.key} label={f.label} value={attr[f.key]} onPress={() => setEditing(f.key)} />
        ))}
      </View>
      <InfoBox>저장하면 {closet.name}이 {closet.items.length + 1} / {closet.capacity}벌이 돼요</InfoBox>

    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  photo: { width: 130, height: 150, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
