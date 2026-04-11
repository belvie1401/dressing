'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import ShareModal from '@/components/ui/ShareModal';
import BottomNav from '@/components/ui/BottomNav';
import NotificationBell from '@/components/ui/NotificationBell';
import StylistScopedSearch from '@/components/ui/StylistScopedSearch';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  tourId?: string;
};

const NAV_BASE: NavItem[] = [
  {
    href: '/stylist-dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/my-clients',
    label: 'Clientes',
    tourId: 'clients-nav',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/lookbooks',
    label: 'Dressings clientes',
    tourId: 'lookbooks-nav',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" />
        <line x1="16" y1="6" x2="16" y2="8" />
      </svg>
    ),
  },
  {
    href: '/agenda',
    label: 'Rendez-vous',
    tourId: 'agenda-nav',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messagerie',
    tourId: 'messages-nav',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stylist-profile',
    label: 'Mon profil',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
      </svg>
    ),
  },
];

export default function StylistDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [showShare, setShowShare] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Real badge counts
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  const displayName = user?.name ?? user?.email ?? '';
  const firstLetter = (displayName.charAt(0) || '·').toUpperCase();

  const isActive = (href: string) =>
    href === '/stylist-dashboard' ? pathname === href : pathname?.startsWith(href);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const [reqRes, convRes] = await Promise.all([
        api.get<{ count: number }>('/stylists/requests/pending'),
        api.get<Array<{ unreadCount: number }>>('/messages'),
      ]);

      if (!mounted) return;

      setPendingRequests(reqRes.success && reqRes.data ? reqRes.data.count : 0);

      if (convRes.success && convRes.data) {
        const unread = convRes.data.reduce(
          (acc, c) => acc + (c.unreadCount ?? 0),
          0
        );
        setUnreadMessages(unread);
      } else {
        setUnreadMessages(0);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const navItems: NavItem[] = NAV_BASE.map((item) => {
    if (item.href === '/agenda' && pendingRequests > 0) {
      return { ...item, badge: pendingRequests };
    }
    if (item.href === '/messages' && unreadMessages > 0) {
      return { ...item, badge: unreadMessages };
    }
    return item;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F2]">
      <RoleSwitcher />

      {/* ======== LEFT SIDEBAR ======== */}
      <aside className="hidden lg:flex flex-col w-[220px] shrink-0 h-screen border-r border-[#EFEFEF] bg-white py-6 px-4">
        <Link
          href="/"
          className="font-serif text-2xl text-[#111111] px-3 mb-8 no-underline tracking-wide"
        >
          LIEN
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[#F0EDE8] font-medium text-[#111111]'
                    : 'text-[#8A8A8A] hover:bg-[#F7F5F2] hover:text-[#111111]'
                }`}
              >
                <span className={active ? 'text-[#111111]' : 'text-[#8A8A8A]'}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4785C] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="my-3 border-t border-[#EFEFEF]" />

          <Link
            href="/stylist-profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8A8A8A] hover:bg-[#F7F5F2] hover:text-[#111111] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Param&egrave;tres
          </Link>

          {user?.role === 'ADMIN' ? (
            <div className="mt-3 border-t border-[#EFEFEF] pt-3">
              <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-[#C6A47E]">
                Admin
              </p>
              <Link
                href="/admin/notifications"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  pathname?.startsWith('/admin/notifications')
                    ? 'bg-[#F0EDE8] font-medium text-[#111111]'
                    : 'text-[#8A8A8A] hover:bg-[#F7F5F2] hover:text-[#111111]'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
              </Link>
            </div>
          ) : null}
        </nav>

        {/* User card */}
        <Link
          href="/stylist-profile"
          className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={displayName || 'Styliste'}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-sm text-[#C6A47E]">{firstLetter}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#111111]">
              {displayName || '—'}
            </p>
            <p className="text-[11px] text-[#8A8A8A]">Styliste pro</p>
          </div>
        </Link>
      </aside>

      {/* ======== MAIN COLUMN ======== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-[64px] shrink-0 items-center gap-3 border-b border-[#EFEFEF] bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F2] lg:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <StylistScopedSearch />

          <div className="ml-auto flex items-center gap-2 md:ml-4">
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F2] hover:bg-[#F0EDE8] transition-colors"
              aria-label="Partager LIEN"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>

            <NotificationBell variant="compact" />

            <Link
              href="/wardrobe/add"
              className="ml-1 hidden items-center gap-1.5 rounded-full bg-[#111111] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02] sm:flex"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter un v&ecirc;tement
            </Link>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden">
            <div
              className="fixed inset-0 z-40 bg-black/30"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[#EFEFEF] bg-white px-4 py-6">
              <div className="mb-6 flex items-center justify-between px-2">
                <Link
                  href="/"
                  className="font-serif text-2xl text-[#111111] no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  LIEN
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F5F2]"
                  aria-label="Fermer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                        active
                          ? 'bg-[#F0EDE8] font-medium text-[#111111]'
                          : 'text-[#8A8A8A]'
                      }`}
                    >
                      <span className={active ? 'text-[#111111]' : 'text-[#8A8A8A]'}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4785C] px-1 text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
                {user?.role === 'ADMIN' ? (
                  <div className="mt-3 border-t border-[#EFEFEF] pt-3">
                    <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-[#C6A47E]">
                      Admin
                    </p>
                    <Link
                      href="/admin/notifications"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                        pathname?.startsWith('/admin/notifications')
                          ? 'bg-[#F0EDE8] font-medium text-[#111111]'
                          : 'text-[#8A8A8A]'
                      }`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      Notifications
                    </Link>
                  </div>
                ) : null}
              </nav>
            </aside>
          </div>
        )}

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-10">{children}</main>
      </div>

      <BottomNav />

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}
