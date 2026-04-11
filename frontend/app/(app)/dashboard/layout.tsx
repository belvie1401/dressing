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
        <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10.5Z" />
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Mon dressing',
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
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

// ============ ACTIVITIES (right panel) ============
type Activity = {
  kind: 'item' | 'message' | 'heart';
  text: string;
  time: string;
  avatar?: string;
  thumb?: string;
};

const ACTIVITIES: Activity[] = [
  {
    kind: 'item',
    text: 'Veste en laine ajout\u00e9e',
    time: 'Il y a 2 jours',
    thumb:
      'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=80&h=80&fit=crop',
  },
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
  },
];

// ============ STATS (right panel) ============
const STATS = [
  {
    value: '18',
    label: 'port\u00e9s',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="2" />
        <line x1="12" y1="6" x2="12" y2="8" />
        <polyline points="3,15 12,8 21,15" />
        <line x1="3" y1="15" x2="21" y2="15" />
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
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2.5" />
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
  const lastInitial = (user?.name?.split(' ')[1] || 'D').charAt(0).toUpperCase();
  const fullDisplay = `${firstName} ${lastInitial}.`;
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
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom block — Paramètres + user card */}
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

          {/* User card */}
          <Link
            href="/profile"
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-[#F7F5F2] px-3 py-2.5 transition-colors hover:bg-[#F0EDE8]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={firstName}
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
                {fullDisplay}
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
          {/* Mobile menu button */}
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

          {/* Search */}
          <div className="hidden max-w-[540px] flex-1 items-center gap-3 rounded-full border border-[#EFEFEF] bg-white px-5 py-3 shadow-sm lg:flex">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8A8A8A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher (v\u00eatements, looks, stylistes...)"
              className="flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#8A8A8A]"
            />
            <span className="flex items-center gap-1 rounded-md border border-[#EFEFEF] bg-[#F7F5F2] px-2 py-0.5 text-[10px] font-medium text-[#8A8A8A]">
              &#8984; K
            </span>
          </div>

          {/* Spacer for mobile */}
          <div className="flex-1 lg:hidden" />

          {/* Right controls */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowShare(true)}
              className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F0EDE8] lg:flex"
              aria-label="Partager LIEN"
            >
              <svg
                width="16"
                height="16"
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
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-[#F0EDE8]"
            >
              <svg
                width="18"
                height="18"
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
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#D4785C]" />
            </Link>
            <Link
              href="/wardrobe/add"
              className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
            {/* A. PROCHAINE SESSION (dark card) */}
            <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#111111] p-5">
              <div className="relative z-10 max-w-[62%]">
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C6A47E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="text-[11px] font-medium text-[#C6A47E]">
                    Prochaine session
                  </span>
                </div>
                <p className="mt-3 font-serif text-xl leading-tight text-white">
                  Vendredi 24 mai
                </p>
                <p className="mt-1 text-xs text-[#CFCFCF]">
                  16:00 avec Chlo&eacute;
                </p>
                <Link
                  href="/calendar"
                  className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-[11px] font-medium text-[#111111] transition-colors hover:bg-[#F0EDE8]"
                >
                  Voir les d&eacute;tails
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 top-0 w-[38%]">
                <Image
                  src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=300&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#111111]/40" />
              </div>
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
              <div className="divide-y divide-[#F0EDE8] overflow-hidden rounded-2xl bg-white shadow-sm">
                {ACTIVITIES.map((a) => (
                  <div
                    key={a.text}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    {a.kind === 'item' && a.thumb ? (
                      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[#F0EDE8]">
                        <Image
                          src={a.thumb}
                          alt=""
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : a.kind === 'message' && a.avatar ? (
                      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full">
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
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="#D4785C"
                          stroke="#D4785C"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#111111]">
                        {a.text}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#8A8A8A]">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="grid grid-cols-3 gap-2 text-center">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F2]">
                        {stat.icon}
                      </div>
                      <p className="mt-2 font-serif text-2xl leading-none text-[#111111]">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[10px] text-[#8A8A8A]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* D. UPGRADE BANNER */}
            <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-5">
              <div className="relative z-10 max-w-[62%]">
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
                  D&eacute;couvrir &#10022;
                </Link>
              </div>
              <div className="absolute bottom-0 right-0 top-0 w-[38%]">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=300&fit=crop"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#111111]/30" />
              </div>
            </div>
          </aside>
        </div>
      </div>

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
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111111] px-1 text-[10px] font-bold text-white">
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
