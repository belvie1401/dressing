'use client';

import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Accueil', icon: '\uD83C\uDFE0' },
  { href: '/wardrobe', label: 'Dressing', icon: '\uD83D\uDC55' },
  { href: '/outfits', label: 'Looks', icon: '\u2728' },
  { href: '/calendar', label: 'Agenda', icon: '\uD83D\uDCC5' },
  { href: '/messages', label: 'Messages', icon: '\uD83D\uDCAC' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);

          return (
            <a
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className={isActive ? 'font-semibold' : 'font-normal'}>{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
