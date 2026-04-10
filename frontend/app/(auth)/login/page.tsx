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
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col px-5 py-8">
      {/* Back */}
      <a href="/" className="flex items-center gap-2 text-sm text-[#8A8A8A] w-fit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Accueil
      </a>

      {/* Brand */}
      <div className="text-center mt-6 mb-2">
        <span className="font-serif text-2xl text-[#111111]">LIEN</span>
      </div>
      <h1 className="font-serif text-xl text-center text-[#111111]">Bon retour</h1>
      <p className="text-sm text-[#8A8A8A] text-center mb-8">Connectez-vous &agrave; votre compte</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Email */}
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

        {/* Mot de passe */}
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

        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <button
          type="button"
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

      <p className="text-sm text-[#8A8A8A] text-center mt-4">
        Pas encore de compte ?{' '}
        <a href="/register" className="font-semibold text-[#111111]">S&apos;inscrire</a>
      </p>
    </div>
  );
}
