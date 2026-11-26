// 08 옷 올리기
import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button, ButtonPair, InfoBox, ProgressBar, Screen } from '@/components/ui';
import { ClothGlyph } from '@/components/ClothArt';
import { useApp } from '@/state/AppState';
import { colors, radius, type } from '@/theme';

export default function Upload() {
  const app = useApp();
  const closet = app.activeCloset;
  const pending = app.pending;
  const left = closet.capacity - closet.items.length;

  const pick = async (camera: boolean) => {
    if (camera && Platform.OS !== 'web') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return app.toast('카메라 권한이 필요해요');
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 };
    const res = camera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled && res.assets[0]) app.setPending({ photoUri: res.assets[0].uri });
  };

  return (
    <Screen
      title="옷 올리기"
      footer={
        <Button
          label="AI로 분석하기"
          icon="sparkles"
          disabled={!pending}
          onPress={() => router.push('/analysis')}
        />
      }
    >
      <View style={styles.preview}>
        {pending?.photoUri ? (
          <Image source={{ uri: pending.photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : pending?.sample ? (
          <ClothGlyph category="상의" color="네이비" size={200} />
        ) : (
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Ionicons name="camera-outline" size={36} color={colors.muted} />
            <Text style={[type.sub, { textAlign: 'center' }]}>사진 미리보기{'\n'}옷 전체가 보이게 촬영해 주세요</Text>
          </View>
        )}
      </View>

      <ButtonPair>
        <Button label="카메라 촬영" icon="camera-outline" variant="outline" onPress={() => pick(true)} />
        <Button label="앨범에서 선택" icon="images-outline" variant="outline" onPress={() => pick(false)} />
      </ButtonPair>
      {!pending && (
        <Pressable onPress={() => app.setPending({ sample: true })} style={{ alignSelf: 'center' }}>
          <Text style={[type.sub, { textDecorationLine: 'underline' }]}>사진 없이 샘플로 체험하기</Text>
        </Pressable>
      )}

      <View style={styles.slot}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={type.h3}>{closet.name} · 남은 칸 {left}벌</Text>
          <Text style={type.sub}>{closet.items.length} / {closet.capacity}</Text>
        </View>
        <ProgressBar value={closet.items.length} max={closet.capacity} />
      </View>
      <InfoBox icon="bulb-outline">배경이 단순할수록 AI 분석이 정확해져요. 옷을 바닥에 펼치거나 옷걸이에 걸어 찍어 주세요.</InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    height: 300, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
  },
  slot: { gap: 10, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14 },
});
