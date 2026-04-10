'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, token, _hasHydrated, loadUser } = useAuthStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for Zustand to rehydrate from localStorage, then validate the token
  useEffect(() => {
    if (!_hasHydrated) return;

    // No token after hydration → definitely not logged in
    if (!token) {
      router.push('/login');
      return;
    }

    // Token exists but no user object → validate with the API
    if (!user) {
      loadUser().then(() => {
        setAuthChecked(true);
      });
    } else {
      setAuthChecked(true);
    }
  }, [_hasHydrated, token, user]);

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

  // After check, if no token, don't render (redirect is in flight)
  if (!token) return null;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--color-app-bg)' }}>
      <main className="mx-auto max-w-lg px-5 py-4 lg:max-w-6xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
