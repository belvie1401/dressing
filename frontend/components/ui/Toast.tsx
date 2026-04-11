'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastApi {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastApi | null>(null);

const AUTO_DISMISS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 4000,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id =
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2)) + '';
      setToasts((prev) => [...prev, { id, type, title, message }]);
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS[type]);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  // Clean up timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      warning: (title, message) => push('warning', title, message),
      info: (title, message) => push('info', title, message),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────
/**
 * `useToast` — safe to call in any client component under ToastProvider.
 * Falls back to a no-op API (still logs via console) when called outside a
 * provider, so auth screens that live above the layout don't crash.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Graceful fallback — prevents crashes if useToast is called outside the
  // provider (e.g. during SSR or in isolated tests).
  return {
    success: (t, m) => console.info('[toast:success]', t, m),
    error: (t, m) => console.warn('[toast:error]', t, m),
    warning: (t, m) => console.warn('[toast:warning]', t, m),
    info: (t, m) => console.info('[toast:info]', t, m),
    dismiss: () => {},
  };
}

// ─── Container + single-toast view ──────────────────────────────────────────
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end sm:px-0">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const palette = TYPE_PALETTE[toast.type];
  return (
    <div
      role="status"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="pointer-events-auto flex w-full max-w-[320px] animate-toast-in items-start gap-3 rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 shadow-lg"
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${palette.iconBg}`}
      >
        <ToastIcon type={toast.type} className={palette.iconStroke} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111111]">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-relaxed text-[#8A8A8A]">
            {toast.message}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center text-[#CFCFCF] hover:text-[#8A8A8A]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Styling tokens per type ────────────────────────────────────────────────
const TYPE_PALETTE: Record<
  ToastType,
  { iconBg: string; iconStroke: string }
> = {
  success: {
    iconBg: 'bg-[#F0FFF4]',
    iconStroke: 'text-[#16A34A]',
  },
  error: {
    iconBg: 'bg-[#FFF8F6]',
    iconStroke: 'text-[#D4785C]',
  },
  warning: {
    iconBg: 'bg-[#FFFBF0]',
    iconStroke: 'text-[#C6A47E]',
  },
  info: {
    iconBg: 'bg-[#F0F4FF]',
    iconStroke: 'text-[#3B82F6]',
  },
};

function ToastIcon({
  type,
  className,
}: {
  type: ToastType;
  className: string;
}) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (type) {
    case 'success':
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="16 10 11 15 8 12" />
        </svg>
      );
    case 'error':
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...common} className={className}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}
