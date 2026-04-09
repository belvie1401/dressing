'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

const tabs = [
  {
    href: '/dashboard',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#0D0D0D' : 'none'} stroke={active ? '#0D0D0D' : '#8A8A8A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/wardrobe',
    label: 'Recherche',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#0D0D0D' : '#8A8A8A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/outfits/create',
    label: '',
    isCenter: true,
    icon: () => (
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    ),
  },
  {
    href: '/outfits',
    label: 'Looks',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#0D0D0D' : 'none'} stroke={active ? '#0D0D0D' : '#8A8A8A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#0D0D0D' : 'none'} stroke={active ? '#0D0D0D' : '#8A8A8A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white pb-safe" style={{ boxShadow: '0 -1px 20px rgba(0,0,0,0.05)' }}>
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);
          const isCenter = (tab as any).isCenter;

          return (
            <a
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isCenter ? '-mt-5' : ''
              }`}
            >
              {tab.icon(!!isActive)}
              {tab.label && (
                <span className={`text-[10px] ${isActive ? 'font-semibold text-[#0D0D0D]' : 'text-[#8A8A8A]'}`}>
                  {tab.label}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
