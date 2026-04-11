'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { User } from '@/types';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type TokenStatus = 'checking' | 'valid' | 'expired' | 'not_found';

// ─── Password strength helpers ─────────────────────────────────────────────
type Strength = 0 | 1 | 2 | 3 | 4;

function scorePassword(pw: string): Strength {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score as Strength;
}

const STRENGTH_LABELS: Record<Strength, string> = {
  0: 'Trop court',
  1: 'Faible',
  2: 'Moyen',
  3: 'Fort',
  4: 'Tr\u00e8s fort',
};

const STRENGTH_BAR_CLASS: Record<Strength, string> = {
  0: 'w-1/4 bg-red-300',
  1: 'w-1/4 bg-red-300',
  2: 'w-2/4 bg-amber-300',
  3: 'w-3/4 bg-[#C6A47E]',
  4: 'w-full bg-green-400',
};

// ─── Page wrapper (Suspense for useSearchParams) ───────────────────────────
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col px-5 py-8">
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-[#8A8A8A] w-fit"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Connexion
      </Link>

      <div className="text-center mt-6 mb-2">
        <Link href="/" className="font-serif text-2xl text-[#111111] no-underline">
          LIEN
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center mt-10">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

// ─── Inner form ────────────────────────────────────────────────────────────
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenStatus('not_found');
      return;
    }
    let cancelled = false;
    fetch(`${API_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        const result = data?.data;
        if (result?.valid) {
          setEmail(result.email || '');
          setTokenStatus('valid');
        } else if (result?.reason === 'expired') {
          setTokenStatus('expired');
        } else {
          setTokenStatus('not_found');
        }
      })
      .catch(() => {
        if (!cancelled) setTokenStatus('not_found');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const strength = useMemo(() => scorePassword(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caract\u00e8res.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const code = data?.error;
        if (code === 'EXPIRED_TOKEN') {
          setTokenStatus('expired');
        } else if (code === 'INVALID_TOKEN') {
          setTokenStatus('not_found');
        } else if (code === 'WEAK_PASSWORD') {
          setError('Mot de passe trop faible.');
        } else {
          setError('Probl\u00e8me technique. R\u00e9essayez dans quelques instants.');
        }
        return;
      }

      // Auto-login
      const { user, token: jwtToken } = data.data as { user: User; token: string };
      localStorage.setItem('lien_token', jwtToken);
      localStorage.setItem('lien_remember_me', 'true');
      useAuthStore.setState({ token: jwtToken, user });

      const dest = user.role === 'STYLIST' ? '/stylist-dashboard' : '/dashboard';
      router.push(dest);
    } catch {
      setError('Probl\u00e8me de connexion. R\u00e9essayez.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Token check states ────────────────────────────────────────────────
  if (tokenStatus === 'checking') {
    return (
      <div className="flex flex-col items-center mt-10">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        <p className="mt-3 text-sm text-[#8A8A8A]">V&eacute;rification du lien...</p>
      </div>
    );
  }

  if (tokenStatus === 'expired' || tokenStatus === 'not_found') {
    return (
      <div className="flex flex-col items-center mt-10 max-w-sm mx-auto w-full text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF8F6] flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-serif text-xl text-[#111111] mb-2">
          {tokenStatus === 'expired' ? 'Lien expir\u00e9' : 'Lien invalide'}
        </h1>
        <p className="text-sm text-[#8A8A8A] mb-6">
          {tokenStatus === 'expired'
            ? 'Ce lien de r\u00e9initialisation n\u2019est plus valide. Demandez-en un nouveau.'
            : 'Nous n\u2019avons pas pu v\u00e9rifier ce lien. Demandez-en un nouveau.'}
        </p>
        <Link
          href="/forgot-password"
          className="bg-[#111111] text-white rounded-full py-3 px-8 text-sm font-medium no-underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  // ─── Reset form ────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="font-serif text-xl text-center text-[#111111] mt-6">
        Nouveau mot de passe
      </h1>
      <p className="text-sm text-[#8A8A8A] text-center mt-2 mb-8">
        Choisissez un nouveau mot de passe s&eacute;curis&eacute;.
        {email ? (
          <>
            <br />
            <span className="text-xs">{email}</span>
          </>
        ) : null}
      </p>

      <form onSubmit={submit} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        {error ? (
          <div className="rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
            {error}
          </div>
        ) : null}

        {/* New password */}
        <div>
          <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 pr-12 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
              placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#8A8A8A]"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.74 19.74 0 0 1-3.17 4.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength bar */}
          {password.length > 0 ? (
            <div className="mt-2">
              <div className="h-1 w-full rounded-full bg-[#EFEFEF] overflow-hidden">
                <div
                  className={`h-full transition-all ${STRENGTH_BAR_CLASS[strength]}`}
                />
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                {STRENGTH_LABELS[strength]}
              </p>
            </div>
          ) : null}
        </div>

        {/* Confirm */}
        <div>
          <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">
            Confirmer le mot de passe
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
            placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Mise &agrave; jour...
            </>
          ) : (
            'Mettre &agrave; jour'
          )}
        </button>
      </form>
    </>
  );
}
