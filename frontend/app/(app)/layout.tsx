'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loadUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user) {
      loadUser();
    }

    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [token]);

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
