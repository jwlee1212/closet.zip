// 01 스플래시 · 로그인
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { ClothGlyph } from '@/components/ClothArt';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function Login() {
  const { login } = useApp();
  const start = () => {
    login();
    router.push('/onboarding');
  };
  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="shirt-outline" size={48} color="#fff" />
        </View>
        <Text style={[type.hero, { fontSize: 32, marginTop: 20 }]}>내 옷장</Text>
        <Text style={[type.sub, { marginTop: 8, fontSize: 14 }]}>옷장을 올리고, 다른 사람의 옷장을 구경해요</Text>
        <View style={styles.strip}>
          {(['아우터', '상의', '하의', '신발'] as const).map((c, i) => (
            <View key={c} style={styles.stripCell}>
              <ClothGlyph category={c} color={['베이지', '네이비', '차콜', '화이트'][i]} size={46} />
            </View>
          ))}
        </View>
      </View>
      <View style={{ gap: 8, padding: 24 }}>
        <Button label="카카오로 시작하기" variant="kakao" icon="chatbubble" onPress={start} />
        <Button label="Google로 시작하기" variant="outline" icon="logo-google" onPress={start} />
        <Button label="이메일로 로그인" variant="secondary" icon="mail-outline" onPress={start} />
        <Pressable onPress={() => router.replace('/explore')} style={{ alignSelf: 'center', padding: 12 }}>
          <Text style={[type.sub, { textDecorationLine: 'underline' }]}>로그인 없이 둘러보기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  logo: { width: 96, height: 96, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', gap: 10, marginTop: 40 },
  stripCell: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
