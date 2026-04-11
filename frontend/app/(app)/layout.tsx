'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import BottomNav from '@/components/ui/BottomNav';
import Sidebar from '@/components/ui/Sidebar';
import { GlobalSearchProvider } from '@/components/ui/GlobalSearch';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, token, _hasHydrated, loadUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for Zustand to rehydrate from localStorage, then validate the token
  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      loadUser().then(() => {
        setAuthChecked(true);
      });
    } else {
      setAuthChecked(true);
    }
  }, [_hasHydrated, token, user]);

  // Role-based dashboard redirect
  useEffect(() => {
    if (!authChecked || !user) return;
    if (user.role === 'STYLIST' && pathname === '/dashboard') {
      router.replace('/stylist-dashboard');
    }
    if (user.role === 'CLIENT' && pathname === '/stylist-dashboard') {
      router.replace('/dashboard');
    }
  }, [authChecked, user, pathname]);

  // After auth check completes, if token was cleared by loadUser (invalid), redirect
  useEffect(() => {
    if (authChecked && !token) {
      router.push('/login');
    }
  }, [authChecked, token]);

  // Connect socket once authenticated
  useEffect(() => {
    if (authChecked && token && user) {
      connectSocket();
      return () => {
        disconnectSocket();
      };
    }
  }, [authChecked, token, user]);

  // Show loading spinner while hydration or auth check is pending
  if (!_hasHydrated || !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-app-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          <span className="font-serif text-sm text-[#8A8A8A]">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!token) return null;

  // /dashboard and /stylist-dashboard have their own dedicated layouts
  // (sidebar + main + right panel/top bar + mobile nav fallback)
  if (pathname === '/dashboard' || pathname === '/stylist-dashboard') {
    return <GlobalSearchProvider>{children}</GlobalSearchProvider>;
  }

  // Other stylist-facing routes reuse the client shell but skip the mobile bottom nav
  const isStylistRoute =
    pathname?.startsWith('/stylist') ||
    pathname === '/my-clients' ||
    pathname?.startsWith('/my-clients/') ||
    pathname === '/agenda' ||
    pathname === '/wallet' ||
    pathname?.startsWith('/lookbooks');

  return (
    <GlobalSearchProvider>
      <div className="flex min-h-screen" style={{ background: 'var(--color-app-bg)' }}>
        {/* Desktop sidebar — hidden on mobile */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile bottom nav — hidden on desktop; skipped entirely on stylist desktop routes */}
        {!isStylistRoute && <BottomNav />}
      </div>
    </GlobalSearchProvider>
  );
}
