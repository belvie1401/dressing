'use client';

import { useState } from 'react';
import { Cloud, Briefcase, Palette, Loader2, Sparkles } from 'lucide-react';
import type { AIOutfitSuggestion, ClothingItem } from '@/types';
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
          className="flex flex-col items-center gap-2 rounded-xl bg-blue-50 px-3 py-4 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          <Cloud className="h-5 w-5" />
          Météo
        </button>
        <button
          onClick={() => handleGenerate('occasion')}
          disabled={loading}
          className="flex flex-col items-center gap-2 rounded-xl bg-amber-50 px-3 py-4 text-xs font-medium text-amber-700 hover:bg-amber-100"
        >
          <Briefcase className="h-5 w-5" />
          Occasion
        </button>
        <button
          onClick={() => handleGenerate('style')}
          disabled={loading}
          className="flex flex-col items-center gap-2 rounded-xl bg-purple-50 px-3 py-4 text-xs font-medium text-purple-700 hover:bg-purple-100"
        >
          <Palette className="h-5 w-5" />
          Style
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">L&apos;IA compose vos looks...</p>
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">{suggestion.name}</h4>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  {suggestion.score}/100
                </span>
              </div>
              <p className="mb-3 text-xs text-gray-500">{suggestion.reasoning}</p>
              <button
                onClick={() => onSelectOutfit(suggestion)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-2 text-xs font-medium text-white hover:bg-gray-800"
              >
                <Sparkles className="h-3 w-3" />
                Essayer ce look
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
