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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="mt-2 text-sm text-gray-500">
            Accédez à votre dressing intelligent
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Se connecter'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <a href="/register" className="font-medium text-black hover:underline">
            S&#39;inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
