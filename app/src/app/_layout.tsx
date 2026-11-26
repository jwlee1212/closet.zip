import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '@/state/AppState';
import { colors } from '@/theme';

function Toast() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return (
    <View pointerEvents="none" style={styles.toastWrap}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </View>
    </View>
  );
}

/** 웹 미리보기에서는 390px 폰 프레임 안에 렌더링 */
function Frame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.webBg}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Frame>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="subscribe" options={{ presentation: 'modal' }} />
            <Stack.Screen name="expand" options={{ presentation: 'modal' }} />
          </Stack>
          <Toast />
        </Frame>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webBg: { flex: 1, backgroundColor: '#E8E6E1', alignItems: 'center', justifyContent: 'center' },
  phone: {
    width: '100%', maxWidth: 390, height: '100%', maxHeight: 844, backgroundColor: colors.bg, overflow: 'hidden',
    borderRadius: 28, boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 100, alignItems: 'center', zIndex: 100 },
  toast: { backgroundColor: 'rgba(23,23,23,0.92)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, maxWidth: '86%' },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
