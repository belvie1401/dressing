'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

const styles = ['Minimal', 'Chic', 'Casual', 'Street', 'Romantique', 'Audacieux'];
const budgets = ['50€ - 150€', '150€ - 300€', '+300€'];
const objectives = ['Quotidien', 'Travail', 'Soirée', 'Événements'];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedObjective, setSelectedObjective] = useState('');

  const toggleStyle = (s: string) => {
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleContinue = async () => {
    await api.put('/auth/profile', {
      style_profile: {
        preferred_styles: selectedStyles,
        budget: selectedBudget,
        objective: selectedObjective,
      },
    });
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-5">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="font-serif text-lg text-[#1A1A1A] no-underline">LIEN</Link>
        <a href="/dashboard" className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors cursor-pointer">
          Passer
        </a>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-2 mb-8">
        <div className="h-1 w-8 rounded-full bg-[#1A1A1A]" />
        <div className="h-1 w-8 rounded-full bg-[#EFEFEF]" />
        <div className="h-1 w-8 rounded-full bg-[#EFEFEF]" />
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-sm flex-1">
        <h1 className="font-serif text-2xl text-[#1A1A1A]" style={{ fontWeight: 500 }}>Parlons de vous</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#9B9B9B]">
          Pour vous proposer les meilleurs stylistes et des looks qui vous correspondent.
        </p>

        {/* Style selection */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">Quel est votre style ?</h2>
          <p className="mt-0.5 text-xs text-[#9B9B9B]">Vous pouvez en choisir plusieurs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm transition-all ${
                  selectedStyles.includes(s)
                    ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]'
                    : 'bg-white border border-[#EFEFEF] text-[#1A1A1A]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Budget selection */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">Quel est votre budget moyen par pièce ?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {budgets.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBudget(b)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm transition-all ${
                  selectedBudget === b
                    ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]'
                    : 'bg-white border border-[#EFEFEF] text-[#1A1A1A]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Objective selection */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A]">Votre objectif principal ?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {objectives.map((o) => (
              <button
                key={o}
                onClick={() => setSelectedObjective(o)}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm transition-all ${
                  selectedObjective === o
                    ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]'
                    : 'bg-white border border-[#EFEFEF] text-[#1A1A1A]'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue button — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#EFEFEF] bg-white px-5 pb-8 pt-4">
        <button
          onClick={handleContinue}
          className="w-full cursor-pointer rounded-full bg-[#1A1A1A] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
