import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { AppProvider } from '@/state/AppState';
import { GlobalToast } from '@/components/GlobalToast';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '내 옷장 — 내 옷으로 만드는 코디', template: '%s · 내 옷장' },
  description: '등록된 내 옷장을 바탕으로 AI가 오늘의 코디를 추천합니다. 다른 사람의 공개 옷장도 구경해 보세요.',
  openGraph: { siteName: '내 옷장', locale: 'ko_KR', type: 'website' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-ink text-2xl text-white">👕</div>
      <p className="text-sm text-muted">내 옷장을 불러오는 중…</p>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        {/* 모바일 우선: 데스크톱에서는 가운데 폰 폭 컬럼으로 보여준다 */}
        <div className="relative mx-auto min-h-dvh max-w-[390px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]">
          <Suspense fallback={<Splash />}>
            <AppProvider>
              {children}
              <GlobalToast />
            </AppProvider>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
