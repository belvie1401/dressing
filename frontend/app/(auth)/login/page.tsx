'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--color-app-bg)' }}>
      <div className="w-full max-w-sm">
        <a
          href="/"
          className="mb-6 flex min-h-[44px] w-fit items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Accueil
        </a>
        <div className="mb-8 text-center">
          <span className="font-serif text-3xl font-semibold tracking-wide text-[#0D0D0D]">LIEN</span>
          <h1 className="mt-4 text-xl font-bold text-[#0D0D0D]">Bon retour</h1>
          <p className="mt-1 text-sm text-[#8A8A8A]">
            Connectez-vous \u00e0 votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0D0D0D]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E0DCD5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0D0D0D]">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E0DCD5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-[#0D0D0D] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E0DCD5] bg-white py-3.5 text-sm font-medium text-[#0D0D0D]"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          Pas encore de compte ?{' '}
          <a href="/register" className="font-semibold text-[#0D0D0D]">
            S&apos;inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
