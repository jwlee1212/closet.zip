'use client';
// 21 마이페이지

import { useRouter } from 'next/navigation';
import { Avatar, Badge, Button, Card, Page, Row, TextAction } from '@/components/ui';
import { bodySummary } from '@/data/mock';
import { useApp } from '@/state/AppState';

export default function My() {
  const app = useApp();
  const router = useRouter();
  const soon = () => app.toast('데모에서는 준비 중인 메뉴예요');
  const user = app.loggedIn ? app.user : undefined;
  const providerLabel = { kakao: '카카오', google: 'Google', email: '이메일' } as const;
  return (
    <Page title="마이" large left="none" tabbed right={<TextAction label="설정" onClick={soon} />}>
      <div className="flex items-center gap-3.5">
        <Avatar size={64} label={user ? user.name.slice(0, 1) : undefined} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-lg font-bold">{user?.name ?? '게스트'}</span>
            {user && <Badge label={providerLabel[user.provider]} tone="outline" />}
            {app.subscribed && <Badge label="PRO" tone="pro" />}
          </div>
          <span className="truncate text-[13px] text-sub">
            {user ? `${user.email ?? '이메일 비공개'} · ${app.styles.join(' · ')}` : '로그인하면 옷장을 저장하고 공개할 수 있어요'}
          </span>
        </div>
      </div>
      {!user && <Button label="로그인 / 가입하기" href="/" />}

      <div className="grid grid-cols-2 gap-2">
        <Card href={app.subscribed ? '/subscription' : '/subscribe'} tone="muted" className="gap-1!">
          <span className="text-[15px] font-semibold">{app.subscribed ? 'AI 추천 PRO' : '무료 이용 중'}</span>
          <span className="text-[13px] text-sub">{app.subscribed ? '구독 관리 ›' : '구독 알아보기 ›'}</span>
        </Card>
        <Card href="/expand" tone="muted" className="gap-1!">
          <span className="text-[15px] font-semibold">옷장 {app.myClosets.length} / {app.closetSlots}개</span>
          <span className="text-[13px] text-sub">옷장 늘리기 ›</span>
        </Card>
      </div>

      <div>
        <Row label="내 옷장 관리" value={`${app.myClosets.length}개`} href="/closets" />
        <Row label="추구미 · 관심 카테고리" value={app.styles.join(' · ')} href="/style-setup?mode=edit" />
        <Row label="신체 정보" value={bodySummary(app.body) || '입력 안 함'} href="/body-spec?mode=edit" />
        <Row label="관심 옷장" value={`${app.liked.length}`} href="/library?kind=liked" />
        <Row label="팔로잉" value={`${app.following.length}`} href="/library?kind=following" />
        <Row label="저장한 착장" value={`${app.savedOutfits.length}`} href="/library?kind=outfits" />
        <Row label="결제 내역" onClick={soon} />
        <Row label="알림 설정" onClick={soon} />
        <Row label="고객센터" onClick={soon} />
        {user && <Row label="로그아웃" onClick={() => { app.logout(); app.toast('로그아웃했어요'); router.replace('/'); }} />}
        <Row label="처음 화면으로 (데모 초기화)" danger onClick={() => { app.reset(); router.replace('/'); }} />
      </div>
    </Page>
  );
}
