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
    <div className="flex min-h-screen flex-col px-5 py-6" style={{ background: 'var(--color-app-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-semibold tracking-wide text-[#111111] no-underline">LIEN</Link>
        <a href="/dashboard" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">
          Passer
        </a>
      </div>

      {/* Content */}
      <div className="mx-auto mt-10 w-full max-w-sm flex-1">
        <h1 className="font-serif text-2xl font-semibold text-[#111111]">Parlons de vous</h1>
        <p className="mt-2 text-sm text-[#8A8A8A]">
          Pour vous proposer les meilleurs stylistes et des looks qui vous correspondent.
        </p>

        {/* Style selection */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[#111111]">Quel est votre style ?</h2>
          <p className="mt-1 text-xs text-[#8A8A8A]">Vous pouvez en choisir plusieurs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => toggleStyle(s)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedStyles.includes(s)
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-[#E0DCD5] text-[#111111]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Budget selection */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[#111111]">Quel est votre budget moyen par pièce ?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {budgets.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBudget(b)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedBudget === b
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-[#E0DCD5] text-[#111111]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Objective selection */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[#111111]">Votre objectif principal ?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {objectives.map((o) => (
              <button
                key={o}
                onClick={() => setSelectedObjective(o)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedObjective === o
                    ? 'bg-[#111111] text-white'
                    : 'bg-white border border-[#E0DCD5] text-[#111111]'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="mx-auto mt-8 w-full max-w-sm">
        <button
          onClick={handleContinue}
          className="w-full rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
