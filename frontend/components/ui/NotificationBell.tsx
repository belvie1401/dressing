'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { playNotificationSound } from '@/lib/notificationSound';
import type {
  Notification,
  NotificationListResponse,
  NotificationType,
} from '@/types';

interface Props {
  /** Visual variant — `light` for dark backgrounds (white bg), `compact` for small headers. */
  variant?: 'light' | 'compact';
}

const POLL_INTERVAL_MS = 30_000;

export default function NotificationBell({ variant = 'light' }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const prevUnreadRef = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await api.get<NotificationListResponse>('/notifications?limit=5');
    if (res.success && res.data) {
      const newUnread = res.data.unread_count;

      // Play sound when new notifications arrive
      if (newUnread > prevUnreadRef.current && prevUnreadRef.current >= 0) {
        playNotificationSound();
      }
      prevUnreadRef.current = newUnread;

      setItems(res.data.items);
      setUnread(newUnread);
    } else {
      setItems([]);
      setUnread(0);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    // Mark -1 so the very first load doesn't play a sound
    prevUnreadRef.current = -1;
    load().then(() => {
      // After the first load, future increases will trigger the sound
      // prevUnreadRef is already set inside `load`
    });
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  // Refresh when the dropdown opens (so it shows fresh data)
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const handleMarkAllRead = async () => {
    const res = await api.post<{ updated: number }>('/notifications/read-all');
    if (res.success) {
      setItems((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev));
      setUnread(0);
    }
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      // Optimistic local update
      setItems((prev) =>
        prev ? prev.map((it) => (it.id === n.id ? { ...it, read: true } : it)) : prev,
      );
      setUnread((u) => Math.max(0, u - 1));
      api.post(`/notifications/${n.id}/read`);
    }
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  const buttonClasses =
    variant === 'compact'
      ? 'relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F2] hover:bg-[#F0EDE8] transition-colors cursor-pointer'
      : 'relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F0EDE8]';

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className={buttonClasses}
      >
        <svg width={variant === 'compact' ? 16 : 18} height={variant === 'compact' ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 ? (
          <span
            className={
              variant === 'compact'
                ? 'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D4785C] px-1 text-[9px] font-bold text-white'
                : 'absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#D4785C] px-1 text-[10px] font-bold text-white'
            }
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-[#EFEFEF] bg-white shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EFEFEF] px-4 py-3">
            <h3 className="font-serif text-base text-[#111111]">Notifications</h3>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unread === 0}
              className="cursor-pointer text-xs text-[#C6A47E] hover:underline disabled:cursor-default disabled:opacity-40 disabled:hover:no-underline"
            >
              Tout lire
            </button>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {items === null ? (
              <div className="space-y-2 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-[#F7F5F2] animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => handleClickNotification(n)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[#EFEFEF] px-4 py-3 text-center text-xs text-[#8A8A8A] no-underline transition-colors hover:bg-[#F7F5F2] hover:text-[#111111]"
          >
            Voir toutes les notifications
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#CFCFCF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <p className="mt-3 text-sm text-[#8A8A8A]">Aucune notification</p>
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const { type, title, message, sent_at, link, link_label, read } = notification;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-start gap-3 border-b border-[#F7F5F2] px-4 py-3 text-left last:border-0 hover:bg-[#F7F5F2] ${
        read ? 'bg-white' : 'bg-[#FFFBF8]'
      }`}
    >
      <NotificationIcon type={type} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111111]">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-[#8A8A8A]">{message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-[#CFCFCF]">{formatRelative(sent_at)}</span>
          {link && link_label ? (
            <span className="cursor-pointer text-[10px] text-[#C6A47E] underline">
              {link_label}
            </span>
          ) : null}
        </div>
      </div>
      {!read ? (
        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#D4785C]" aria-label="Non lue" />
      ) : null}
    </button>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const containers: Record<NotificationType, string> = {
    PROMO: 'bg-[#C6A47E]/15 text-[#C6A47E]',
    ALERT: 'bg-[#D4785C]/10 text-[#D4785C]',
    INFO: 'bg-blue-50 text-blue-500',
    LIMIT: 'bg-amber-50 text-amber-500',
    SYSTEM: 'bg-[#F0EDE8] text-[#111111]',
  };

  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const icon = (() => {
    switch (type) {
      case 'PROMO':
        // Gift box
        return (
          <svg {...common}>
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        );
      case 'ALERT':
        return (
          <svg {...common}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'INFO':
        return (
          <svg {...common}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      case 'LIMIT':
        return (
          <svg {...common}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'SYSTEM':
      default:
        // LIEN-ish "L" mark
        return (
          <svg {...common}>
            <path d="M6 4v16h12" />
          </svg>
        );
    }
  })();

  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${containers[type]}`}
    >
      {icon}
    </div>
  );
}

// ─── Date helpers ───────────────────────────────────────────────────────────
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD} j`;
  const diffMo = Math.round(diffD / 30);
  return `Il y a ${diffMo} mois`;
}
