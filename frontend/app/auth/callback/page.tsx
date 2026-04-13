'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy OAuth callback page. Clerk now handles OAuth flows directly.
 * Redirect users to the dashboard.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        <p className="font-serif text-sm text-[#8A8A8A]">Redirection...</p>
      </div>
    </div>
  );
}
