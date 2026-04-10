'use client';

import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const leftTabs: Tab[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Dressing',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" />
        <line x1="16" y1="6" x2="16" y2="8" />
      </svg>
    ),
  },
];

const rightTabs: Tab[] = [
  {
    href: '/stylists',
    label: 'Styliste',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke={active ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/profile',
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

  const checkActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname?.startsWith(href);

  const renderTab = (tab: Tab) => {
    const active = checkActive(tab.href);
    return (
      <a key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5">
        <div className="flex h-8 w-8 items-center justify-center">
          {tab.icon(!!active)}
        </div>
        <span className={`text-[9px] mt-0.5 ${active ? 'text-[#111111]' : 'text-[#8A8A8A]'}`}>
          {tab.label}
        </span>
        {active && <div className="w-1 h-1 bg-[#111111] rounded-full" />}
      </a>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EFEFEF] bg-white pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {leftTabs.map(renderTab)}

        {/* Center plus button */}
        <a
          href="/wardrobe/add"
          className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full shadow-lg"
          style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </a>

        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
