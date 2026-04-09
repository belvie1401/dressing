'use client';

import { useState } from 'react';

interface VirtualTryOnProps {
  outfitId: string;
  tryOnUrl?: string;
}

export default function VirtualTryOn({ outfitId, tryOnUrl }: VirtualTryOnProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(tryOnUrl || '');

  const handleGenerate = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="relative overflow-hidden rounded-2xl">
          <img src={imageUrl} alt="Essayage virtuel" className="w-full" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-12" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0D0D0D]">Essayage virtuel</p>
          <p className="text-xs text-[#8A8A8A]">Visualisez cette tenue sur vous</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Génération...
              </>
            ) : (
              'Essayer virtuellement'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
