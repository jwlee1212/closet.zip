'use client';
// 01 스플래시 · 로그인

import Link from 'next/link';
import { Mail, MessageCircle, Shirt } from 'lucide-react';
import { Button } from '@/components/ui';

function GoogleIcon() {
  return <span className="text-base font-bold">G</span>;
}

export default function Login() {
  // 각 버튼은 모의 로그인 화면으로 이동한다 (src/app/login/)
  return (
    <div className="flex min-h-dvh flex-col justify-between">
      <div className="flex flex-1 flex-col items-center justify-center pt-10">
        <div className="flex size-24 items-center justify-center rounded-[28px] bg-ink text-white">
          <Shirt size={48} strokeWidth={1.6} />
        </div>
        <h1 className="mt-5 text-[32px] font-bold tracking-tight">내 옷장</h1>
        <p className="mt-2 text-sm text-sub">옷장을 올리고, 다른 사람의 옷장을 구경해요</p>
      </div>
      <div className="flex flex-col gap-2 p-6">
        <Button label="카카오로 시작하기" variant="primary" icon={MessageCircle} href="/login/kakao" />
        <Link href="/login/google" className="flex h-[50px] items-center justify-center gap-2 rounded-xl border border-line text-[15px] font-semibold">
          <GoogleIcon /> Google로 시작하기
        </Link>
        <Button label="이메일로 로그인" variant="secondary" icon={Mail} href="/login/email" />
        <Link href="/explore" className="self-center p-3 text-[13px] text-sub underline">로그인 없이 둘러보기</Link>
      </div>
    </div>
  );
}
