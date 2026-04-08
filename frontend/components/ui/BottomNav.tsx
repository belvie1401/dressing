'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shirt, Sparkles, Calendar, MessageCircle } from 'lucide-react';

const tabs = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/wardrobe', label: 'Dressing', icon: Shirt },
  { href: '/outfits', label: 'Looks', icon: Sparkles },
  { href: '/calendar', label: 'Agenda', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-2 pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname?.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-black'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
                {isActive && (
                  <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black" />
                )}
              </div>
              <span className={isActive ? 'font-semibold' : 'font-normal'}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
