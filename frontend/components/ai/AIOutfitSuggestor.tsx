'use client';

import { useState } from 'react';
import type { AIOutfitSuggestion } from '@/types';
import { api } from '@/lib/api';

interface AIOutfitSuggestorProps {
  onSelectOutfit: (suggestion: AIOutfitSuggestion) => void;
}

export default function AIOutfitSuggestor({ onSelectOutfit }: AIOutfitSuggestorProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIOutfitSuggestion[]>([]);

  const handleGenerate = async (mode: 'weather' | 'occasion' | 'style') => {
    setLoading(true);
    try {
      const body: Record<string, string> = {};
      if (mode === 'weather') body.weather = 'current';
      if (mode === 'occasion') body.occasion = 'CASUAL';
      if (mode === 'style') body.style_profile = 'auto';

      const res = await api.post<AIOutfitSuggestion[]>('/ai/generate-outfits', body);
      if (res.success && res.data) {
        setSuggestions(res.data);
      }
    } catch {
      // handled by api wrapper
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick select buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleGenerate('weather')}
          disabled={loading}
          className="flex flex-col items-center gap-2 rounded-2xl bg-[#F0F0F0] px-3 py-4 text-xs font-medium text-[#0D0D0D]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          Météo
        </button>
        <button
          onClick={() => handleGenerate('occasion')}
          disabled={loading}
          className="flex flex-col items-center gap-2 rounded-2xl bg-[#F0F0F0] px-3 py-4 text-xs font-medium text-[#0D0D0D]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Occasion
        </button>
        <button
          onClick={() => handleGenerate('style')}
          disabled={loading}
          className="flex flex-col items-center gap-2 rounded-2xl bg-[#F0F0F0] px-3 py-4 text-xs font-medium text-[#0D0D0D]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="2.5" /><path d="M17 2a2.5 2.5 0 0 1 0 5" /><path d="M3 15.5A6.5 6.5 0 0 1 9.5 9h5A6.5 6.5 0 0 1 21 15.5v0a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5v0z" />
          </svg>
          Style
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p className="text-sm text-[#8A8A8A]">L&apos;IA compose vos looks...</p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-4"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#0D0D0D]">{suggestion.name}</h4>
                <span className="rounded-full bg-[#F0F0F0] px-2 py-0.5 text-xs font-medium text-[#0D0D0D]">
                  {suggestion.score}/100
                </span>
              </div>
              <p className="mb-3 text-xs text-[#8A8A8A]">{suggestion.reasoning}</p>
              <button
                onClick={() => onSelectOutfit(suggestion)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0D0D0D] py-2.5 text-xs font-medium text-white"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5 8 14.5l1.5-4.5L6 7.5h4.5z" />
                </svg>
                Essayer ce look
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
