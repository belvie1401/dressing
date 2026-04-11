'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [magicStatus, setMagicStatus] = useState<'idle' | 'loading' | 'sent'>('idle');
  const [magicSentTo, setMagicSentTo] = useState('');
  const { login, requestMagicLink, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show error from Google OAuth redirect
  useEffect(() => {
    const err = searchParams.get('error');
    if (err) {
      const messages: Record<string, string> = {
        google_denied: 'Connexion Google annulée',
        google_token_failed: 'Échec de l’authentification Google',
        google_no_email: 'Aucun email associé au compte Google',
        google_server_error: 'Erreur serveur lors de la connexion Google',
        invalid_token: 'Token invalide, veuillez réessayer',
        network: 'Erreur réseau, veuillez réessayer',
      };
      setError(messages[err] || 'Erreur de connexion');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password, rememberMe);
    if (success) {
      const role = useAuthStore.getState().user?.role;
      router.push(role === 'STYLIST' ? '/stylist-dashboard' : '/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
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
      setError('Impossible d’envoyer le lien. Réessayez dans un instant.');
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
          <p className="text-xs text-[#8A8A8A] mt-4">
            Le lien expire dans 15 minutes.
          </p>
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
      {error && (
        <div className="rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
          placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
        />
      </div>

      {/* Remember me */}
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
        disabled={isLoading || magicStatus === 'loading'}
        className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isLoading ? (
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
        disabled={isLoading || magicStatus === 'loading'}
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
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
          window.location.href = `${apiUrl}/auth/google`;
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
        <Link href="/" className="font-serif text-2xl text-[#111111] no-underline">LIEN</Link>
      </div>
      <h1 className="font-serif text-xl text-center text-[#111111]">Bon retour</h1>
      <p className="text-sm text-[#8A8A8A] text-center mb-8">Connectez-vous &agrave; votre compte</p>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="text-sm text-[#8A8A8A] text-center mt-4">
        Pas encore de compte ?{' '}
        <a href="/register" className="font-semibold text-[#111111]">S&apos;inscrire</a>
      </p>
    </div>
  );
}
