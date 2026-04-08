'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-gray-500">
            Commencez à organiser votre dressing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="Votre nom"
            />
          </div>

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
              minLength={6}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="Minimum 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Créer mon compte
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-black hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
