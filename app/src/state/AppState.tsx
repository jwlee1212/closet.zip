import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  Category, Closet, ClosetType, ClothingItem, PUBLIC_CLOSETS, Style, Visibility, createMyFirstCloset,
} from '@/data/mock';

export type Outfit = { id: string; top?: string; bottom?: string; shoes?: string; outer?: string; sourceClosetId: string };
export type PendingUpload = { photoUri?: string; sample?: boolean };

type State = {
  loggedIn: boolean;
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
  toastMsg?: string;
};

const initial = (): State => {
  const first = createMyFirstCloset();
  return {
    loggedIn: false,
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

function useAppStore() {
  const [s, setS] = useState<State>(initial);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(s);
  latest.current = s;

  const patch = useCallback((p: Partial<State> | ((s: State) => Partial<State>)) => {
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) }));
  }, []);

  const toast = useCallback((msg: string) => {
    patch({ toastMsg: msg });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => patch({ toastMsg: undefined }), 2200);
  }, [patch]);

  const updateCloset = useCallback((id: string, fn: (c: Closet) => Closet) => {
    patch((prev) => ({ myClosets: prev.myClosets.map((c) => (c.id === id ? fn(c) : c)) }));
  }, [patch]);

  const activeCloset = s.myClosets.find((c) => c.id === s.activeClosetId) ?? s.myClosets[0];
  const allClosets = useMemo(() => [...s.myClosets, ...PUBLIC_CLOSETS], [s.myClosets]);

  const actions = useMemo(() => ({
    patch,
    toast,
    login: () => patch({ loggedIn: true }),
    reset: () => setS(initial()),
    setPrefs: (styles: Style[], interests: Category[]) => patch({ styles, interests }),
    subscribe: () => patch({ subscribed: true }),
    unsubscribe: () => patch({ subscribed: false }),
    bumpUsage: (k: keyof State['usage']) => patch((p) => ({ usage: { ...p.usage, [k]: p.usage[k] + 1 } })),
    toggleFollow: (id: string) => patch((p) => ({ following: p.following.includes(id) ? p.following.filter((x) => x !== id) : [...p.following, id] })),
    toggleLike: (id: string) => patch((p) => ({ liked: p.liked.includes(id) ? p.liked.filter((x) => x !== id) : [...p.liked, id] })),
    setActiveCloset: (id: string) => patch({ activeClosetId: id }),
    setPending: (pending?: PendingUpload) => patch({ pending }),
    /** 활성 옷장에 옷 추가. 가득 차 있으면 false */
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
          id, name, theme, type, owner: '이재우', handle: 'jaewoo', capacity: 30,
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

  return { ...s, activeCloset, allClosets, findCloset, findItem, isMine, ...actions };
}

type Store = ReturnType<typeof useAppStore>;
const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const store = useAppStore();
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
