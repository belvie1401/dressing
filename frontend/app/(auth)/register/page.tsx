'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'STYLIST' | ''>('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caract\u00e8res');
      return;
    }

    if (!role) {
      setError('Veuillez choisir un r\u00f4le');
      return;
    }

    const success = await register(email, password, name, role);
    if (success) {
      router.push('/onboarding');
    } else {
      setError('Erreur lors de l\'inscription. Cet email est peut-\u00eatre d\u00e9j\u00e0 utilis\u00e9.');
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
        <Link href="/" className="font-serif text-2xl text-[#111111] no-underline">LIEN</Link>
      </div>
      <h1 className="font-serif text-xl text-center text-[#111111]">Cr&eacute;er un compte</h1>
      <p className="text-sm text-[#8A8A8A] text-center mb-8">Rejoignez la communaut&eacute; Lien</p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto w-full">
        {error && (
          <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Nom */}
        <div>
          <label className="text-xs text-[#8A8A8A] mb-1 font-medium uppercase tracking-wide block">Nom</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
            placeholder="Votre nom"
          />
        </div>

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
            minLength={6}
            className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-[#111111] text-sm focus:outline-none focus:border-[#111111] placeholder:text-[#CFCFCF]"
            placeholder="Minimum 6 caract\u00e8res"
          />
        </div>

        {/* Role selection */}
        <div>
          <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">Je suis...</label>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 ${
                role === 'CLIENT' ? 'bg-white border-[#111111] shadow-md' : 'bg-white border-[#EFEFEF]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-center text-[#111111]">Cliente</p>
              <p className="text-xs text-[#8A8A8A] text-center mt-1">Je g&egrave;re mon dressing</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('STYLIST')}
              className={`cursor-pointer rounded-2xl p-4 border-2 transition-all duration-200 ${
                role === 'STYLIST' ? 'bg-white border-[#111111] shadow-md' : 'bg-white border-[#EFEFEF]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-center text-[#111111]">Styliste</p>
              <p className="text-xs text-[#8A8A8A] text-center mt-1">Je conseille mes clientes</p>
            </button>
          </div>
        </div>

        <a href="/pricing" className="text-xs text-[#8A8A8A] underline text-center">
          Voir les abonnements
        </a>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-medium mt-2 disabled:opacity-50"
        >
          {isLoading ? 'Cr\u00e9ation...' : 'Cr\u00e9er mon compte'}
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

      <p className="text-sm text-[#8A8A8A] text-center mt-4">
        D&eacute;j&agrave; un compte ?{' '}
        <a href="/login" className="font-semibold text-[#111111]">Se connecter</a>
      </p>
    </div>
  );
}
