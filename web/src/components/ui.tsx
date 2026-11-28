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
  const bottomPad = footer ? (tabbed ? 'pb-44' : 'pb-32') : tabbed ? 'pb-24' : 'pb-10';
  return (
    <div className="flex min-h-dvh flex-col">
      {title !== undefined && <AppBar title={title} large={large} left={left} right={right} />}
      <main className={cx('flex flex-1 flex-col gap-4 px-4 pt-2', bottomPad, className)}>{children}</main>
      {footer && (
        <div className={cx('fixed inset-x-0 z-20 mx-auto flex max-w-[390px] flex-col gap-2 bg-white/95 px-4 pt-2 pb-3 backdrop-blur', tabbed ? 'bottom-16' : 'bottom-0')}>
          {footer}
        </div>
      )}
      {overlay}
    </div>
  );
}

export function useGoBack() {
  const router = useRouter();
  return () => (window.history.length > 1 ? router.back() : router.push('/explore'));
}

export function AppBar({ title, large, left = 'back', right }: {
  title: string; large?: boolean; left?: 'back' | 'close' | 'none'; right?: React.ReactNode;
}) {
  const goBack = useGoBack();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center bg-white/90 px-3 backdrop-blur">
      <div className={cx('flex items-center', large && left === 'none' ? 'w-1' : 'w-14')}>
        {left !== 'none' && (
          <button onClick={goBack} aria-label={left === 'back' ? '뒤로' : '닫기'} className="-m-2 p-2">
            {left === 'back' ? <ChevronLeft size={26} /> : <X size={24} />}
          </button>
        )}
      </div>
      <h1 className={cx('flex-1 truncate', large ? 'text-[22px] font-bold tracking-tight' : 'text-center text-[17px] font-semibold')}>
        {title}
      </h1>
      <div className="flex w-14 items-center justify-end">{right}</div>
    </header>
  );
}

export function TextAction({ label, onClick, href, muted }: { label: string; onClick?: () => void; href?: string; muted?: boolean }) {
  const cls = cx('text-sm font-medium whitespace-nowrap', muted ? 'text-sub' : 'text-ink');
  return href ? <Link href={href} className={cls}>{label}</Link> : <button onClick={onClick} className={cls}>{label}</button>;
}

/* ───────── 버튼 · 칩 · 뱃지 ───────── */

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'kakao' | 'accent' | 'danger';
const btnStyle: Record<BtnVariant, string> = {
  primary: 'bg-ink text-white',
  secondary: 'bg-surface-strong text-ink',
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
    'flex h-[50px] w-full items-center justify-center gap-1.5 rounded-xl px-4 text-[15px] font-semibold transition active:opacity-80',
    btnStyle[variant], disabled && 'pointer-events-none opacity-35', className,
  );
  const body = (
    <>
      {Icon && <Icon size={18} />}
      <span>{label}</span>
      {pro && <Badge label="PRO" tone="pro" className="ml-1" />}
    </>
  );
  return href
    ? <Link href={href} onClick={onClick} className={cls}>{body}</Link>
    : <button type={type} onClick={onClick} disabled={disabled} className={cls}>{body}</button>;
}

export function ButtonPair({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

export function Chip({ label, selected, onClick, small }: { label: string; selected?: boolean; onClick?: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cx(
        'shrink-0 rounded-full border text-[13px] font-medium whitespace-nowrap transition',
        small ? 'h-7 px-2.5' : 'h-8 px-3.5',
        selected ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink',
        !onClick && 'cursor-default',
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
  if (wrap) return <div className="flex flex-wrap gap-1.5">{chips}</div>;
  return <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">{chips}</div>;
}

type Tone = 'neutral' | 'pro' | 'influencer' | 'brand' | 'ad' | 'success' | 'outline';
const badgeStyle: Record<Tone, string> = {
  neutral: 'bg-surface-strong text-sub border-surface-strong',
  pro: 'bg-accent text-white border-accent',
  influencer: 'bg-accent-soft text-[#4440C9] border-accent-soft',
  brand: 'bg-[#FFF1DC] text-[#9A5B00] border-[#FFF1DC]',
  ad: 'bg-[#FFE7E0] text-[#B23B16] border-[#FFE7E0]',
  success: 'bg-[#E3F5EA] text-[#1F7A45] border-[#E3F5EA]',
  outline: 'bg-white text-sub border-line',
};
export function Badge({ label, tone = 'neutral', className }: { label: string; tone?: Tone; className?: string }) {
  return (
    <span className={cx('inline-flex h-[21px] shrink-0 items-center self-start rounded-md border px-1.5 text-[11px] font-bold whitespace-nowrap', badgeStyle[tone], className)}>
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
      <span className={cx('text-sm', danger && 'text-danger')}>{label}</span>
      <span className="flex min-w-0 items-center gap-1">
        {value !== undefined && <span className="truncate text-[13px] text-sub">{value}</span>}
        {(onClick || href) && <ChevronRight size={16} className="shrink-0 text-muted" />}
      </span>
    </>
  );
  const cls = 'flex min-h-12 w-full items-center justify-between gap-3 border-b border-line text-left';
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button onClick={onClick} className={cx(cls, 'active:bg-surface')}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

export function SectionHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="mt-1 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {action && href && <Link href={href} className="text-sm text-sub">{action}</Link>}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-1 text-[15px] font-semibold">{children}</h3>;
}

export function InfoBox({ children, icon: Icon = Info, tone = 'neutral' }: { children: React.ReactNode; icon?: LucideIcon; tone?: 'neutral' | 'accent' }) {
  const accent = tone === 'accent';
  return (
    <div className={cx('flex gap-2 rounded-xl p-3 text-[13px] leading-[18px]', accent ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-sub')}>
      <Icon size={16} className={cx('mt-px shrink-0', accent ? 'text-accent' : 'text-sub')} />
      <p>{children}</p>
    </div>
  );
}

export function ProgressBar({ value, max, tone = 'primary' }: { value: number; max: number; tone?: 'primary' | 'accent' | 'danger' }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const c = tone === 'accent' ? 'bg-accent' : tone === 'danger' ? 'bg-danger' : 'bg-ink';
  return (
    <div className="h-2 overflow-hidden rounded bg-surface-strong">
      <div className={cx('h-2 rounded transition-all', c)} style={{ width: `${pct}%` }} />
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

const cardTone = { default: 'border-line bg-white', muted: 'border-surface bg-surface', accent: 'border-accent-soft bg-accent-soft' };
export function Card({ children, className, onClick, href, tone = 'default' }: {
  children: React.ReactNode; className?: string; onClick?: () => void; href?: string; tone?: keyof typeof cardTone;
}) {
  const cls = cx('flex flex-col gap-2.5 rounded-2xl border p-3.5 text-left', cardTone[tone], (onClick || href) && 'transition active:opacity-85', className);
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  if (onClick) return <button onClick={onClick} className={cls}>{children}</button>;
  return <div className={cls}>{children}</div>;
}

export function Radio({ on }: { on: boolean }) {
  return (
    <span className={cx('flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px]', on ? 'border-ink bg-ink' : 'border-line')}>
      {on && <Check size={14} className="text-white" strokeWidth={3} />}
    </span>
  );
}

export function OptionCard({ title, desc, right, selected, onClick, extra }: {
  title: string; desc: string; right?: string; selected: boolean; onClick: () => void; extra?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={cx('flex items-center gap-3 rounded-2xl border p-3.5 text-left transition', selected ? 'border-ink ring-1 ring-ink' : 'border-line')}>
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
      <span className="text-[15px] font-semibold">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-xl border border-line px-3.5 text-[15px] outline-none placeholder:text-muted focus:border-ink"
      />
    </label>
  );
}

export function StatGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((st) => (
        <div key={st.label} className="flex flex-col items-center gap-0.5 rounded-xl bg-surface py-3">
          <span className="text-lg font-bold">{st.value}</span>
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
          <button key={it.id} onClick={() => onPick(it)} className="relative text-left">{inner}</button>
        ) : (
          <Link key={it.id} href={hrefFor?.(it) ?? `/item/${it.id}`} className="relative">{inner}</Link>
        );
      })}
    </div>
  );
}

export function ClosetCard({ closet, href, liked, onLike }: { closet: Closet; href: string; liked?: boolean; onLike?: () => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      <Link href={href} className="transition active:opacity-85"><ClosetCover items={closet.items} height={260} /></Link>
      <div className="flex items-center gap-2.5">
        <Avatar size={28} />
        <Link href={href} className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{closet.name}</p>
          <p className="text-xs text-muted">테마 {closet.theme} · 옷 {closet.items.length}벌 · ♡ {compact(closet.likes + (liked ? 1 : 0))}</p>
        </Link>
        <Badge label={closet.type} tone={typeTone(closet.type)} />
        {onLike && (
          <button onClick={onLike} aria-label="관심 옷장" className="p-1">
            <Heart size={20} className={liked ? 'fill-danger text-danger' : 'text-muted'} />
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
      <div className="animate-sheet absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-[20px] bg-white p-5 pt-2.5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <span className="mx-auto mb-1.5 h-1 w-10 rounded bg-line" />
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
      <h2 className="mb-1 text-lg font-bold">{title}</h2>
      <div className="max-h-[360px] overflow-y-auto">
        {options.map((o) => (
          <button key={o} onClick={() => { onPick(o); onClose(); }} className="flex h-12 w-full items-center justify-between border-b border-line text-left">
            <span className={cx('text-sm', o === value && 'font-bold')}>{o}</span>
            {o === value && <Check size={18} />}
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
      <div className="animate-fade rounded-full bg-ink/92 px-4 py-2.5 text-center text-[13px] font-medium text-white">{message}</div>
    </div>
  );
}
