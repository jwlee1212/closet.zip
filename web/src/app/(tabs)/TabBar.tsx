'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Shirt, Sparkles, User } from 'lucide-react';

const TABS = [
  { href: '/explore', label: '탐방', icon: Compass },
  { href: '/ai', label: 'AI 추천', icon: Sparkles },
  { href: '/closet', label: '내 옷장', icon: Shirt },
  { href: '/my', label: '마이', icon: User },
] as const;

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-16 max-w-[430px] border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ href, label, icon: Icon }) => {
        const on = path === href;
        return (
          <Link key={href} href={href} className={`flex flex-1 flex-col items-center justify-center gap-0.5 ${on ? 'text-ink' : 'text-muted'}`}>
            <Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
            <span className="text-[11px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
