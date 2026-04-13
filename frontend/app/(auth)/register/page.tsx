'use client';

import { SignUp } from '@clerk/nextjs';
import { useState } from 'react';

export default function RegisterPage() {
  const [roleSelected, setRoleSelected] = useState<string | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

  if (!showSignUp) {
    return (
      <div
        className="min-h-screen bg-[#F7F5F2] flex flex-col px-5 py-8"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)',
        }}
      >
        <a href="/" className="mb-8 block">
          <img src="/logo.png" alt="LIEN" className="h-12 w-auto" />
        </a>

        <h1 className="font-serif text-2xl text-[#111111]">Créer un compte</h1>
        <p className="text-sm text-[#8A8A8A] mt-1 mb-8">
          Rejoignez la communauté LIEN
        </p>

        <p className="text-xs text-[#8A8A8A] uppercase tracking-wide mb-3">
          Je suis...
        </p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => setRoleSelected('CLIENT')}
            className={`rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
              roleSelected === 'CLIENT'
                ? 'border-[#111111] bg-white shadow-md'
                : 'border-transparent bg-[#F0EDE8]'
            }`}
          >
            <div className="w-10 h-10 bg-[#EDE5DC] rounded-full flex items-center justify-center mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6A47E"
                strokeWidth="1.5"
              >
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111111]">Cliente</p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Je gère mon dressing personnel
            </p>
          </button>

          <button
            onClick={() => setRoleSelected('STYLIST')}
            className={`rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
              roleSelected === 'STYLIST'
                ? 'border-[#111111] bg-white shadow-md'
                : 'border-transparent bg-[#F0EDE8]'
            }`}
          >
            <div className="w-10 h-10 bg-[#EDE5DC] rounded-full flex items-center justify-center mb-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6A47E"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111111]">Styliste</p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Je conseille mes clientes
            </p>
          </button>
        </div>

        {!roleSelected && (
          <p className="text-xs text-[#8A8A8A] text-center mb-4">
            Choisissez un rôle pour continuer
          </p>
        )}

        <button
          onClick={() => roleSelected && setShowSignUp(true)}
          disabled={!roleSelected}
          className={`rounded-full w-full py-4 text-sm font-medium transition-all ${
            roleSelected
              ? 'bg-[#111111] text-white cursor-pointer'
              : 'bg-[#CFCFCF] text-white cursor-not-allowed'
          }`}
        >
          Continuer
        </button>

        <p className="text-sm text-[#8A8A8A] text-center mt-5">
          Déjà un compte ?{' '}
          <a href="/login" className="text-[#111111] font-medium underline">
            Se connecter
          </a>
        </p>

        <p className="text-xs text-[#CFCFCF] text-center mt-4">
          En continuant, vous acceptez nos{' '}
          <a href="/cgv" className="underline">
            CGV
          </a>
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5 py-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <button
            onClick={() => setShowSignUp(false)}
            className="text-xs text-[#8A8A8A] flex items-center gap-1 mx-auto mb-4 cursor-pointer"
          >
            ← Retour
          </button>
          <img src="/logo.png" alt="LIEN" className="h-12 w-auto mx-auto" />
          <div className="w-8 h-0.5 bg-[#C6A47E] mx-auto mt-2" />
          <div className="mt-3 inline-flex items-center gap-2 bg-[#F0EDE8] rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 bg-[#C6A47E] rounded-full" />
            <span className="text-xs text-[#111111] font-medium">
              {roleSelected === 'CLIENT' ? 'Cliente' : 'Styliste'}
            </span>
          </div>
        </div>

        <SignUp
          routing="hash"
          fallbackRedirectUrl="/onboarding"
          unsafeMetadata={{ role: roleSelected }}
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full',
            },
          }}
        />
      </div>
    </div>
  );
}
