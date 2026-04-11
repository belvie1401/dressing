'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import ShareModal from '@/components/ui/ShareModal';
import BottomNav from '@/components/ui/BottomNav';

// ============ SIDEBAR NAV ITEMS ============
type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Mon dressing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" />
        <line x1="16" y1="6" x2="16" y2="8" />
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
    badge: 2,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stylists',
    label: 'Stylistes',
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
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

// ============ ACTIVITIES (right panel) ============
type Activity = {
  kind: 'message' | 'heart';
  text: string;
  time: string;
  avatar: string | null;
};

const ACTIVITIES: Activity[] = [
  {
    kind: 'message',
    text: 'Chlo\u00e9 vous a envoy\u00e9 3 looks',
    time: 'Il y a 3 jours',
    avatar: 'https://i.pravatar.cc/40?img=32',
  },
  {
    kind: 'heart',
    text: 'Look soir\u00e9e ajout\u00e9 aux favoris',
    time: 'Il y a 5 jours',
    avatar: null,
  },
];

// ============ STATS (right panel) ============
const STATS = [
  {
    value: '18',
    label: 'port\u00e9s',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    value: '7',
    label: 'nouveaux looks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    value: '4,2',
    label: 'co\u00fbt par port',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [showShare, setShowShare] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Camille';
  const initial = (user?.name || 'Camille').charAt(0).toUpperCase();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname?.startsWith(href);

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
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Paramètres — pushed to bottom */}
        <div className="mt-auto">
          <Link
            href="/profile"
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#8A8A8A] transition-all hover:bg-[#F7F5F2] hover:text-[#111111]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Param&egrave;tres
          </Link>
        </div>
      </aside>

      {/* =================================================
          ZONE 2 — CENTER CONTENT (flex-1, scrollable)
          ================================================= */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-5 py-6 pb-24 lg:px-10 lg:py-8 lg:pb-10">
        {/* Mobile header (small screens only) */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="font-serif text-lg text-[#111111] tracking-[0.15em] no-underline">
            LIEN
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="Partager LIEN"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        {children}
      </main>

      {/* =================================================
          ZONE 3 — RIGHT PANEL (w-[320px], scrollable)
          ================================================= */}
      <aside className="hidden h-screen w-[320px] flex-shrink-0 flex-col overflow-y-auto border-l border-[#EFEFEF] bg-[#F7F5F2] px-6 py-8 lg:flex">
        {/* A. USER HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={firstName}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-lg text-[#C6A47E]">{initial}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs leading-none text-[#8A8A8A]">Bonjour,</span>
            <span className="mt-0.5 text-sm font-semibold text-[#111111]">
              {firstName}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F0EDE8]"
              aria-label="Partager LIEN"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
            <Link
              href="/messages"
              aria-label="Notifications"
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#D4785C]" />
            </Link>
          </div>
        </div>

        {/* B. WEATHER + TENUE DU JOUR */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6A47E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span className="text-sm font-semibold text-[#111111]">22&deg;</span>
            <span className="text-xs text-[#8A8A8A]">Marseille</span>
          </div>
          <Link href="/outfits" className="font-serif text-xs text-[#111111]">
            Tenue du jour &rarr;
          </Link>
        </div>

        {/* C. STATISTIQUES DRESSING */}
        <div className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-serif text-base text-[#111111]">
              Statistiques dressing
            </h3>
            <span className="text-xs text-[#8A8A8A]">Ce mois-ci</span>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="grid grid-cols-3 gap-2 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F2]">
                    {stat.icon}
                  </div>
                  <p className="mt-2 font-serif text-xl leading-none text-[#111111]">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[#8A8A8A]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* D. ACTIVITE RECENTE */}
        <div className="mb-6">
          <h3 className="mb-3 font-serif text-base text-[#111111]">
            Activit&eacute; r&eacute;cente
          </h3>
          <div className="divide-y divide-[#F7F5F2] overflow-hidden rounded-2xl bg-white shadow-sm">
            {ACTIVITIES.map((a) => (
              <div
                key={a.text}
                className="flex items-center gap-3 px-4 py-3"
              >
                {a.kind === 'heart' ? (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-50">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#F87171"
                      stroke="#F87171"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                ) : a.avatar ? (
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={a.avatar}
                      alt=""
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[#EDE5DC]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[#111111]">
                    {a.text}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8A8A8A]">{a.time}</p>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#CFCFCF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* E. UPGRADE BANNER */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-5">
          <div className="relative z-10 max-w-[65%]">
            <p className="font-serif text-sm text-white">
              Upgradez votre exp&eacute;rience
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-[#CFCFCF]">
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
          <div className="absolute bottom-0 right-0 top-0 w-[40%] opacity-30">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200"
              alt=""
              fill
              className="object-cover"
              sizes="120px"
            />
          </div>
        </div>
      </aside>

      {/* =================================================
          MOBILE DRAWER (replaces sidebar on small screens)
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => {
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
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-[9px] font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile bottom nav — fallback for small screens */}
      <BottomNav />

      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  );
}
