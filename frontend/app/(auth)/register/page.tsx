'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const success = await register(email, password, name);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Erreur lors de l\'inscription. Cet email est peut-être déjà utilisé.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--color-app-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D0D0D]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0D0D0D]">Créer un compte</h1>
          <p className="mt-2 text-sm text-[#8A8A8A]">
            Commencez à organiser votre dressing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#0D0D0D]">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
              placeholder="Votre nom"
            />
          </div>

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
              minLength={6}
              className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-[#0D0D0D] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? 'Chargement...' : 'Créer mon compte'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-white py-3.5 text-sm font-medium text-[#0D0D0D]"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          Déjà un compte ?{' '}
          <a href="/login" className="font-semibold text-[#0D0D0D]">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
