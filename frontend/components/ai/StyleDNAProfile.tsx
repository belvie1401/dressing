'use client';

import { useState, useEffect } from 'react';
import { Loader2, Dna } from 'lucide-react';
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
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!styleDNA) {
    return (
      <div className="rounded-2xl bg-gray-50 p-6 text-center">
        <Dna className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">
          Ajoutez plus de vêtements pour découvrir votre ADN de style
        </p>
        <button
          onClick={loadStyleDNA}
          className="mt-3 rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800"
        >
          Analyser mon style
        </button>
      </div>
    );
  }

  const scores = styleDNA.style_score;

  return (
    <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <Dna className="h-5 w-5 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">ADN de Style</h3>
      </div>

      <div className="text-center">
        <span className="inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
          {styleDNA.style_archetype}
        </span>
      </div>

      {/* Style scores */}
      <div className="space-y-2">
        {Object.entries(scores).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-16 text-xs capitalize text-gray-500">{key}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-black"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-gray-600">{value}</span>
          </div>
        ))}
      </div>

      {/* Dominant colors */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">Couleurs dominantes</p>
        <div className="flex gap-2">
          {styleDNA.dominant_colors.map((color) => (
            <span key={color} className="rounded-full bg-white px-3 py-1 text-xs text-gray-700 shadow-sm">
              {color}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {styleDNA.recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">Recommandations</p>
          <ul className="space-y-1">
            {styleDNA.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-gray-600">• {rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
