// 04 탐방 홈 (공개 옷장 피드)
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChipRow, ClosetCard, Screen } from '@/components/ui';
import { PUBLIC_CLOSETS, STYLES, matchScore } from '@/data/mock';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

const SORTS = ['추천', '인기', '팔로잉', '최신'] as const;

export default function Explore() {
  const app = useApp();
  const [sort, setSort] = useState<(typeof SORTS)[number]>('추천');
  const [theme, setTheme] = useState('전체');
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    let l = PUBLIC_CLOSETS.filter((c) => theme === '전체' || c.theme === theme);
    if (q.trim()) l = l.filter((c) => `${c.name} ${c.theme} ${c.tags.join(' ')}`.includes(q.trim()));
    if (sort === '팔로잉') l = l.filter((c) => app.following.includes(c.id));
    const by = {
      추천: (a: typeof l[0], b: typeof l[0]) => matchScore(b, app.styles, app.interests) - matchScore(a, app.styles, app.interests),
      인기: (a: typeof l[0], b: typeof l[0]) => b.likes - a.likes,
      팔로잉: (a: typeof l[0], b: typeof l[0]) => a.updatedRank - b.updatedRank,
      최신: (a: typeof l[0], b: typeof l[0]) => a.updatedRank - b.updatedRank,
    }[sort];
    return [...l].sort(by);
  }, [sort, theme, q, app.following, app.styles, app.interests]);

  const mainStyle = app.styles[0] ?? '미니멀';
  const matchCount = PUBLIC_CLOSETS.filter((c) => matchScore(c, app.styles, app.interests) >= 80).length;

  return (
    <Screen
      title="탐방"
      large
      left="none"
      tabScreen
      right={
        <Pressable hitSlop={10} onPress={() => setSearching((v) => !v)}>
          <Ionicons name={searching ? 'close' : 'search'} size={22} color={colors.text} />
        </Pressable>
      }
    >
      {searching && (
        <TextInput
          autoFocus value={q} onChangeText={setQ} placeholder="옷장 이름, 테마, 키워드 검색"
          placeholderTextColor={colors.muted} style={styles.search}
        />
      )}
      <View style={{ gap: 8 }}>
        <ChipRow items={SORTS} value={sort} onChange={(v) => setSort(v as typeof sort)} />
        <ChipRow items={['전체', ...STYLES]} value={theme} onChange={setTheme} />
      </View>

      <Pressable
        style={styles.banner}
        onPress={() => router.push(app.subscribed ? '/ai' : '/subscribe')}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[type.h3, { fontSize: 14 }]}>
            AI 추천 · 내 추구미 &quot;{mainStyle}&quot;에 맞는 옷장 {matchCount}개
          </Text>
          <Text style={[type.caption, { color: colors.accent, fontWeight: '600' }]}>
            {app.subscribed ? '추천 보러 가기 ›' : '구독하고 확인하기 ›'}
          </Text>
        </View>
        <Ionicons name={app.subscribed ? 'sparkles' : 'lock-closed'} size={20} color={colors.accent} />
      </Pressable>

      {list.map((c) => (
        <ClosetCard
          key={c.id}
          closet={c}
          liked={app.liked.includes(c.id)}
          onLike={() => app.toggleLike(c.id)}
          onPress={() => router.push(`/closet/${c.id}`)}
        />
      ))}
      {list.length === 0 && (
        <Text style={[type.sub, { textAlign: 'center', marginTop: 40 }]}>
          {sort === '팔로잉' ? '팔로우한 옷장이 아직 없어요' : '조건에 맞는 옷장이 없어요'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.accentSoft,
    borderRadius: radius.lg, padding: 14,
  },
  search: { height: 44, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: 14, fontSize: 14, color: colors.text },
});
