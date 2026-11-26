import React from 'react';
import {
  Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, radius, type } from '@/theme';
import { Closet, ClosetType, ClothingItem, compact } from '@/data/mock';
import { ClosetCover, ClothThumb } from './ClothArt';

/* ───────── 레이아웃 ───────── */

export function Screen({
  title, large, left = 'back', right, children, footer, scroll = true, tabScreen, contentStyle, overlay,
}: {
  title?: string;
  large?: boolean;
  left?: 'back' | 'close' | 'none';
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  tabScreen?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** 바텀시트처럼 푸터까지 덮어야 하는 요소 */
  overlay?: React.ReactNode;
}) {
  const body = scroll ? (
    <ScrollView contentContainerStyle={[s.content, contentStyle]} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[s.content, { flex: 1 }, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={s.screen} edges={tabScreen ? ['top'] : ['top', 'bottom']}>
      {title !== undefined && <AppBar title={title} large={large} left={left} right={right} />}
      <View style={{ flex: 1 }}>{body}</View>
      {footer && <View style={s.footer}>{footer}</View>}
      {overlay}
    </SafeAreaView>
  );
}

export function AppBar({ title, large, left = 'back', right }: {
  title: string; large?: boolean; left?: 'back' | 'close' | 'none'; right?: React.ReactNode;
}) {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/explore'));
  return (
    <View style={s.appbar}>
      <View style={s.appbarSide}>
        {left !== 'none' && (
          <Pressable hitSlop={10} onPress={goBack} accessibilityLabel={left === 'back' ? '뒤로' : '닫기'}>
            <Ionicons name={left === 'back' ? 'chevron-back' : 'close'} size={left === 'back' ? 26 : 24} color={colors.text} />
          </Pressable>
        )}
      </View>
      <Text numberOfLines={1} style={[large ? s.appbarTitleLarge : s.appbarTitle, large && { textAlign: 'left' }]}>
        {title}
      </Text>
      <View style={[s.appbarSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

export function TextAction({ label, onPress, color = colors.text }: { label: string; onPress?: () => void; color?: string }) {
  return (
    <Pressable hitSlop={8} onPress={onPress}>
      <Text style={{ fontSize: 14, fontWeight: '500', color }}>{label}</Text>
    </Pressable>
  );
}

/* ───────── 버튼 · 칩 · 뱃지 ───────── */

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'kakao' | 'accent' | 'danger';
export function Button({
  label, onPress, variant = 'primary', icon, disabled, pro, style,
}: {
  label: string; onPress?: () => void; variant?: BtnVariant; icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean; pro?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const v = btn[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.btn, v.box, disabled && { opacity: 0.35 }, pressed && { opacity: 0.8 }, style]}
    >
      {icon && <Ionicons name={icon} size={18} color={v.text.color} style={{ marginRight: 6 }} />}
      <Text style={[s.btnText, v.text]}>{label}</Text>
      {pro && <Badge label="PRO" tone="pro" style={{ marginLeft: 6, alignSelf: 'center' }} />}
    </Pressable>
  );
}

const btn: Record<BtnVariant, { box: ViewStyle; text: { color: string } }> = {
  primary: { box: { backgroundColor: colors.primary }, text: { color: colors.onPrimary } },
  secondary: { box: { backgroundColor: colors.surfaceStrong }, text: { color: colors.text } },
  outline: { box: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }, text: { color: colors.text } },
  kakao: { box: { backgroundColor: colors.kakao }, text: { color: '#191600' } },
  accent: { box: { backgroundColor: colors.accent }, text: { color: '#fff' } },
  danger: { box: { backgroundColor: colors.bg, borderWidth: 1, borderColor: '#F1C7C7' }, text: { color: colors.danger } },
};

export function ButtonPair({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', gap: 8 }}>{React.Children.map(children, (c) => <View style={{ flex: 1 }}>{c}</View>)}</View>;
}

export function Chip({ label, selected, onPress, small }: { label: string; selected?: boolean; onPress?: () => void; small?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[s.chip, small && s.chipSmall, selected && s.chipOn]}>
      <Text style={[s.chipText, selected && { color: colors.onPrimary }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ items, value, onChange, wrap, multi }: {
  items: readonly string[]; value: string | string[]; onChange?: (v: string) => void; wrap?: boolean; multi?: boolean;
}) {
  const sel = (x: string) => (multi || Array.isArray(value) ? (value as string[]).includes(x) : value === x);
  const chips = items.map((x) => <Chip key={x} label={x} selected={sel(x)} onPress={onChange ? () => onChange(x) : undefined} />);
  if (wrap) return <View style={s.wrap}>{chips}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }} style={{ flexGrow: 0, marginHorizontal: -16 }}>
      <View style={{ width: 10 }} />
      {chips}
      <View style={{ width: 10 }} />
    </ScrollView>
  );
}

type Tone = 'neutral' | 'pro' | 'influencer' | 'brand' | 'ad' | 'success' | 'outline';
export function Badge({ label, tone = 'neutral', style }: { label: string; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const t = badge[tone];
  return (
    <View style={[s.badge, { backgroundColor: t.bg, borderColor: t.border ?? t.bg }, style]}>
      <Text style={[s.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}
const badge: Record<Tone, { bg: string; fg: string; border?: string }> = {
  neutral: { bg: colors.surfaceStrong, fg: colors.sub },
  pro: { bg: colors.accent, fg: '#fff' },
  influencer: { bg: '#EEEDFD', fg: '#4440C9' },
  brand: { bg: '#FFF1DC', fg: '#9A5B00' },
  ad: { bg: '#FFE7E0', fg: '#B23B16' },
  success: { bg: '#E3F5EA', fg: '#1F7A45' },
  outline: { bg: colors.bg, fg: colors.sub, border: colors.border },
};
export const typeTone = (t: ClosetType): Tone => (t === '인플루언서' ? 'influencer' : t === '브랜드' ? 'brand' : t === '광고' ? 'ad' : 'neutral');

/* ───────── 목록 요소 ───────── */

export function Row({ label, value, onPress, chevron = !!onPress, danger }: {
  label: string; value?: string; onPress?: () => void; chevron?: boolean; danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surface }]}>
      <Text style={[type.body, danger && { color: colors.danger }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
        {value !== undefined && <Text numberOfLines={1} style={[type.sub, { textAlign: 'right' }]}>{value}</Text>}
        {chevron && <Ionicons name="chevron-forward" size={16} color={colors.muted} />}
      </View>
    </Pressable>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={type.h3}>{title}</Text>
      {action && <TextAction label={action} onPress={onAction} color={colors.sub} />}
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={[type.h3, { marginTop: 4 }]}>{children}</Text>;
}

export function InfoBox({ children, icon = 'information-circle-outline', tone = 'neutral' }: {
  children: React.ReactNode; icon?: keyof typeof Ionicons.glyphMap; tone?: 'neutral' | 'accent';
}) {
  const accent = tone === 'accent';
  return (
    <View style={[s.info, accent && { backgroundColor: colors.accentSoft }]}>
      <Ionicons name={icon} size={16} color={accent ? colors.accent : colors.sub} style={{ marginTop: 1 }} />
      <Text style={[type.sub, { flex: 1 }, accent && { color: '#3A37A8' }]}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ value, max, tone = 'primary' }: { value: number; max: number; tone?: 'primary' | 'accent' | 'danger' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const c = tone === 'accent' ? colors.accent : tone === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={s.track}>
      <View style={[s.bar, { width: `${pct * 100}%`, backgroundColor: c }]} />
    </View>
  );
}

export function Avatar({ size = 28, label }: { size?: number; label?: string }) {
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {label ? (
        <Text style={{ fontSize: size * 0.4, fontWeight: '700', color: colors.sub }}>{label}</Text>
      ) : (
        <Ionicons name="person" size={size * 0.5} color={colors.muted} />
      )}
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function Radio({ on }: { on: boolean }) {
  return (
    <View style={[s.radio, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
      {on && <Ionicons name="checkmark" size={14} color="#fff" />}
    </View>
  );
}

export function OptionCard({ title, desc, right, selected, onPress, extra }: {
  title: string; desc: string; right?: string; selected: boolean; onPress: () => void; extra?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={[s.option, selected && { borderColor: colors.primary, borderWidth: 1.5 }]}>
      <Radio on={selected} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={type.h3}>{title}</Text>
        {extra}
        <Text style={type.sub}>{desc}</Text>
      </View>
      {right && <Text style={[type.h3, { fontSize: 14 }]}>{right}</Text>}
    </Pressable>
  );
}

export function Input({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (t: string) => void; placeholder?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={type.h3}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={s.input} />
    </View>
  );
}

export function StatGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {stats.map((st) => (
        <View key={st.label} style={s.stat}>
          <Text style={[type.h2, { fontSize: 18 }]}>{st.value}</Text>
          <Text style={type.caption}>{st.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* ───────── 도메인 컴포넌트 ───────── */

export function ItemGrid({ items, onPress, renderBadge }: {
  items: ClothingItem[]; onPress?: (i: ClothingItem) => void; renderBadge?: (i: ClothingItem) => React.ReactNode;
}) {
  return (
    <View style={s.grid}>
      {items.map((it) => (
        <Pressable key={it.id} onPress={() => onPress?.(it)} style={s.gridCell}>
          <ClothThumb item={it} height={120} />
          {renderBadge?.(it)}
          <Text style={[type.caption, { color: colors.sub, marginTop: 4 }]} numberOfLines={1}>
            {it.category} · {it.color}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ClosetCard({ closet, onPress, liked, onLike }: {
  closet: Closet; onPress: () => void; liked?: boolean; onLike?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ gap: 10 }, pressed && { opacity: 0.85 }]}>
      <ClosetCover items={closet.items} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar size={28} />
        <View style={{ flex: 1 }}>
          <Text style={type.h3} numberOfLines={1}>{closet.name}</Text>
          <Text style={type.caption}>
            테마 {closet.theme} · 옷 {closet.items.length}벌 · ♡ {compact(closet.likes + (liked ? 1 : 0))}
          </Text>
        </View>
        <Badge label={closet.type} tone={typeTone(closet.type)} />
        {onLike && (
          <Pressable hitSlop={8} onPress={onLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? colors.danger : colors.muted} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

/** 화면 안쪽에 그리는 바텀시트 (웹 미리보기에서도 폰 프레임 안에 머무르도록 Modal 대신 오버레이 사용) */
export function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.dim }]} onPress={onClose} />
      <SafeAreaView edges={['bottom']} style={s.sheet}>
        <View style={s.handle} />
        {children}
      </SafeAreaView>
    </View>
  );
}

/** 선택지 바텀시트 (속성 수정, 결제 수단 등) */
export function PickerSheet({ visible, title, options, value, onPick, onClose }: {
  visible: boolean; title: string; options: readonly string[]; value?: string; onPick: (v: string) => void; onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[type.h2, { marginBottom: 8 }]}>{title}</Text>
      <ScrollView style={{ maxHeight: 360 }}>
        {options.map((o) => (
          <Pressable key={o} onPress={() => { onPick(o); onClose(); }} style={s.pickRow}>
            <Text style={[type.body, o === value && { fontWeight: '700' }]}>{o}</Text>
            {o === value && <Ionicons name="checkmark" size={18} color={colors.text} />}
          </Pressable>
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 28 },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 8, backgroundColor: colors.bg },
  appbar: { height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  appbarSide: { width: 56, justifyContent: 'center' },
  appbarTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: colors.text },
  appbarTitleLarge: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text, marginLeft: -52, letterSpacing: -0.4 },
  btn: { height: 50, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  btnText: { fontSize: 15, fontWeight: '600' },
  chip: { height: 32, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  chipSmall: { height: 28, paddingHorizontal: 10 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 7, height: 21, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  info: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceStrong, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  avatar: { backgroundColor: colors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, gap: 10 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14 },
  input: { height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 15, color: colors.text },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', gap: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCell: { width: '31.3%' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingTop: 10, gap: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 6 },
  pickRow: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
