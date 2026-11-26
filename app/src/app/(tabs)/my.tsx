// 21 마이페이지
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Avatar, Badge, Card, Row, Screen, TextAction } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { colors, type } from '@/theme';

export default function My() {
  const app = useApp();
  const soon = () => app.toast('프로토타입에서는 준비 중인 메뉴예요');
  return (
    <Screen title="마이" large left="none" tabScreen right={<TextAction label="설정" onPress={soon} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar size={64} label="재" />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={type.h2}>{app.loggedIn ? '이재우' : '게스트'}</Text>
            {app.subscribed && <Badge label="PRO" tone="pro" />}
          </View>
          <Text style={type.sub}>@jaewoo · {app.styles.join(' · ')}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Card style={styles.half} onPress={() => router.push(app.subscribed ? '/subscription' : '/subscribe')}>
          <Text style={type.h3}>{app.subscribed ? 'AI 추천 PRO' : '무료 이용 중'}</Text>
          <Text style={type.sub}>{app.subscribed ? '구독 관리 ›' : '구독 알아보기 ›'}</Text>
        </Card>
        <Card style={styles.half} onPress={() => router.push('/expand')}>
          <Text style={type.h3}>옷장 {app.myClosets.length} / {app.closetSlots}개</Text>
          <Text style={type.sub}>옷장 늘리기 ›</Text>
        </Card>
      </View>

      <View>
        <Row label="내 옷장 관리" value={`${app.myClosets.length}개`} onPress={() => router.push('/closets')} />
        <Row label="관심 옷장" value={`${app.liked.length}`} onPress={() => router.push('/library?kind=liked')} />
        <Row label="팔로잉" value={`${app.following.length}`} onPress={() => router.push('/library?kind=following')} />
        <Row label="저장한 착장" value={`${app.savedOutfits.length}`} onPress={() => router.push('/library?kind=outfits')} />
        <Row label="결제 내역" onPress={soon} />
        <Row label="알림 설정" onPress={soon} />
        <Row label="고객센터" onPress={soon} />
        <Row label="처음 화면으로 (데모 초기화)" danger onPress={() => { app.reset(); router.replace('/'); }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1, backgroundColor: colors.surface, borderColor: colors.surface, gap: 4 },
});
