'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/types';
import { useAuthStore } from '@/lib/store';

type Status = 'verifying' | 'expired' | 'error';

function VerifyHandler({ onStatus }: { onStatus: (s: Status) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      onStatus('error');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    fetch(`${apiUrl}/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();

        if (res.status === 410) {
          onStatus('expired');
          return;
        }

        if (!res.ok || !data.success || !data.data) {
          onStatus('error');
          return;
        }

        const { user, token: jwtToken } = data.data as { user: User; token: string };

        // Magic-link session is 30 days by default (treated like "remember me")
        localStorage.setItem('lien_token', jwtToken);
        localStorage.setItem('lien_remember_me', 'true');
        useAuthStore.setState({ token: jwtToken, user });

        const profile = (user.style_profile ?? null) as Record<string, unknown> | null;
        const needsOnboarding = !profile || (!profile.styles && !profile.budget);
        const isStylist = user.role === 'STYLIST';
        const dashPath = isStylist ? '/stylist-dashboard' : '/dashboard';
        router.push(needsOnboarding ? '/onboarding' : dashPath);
      })
      .catch(() => {
        onStatus('error');
      });
  }, [searchParams, router, onStatus]);

  return null;
}

export default function VerifyPage() {
  const [status, setStatus] = useState<Status>('verifying');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2] px-5">
      <div className="max-w-sm w-full flex flex-col items-center text-center">
        <Link href="/" className="font-serif text-2xl text-[#111111] no-underline mb-8">LIEN</Link>

        {status === 'verifying' && (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#111111] border-t-transparent mb-4" />
            <h1 className="font-serif text-xl text-[#111111] mb-2">Connexion en cours</h1>
            <p className="text-sm text-[#8A8A8A]">
              Nous v&eacute;rifions votre lien de connexion...
            </p>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h1 className="font-serif text-xl text-[#111111] mb-2">Lien expir&eacute;</h1>
            <p className="text-sm text-[#8A8A8A] mb-6">
              Ce lien de connexion n&rsquo;est plus valide. Demandez-en un nouveau pour vous connecter.
            </p>
            <Link
              href="/login"
              className="bg-[#111111] text-white rounded-full py-3 px-8 text-sm font-medium no-underline"
            >
              Demander un nouveau lien
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-[#FFF8F6] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="font-serif text-xl text-[#111111] mb-2">Lien invalide</h1>
            <p className="text-sm text-[#8A8A8A] mb-6">
              Nous n&rsquo;avons pas pu v&eacute;rifier ce lien. Essayez de vous reconnecter.
            </p>
            <Link
              href="/login"
              className="bg-[#111111] text-white rounded-full py-3 px-8 text-sm font-medium no-underline"
            >
              Retour &agrave; la connexion
            </Link>
          </>
        )}

        <Suspense fallback={null}>
          <VerifyHandler onStatus={setStatus} />
        </Suspense>
      </div>
    </div>
  );
}
