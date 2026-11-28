'use client';

import { createContext, use, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { browser } from 'react-dom';
import {
  BodySpec, Category, Closet, ClosetType, ClothingItem, FREE_CAPACITY, PUBLIC_CLOSETS, Style, Visibility, createMyFirstCloset,
} from '@/data/mock';

export type Outfit = { id: string; top?: string; bottom?: string; shoes?: string; outer?: string; sourceClosetId: string; /** AI 착장 이미지 (480px WebP) */ image?: string };
export type PendingUpload = { photoUri?: string; sample?: boolean };
export type AuthProvider = 'kakao' | 'google' | 'email';
export type User = { name: string; email?: string; provider: AuthProvider };

type State = {
  loggedIn: boolean;
  user?: User;
  onboarded: boolean; // 추구미 설정까지 마쳤는지 (재로그인 시 온보딩 생략)
  body?: BodySpec; // 신체 정보 — 나에게만 보이고 공개 옷장에는 노출하지 않음
  styles: Style[];
  interests: Category[];
  subscribed: boolean;
  payMethod: string;
  usage: { summaries: number; recs: number; mannequin: number };
  myClosets: Closet[];
  activeClosetId: string;
  closetSlots: number; // 구매한 옷장 슬롯 수 (무료 1)
  business: boolean;
  following: string[];
  liked: string[];
  savedOutfits: Outfit[];
  pending?: PendingUpload;
};

// v2: 무료 옷장 한도 30 → 20벌(보고서 수정본). 버전을 올려 예전 데모 상태 대신 새 기본값으로 시작한다
const STORAGE_KEY = 'closet-demo-v2';

const initial = (): State => {
  const first = createMyFirstCloset();
  return {
    loggedIn: false,
    onboarded: false,
    styles: ['미니멀', '모던 캐주얼'],
    interests: ['아우터', '상의'],
    subscribed: false,
    payMethod: '신용카드 (****1234)',
    usage: { summaries: 12, recs: 30, mannequin: 8 },
    myClosets: [first],
    activeClosetId: first.id,
    closetSlots: 1,
    business: false,
    following: ['hana'],
    liked: ['minji'],
    savedOutfits: [],
  };
};

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch {
    /* 손상된 저장값은 무시 */
  }
  return initial();
}

function useAppStore() {
  // 데모 상태는 localStorage에 저장한다 → 서버 프리렌더 대상이 아님
  use(browser('데모 상태를 localStorage에서 읽어요.'));
  const [s, setS] = useState<State>(load);
  const [toastMsg, setToastMsg] = useState<string>();
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 이벤트 핸들러(addItem 등)에서 최신 상태를 동기적으로 읽기 위한 ref
  const latest = useRef(s);
  useLayoutEffect(() => {
    latest.current = s;
  }, [s]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* 용량 초과 등은 무시 (사진이 많을 때) */
    }
  }, [s]);

  const patch = useCallback((p: Partial<State> | ((s: State) => Partial<State>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(undefined), 2200);
  }, []);

  const updateCloset = useCallback((id: string, fn: (c: Closet) => Closet) => {
    patch((prev) => ({ myClosets: prev.myClosets.map((c) => (c.id === id ? fn(c) : c)) }));
  }, [patch]);

  const activeCloset = s.myClosets.find((c) => c.id === s.activeClosetId) ?? s.myClosets[0];
  const allClosets = useMemo(() => [...s.myClosets, ...PUBLIC_CLOSETS], [s.myClosets]);

  const actions = useMemo(() => ({
    patch,
    toast,
    // TODO(백엔드): OAuth 콜백/이메일 인증 후 서버 세션으로 대체
    login: (user: User) => patch({ loggedIn: true, user }),
    logout: () => patch({ loggedIn: false, user: undefined }),
    reset: () => setS(initial()),
    setPrefs: (styles: Style[], interests: Category[]) => patch({ styles, interests, onboarded: true }),
    setBody: (body?: BodySpec) => patch({ body }),
    subscribe: () => patch({ subscribed: true }),
    unsubscribe: () => patch({ subscribed: false }),
    bumpUsage: (k: keyof State['usage']) => patch((p) => ({ usage: { ...p.usage, [k]: p.usage[k] + 1 } })),
    toggleFollow: (id: string) => patch((p) => ({ following: p.following.includes(id) ? p.following.filter((x) => x !== id) : [...p.following, id] })),
    toggleLike: (id: string) => patch((p) => ({ liked: p.liked.includes(id) ? p.liked.filter((x) => x !== id) : [...p.liked, id] })),
    setActiveCloset: (id: string) => patch({ activeClosetId: id }),
    setPending: (pending?: PendingUpload) => patch({ pending }),
    /** 활성(또는 지정) 옷장에 옷 추가. 가득 차 있으면 false */
    addItem: (item: Omit<ClothingItem, 'id' | 'closetId' | 'coordiCount'>, closetId?: string) => {
      const target = closetId ?? latest.current.activeClosetId;
      const c = latest.current.myClosets.find((x) => x.id === target);
      if (!c || c.items.length >= c.capacity) return false;
      const newItem: ClothingItem = { ...item, id: `${target}-${Date.now()}`, closetId: target, coordiCount: 0 };
      patch((prev) => ({
        myClosets: prev.myClosets.map((x) => (x.id === target ? { ...x, items: [newItem, ...x.items] } : x)),
      }));
      return true;
    },
    addLook: (closetId: string, photo: string, itemIds: string[]) => {
      const current = latest.current;
      const closet = current.myClosets.find(c => c.id === closetId);
      if (!closet || !photo || !itemIds.length || !itemIds.every(id => closet.items.some(i => i.id === id))) return false;
      const look = { id: crypto.randomUUID(), photo, itemIds: [...new Set(itemIds)] };
      const myClosets = current.myClosets.map(c => c === closet ? { ...c, looks: [look, ...(c.looks ?? [])] } : c);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, myClosets })); }
      catch { return false; }
      patch({ myClosets });
      return true;
    },
    setWornPhoto: (itemId: string, wornPhoto: string | undefined) => {
      const current = latest.current;
      const myClosets = current.myClosets.map(c => ({
        ...c, items: c.items.map(it => it.id === itemId ? { ...it, wornPhoto } : it),
      }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, myClosets }));
      } catch {
        return false;
      }
      patch({ myClosets });
      return true;
    },
    removeItem: (itemId: string) => patch((prev) => ({
      myClosets: prev.myClosets.map((c) => ({ ...c, items: c.items.filter((i) => i.id !== itemId) })),
    })),
    updateCloset,
    addCapacity: (n: number) => updateCloset(latest.current.activeClosetId, (c) => ({ ...c, capacity: c.capacity + n })),
    buySlots: (n: number, business = false) => patch((p) => ({ closetSlots: p.closetSlots + n, business: p.business || business })),
    createCloset: (name: string, theme: Style, type: ClosetType) => {
      const id = `my-${Date.now()}`;
      patch((prev) => ({
        myClosets: [...prev.myClosets, {
          id, name, theme, type, owner: '이재우', handle: 'jaewoo', capacity: FREE_CAPACITY,
          likes: 0, followers: 0, views: 0, linkClicks: 0, visibility: '비공개' as Visibility,
          summary: '', tags: [], updatedRank: 0, items: [],
        }],
        activeClosetId: id,
      }));
      return id;
    },
    saveOutfit: (o: Omit<Outfit, 'id'>) => patch((p) => ({ savedOutfits: [{ ...o, id: `o-${Date.now()}` }, ...p.savedOutfits] })),
  }), [patch, toast, updateCloset]);

  const findCloset = useCallback((id?: string) => allClosets.find((c) => c.id === id), [allClosets]);
  const findItem = useCallback((id?: string) => {
    for (const c of allClosets) {
      const it = c.items.find((i) => i.id === id);
      if (it) return { item: it, closet: c };
    }
    return undefined;
  }, [allClosets]);
  const isMine = useCallback((closetId: string) => s.myClosets.some((c) => c.id === closetId), [s.myClosets]);

  return { ...s, toastMsg, activeCloset, allClosets, findCloset, findItem, isMine, ...actions };
}

type Store = ReturnType<typeof useAppStore>;
const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStore();
  return <Ctx value={store}>{children}</Ctx>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
