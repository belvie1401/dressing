'use client';

import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const tabs: Tab[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Dressing',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/favorites',
    label: 'Favoris',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#111111' : 'none'} stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={active ? '#111111' : 'none'} />
        <path d="M12 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill={active ? 'white' : 'none'} stroke={active ? 'white' : '#111111'} />
        <path d="M6 20.5c0-2.5 2.5-4.5 6-4.5s6 2 6 4.5" stroke={active ? 'white' : '#111111'} fill="none" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E0DCD5] bg-white pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(tab.href);

          return (
            <a
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5"
            >
              <div className={`relative flex h-8 w-8 items-center justify-center ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                {tab.icon(!!isActive)}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold text-[#111111]' : 'text-[#8A8A8A]'}`}>
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
