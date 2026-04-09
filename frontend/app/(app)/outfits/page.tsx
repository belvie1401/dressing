'use client';

import { useState, useEffect } from 'react';
import type { Outfit } from '@/types';
import { api } from '@/lib/api';
import OutfitPreview from '@/components/outfits/OutfitPreview';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (res.success && res.data) {
        setOutfits(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-[#0D0D0D]">Mes Looks</h1>
        <a
          href="/outfits/create"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D0D0D]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </a>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Chargement...</div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className="text-sm text-[#8A8A8A]">Aucune tenue créée</p>
          <a
            href="/outfits/create"
            className="mt-4 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white"
          >
            Créer une tenue
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <a key={outfit.id} href={`/outfits/${outfit.id}`}>
              <OutfitPreview outfit={outfit} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
