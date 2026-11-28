'use client';
// 소셜 로그인 모의(Mock) 화면 — 카카오/Google OAuth 동의 단계를 흉내 낸다.
// 실제 로그인 페이지가 아니므로 비밀번호를 받지 않고, 화면에 "데모"임을 표시한다.
// TODO(백엔드): 실제 연동 시 이 화면 대신 각 제공자의 인가 URL로 리다이렉트 → /api/auth/callback/[provider] 에서 토큰 교환

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Check, ChevronLeft, Loader2, Shirt, UserRound } from 'lucide-react';
import { Button } from '@/components/ui';
import { useApp, type User } from '@/state/AppState';

type ProviderKey = 'kakao' | 'google';

const PROVIDERS: Record<ProviderKey, {
  label: string;
  headerClass: string;
  buttonVariant: 'kakao' | 'primary';
  accounts: { name: string; email: string }[];
  scopes: { key: string; label: string; required: boolean }[];
}> = {
  kakao: {
    label: '카카오',
    headerClass: 'bg-kakao text-[#191600]',
    buttonVariant: 'kakao',
    accounts: [
      { name: '이재우', email: 'jaewoo@example.com' },
      { name: '데모 사용자', email: 'demo.kakao@example.com' },
    ],
    scopes: [
      { key: 'nickname', label: '닉네임', required: true },
      { key: 'profile', label: '프로필 사진', required: true },
      { key: 'email', label: '카카오계정(이메일)', required: false },
    ],
  },
  google: {
    label: 'Google',
    headerClass: 'bg-paper text-ink border-b border-line',
    buttonVariant: 'primary',
    accounts: [
      { name: '이재우', email: 'jaewoo@example.com' },
      { name: 'Demo User', email: 'demo.google@example.com' },
    ],
    scopes: [
      { key: 'name', label: '이름', required: true },
      { key: 'email', label: '이메일 주소', required: true },
      { key: 'profile', label: '프로필 사진', required: false },
    ],
  },
};

export default function MockSocialLogin() {
  const { provider } = useParams<{ provider: string }>();
  const app = useApp();
  const router = useRouter();
  const cfg = PROVIDERS[provider as ProviderKey];
  const [account, setAccount] = useState(0);
  const [agreed, setAgreed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  if (!cfg) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-[15px] font-semibold">지원하지 않는 로그인 방식이에요</p>
        <Link href="/" className="text-sm text-sub underline">로그인 화면으로</Link>
      </div>
    );
  }

  const allOn = cfg.scopes.every((s) => agreed[s.key]);
  const requiredOn = cfg.scopes.filter((s) => s.required).every((s) => agreed[s.key]);
  const toggleAll = () => setAgreed(Object.fromEntries(cfg.scopes.map((s) => [s.key, !allOn])));

  const proceed = () => {
    setLoading(true);
    const acc = cfg.accounts[account];
    const user: User = {
      name: acc.name,
      email: agreed.email ? acc.email : undefined,
      provider: provider as ProviderKey,
    };
    // 인가 코드 → 토큰 교환 → 세션 발급에 걸리는 시간을 흉내
    setTimeout(() => {
      app.login(user);
      app.toast(`${cfg.label} 계정으로 로그인했어요`);
      router.replace(app.onboarded ? '/explore' : '/onboarding');
    }, 900);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className={`flex h-14 items-center gap-2 px-3 ${cfg.headerClass}`}>
        <button onClick={() => router.back()} aria-label="뒤로" className="-m-2 p-2"><ChevronLeft size={26} /></button>
        <span className="flex-1 text-[17px] font-bold">{cfg.label} 로그인</span>
        <span className="rounded-md bg-black/10 px-2 py-0.5 text-[11px] font-bold">데모</span>
      </header>

      <main className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-32">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-white"><Shirt size={24} /></span>
          <div>
            <p className="text-[17px] font-bold">내 옷장</p>
            <p className="text-[13px] text-sub">에서 {cfg.label} 계정 정보를 요청해요</p>
          </div>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-[13px] font-semibold text-sub">계정 선택</h2>
          {cfg.accounts.map((a, i) => (
            <button
              key={a.email}
              onClick={() => setAccount(i)}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left ${account === i ? 'border-ink ring-1 ring-ink' : 'border-line'}`}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-surface-strong text-sub"><UserRound size={20} /></span>
              <span className="flex flex-1 flex-col">
                <span className="text-[15px] font-semibold">{a.name}</span>
                <span className="text-xs text-muted">{a.email}</span>
              </span>
              {account === i && <Check size={18} />}
            </button>
          ))}
          <button onClick={() => app.toast('데모에서는 준비된 계정만 쓸 수 있어요')} className="self-start py-1 text-[13px] text-sub underline">
            다른 계정 사용
          </button>
        </section>

        <section className="flex flex-col gap-1 rounded-2xl bg-surface p-4">
          <button onClick={toggleAll} className="flex items-center gap-2.5 border-b border-line pb-3 text-left text-[15px] font-semibold">
            <CheckBox on={allOn} /> 전체 동의하기
          </button>
          {cfg.scopes.map((s) => (
            <button
              key={s.key}
              onClick={() => setAgreed({ ...agreed, [s.key]: !agreed[s.key] })}
              className="flex items-center gap-2.5 py-2 text-left text-sm"
            >
              <CheckBox on={!!agreed[s.key]} />
              <span className="flex-1">{s.label}</span>
              <span className={`text-xs ${s.required ? 'text-accent' : 'text-muted'}`}>{s.required ? '필수' : '선택'}</span>
            </button>
          ))}
        </section>

        <p className="text-xs leading-5 text-muted">
          이 화면은 프로토타입용 모의 로그인이에요. 실제 {cfg.label} 계정에 접속하지 않으며 어떤 정보도 외부로 보내지 않아요.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[390px] bg-paper/95 px-5 pt-2 pb-4 backdrop-blur">
        <Button label="동의하고 계속하기" variant={cfg.buttonVariant} disabled={!requiredOn || loading} onClick={proceed} />
      </div>

      {loading && (
        <div className="animate-fade fixed inset-0 z-50 mx-auto flex max-w-[390px] flex-col items-center justify-center gap-3 bg-paper/90">
          <Loader2 size={32} className="animate-spin text-ink" />
          <p className="text-sm text-sub">내 옷장으로 돌아가는 중…</p>
        </div>
      )}
    </div>
  );
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <span className={`flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px] ${on ? 'border-ink bg-ink' : 'border-line bg-white'}`}>
      {on && <Check size={13} strokeWidth={3} className="text-white" />}
    </span>
  );
}
