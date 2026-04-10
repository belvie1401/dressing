'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--color-app-bg)' }}>
      <div className="w-full max-w-sm">
        <a
          href="/"
          className="mb-6 flex min-h-[44px] w-fit items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Accueil
        </a>
        <div className="mb-8 text-center">
          <span className="font-serif text-3xl font-semibold tracking-wide text-[#111111]">LIEN</span>
          <h1 className="mt-4 text-xl font-bold text-[#111111]">Cr\u00e9er un compte</h1>
          <p className="mt-1 text-sm text-[#8A8A8A]">
            Rejoignez la communaut\u00e9 Lien
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-[#111111]">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E0DCD5] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#111111]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E0DCD5] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#111111]">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[#E0DCD5] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
              placeholder="Minimum 6 caract\u00e8res"
            />
          </div>

          {/* Role selection */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111111]">
              Je suis...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                  role === 'CLIENT'
                    ? 'border-[#111111] bg-white shadow-md'
                    : 'border-[#E0DCD5] bg-white'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={role === 'CLIENT' ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                </svg>
                <span className="text-sm font-semibold text-[#111111]">Cliente</span>
                <span className="text-center text-[11px] leading-tight text-[#8A8A8A]">Je g\u00e8re mon dressing</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('STYLIST')}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                  role === 'STYLIST'
                    ? 'border-[#111111] bg-white shadow-md'
                    : 'border-[#E0DCD5] bg-white'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={role === 'STYLIST' ? '#111111' : '#8A8A8A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-sm font-semibold text-[#111111]">Styliste</span>
                <span className="text-center text-[11px] leading-tight text-[#8A8A8A]">Je conseille mes clientes</span>
              </button>
            </div>
          </div>

          <a
            href="/pricing"
            className="flex items-center justify-center gap-1 text-xs font-medium text-[#8A8A8A] transition-colors hover:text-[#111111]"
          >
            Voir les abonnements
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? 'Cr\u00e9ation...' : 'Cr\u00e9er mon compte'}
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E0DCD5] bg-white py-3.5 text-sm font-medium text-[#111111]"
          >
            Continuer avec Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#8A8A8A]">
          D\u00e9j\u00e0 un compte ?{' '}
          <a href="/login" className="font-semibold text-[#111111]">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
