'use client';

import { SignUp } from '@clerk/nextjs';
import { useState } from 'react';

export default function RegisterPage() {
  const [role, setRole] = useState<string | null>(null);
  const [step, setStep] = useState<'role' | 'signup'>('role');

  if (step === 'role') {
    return (
      <div
        className="min-h-screen bg-[#F7F5F2] flex flex-col px-5"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)',
          paddingBottom: '40px',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="LIEN" className="h-8 w-auto" />
            <span className="font-serif text-lg text-[#111111] tracking-wide">Lien</span>
          </a>
          <div
            style={{
              width: '32px',
              height: '2px',
              backgroundColor: '#C6A47E',
              margin: '8px auto 0',
            }}
          />
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl text-[#111111] text-center">Créer un compte</h1>
        <p className="text-sm text-[#8A8A8A] mt-1 mb-8 text-center">Rejoignez la communauté LIEN</p>

        {/* Role selection */}
        <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wide mb-3 text-center">
          Je suis...
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setRole('CLIENT')}
            className={`rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
              role === 'CLIENT'
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
                strokeLinecap="round"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111111]">Cliente</p>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5 leading-relaxed">
              Je gère mon dressing personnel
            </p>
          </button>

          <button
            onClick={() => setRole('STYLIST')}
            className={`rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
              role === 'STYLIST'
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
                strokeLinecap="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111111]">Styliste</p>
            <p className="text-[11px] text-[#8A8A8A] mt-0.5 leading-relaxed">
              Je conseille mes clientes
            </p>
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={() => role && setStep('signup')}
          disabled={!role}
          className={`rounded-full w-full py-4 text-sm font-medium transition-all cursor-pointer ${
            role ? 'bg-[#111111] text-white' : 'bg-[#CFCFCF] text-white cursor-not-allowed'
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

        <p className="text-[10px] text-[#CFCFCF] text-center mt-4">
          En créant un compte, vous acceptez nos{' '}
          <a href="/cgv" className="underline text-[#8A8A8A]">
            CGV
          </a>
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5 py-8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)' }}
    >
      {/* Logo + back + role badge */}
      <div className="text-center mb-6">
        <button
          onClick={() => setStep('role')}
          className="text-xs text-[#8A8A8A] flex items-center gap-1 mx-auto mb-4 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <div className="flex items-center justify-center gap-2">
          <img src="/logo.png" alt="LIEN" className="h-8 w-auto" />
          <span className="font-serif text-lg text-[#111111] tracking-wide">Lien</span>
        </div>
        <div
          style={{
            width: '32px',
            height: '2px',
            backgroundColor: '#C6A47E',
            margin: '8px auto 12px',
          }}
        />
        <div className="inline-flex items-center gap-2 bg-[#F0EDE8] rounded-full px-3 py-1.5">
          <div className="w-1.5 h-1.5 bg-[#C6A47E] rounded-full" />
          <span className="text-xs text-[#111111] font-medium">
            {role === 'CLIENT' ? 'Cliente' : 'Styliste'}
          </span>
        </div>
      </div>

      {/* Clerk SignUp */}
      <div className="w-full" style={{ maxWidth: '400px' }}>
        <SignUp
          routing="hash"
          forceRedirectUrl="/onboarding"
          fallbackRedirectUrl="/onboarding"
          unsafeMetadata={{ role }}
        />
      </div>
    </div>
  );
}
