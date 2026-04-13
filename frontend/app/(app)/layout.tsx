'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useAuthStore } from '@/lib/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import ClerkTokenSync from '@/components/auth/ClerkTokenSync';
import BottomNav from '@/components/ui/BottomNav';
import Sidebar from '@/components/ui/Sidebar';
import { GlobalSearchProvider } from '@/components/ui/GlobalSearch';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  // Role-based dashboard redirect (only once user data is loaded)
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    if (user.role === 'STYLIST' && pathname === '/dashboard') {
      router.replace('/stylist-dashboard');
    }
    if (user.role === 'CLIENT' && pathname === '/stylist-dashboard') {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, user, pathname, router]);

  // Connect socket once authenticated
  useEffect(() => {
    if (isSignedIn && user) {
      connectSocket();
      return () => {
        disconnectSocket();
      };
    }
  }, [isSignedIn, user]);

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--color-app-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          <span className="font-serif text-sm text-[#8A8A8A]">Chargement...</span>
        </div>
      </div>
    );
  }

  // Middleware guarantees only authenticated users reach here,
  // but guard against the edge case where isSignedIn is false
  if (!isSignedIn) return null;

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
