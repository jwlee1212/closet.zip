'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Shirt, Sparkles, User } from 'lucide-react';

const TABS = [
  // AI 추천을 첫 탭에 둬서 로그인하자마자 구독(AI) 기능을 체감하게 한다
  { href: '/ai', label: 'AI 추천', icon: Sparkles },
  { href: '/explore', label: '탐방', icon: Compass },
  { href: '/closet', label: '내 옷장', icon: Shirt },
  { href: '/my', label: '마이', icon: User },
] as const;

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-16 max-w-[390px] border-t border-line/70 bg-paper/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const on = path === href;
        return (
          <Link key={href} href={href} className={`pressable flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-200 ${on ? 'text-ink' : 'text-muted'}`}>
            {/* 선택된 탭 아이콘은 들어올 때 살짝 튀어오른다 */}
            <Icon key={String(on)} size={23} strokeWidth={on ? 2.4 : 1.8} className={on ? 'animate-tab' : ''} />
            <span className="text-[11px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
