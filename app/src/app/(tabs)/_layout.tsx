import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

const icon = (name: keyof typeof Ionicons.glyphMap, active: keyof typeof Ionicons.glyphMap) =>
  ({ focused, color }: { focused: boolean; color: ColorValue }) => <Ionicons name={focused ? active : name} size={22} color={color as string} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="explore" options={{ title: '탐방', tabBarIcon: icon('compass-outline', 'compass') }} />
      <Tabs.Screen name="ai" options={{ title: 'AI 추천', tabBarIcon: icon('sparkles-outline', 'sparkles') }} />
      <Tabs.Screen name="closet" options={{ title: '내 옷장', tabBarIcon: icon('shirt-outline', 'shirt') }} />
      <Tabs.Screen name="my" options={{ title: '마이', tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
