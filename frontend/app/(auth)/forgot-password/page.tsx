'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Pre-fill email from "remember email" preference if available
  useEffect(() => {
    try {
      const remembered = localStorage.getItem('lien_email');
      if (remembered) setEmail(remembered);
    } catch {
      // ignore
    }
  }, []);

  // Cooldown ticker for the "Renvoyer l'email" link
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!email || !email.includes('@')) {
      setError('Veuillez saisir un email valide.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ ok?: boolean }>('/auth/forgot-password', { email });
      // Backend always returns success: true (security: don't leak account existence).
      // We treat any non-network success as "sent".
      if (res.success) {
        setSent(true);
        setResendCooldown(60);
      } else {
        setError('Probl\u00e8me technique. R\u00e9essayez dans quelques instants.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setResendCooldown(60);
    } finally {
      setLoading(false);
    }
  };

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

      {sent ? (
        // ─── SUCCESS STATE ─────────────────────────────────────────────
        <div className="flex flex-col gap-4 max-w-sm mx-auto w-full mt-6">
          <svg
            className="mx-auto"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C6A47E"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 className="font-serif text-xl text-[#111111] text-center mt-4">
            Email envoy&eacute; !
          </h1>
          <p className="text-sm text-[#8A8A8A] text-center mt-2">
            V&eacute;rifiez votre bo&icirc;te mail. Le lien est valable 1 heure.
          </p>
          <button
            type="button"
            onClick={resend}
            disabled={resendCooldown > 0 || loading}
            className="text-xs text-[#8A8A8A] underline mt-6 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendCooldown > 0
              ? `Renvoyer l'email (${resendCooldown}s)`
              : "Renvoyer l'email"}
          </button>
        </div>
      ) : (
        // ─── REQUEST FORM ──────────────────────────────────────────────
        <>
          <h1 className="font-serif text-xl text-center text-[#111111] mt-6">
            Mot de passe oubli&eacute;
          </h1>
          <p className="text-sm text-[#8A8A8A] text-center mt-2 mb-8">
            Entrez votre email et nous vous enverrons
            <br />
            un lien de r&eacute;initialisation.
          </p>

          <form
            onSubmit={submit}
            className="flex flex-col gap-4 max-w-sm mx-auto w-full"
          >
            {error ? (
              <div className="rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
                {error}
              </div>
            ) : null}

            <div>
              <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
                placeholder="votre@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>
        </>
      )}

      <p className="text-sm text-[#8A8A8A] text-center mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-[#111111]">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
