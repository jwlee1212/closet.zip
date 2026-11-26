// 20 내 옷장 관리 (여러 옷장) — 유형 뱃지 · 조회수 · 팔로워 · 링크 클릭
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, InfoBox, Screen, SectionHeader, StatGrid, TextAction, typeTone } from '@/components/ui';
import { compact } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

// 비즈니스 통계는 MVP 이후 기능 — 프로토타입에서는 옷장별 고정 목업 수치를 쓴다
const mockStats = (i: number) => ({ views: [5100, 4800, 2500, 1200][i % 4], followers: [1800, 900, 500, 200][i % 4], clicks: [120, 80, 860, 40][i % 4] });

export default function Closets() {
  const app = useApp();
  const add = () => router.push(app.myClosets.length < app.closetSlots ? '/new-closet' : '/expand');
  const totals = app.myClosets.reduce(
    (acc, _c, i) => { const m = mockStats(i); return { v: acc.v + m.views, f: acc.f + m.followers, l: acc.l + m.clicks }; },
    { v: 0, f: 0, l: 0 },
  );

  return (
    <Screen title="내 옷장 관리" right={<TextAction label="추가" onPress={add} />} footer={<Button label="+ 옷장 추가하기" onPress={add} />}>
      <StatGrid stats={[{ value: compact(totals.v), label: '조회수' }, { value: compact(totals.f), label: '팔로워' }, { value: compact(totals.l), label: '링크 클릭' }]} />
      <SectionHeader title={`내 옷장 ${app.myClosets.length} / ${app.closetSlots}`} />
      {app.myClosets.map((c, i) => {
        const m = mockStats(i);
        const active = c.id === app.activeClosetId;
        return (
          <Pressable
            key={c.id}
            style={[styles.row, active && { borderColor: colors.primary }]}
            onPress={() => { app.setActiveCloset(c.id); router.navigate('/closet'); }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={type.h3}>{c.name}</Text>
                <Badge label={c.type} tone={typeTone(c.type)} />
                {active && <Badge label="사용 중" tone="outline" />}
              </View>
              <Text style={type.sub}>
                테마 {c.theme} · 옷 {c.items.length}/{c.capacity} · {c.type === '광고' ? `링크 클릭 ${m.clicks}` : `조회 ${compact(m.views)}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        );
      })}
      <InfoBox>옷장마다 테마가 달라 탐방에서 각각 노출돼요.</InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16 },
});
