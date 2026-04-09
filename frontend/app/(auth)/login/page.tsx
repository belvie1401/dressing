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
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D0D0D]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0D0D0D]">Connexion</h1>
          <p className="mt-2 text-sm text-[#8A8A8A]">
            Accédez à votre dressing intelligent
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
              className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
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
              className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-[#0D0D0D] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Se connecter'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-white py-3.5 text-sm font-medium text-[#0D0D0D]"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          Pas encore de compte ?{' '}
          <a href="/register" className="font-semibold text-[#0D0D0D]">
            S&#39;inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
