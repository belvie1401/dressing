'use client';

import { usePathname } from 'next/navigation';

interface Tab {
  href: string;
  label: string;
  isCenter?: boolean;
  icon?: (active: boolean) => React.ReactNode;
}

const tabs: Tab[] = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Dressing',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    href: '/wardrobe/add',
    label: '',
    isCenter: true,
  },
  {
    href: '/outfits',
    label: 'Looks',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5 8 14.5l1.5-4.5L6 7.5h4.5z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white pb-2 pb-safe">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isCenter = 'isCenter' in tab && tab.isCenter;

          if (isCenter) {
            return (
              <a
                key={tab.href}
                href={tab.href}
                className="-translate-y-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
              </a>
            );
          }

          const isActive = tab.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname?.startsWith(tab.href) && !pathname?.startsWith('/wardrobe/add');

          return (
            <a
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-[#0D0D0D]' : 'text-gray-400'
              }`}
            >
              {tab.icon?.(!!isActive)}
              {tab.label && (
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              )}
              {isActive && (
                <span className="h-1 w-1 rounded-full bg-[#0D0D0D]" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
