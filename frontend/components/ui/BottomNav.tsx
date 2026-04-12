'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface Tab {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

// ---- CLIENT TABS ----
const clientTabs: Tab[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#1A1A1A' : 'none'} stroke={active ? '#1A1A1A' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Dressing',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#1A1A1A' : 'none'} stroke={active ? '#1A1A1A' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" />
        <line x1="16" y1="6" x2="16" y2="8" />
      </svg>
    ),
  },
  {
    href: '/stylists',
    label: 'Styliste',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1A1A1A' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#1A1A1A' : 'none'} stroke={active ? '#1A1A1A' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#1A1A1A' : '#C4C4C4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={active ? '#1A1A1A' : 'none'} />
        <path d="M12 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill={active ? 'white' : 'none'} stroke={active ? 'white' : '#C4C4C4'} />
        <path d="M6 20.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke={active ? 'white' : '#C4C4C4'} fill="none" />
      </svg>
    ),
  },
];

// Legacy split for desktop layout compatibility
const clientLeftTabs = clientTabs.slice(0, 2);
const clientRightTabs = clientTabs.slice(3);

// ---- STYLIST TABS ----
const stylistLeftTabs: Tab[] = [
  {
    href: '/stylist-dashboard',
    label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: '/my-clients',
    label: 'Clientes',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const stylistRightTabs: Tab[] = [
  {
    href: '/messages',
    label: 'Messages',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stylist-profile',
    label: 'Profil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={active ? '#111111' : 'none'} />
        <path d="M12 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill={active ? 'white' : 'none'} stroke={active ? 'white' : '#8A8A8A'} />
        <path d="M6 20.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke={active ? 'white' : '#8A8A8A'} fill="none" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isStylist = user?.role === 'STYLIST';

  const leftTabs = isStylist ? stylistLeftTabs : clientLeftTabs;
  const rightTabs = isStylist ? stylistRightTabs : clientRightTabs;
  const centerHref = isStylist ? '/lookbooks/create' : '/wardrobe/add';

  const exactMatches = new Set(['/dashboard', '/stylist-dashboard']);
  const checkActive = (href: string) =>
    exactMatches.has(href) ? pathname === href : pathname?.startsWith(href);

  const allTabs = isStylist
    ? [...stylistLeftTabs, ...stylistRightTabs]
    : clientTabs;

  const renderTab = (tab: Tab) => {
    const active = checkActive(tab.href);
    return (
      <a key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5">
        <div className="flex h-8 w-8 items-center justify-center">
          {tab.icon(!!active)}
        </div>
        <span className={`text-[10px] mt-0.5 ${active ? 'text-[#1A1A1A]' : 'text-[#C4C4C4]'}`}>
          {tab.label}
        </span>
      </a>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#F2F0EC] bg-white pb-safe lg:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {allTabs.map(renderTab)}
      </div>
    </nav>
  );
}
