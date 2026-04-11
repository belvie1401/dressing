'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@/types';
import { useAuthStore } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const REQUEST_TIMEOUT_MS = 10_000;
const REMEMBER_EMAIL_KEY = 'lien_email';

// ─── Backend error code → French message ──────────────────────────────────
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_NOT_FOUND: 'Aucun compte trouv\u00e9 avec cet email',
  ACCOUNT_SUSPENDED: 'Ce compte a \u00e9t\u00e9 suspendu. Contactez le support.',
  SERVER_ERROR: 'Probl\u00e8me technique. R\u00e9essayez dans quelques instants.',
};

interface LoginResult {
  ok: boolean;
  user?: User;
  token?: string;
  /** Backend error code or one of: 'NETWORK', 'TIMEOUT' */
  errorCode?: string;
}

/** Single login fetch with abort/timeout. Throws nothing — returns a result. */
async function loginFetch(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<LoginResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      return { ok: false, errorCode: data?.error || 'SERVER_ERROR' };
    }
    return { ok: true, user: data.data.user, token: data.data.token };
  } catch (err: unknown) {
    const e = err as { name?: string };
    if (e?.name === 'AbortError') {
      return { ok: false, errorCode: 'TIMEOUT' };
    }
    return { ok: false, errorCode: 'NETWORK' };
  } finally {
    clearTimeout(timeout);
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Magic link state
  const [magicStatus, setMagicStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [magicSentTo, setMagicSentTo] = useState('');

  const { requestMagicLink } = useAuthStore();
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // OAuth redirect error from query string
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      const messages: Record<string, string> = {
        google_denied: 'Connexion Google annul\u00e9e',
        google_token_failed: 'Échec de l\u2019authentification Google',
        google_no_email: 'Aucun email associ\u00e9 au compte Google',
        google_server_error: 'Erreur serveur lors de la connexion Google',
        invalid_token: 'Token invalide, veuillez r\u00e9essayer',
        network: 'Erreur r\u00e9seau, veuillez r\u00e9essayer',
      };
      setError(messages[err] || 'Erreur de connexion');
    }
  }, [searchParams]);

  // Pre-fill email from "remember email" preference
  useEffect(() => {
    try {
      const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (remembered) {
        setEmail(remembered);
        setRememberEmail(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Cleanup any pending retry on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const persistAndRedirect = useCallback(
    (user: User, token: string) => {
      localStorage.setItem('lien_token', token);
      localStorage.setItem('lien_remember_me', rememberMe ? 'true' : 'false');
      const activeRole: 'CLIENT' | 'STYLIST' =
        user.active_role === 'STYLIST'
          ? 'STYLIST'
          : user.active_role === 'CLIENT'
            ? 'CLIENT'
            : user.role === 'STYLIST'
              ? 'STYLIST'
              : 'CLIENT';
      useAuthStore.setState({
        user,
        token,
        activeRole,
        isDualRole: user.is_dual_role ?? false,
      });
      router.push(activeRole === 'STYLIST' ? '/stylist-dashboard' : '/dashboard');
    },
    [rememberMe, router],
  );

  /**
   * Run a login attempt. On a network failure (NOT credential failure),
   * the first call schedules a single retry 3 s later.
   */
  const attemptLogin = useCallback(
    async (attempt: number) => {
      const result = await loginFetch(email, password, rememberMe);

      if (result.ok && result.user && result.token) {
        // Save remembered email preference
        try {
          if (rememberEmail) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, email);
          } else {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
          }
        } catch {
          // ignore
        }
        persistAndRedirect(result.user, result.token);
        return;
      }

      const code = result.errorCode || 'SERVER_ERROR';

      // Network failure → auto-retry once after 3 s
      if ((code === 'NETWORK' || code === 'TIMEOUT') && attempt === 0) {
        setInfo(
          'Probl\u00e8me de connexion r\u00e9seau. Nouvelle tentative dans 3s...',
        );
        setError('');
        retryTimerRef.current = setTimeout(() => {
          setInfo('');
          attemptLogin(1).finally(() => setLoading(false));
        }, 3000);
        return;
      }

      // Final failure → display message
      const message =
        code === 'TIMEOUT'
          ? 'Connexion trop lente. R\u00e9essayez.'
          : code === 'NETWORK'
            ? 'Probl\u00e8me de connexion r\u00e9seau. R\u00e9essayez.'
            : ERROR_MESSAGES[code] || ERROR_MESSAGES.SERVER_ERROR;
      setError(message);
      setInfo('');
      setLoading(false);
    },
    [email, password, rememberMe, rememberEmail, persistAndRedirect],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setInfo('');
    setLoading(true);
    // attemptLogin handles its own setLoading(false) — we don't wrap in finally
    // because the auto-retry path needs to keep loading=true across the 3s wait.
    attemptLogin(0).catch(() => setLoading(false));
  };

  const handleMagicLink = async () => {
    setError('');

    if (!email || !email.includes('@')) {
      setError('Veuillez saisir un email valide pour recevoir un lien');
      return;
    }

    setMagicStatus('loading');
    const success = await requestMagicLink(email);
    if (success) {
      setMagicSentTo(email);
      setMagicStatus('sent');
    } else {
      setMagicStatus('idle');
      setError('Impossible d\u2019envoyer le lien. R\u00e9essayez dans un instant.');
    }
  };

  if (magicStatus === 'sent') {
    return (
      <div className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        <div className="rounded-2xl bg-[#F0EDE8] p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h2 className="font-serif text-lg text-[#111111] mb-2">Lien envoy&eacute; !</h2>
          <p className="text-sm text-[#8A8A8A] leading-relaxed">
            Un lien de connexion a &eacute;t&eacute; envoy&eacute; &agrave;{' '}
            <span className="font-medium text-[#111111]">{magicSentTo}</span>.
            <br />
            Cliquez dessus pour vous connecter instantan&eacute;ment.
          </p>
          <p className="text-xs text-[#8A8A8A] mt-4">Le lien expire dans 15 minutes.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMagicStatus('idle');
            setMagicSentTo('');
          }}
          className="text-sm text-[#8A8A8A] underline"
        >
          Utiliser un autre email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-sm mx-auto w-full"
    >
      {error ? (
        <div className="rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
          {error}
        </div>
      ) : null}

      {info ? (
        <div className="rounded-2xl border border-[#C6A47E]/30 bg-[#FFFBF8] px-4 py-3 text-sm text-[#8A8A8A] flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#C6A47E] border-t-transparent" />
          {info}
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
          className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
          placeholder="votre@email.com"
        />
      </div>

      {/* Remember email */}
      <label className="flex items-center gap-2 cursor-pointer select-none -mt-2">
        <input
          type="checkbox"
          checked={rememberEmail}
          onChange={(e) => setRememberEmail(e.target.checked)}
          className="w-4 h-4 accent-[#111111] cursor-pointer"
        />
        <span className="text-xs text-[#8A8A8A]">M&eacute;moriser mon email</span>
      </label>

      <div>
        <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">
          Mot de passe
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
          placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
        />
        <Link
          href="/forgot-password"
          className="text-xs text-[#8A8A8A] underline cursor-pointer mt-2 inline-block"
        >
          Mot de passe oubli&eacute; ?
        </Link>
      </div>

      {/* Stay-signed-in */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 accent-[#111111] cursor-pointer"
        />
        <span className="text-sm text-[#8A8A8A]">Rester connect&eacute;</span>
      </label>

      <button
        type="submit"
        disabled={loading || magicStatus === 'loading'}
        className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[#EFEFEF]" />
        <span className="text-xs text-[#8A8A8A]">ou</span>
        <div className="flex-1 h-px bg-[#EFEFEF]" />
      </div>

      {/* Magic link */}
      <button
        type="button"
        onClick={handleMagicLink}
        disabled={loading || magicStatus === 'loading'}
        className="bg-[#F0EDE8] text-[#111111] rounded-full w-full py-4 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {magicStatus === 'loading' ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
            Envoi du lien...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Recevoir un lien de connexion par email
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          window.location.href = `${API_URL}/auth/google`;
        }}
        className="bg-white border border-[#EFEFEF] rounded-full w-full py-4 text-sm text-[#111111] font-medium flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continuer avec Google
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col px-5 py-8">
      <a href="/" className="flex items-center gap-2 text-sm text-[#8A8A8A] w-fit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Accueil
      </a>

      <div className="text-center mt-6 mb-2">
        <Link href="/" className="font-serif text-2xl text-[#111111] no-underline">
          LIEN
        </Link>
      </div>
      <h1 className="font-serif text-xl text-center text-[#111111]">Bon retour</h1>
      <p className="text-sm text-[#8A8A8A] text-center mb-8">
        Connectez-vous &agrave; votre compte
      </p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-sm text-[#8A8A8A] text-center mt-4">
        Pas encore de compte ?{' '}
        <a href="/register" className="font-semibold text-[#111111]">
          S&apos;inscrire
        </a>
      </p>
    </div>
  );
}
