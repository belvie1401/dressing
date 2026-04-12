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
    icon: (active) =>
      active ? (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
  },
  {
    href: '/wardrobe',
    label: 'Dressing',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#9B9B9B'} strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V8l8 6H3l8-6V5.72A2 2 0 0 1 12 2z" />
        <path d="M3 14v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-5" />
      </svg>
    ),
  },
  {
    href: '/stylists',
    label: 'Styliste',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#9B9B9B'} strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#9B9B9B'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#9B9B9B'} strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
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
    icon: (active) =>
      active ? (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#111111">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
  },
  {
    href: '/my-clients',
    label: 'Clientes',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#9B9B9B'} strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
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
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#9B9B9B'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stylist-profile',
    label: 'Profil',
    icon: (active) => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={active ? '#111111' : '#9B9B9B'} strokeWidth={active ? '2' : '1.5'} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
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
      <a key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 cursor-pointer py-2 px-3">
        {tab.icon(!!active)}
        <span className={`text-[11px] ${active ? 'text-[#111111] font-medium' : 'text-[#9B9B9B]'}`}>
          {tab.label}
        </span>
      </a>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#F2F0EB] bg-white pb-safe lg:hidden">
      <div className="flex h-[72px] items-center justify-around px-2">
        {allTabs.map(renderTab)}
      </div>
    </nav>
  );
}
