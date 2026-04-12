'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import type { StyleAnalysis } from '@/types';
import { api } from '@/lib/api';

// Map French color names to hex for the palette circles
const COLOR_HEX: Record<string, string> = {
  Blanc: '#F5F5F5',
  Noir: '#111111',
  Gris: '#8A8A8A',
  Beige: '#E8DFD0',
  Marron: '#7B5943',
  Rouge: '#D4423D',
  Rose: '#E8899A',
  Orange: '#E87B3A',
  Jaune: '#F0C040',
  Vert: '#4A7E5C',
  Bleu: '#4A6FA5',
  'Bleu marine': '#1E3A5F',
  Violet: '#7B5EA7',
  Camel: '#C6A47E',
  Kaki: '#7B7B4A',
  Multicolore: '#CFCFCF',
};

function colorToHex(name: string): string {
  return COLOR_HEX[name] ?? '#CFCFCF';
}

function CapsuleScoreRing({ score }: { score: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        {/* Track */}
        <circle cx="48" cy="48" r={r} fill="none" stroke="#F0EDE8" strokeWidth="7" />
        {/* Progress */}
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#C6A47E"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 48 48)"
        />
        <text x="48" y="45" textAnchor="middle" className="text-[#111111]" style={{ fontSize: 20, fontWeight: 700, fontFamily: 'serif' }} fill="#111111">
          {score}
        </text>
        <text x="48" y="61" textAnchor="middle" style={{ fontSize: 10, fill: '#8A8A8A' }}>
          /100
        </text>
      </svg>
      <p className="text-xs text-[#8A8A8A]">Score capsule</p>
    </div>
  );
}

function isStyleAnalysis(v: unknown): v is StyleAnalysis {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.dominant_style === 'string' && Array.isArray(o.style_tags);
}

export default function StyleDNAProfile() {
  const { user, loadUser } = useAuthStore();
  const [analysis, setAnalysis] = useState<StyleAnalysis | null>(() => {
    return isStyleAnalysis(user?.style_profile) ? user!.style_profile as StyleAnalysis : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    const res = await api.post<StyleAnalysis>('/ai/analyze-style', {});
    setLoading(false);
    if (res.success && res.data) {
      setAnalysis(res.data);
      loadUser();
    } else {
      const errBody = res as unknown as { error?: string };
      setError(errBody.error ?? "Erreur lors de l'analyse");
    }
  };

  if (!analysis) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE5DC]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <p className="font-serif text-base text-[#111111]">Votre style DNA</p>
        <p className="mt-1 text-sm text-[#8A8A8A]">
          Analysez votre dressing pour découvrir votre profil de style
        </p>
        {error && (
          <p className="mt-2 text-xs text-[#D4785C]">{error}</p>
        )}
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-spin">
                <circle cx="12" cy="12" r="10" opacity="0.3" />
                <path d="M22 12a10 10 0 0 1-10 10" />
              </svg>
              Analyse en cours…
            </>
          ) : (
            'Analyser mon style'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-lg text-[#111111]">Votre style DNA</h2>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="text-xs font-medium text-[#C6A47E] transition-colors hover:text-[#b8935a] disabled:opacity-50"
        >
          {loading ? 'Analyse…' : 'Réanalyser'}
        </button>
      </div>

      {/* Dominant style pill + capsule score */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs text-[#8A8A8A]">Style dominant</p>
          <span className="inline-block rounded-full bg-[#111111] px-5 py-2 font-serif text-base text-white">
            {analysis.dominant_style}
          </span>
        </div>
        <CapsuleScoreRing score={analysis.capsule_score} />
      </div>

      {/* Style tags */}
      {analysis.style_tags.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Tags style</p>
          <div className="flex flex-wrap gap-2">
            {analysis.style_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#F0EDE8] px-3 py-1.5 text-xs text-[#111111]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Color palette */}
      {analysis.color_palette.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Palette de couleurs</p>
          <div className="flex gap-3">
            {analysis.color_palette.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-full border border-[#EFEFEF] shadow-sm"
                  style={{ backgroundColor: colorToHex(color) }}
                />
                <span className="text-[10px] text-[#8A8A8A]">{color}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Points forts</p>
          <ul className="space-y-1.5">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#111111]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Suggestions</p>
          <ul className="space-y-1.5">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#111111]">
                <span className="mt-0.5 shrink-0 text-[#C6A47E]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#C6A47E" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-[#D4785C]">{error}</p>
      )}
    </div>
  );
}
