'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Notification, NotificationListResponse } from '@/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  PROMO: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  ALERT: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  LIMIT: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  SYSTEM: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

const TYPE_COLOR: Record<string, string> = {
  PROMO: 'bg-pink-50 text-pink-500',
  ALERT: 'bg-amber-50 text-amber-500',
  LIMIT: 'bg-orange-50 text-orange-500',
  INFO: 'bg-blue-50 text-blue-500',
  SYSTEM: 'bg-[#F0EDE8] text-[#C6A47E]',
};

const INFO_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async (p: number, append: boolean) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    const res = await api.get<NotificationListResponse>(`/notifications?limit=${PAGE_SIZE}&page=${p}`);
    if (res.success && res.data) {
      setItems((prev) => append ? [...prev, ...res.data!.items] : res.data!.items);
      setTotal(res.data.total);
      setUnreadCount(res.data.unread_count);
    }
    if (p === 1) setLoading(false); else setLoadingMore(false);
  }, []);

  useEffect(() => {
    load(1, false);
  }, [load]);

  const markAllRead = async () => {
    await api.post('/notifications/read-all', {});
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
    await api.post(`/notifications/${id}/read`, {});
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage, true);
  };

  const hasMore = items.length < total;

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[24px] font-semibold text-[#111111]">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-[#8A8A8A]">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-medium text-[#C6A47E] transition-colors hover:text-[#b8935a]"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F0EDE8]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <p className="font-serif text-base font-semibold text-[#111111]">Aucune notification</p>
          <p className="mt-1 text-sm text-[#8A8A8A]">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((notif) => {
            const icon = TYPE_ICON[notif.type] ?? INFO_ICON;
            const colorClass = TYPE_COLOR[notif.type] ?? TYPE_COLOR.INFO;
            const content = (
              <div
                className={`flex gap-3 rounded-2xl p-4 transition-colors ${
                  notif.read ? 'bg-white' : 'bg-[#FDFAF7]'
                }`}
                onClick={() => { if (!notif.read) markRead(notif.id); }}
                role={notif.read ? undefined : 'button'}
                tabIndex={notif.read ? undefined : 0}
                onKeyDown={(e) => { if (!notif.read && (e.key === 'Enter' || e.key === ' ')) markRead(notif.id); }}
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  {icon}
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${notif.read ? 'font-normal text-[#111111]' : 'font-semibold text-[#111111]'}`}>
                      {notif.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-[#8A8A8A]">{formatDate(notif.sent_at)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A8A8A] line-clamp-2">{notif.message}</p>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 inline-block text-xs font-medium text-[#C6A47E] transition-colors hover:text-[#b8935a]"
                    >
                      {notif.link_label ?? 'Voir'}
                    </Link>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C6A47E]" />
                )}
              </div>
            );

            return <div key={notif.id}>{content}</div>;
          })}

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-2 w-full rounded-full border border-[#EFEFEF] py-3 text-sm font-medium text-[#8A8A8A] transition-colors hover:bg-[#F7F5F2] disabled:opacity-50"
            >
              {loadingMore ? 'Chargement…' : 'Voir plus'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
