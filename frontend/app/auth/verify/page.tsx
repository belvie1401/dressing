'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy magic-link verification page. Clerk now handles email verification.
 * Redirect users to the login page.
 */
export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
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
