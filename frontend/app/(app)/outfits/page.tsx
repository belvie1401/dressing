'use client';

import { useState, useEffect } from 'react';

import { Plus } from 'lucide-react';
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
      <h1 className="text-xl font-bold text-gray-900">Mes Looks</h1>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
      ) : outfits.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-gray-500">Aucune tenue créée</p>
          <a
            href="/outfits/create"
            className="mt-4 rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
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

      <a
        href="/outfits/create"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800 lg:right-8"
      >
        <Plus className="h-6 w-6" />
      </a>
    </div>
  );
}
