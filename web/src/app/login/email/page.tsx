'use client';
// 이메일 로그인 · 회원가입 (모의) — 입력 형식만 검사하고, 비밀번호는 어디에도 저장하지 않는다.
// TODO(백엔드): /api/auth/email 로 로그인·가입 요청, 이메일 인증 메일 발송

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Page } from '@/components/ui';
import { useApp } from '@/state/AppState';

type Mode = 'login' | 'signup';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailLogin() {
  const app = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    name: mode === 'signup' && !name.trim() ? '이름을 입력해 주세요' : '',
    email: !EMAIL_RE.test(email) ? '이메일 형식을 확인해 주세요' : '',
    password: password.length < 8 ? '비밀번호는 8자 이상이에요' : '',
  };
  const valid = !errors.name && !errors.email && !errors.password;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      const displayName = mode === 'signup' ? name.trim() : email.split('@')[0];
      app.login({ name: displayName, email, provider: 'email' });
      setPassword('');
      app.toast(mode === 'signup' ? '가입을 완료했어요' : '로그인했어요');
      router.replace(app.onboarded && mode === 'login' ? '/ai' : '/onboarding');
    }, 700);
  };

  const field = 'h-12 w-full rounded-xl border px-3.5 text-[15px] outline-none placeholder:text-muted focus:border-ink';
  const err = (msg: string) => (touched && msg ? <span className="text-xs text-danger">{msg}</span> : null);

  return (
    <Page title={mode === 'login' ? '이메일로 로그인' : '이메일로 가입하기'}>
      <div className="grid grid-cols-2 rounded-xl bg-surface p-1">
        {(['login', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setTouched(false); }}
            className={`h-10 rounded-lg text-sm font-semibold ${mode === m ? 'bg-white shadow-sm' : 'text-sub'}`}
          >
            {m === 'login' ? '로그인' : '회원가입'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        {mode === 'signup' && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[15px] font-semibold">이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="옷장에 보일 이름" className={`${field} ${touched && errors.name ? 'border-danger' : 'border-line'}`} />
            {err(errors.name)}
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">이메일</span>
          <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={`${field} ${touched && errors.email ? 'border-danger' : 'border-line'}`} />
          {err(errors.email)}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold">비밀번호</span>
          <span className="relative">
            <input
              type={show ? 'text' : 'password'}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
              className={`${field} pr-11 ${touched && errors.password ? 'border-danger' : 'border-line'}`}
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {err(errors.password)}
        </label>

        <Button type="submit" label={mode === 'login' ? '로그인' : '가입하고 시작하기'} disabled={loading} />
        {loading && <Loader2 size={22} className="animate-spin self-center text-muted" />}
        {mode === 'login' && (
          <button type="button" onClick={() => app.toast('데모에서는 비밀번호 찾기를 지원하지 않아요')} className="self-center text-[13px] text-sub underline">
            비밀번호를 잊으셨나요?
          </button>
        )}
      </form>

      <p className="text-xs leading-5 text-muted">데모 화면이에요. 형식만 맞으면 어떤 이메일로든 로그인되고, 비밀번호는 저장하거나 전송하지 않아요.</p>
    </Page>
  );
}
