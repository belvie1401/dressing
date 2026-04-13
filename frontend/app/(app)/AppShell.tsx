'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import ClerkTokenSync from '@/components/auth/ClerkTokenSync';
import BottomNav from '@/components/ui/BottomNav';
import Sidebar from '@/components/ui/Sidebar';
import { GlobalSearchProvider } from '@/components/ui/GlobalSearch';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  // Role-based dashboard redirect
  useEffect(() => {
    if (!user) return;
    if (user.role === 'STYLIST' && pathname === '/dashboard') {
      router.replace('/stylist-dashboard');
    }
    if (user.role === 'CLIENT' && pathname === '/stylist-dashboard') {
      router.replace('/dashboard');
    }
  }, [user, pathname, router]);

  // Connect socket once user is loaded
  useEffect(() => {
    if (user) {
      connectSocket();
      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  // /dashboard and /stylist-dashboard have their own dedicated layouts
  if (pathname === '/dashboard' || pathname === '/stylist-dashboard') {
    return (
      <GlobalSearchProvider>
        <ClerkTokenSync />
        {children}
        <BottomNav />
      </GlobalSearchProvider>
    );
  }

  const isStylistRoute =
    pathname?.startsWith('/stylist-') ||
    pathname === '/my-clients' ||
    pathname?.startsWith('/my-clients/') ||
    pathname === '/agenda' ||
    pathname === '/wallet' ||
    pathname?.startsWith('/lookbooks');

  return (
    <GlobalSearchProvider>
      <ClerkTokenSync />
      <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden" style={{ background: 'var(--color-app-bg)' }}>
        <Sidebar />
        <main className="flex-1 min-w-0 w-full overflow-x-hidden mobile-bottom-padding lg:pb-8">
          {children}
        </main>
        {!isStylistRoute && <BottomNav />}
      </div>
    </GlobalSearchProvider>
  );
}
