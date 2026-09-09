import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { ToastHost } from './Toast';
import { useToastStore, type ToastType } from './toastStore';

export interface ToastOptions {
  /** Auto-dismiss delay in ms. Defaults by type (3000 for success/info, 4500 for error). Pass 0 to require manual dismissal. */
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => string;
  showSuccess: (message: string, options?: ToastOptions) => string;
  showError: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3000,
  info: 3000,
  error: 4500,
};

let nextId = 0;

export interface ToastProviderProps {
  children: ReactNode;
}

/** Mounts the toast overlay and provides `useToast()` to everything below it. Mount once, near the app root (inside ThemeProvider/SafeAreaProvider). */
export function ToastProvider({ children }: ToastProviderProps) {
  const push = useToastStore((state) => state.push);
  const remove = useToastStore((state) => state.remove);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback(
    (id: string) => {
      const timer = timers.current.get(id);
      if (timer) {
        clearTimeout(timer);
        timers.current.delete(id);
      }
      remove(id);
    },
    [remove],
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      const id = `toast-${++nextId}`;
      const duration = options?.duration ?? DEFAULT_DURATION[type];
      push({ id, type, message, duration });
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [push, dismiss],
  );

  const showSuccess = useCallback(
    (message: string, options?: ToastOptions) => showToast(message, 'success', options),
    [showToast],
  );

  const showError = useCallback(
    (message: string, options?: ToastOptions) => showToast(message, 'error', options),
    [showToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ showToast, showSuccess, showError, dismiss }),
    [showToast, showSuccess, showError, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** Hook to imperatively show/dismiss toasts: `const { showSuccess, showError, showToast, dismiss } = useToast();` */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() must be used within a <ToastProvider>.');
  }
  return ctx;
}
