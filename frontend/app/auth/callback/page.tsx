'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      router.push(`/login?error=${error}`);
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    // Store the token
    localStorage.setItem('lien_token', token);

    // Fetch user data with the new token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          useAuthStore.setState({ token, user: data.data });

          // Check if user needs onboarding
          const profile = data.data.style_profile;
          const needsOnboarding = !profile || (!profile.styles && !profile.budget);
          router.push(needsOnboarding ? '/onboarding' : '/dashboard');
        } else {
          localStorage.removeItem('lien_token');
          router.push('/login?error=invalid_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('lien_token');
        router.push('/login?error=network');
      });
  }, [searchParams, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        <p className="font-serif text-sm text-[#8A8A8A]">Connexion en cours...</p>
      </div>
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
