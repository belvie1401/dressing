'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { CalendarEntry } from '@/types';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import ShareModal from '@/components/ui/ShareModal';
import BottomNav from '@/components/ui/BottomNav';
import NotificationBell from '@/components/ui/NotificationBell';
import { useGlobalSearch } from '@/components/ui/GlobalSearch';

// ============ SIDEBAR NAV ITEMS ============
type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  tourId?: string;
};

type ActivityItem = {
  kind: 'item_added' | 'outfit_created' | 'message_received' | 'favorite_added';
  text: string;
  at: string;
  thumb?: string | null;
  avatar?: string | null;
};

type WardrobeStats = {
  worn: number;
  new_outfits: number;
  cost_per_wear: number;
};

const NAV_BASE: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10.5Z" />
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Mon dressing',
    tourId: 'wardrobe-nav',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2" />
        <line x1="12" y1="6" x2="12" y2="8" />
        <polyline points="3,15 12,8 21,15" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
  },
  {
    href: '/outfits',
    label: 'Mes looks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stylists',
    label: 'Stylistes',
    tourId: 'stylists-nav',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendrier',
    tourId: 'calendar-nav',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/favorites',
    label: 'Favoris',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

const STAT_ICONS = {
  worn: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  outfits: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  cost: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

function capitalizeName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function extractNameFromTitle(title: string | null): string {
  if (!title) return '';
  const match = title.match(/Session avec (.+)$/i);
  return match ? match[1].trim() : '';
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return 'À l’instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD} j`;
  const diffMo = Math.round(diffD / 30);
  return `Il y a ${diffMo} mois`;
}

function formatUpcomingDate(iso: string): { label: string; time: string } {
  const d = new Date(iso);
  const label = d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const time = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { label: label.charAt(0).toUpperCase() + label.slice(1), time };
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [showShare, setShowShare] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [cancellingSession, setCancellingSession] = useState(false);

  // Real data state
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityItem[] | null>(null);
  const [stats, setStats] = useState<WardrobeStats | null>(null);
  const [nextSession, setNextSession] = useState<CalendarEntry | null | undefined>(
    undefined
  );

  const firstName = capitalizeName(user?.name?.split(' ')[0] ?? '');
  const lastInitial = user?.name?.split(' ')[1]?.charAt(0).toUpperCase() ?? '';
  const fullDisplay = firstName
    ? lastInitial
      ? `${firstName} ${lastInitial}.`
      : firstName
    : user?.email ?? '';
  const initial = firstName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '·';

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname?.startsWith(href);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const [convRes, actRes, statsRes, upcomingRes] = await Promise.all([
        api.get<Array<{ unreadCount: number }>>('/messages'),
        api.get<ActivityItem[]>('/activity?limit=5'),
        api.get<WardrobeStats>('/wardrobe/stats'),
        api.get<CalendarEntry[]>('/calendar?upcoming=true&limit=1'),
      ]);

      if (!mounted) return;

      if (convRes.success && convRes.data) {
        const unread = convRes.data.reduce(
          (acc, c) => acc + (c.unreadCount ?? 0),
          0
        );
        setUnreadMessages(unread);
      } else {
        setUnreadMessages(0);
      }

      setActivities(actRes.success && actRes.data ? actRes.data : []);
      setStats(
        statsRes.success && statsRes.data
          ? statsRes.data
          : { worn: 0, new_outfits: 0, cost_per_wear: 0 }
      );
      setNextSession(
        upcomingRes.success && upcomingRes.data && upcomingRes.data.length > 0
          ? upcomingRes.data[0]
          : null
      );
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const navItems: NavItem[] = NAV_BASE.map((item) =>
    item.href === '/messages' && unreadMessages > 0
      ? { ...item, badge: unreadMessages }
      : item
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F2]">
      <RoleSwitcher />

      {/* =================================================
          ZONE 1 — LEFT SIDEBAR (w-[200px])
          ================================================= */}
      <aside className="hidden lg:flex h-screen w-[200px] flex-shrink-0 flex-col border-r border-[#EFEFEF] bg-white px-4 py-8">
        {/* Logo */}
        <Link
          href="/"
          className="mb-10 px-3 font-serif text-xl text-[#111111] no-underline tracking-[0.15em]"
        >
          LIEN
        </Link>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
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
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom block */}
        <div className="mt-auto">
          {user?.role === 'ADMIN' ? (
            <div className="mb-2 border-t border-[#EFEFEF] pt-3">
              <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-[#C6A47E]">
                Admin
              </p>
              <Link
                href="/admin/notifications"
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  pathname?.startsWith('/admin/notifications')
                    ? 'bg-[#F0EDE8] font-medium text-[#111111]'
                    : 'text-[#8A8A8A] hover:bg-[#F7F5F2] hover:text-[#111111]'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications
              </Link>
            </div>
          ) : null}
          <Link
            href="/profile"
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8A8A8A] transition-all hover:bg-[#F7F5F2] hover:text-[#111111]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Param&egrave;tres
          </Link>

          {/* User card */}
          <Link
            href="/profile"
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-[#F7F5F2] px-3 py-2.5 transition-colors hover:bg-[#F0EDE8]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={firstName || 'Utilisateur'}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-serif text-sm text-[#C6A47E]">{initial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#111111]">
                {fullDisplay || '—'}
              </p>
              <p className="truncate text-[10px] text-[#8A8A8A]">Voir mon profil</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* =================================================
          RIGHT SIDE — TOP BAR + (CENTER + RIGHT PANEL)
          ================================================= */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="flex h-[88px] flex-shrink-0 items-center gap-4 bg-[#F7F5F2] px-5 lg:px-10">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm lg:hidden"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <SearchTrigger />

          <div className="flex-1 lg:hidden" />

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F0EDE8] lg:flex"
              aria-label="Partager LIEN"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <NotificationBell variant="light" />
            <Link
              href="/wardrobe/add"
              className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="hidden sm:inline">Ajouter un v&ecirc;tement</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>
          </div>
        </header>

        {/* CENTER + RIGHT PANEL row */}
        <div className="flex min-h-0 flex-1">
          {/* ZONE 2 — CENTER CONTENT */}
          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-5 pb-24 lg:px-10 lg:pb-10">
            {children}
          </main>

          {/* ZONE 3 — RIGHT PANEL (w-[320px]) */}
          <aside className="hidden h-full w-[320px] flex-shrink-0 flex-col overflow-y-auto border-l border-[#EFEFEF] bg-[#F7F5F2] px-6 pb-10 lg:flex">
            {/* A. PROCHAINE SESSION */}
            <div className="mb-6 mt-6">
              {nextSession === undefined ? (
                <div className="h-[200px] rounded-2xl bg-[#F0EDE8] animate-pulse" />
              ) : nextSession === null ? (
                <div className="rounded-2xl bg-[#111111] p-5">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#CFCFCF]">
                    Prochaine session
                  </span>
                  <p className="mt-3 font-serif text-2xl leading-tight text-white">
                    Aucune session pr&eacute;vue
                  </p>
                  <p className="mt-1 text-xs text-[#CFCFCF]">
                    R&eacute;servez un rendez-vous avec un styliste.
                  </p>
                  <Link
                    href="/stylists"
                    className="mt-4 inline-flex w-fit rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F0EDE8]"
                  >
                    Trouvez un styliste
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#111111] p-5">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#CFCFCF]">
                    Prochaine session
                  </span>
                  {(() => {
                    const { label, time } = formatUpcomingDate(nextSession.date);
                    const rawName =
                      nextSession.client?.name ||
                      extractNameFromTitle(nextSession.title ?? null);
                    const counterpartName = rawName
                      ? capitalizeName(rawName.split(' ')[0])
                      : '';
                    const withName = counterpartName ? ` avec ${counterpartName}` : '';
                    const duration = nextSession.duration_min
                      ? `${nextSession.duration_min} min`
                      : '60 min';
                    const avatar = nextSession.client?.avatar_url || null;
                    return (
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-2xl leading-tight text-white">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-white">
                            {time}
                            {withName}
                          </p>
                          <p className="mt-1 text-xs text-[#CFCFCF]">{duration}</p>
                        </div>
                        {avatar ? (
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#C6A47E] ring-offset-2 ring-offset-[#111111]">
                            <Image
                              src={avatar}
                              alt={counterpartName || 'Styliste'}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#EDE5DC] ring-2 ring-[#C6A47E] ring-offset-2 ring-offset-[#111111]">
                            <span className="font-serif text-lg text-[#C6A47E]">
                              {counterpartName.charAt(0) || '·'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <button
                    type="button"
                    onClick={() => setShowSessionModal(true)}
                    className="mt-4 inline-flex w-fit rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F0EDE8]"
                  >
                    Voir les d&eacute;tails
                  </button>
                </div>
              )}
            </div>

            {/* B. ACTIVITE RECENTE */}
            <div className="mb-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-serif text-base text-[#111111]">
                  Activit&eacute; r&eacute;cente
                </h3>
                <Link href="/notifications" className="text-[11px] text-[#8A8A8A]">
                  Voir tout
                </Link>
              </div>

              {activities === null ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-2xl bg-[#F0EDE8] animate-pulse" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center">
                  <p className="text-xs text-[#8A8A8A]">
                    Aucune activit&eacute; pour l&rsquo;instant.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0EDE8] overflow-hidden rounded-2xl bg-white shadow-sm">
                  {activities.map((a, idx) => (
                    <div
                      key={`${a.kind}-${idx}-${a.at}`}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      {a.thumb ? (
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[#F0EDE8]">
                          <Image
                            src={a.thumb}
                            alt=""
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : a.avatar ? (
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-[#EDE5DC]">
                          <Image
                            src={a.avatar}
                            alt=""
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#FDEEE8]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#111111]">
                          {a.text}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#8A8A8A]">
                          {formatRelative(a.at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* C. STATISTIQUES DRESSING */}
            <div className="mb-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-serif text-base text-[#111111]">
                  Statistiques dressing
                </h3>
                <span className="text-[11px] text-[#8A8A8A]">Ce mois-ci</span>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                {stats === null ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-16 rounded bg-[#F0EDE8] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
                        {STAT_ICONS.worn}
                      </div>
                      <p className="mt-2 font-serif text-2xl leading-none text-[#111111]">
                        {stats.worn}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8A8A8A]">port&eacute;s</p>
                    </div>
                    <div>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
                        {STAT_ICONS.outfits}
                      </div>
                      <p className="mt-2 font-serif text-2xl leading-none text-[#111111]">
                        {stats.new_outfits}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8A8A8A]">nouveaux looks</p>
                    </div>
                    <div>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
                        {STAT_ICONS.cost}
                      </div>
                      <p className="mt-2 font-serif text-2xl leading-none text-[#111111]">
                        {stats.cost_per_wear.toString().replace('.', ',')}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8A8A8A]">co&ucirc;t par port</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* D. UPGRADE BANNER */}
            <div className="relative min-h-[160px] overflow-hidden rounded-2xl bg-[#111111]">
              {/* Background image, right side */}
              <div className="absolute inset-y-0 right-0 w-[45%]">
                <Image
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400"
                  alt=""
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#111111]/90 to-transparent" />
              {/* Content */}
              <div className="relative z-10 p-5">
                <span className="inline-block rounded-full bg-[#C6A47E] px-2 py-0.5 text-[9px] font-bold text-[#111111]">
                  NOUVEAU
                </span>
                <p className="mt-3 font-serif text-base text-white">
                  Upgradez votre exp&eacute;rience
                </p>
                <p className="mt-2 max-w-[55%] text-[11px] leading-relaxed text-[#CFCFCF]">
                  Acc&eacute;dez &agrave; des fonctionnalit&eacute;s exclusives et
                  collaborez avec des stylistes experts.
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-block cursor-pointer text-xs font-medium text-[#C6A47E]"
                >
                  D&eacute;couvrir &rarr;
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* =================================================
          MOBILE DRAWER
          ================================================= */}
      {mobileOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          />
          <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[#EFEFEF] bg-white px-4 py-6">
            <div className="mb-6 flex items-center justify-between px-2">
              <Link
                href="/"
                className="font-serif text-xl text-[#111111] no-underline tracking-[0.15em]"
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
            <nav className="flex flex-col gap-0.5">
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
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Mobile bottom nav */}
      <BottomNav />

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}

      {/* Session detail modal */}
      {showSessionModal && nextSession && (
        <SessionDetailModal
          session={nextSession}
          onClose={() => setShowSessionModal(false)}
          onCancelled={() => {
            setShowSessionModal(false);
            setNextSession(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Session Detail Modal ─────────────────────────────────────────────────
function SessionDetailModal({
  session,
  onClose,
  onCancelled,
}: {
  session: CalendarEntry;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { label, time } = formatUpcomingDate(session.date);
  const stylistName = session.client?.name ?? extractNameFromTitle(session.title ?? '');
  const stylistAvatar = session.client?.avatar_url ?? null;
  const durationLabel = session.duration_min ? `${session.duration_min} min` : '—';
  const typeLabel = session.event_type === 'VIDEO' ? 'Visio' : session.event_type === 'PHONE' ? 'Téléphone' : session.event_type ?? '—';
  const isConfirmed = !!session.zoom_link;

  async function handleCancel() {
    setCancelling(true);
    const res = await api.delete(`/calendar/${session.id}`);
    setCancelling(false);
    if (res.success) onCancelled();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#EFEFEF]" />

        <h2 className="mb-6 font-serif text-xl text-[#111111]">Détail de la session</h2>

        {/* Stylist info */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
            {stylistAvatar ? (
              <Image src={stylistAvatar} alt={stylistName} width={56} height={56} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-semibold text-[#C6A47E]">{stylistName.charAt(0) || 'S'}</span>
            )}
          </div>
          <div>
            <p className="font-serif text-lg text-[#111111]">{stylistName}</p>
            <span className="inline-block rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[11px] font-medium text-[#C6A47E]">
              Styliste certifiée
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Confirmé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              En attente
            </span>
          )}
        </div>

        {/* Session info rows */}
        <div className="mb-6 rounded-2xl bg-[#F7F5F2] p-4">
          {[
            { label: 'Date', value: label },
            { label: 'Heure', value: time },
            { label: 'Durée', value: durationLabel },
            { label: 'Type', value: typeLabel },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex justify-between py-2 text-sm ${i < arr.length - 1 ? 'border-b border-[#EFEFEF]' : ''}`}
            >
              <span className="text-[#8A8A8A]">{row.label}</span>
              <span className="font-medium text-[#111111]">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Zoom link */}
        {session.zoom_link && (
          <a
            href={session.zoom_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333333]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Rejoindre la visio
          </a>
        )}

        {/* Cancel action */}
        {!confirmCancel ? (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            className="w-full py-2 text-sm text-[#D4785C] transition-colors hover:text-[#b85a3e]"
          >
            Annuler la session
          </button>
        ) : (
          <div className="rounded-xl border border-[#F0EDE8] bg-[#FFF8F6] p-4">
            <p className="mb-3 text-sm text-[#111111]">Confirmer l&apos;annulation de cette session ?</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="flex-1 rounded-full border border-[#EFEFEF] py-2 text-sm font-medium text-[#8A8A8A] transition-colors hover:bg-[#F7F5F2]"
              >
                Non, garder
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-full bg-[#D4785C] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b85a3e] disabled:opacity-60"
              >
                {cancelling ? '...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Top-bar search trigger ───────────────────────────────────────────────
// A button styled like the previous input that opens the global search modal.
// ⌘K still works because the provider has a window-level listener.
function SearchTrigger() {
  const { open } = useGlobalSearch();
  return (
    <button
      type="button"
      onClick={open}
      aria-label="Ouvrir la recherche"
      className="hidden max-w-[540px] flex-1 cursor-pointer items-center gap-3 rounded-full border border-[#EFEFEF] bg-white px-5 py-3 text-left shadow-sm transition-colors hover:bg-[#F7F5F2] lg:flex"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span className="flex-1 text-sm text-[#8A8A8A]">
        Rechercher (v&ecirc;tements, looks, stylistes...)
      </span>
      <span className="flex items-center gap-1 rounded-md border border-[#EFEFEF] bg-[#F7F5F2] px-2 py-0.5 text-[10px] font-medium text-[#8A8A8A]">
        &#8984; K
      </span>
    </button>
  );
}
