'use client';

import { useApp } from '@/state/AppState';
import { Toast } from './ui';

export function GlobalToast() {
  const { toastMsg } = useApp();
  return <Toast message={toastMsg} />;
}
