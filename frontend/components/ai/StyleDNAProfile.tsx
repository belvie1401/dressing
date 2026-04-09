'use client';

import { useState, useEffect } from 'react';
import type { StyleDNA } from '@/types';
import { api } from '@/lib/api';

export default function StyleDNAProfile() {
  const [styleDNA, setStyleDNA] = useState<StyleDNA | null>(null);
  const [loading, setLoading] = useState(false);

  const loadStyleDNA = async () => {
    setLoading(true);
    try {
      const res = await api.get<StyleDNA>('/ai/style-dna');
      if (res.success && res.data) {
        setStyleDNA(res.data);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStyleDNA();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
      </div>
    );
  }

  if (!styleDNA) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F0F0]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <p className="text-sm text-[#8A8A8A]">
          Ajoutez plus de vêtements pour découvrir votre ADN de style
        </p>
        <button
          onClick={loadStyleDNA}
          className="mt-3 rounded-full bg-[#0D0D0D] px-5 py-2 text-xs font-medium text-white"
        >
          Analyser mon style
        </button>
      </div>
    );
  }

  const scores = styleDNA.style_score;

  return (
    <div className="space-y-4 rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
        <h3 className="text-sm font-semibold text-[#0D0D0D]">ADN de Style</h3>
      </div>

      <div className="text-center">
        <span className="inline-block rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
          {styleDNA.style_archetype}
        </span>
      </div>

      {/* Style scores */}
      <div className="space-y-2.5">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-16 text-xs capitalize text-[#8A8A8A]">{key}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0F0F0]">
              <div
                className="h-full rounded-full bg-[#0D0D0D]"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-[#8A8A8A]">{value}</span>
          </div>
        ))}
      </div>

      {/* Dominant colors */}
      <div>
        <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Couleurs dominantes</p>
        <div className="flex flex-wrap gap-2">
          {styleDNA.dominant_colors.map((color) => (
            <span key={color} className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
              {color}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {styleDNA.recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-[#8A8A8A]">Recommandations</p>
          <ul className="space-y-1.5">
            {styleDNA.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-[#0D0D0D]">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
