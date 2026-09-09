import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  /** Auto-dismiss delay in ms; 0 means it stays until manually dismissed. */
  duration: number;
}

interface ToastStoreState {
  toasts: ToastItem[];
  push: (toast: ToastItem) => void;
  remove: (id: string) => void;
}

/**
 * Raw toast queue. Not meant to be used directly from screens — go through
 * `useToast()` (see ToastContext.tsx), which also owns id generation and
 * auto-dismiss timers. This store just holds what's currently on screen.
 */
export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  push: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
