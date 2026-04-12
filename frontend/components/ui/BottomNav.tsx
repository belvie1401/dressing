'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      href: '/dashboard',
      label: 'Accueil',
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414
            0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1
            1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1
            1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586
            l.293.293a1 1 0 001.414-1.414l-7-7z"/>
        </svg>
      ),
      inactiveIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2
            2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      href: '/wardrobe',
      label: 'Dressing',
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M21 18H3v2h18v-2zm-9-7L5
            17h14l-7-6zm0-9a2 2 0 00-2 2c0 .74.4
            1.39 1 1.73V8l-8 6h16l-8-6V5.73A2 2 0
            0014 4a2 2 0 00-2-2z"/>
        </svg>
      ),
      inactiveIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3a2 2 0 100 4 2 2 0 000-4z"/>
          <path d="M12 7v2M4 17l8-6 8 6"/>
          <rect x="3" y="17" width="18" height="4" rx="1"/>
        </svg>
      )
    },
    {
      href: '/stylists',
      label: 'Styliste',
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7
            2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0
            2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4
            c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      ),
      inactiveIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20v-1a8 8 0 0116 0v1"/>
        </svg>
      )
    },
    {
      href: '/messages',
      label: 'Messages',
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1
            0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      ),
      inactiveIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0
            012-2h14a2 2 0 012 2z"/>
        </svg>
      )
    },
    {
      href: '/profile',
      label: 'Profil',
      activeIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="currentColor">
          <circle cx="12" cy="8" r="4"/>
          <path d="M12 14c-5 0-8 2.5-8 4v1h16v-1
            c0-1.5-3-4-8-4z"/>
        </svg>
      ),
      inactiveIcon: (
        <svg width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20v-1a8 8 0 0116 0v1"/>
        </svg>
      )
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0
      z-30 bg-white border-t border-[#F2F0EB] h-[72px]
      flex items-center justify-around px-2 md:hidden">

      {tabs.map(tab => {
        const isActive = pathname === tab.href ||
          (tab.href !== '/dashboard' &&
           pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center
              gap-0.5 py-2 px-3 min-w-[48px]"
          >
            <span className={isActive
              ? 'text-[#111111]'
              : 'text-[#9B9B9B]'}>
              {isActive ? tab.activeIcon : tab.inactiveIcon}
            </span>
            <span className={`text-[11px] ${
              isActive
                ? 'text-[#111111] font-medium'
                : 'text-[#9B9B9B]'
            }`}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
