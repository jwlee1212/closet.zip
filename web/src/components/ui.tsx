'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, Heart, Info, User, X, type LucideIcon } from 'lucide-react';
import { Closet, ClosetType, ClothingItem, compact } from '@/data/mock';
import { ClosetCover, ClothThumb } from './ClothArt';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ───────── 레이아웃 ───────── */

export function Page({
  title, large, left = 'back', right, children, footer, tabbed, overlay, className,
}: {
  title?: string;
  large?: boolean;
  left?: 'back' | 'close' | 'none';
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** 하단 탭바가 있는 화면 */
  tabbed?: boolean;
  /** 바텀시트처럼 화면 전체를 덮는 요소 */
  overlay?: React.ReactNode;
  className?: string;
}) {
  const bottomPad = footer ? (tabbed ? 'pb-48' : 'pb-36') : tabbed ? 'pb-28' : 'pb-12';
  return (
    <div className="flex min-h-dvh flex-col">
      {title !== undefined && <AppBar title={title} large={large} left={left} right={right} />}
      <main className={cx('stagger flex flex-1 flex-col gap-5 px-5 pt-2', bottomPad, className)}>{children}</main>
      {footer && (
        // 하단 고정 버튼: 위로 갈수록 투명해지는 그라데이션으로 본문과 자연스럽게 이어진다
        <div className={cx('fixed inset-x-0 z-20 mx-auto flex max-w-[390px] flex-col gap-2 bg-gradient-to-t from-paper from-70% to-paper/0 px-5 pt-6 pb-4', tabbed ? 'bottom-16' : 'bottom-0')}>
          {footer}
        </div>
      )}
      {overlay}
    </div>
  );
}

export function useGoBack() {
  const router = useRouter();
  return () => (window.history.length > 1 ? router.back() : router.push('/ai'));
}

export function AppBar({ title, large, left = 'back', right }: {
  title: string; large?: boolean; left?: 'back' | 'close' | 'none'; right?: React.ReactNode;
}) {
  const goBack = useGoBack();
  return (
    <header className={cx('sticky top-0 z-10 flex items-center bg-paper/90 px-3 backdrop-blur-md', large ? 'h-16 pt-2' : 'h-14')}>
      <div className={cx('flex items-center', large && left === 'none' ? 'w-2' : 'w-14')}>
        {left !== 'none' && (
          <button onClick={goBack} aria-label={left === 'back' ? '뒤로' : '닫기'} className="pressable -m-2 rounded-full p-2 active:bg-surface">
            {left === 'back' ? <ChevronLeft size={26} /> : <X size={24} />}
          </button>
        )}
      </div>
      <h1 className={cx('flex-1 truncate', large ? 'text-[26px] font-bold tracking-[-0.02em]' : 'text-center text-[17px] font-semibold tracking-[-0.01em]')}>
        {title}
      </h1>
      <div className="flex w-14 items-center justify-end">{right}</div>
    </header>
  );
}

export function TextAction({ label, onClick, href, muted }: { label: string; onClick?: () => void; href?: string; muted?: boolean }) {
  const cls = cx('pressable rounded-lg px-1 text-[15px] font-semibold whitespace-nowrap', muted ? 'text-muted' : 'text-ink');
  return href ? <Link href={href} className={cls}>{label}</Link> : <button onClick={onClick} className={cls}>{label}</button>;
}

/* ───────── 버튼 · 칩 · 뱃지 ───────── */

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'kakao' | 'accent' | 'danger';
const btnStyle: Record<BtnVariant, string> = {
  primary: 'bg-ink text-white',
  secondary: 'bg-surface text-ink',
  outline: 'bg-white text-ink border border-line',
  kakao: 'bg-kakao text-[#191600]',
  accent: 'bg-accent text-white',
  danger: 'bg-white text-danger border border-[#F1C7C7]',
};

export function Button({
  label, onClick, href, variant = 'primary', icon: Icon, disabled, pro, className, type = 'button',
}: {
  label: string; onClick?: () => void; href?: string; variant?: BtnVariant; icon?: LucideIcon;
  disabled?: boolean; pro?: boolean; className?: string; type?: 'button' | 'submit';
}) {
  const cls = cx(
    'pressable flex h-14 w-full items-center justify-center gap-1.5 rounded-2xl px-4 text-[17px] font-semibold tracking-[-0.01em]',
    btnStyle[variant], disabled && 'pointer-events-none opacity-30', className,
  );
  const body = (
    <>
      {Icon && <Icon size={18} className="shrink-0" />}
      <span className="truncate whitespace-nowrap">{label}</span>
      {pro && <Badge label="PRO" tone="pro" className="ml-1" />}
    </>
  );
  return href
    ? <Link href={href} onClick={onClick} className={cls}>{body}</Link>
    : <button type={type} onClick={onClick} disabled={disabled} className={cls}>{body}</button>;
}

export function ButtonPair({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2.5">{children}</div>;
}

export function Chip({ label, selected, onClick, small }: { label: string; selected?: boolean; onClick?: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cx(
        'shrink-0 rounded-full font-semibold whitespace-nowrap transition-colors duration-200',
        small ? 'h-7 px-3 text-[13px]' : 'h-9 px-4 text-[14px]',
        selected ? 'bg-ink text-white' : 'bg-surface text-sub',
        onClick ? 'pressable' : 'cursor-default',
      )}
    >
      {label}
    </button>
  );
}

export function ChipRow({ items, value, onChange, wrap }: {
  items: readonly string[]; value: string | string[]; onChange?: (v: string) => void; wrap?: boolean;
}) {
  const sel = (x: string) => (Array.isArray(value) ? value.includes(x) : value === x);
  const chips = items.map((x) => <Chip key={x} label={x} selected={sel(x)} onClick={onChange ? () => onChange(x) : undefined} />);
  if (wrap) return <div className="flex flex-wrap gap-2">{chips}</div>;
  return <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">{chips}</div>;
}

type Tone = 'neutral' | 'pro' | 'influencer' | 'brand' | 'ad' | 'success' | 'outline';
const badgeStyle: Record<Tone, string> = {
  neutral: 'bg-surface-strong text-sub border-surface-strong',
  pro: 'bg-sand text-ink border-sand',
  influencer: 'bg-accent-soft text-[#6b5a43] border-accent-soft',
  brand: 'bg-[#FFF1DC] text-[#9A5B00] border-[#FFF1DC]',
  ad: 'bg-[#FFE7E0] text-[#B23B16] border-[#FFE7E0]',
  success: 'bg-[#E3F5EA] text-[#1F7A45] border-[#E3F5EA]',
  outline: 'bg-white text-sub border-line',
};
export function Badge({ label, tone = 'neutral', className }: { label: string; tone?: Tone; className?: string }) {
  return (
    <span className={cx('inline-flex h-[22px] shrink-0 items-center self-start rounded-full border px-2 text-[11px] font-bold whitespace-nowrap', badgeStyle[tone], className)}>
      {label}
    </span>
  );
}
export const typeTone = (t: ClosetType): Tone => (t === '인플루언서' ? 'influencer' : t === '브랜드' ? 'brand' : t === '광고' ? 'ad' : 'neutral');

/* ───────── 목록 요소 ───────── */

export function Row({ label, value, onClick, href, danger }: {
  label: string; value?: string; onClick?: () => void; href?: string; danger?: boolean;
}) {
  const inner = (
    <>
      <span className={cx('text-[16px] tracking-[-0.01em]', danger ? 'text-danger' : 'text-ink')}>{label}</span>
      <span className="flex min-w-0 items-center gap-1">
        {value !== undefined && <span className="truncate text-[15px] text-sub">{value}</span>}
        {(onClick || href) && <ChevronRight size={18} className="shrink-0 text-muted" />}
      </span>
    </>
  );
  const cls = '-mx-2 flex min-h-14 w-[calc(100%+16px)] items-center justify-between gap-3 rounded-xl px-2 text-left';
  if (href) return <Link href={href} className={cx(cls, 'pressable-soft pressable active:bg-surface')}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={cx(cls, 'pressable-soft pressable active:bg-surface')}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <h2 className="text-[20px] font-bold tracking-[-0.02em]">{title}</h2>
      {action && href && <Link href={href} className="pressable text-[14px] font-medium text-sub">{action}</Link>}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-2 text-[17px] font-bold tracking-[-0.01em]">{children}</h3>;
}

export function InfoBox({ children, icon: Icon = Info, tone = 'neutral' }: { children: React.ReactNode; icon?: LucideIcon; tone?: 'neutral' | 'accent' }) {
  const accent = tone === 'accent';
  return (
    <div className={cx('flex gap-2.5 rounded-2xl p-4 text-[14px] leading-[21px]', accent ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-sub')}>
      <Icon size={18} className={cx('mt-px shrink-0', accent ? 'text-accent' : 'text-muted')} />
      <p>{children}</p>
    </div>
  );
}

export function ProgressBar({ value, max, tone = 'primary' }: { value: number; max: number; tone?: 'primary' | 'accent' | 'danger' }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const c = tone === 'accent' ? 'bg-accent' : tone === 'danger' ? 'bg-danger' : 'bg-ink';
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-strong">
      <div className={cx('animate-grow h-2 rounded-full transition-[width] duration-700 ease-out', c)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({ size = 28, label }: { size?: number; label?: string }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-surface-strong text-sub" style={{ width: size, height: size }}>
      {label ? <span className="font-bold" style={{ fontSize: size * 0.4 }}>{label}</span> : <User size={size * 0.5} className="text-muted" fill="currentColor" />}
    </span>
  );
}

const cardTone = { default: 'border-white bg-white', muted: 'border-surface bg-surface', accent: 'border-accent-soft bg-accent-soft' };
export function Card({ children, className, onClick, href, tone = 'default' }: {
  children: React.ReactNode; className?: string; onClick?: () => void; href?: string; tone?: keyof typeof cardTone;
}) {
  const cls = cx('flex flex-col gap-3 rounded-[20px] border p-5 text-left', cardTone[tone], (onClick || href) && 'pressable pressable-soft', className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{children}</button>;
  return <div className={cls}>{children}</div>;
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span className={cx('flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200', on ? 'border-ink bg-ink' : 'border-surface-strong')}>
      {on && <Check size={14} className="animate-pop text-white" strokeWidth={3} />}
    </span>
  );
}

export function OptionCard({ title, desc, right, selected, onClick, extra }: {
  title: string; desc: string; right?: string; selected: boolean; onClick: () => void; extra?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={cx('pressable pressable-soft flex items-center gap-3.5 rounded-[20px] border-2 bg-white p-4 text-left', selected ? 'border-ink' : 'border-white')}>
      <Radio on={selected} />
      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-semibold">{title}</span>
        {extra}
        <span className="text-[13px] text-sub">{desc}</span>
      </span>
      {right && <span className="text-sm font-semibold whitespace-nowrap">{right}</span>}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (t: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-medium text-sub">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 rounded-2xl border-2 border-surface bg-surface px-4 text-[17px] outline-none transition-colors placeholder:text-muted focus:border-ink focus:bg-white"
      />
    </label>
  );
}

export function StatGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((st) => (
        <div key={st.label} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white py-4">
          <span className="text-[20px] font-bold tracking-[-0.02em]">{st.value}</span>
          <span className="text-xs text-muted">{st.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── 도메인 컴포넌트 ───────── */

export function ItemGrid({ items, hrefFor, onPick, renderBadge }: {
  items: ClothingItem[];
  hrefFor?: (i: ClothingItem) => string;
  onPick?: (i: ClothingItem) => void;
  renderBadge?: (i: ClothingItem) => React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {items.map((it) => {
        const inner = (
          <>
            <ClothThumb item={it} height={120} />
            {renderBadge?.(it)}
            {it.wornPhoto && <span className="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-medium text-white">착용샷</span>}
            <span className="mt-1 block truncate text-xs text-sub">{it.category} · {it.color}</span>
          </>
        );
        return onPick ? (
          <button key={it.id} onClick={() => onPick(it)} className="pressable relative text-left">{inner}</button>
        ) : (
          <Link key={it.id} href={hrefFor?.(it) ?? `/item/${it.id}`} className="pressable relative">{inner}</Link>
        );
      })}
    </div>
  );
}

export function ClosetCard({ closet, href, liked, onLike }: { closet: Closet; href: string; liked?: boolean; onLike?: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Link href={href} className="pressable pressable-soft overflow-hidden rounded-[20px]"><ClosetCover items={closet.items} height={260} /></Link>
      <div className="flex items-center gap-2.5">
        <Avatar size={28} />
        <Link href={href} className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{closet.name}</p>
          <p className="text-xs text-muted">테마 {closet.theme} · 옷 {closet.items.length}벌 · ♡ {compact(closet.likes + (liked ? 1 : 0))}</p>
        </Link>
        <Badge label={closet.type} tone={typeTone(closet.type)} />
        {onLike && (
          <button onClick={onLike} aria-label="관심 옷장" className="pressable rounded-full p-1.5 active:bg-surface">
            <Heart key={String(liked)} size={22} className={liked ? 'animate-pop fill-danger text-danger' : 'text-muted'} />
          </button>
        )}
      </div>
    </div>
  );
}

/** 바텀시트 — 폰 폭 컬럼 안에서 아래에서 올라온다 */
export function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 mx-auto max-w-[390px]" role="dialog" aria-modal>
      <button aria-label="닫기" onClick={onClose} className="animate-fade absolute inset-0 bg-black/45" />
      <div className="animate-sheet absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-[28px] bg-paper p-6 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
        <span className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-surface-strong" />
        {children}
      </div>
    </div>
  );
}

/** 선택지 바텀시트 (속성 수정, 결제 수단 등) */
export function PickerSheet({ open, title, options, value, onPick, onClose }: {
  open: boolean; title: string; options: readonly string[]; value?: string; onPick: (v: string) => void; onClose: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="mb-1 text-[20px] font-bold tracking-[-0.02em]">{title}</h2>
      <div className="max-h-[360px] overflow-y-auto">
        {options.map((o) => (
          <button key={o} onClick={() => { onPick(o); onClose(); }} className="pressable pressable-soft flex h-14 w-full items-center justify-between rounded-xl px-2 text-left active:bg-surface">
            <span className={cx('text-[16px]', o === value && 'font-bold')}>{o}</span>
            {o === value && <Check size={20} className="animate-pop" />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

export function Toast({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] mx-auto flex max-w-[390px] justify-center px-6">
      <div key={message} className="animate-toast rounded-2xl bg-ink/92 px-5 py-3.5 text-center text-[14px] font-medium text-white shadow-lg backdrop-blur">{message}</div>
    </div>
  );
}
