'use client';

import { useState } from 'react';
import type { ClothingItem } from '@/types';
import ClothingCard from './ClothingCard';
import ClothingFilters from './ClothingFilters';

interface WardrobeGridProps {
  items: ClothingItem[];
}

export default function WardrobeGrid({ items }: WardrobeGridProps) {
  const [category, setCategory] = useState('ALL');
  const [season, setSeason] = useState('ALL_SEASONS');

  const filtered = items.filter((item) => {
    if (category !== 'ALL' && item.category !== category) return false;
    if (season !== 'ALL_SEASONS' && item.season !== season) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <ClothingFilters
        selectedCategory={category}
        selectedSeason={season}
        onCategoryChange={setCategory}
        onSeasonChange={setSeason}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0D0D0D]">Votre dressing est vide</h3>
          <p className="mt-1 text-sm text-[#8A8A8A]">
            Ajoutez votre premier vêtement pour commencer
          </p>
          <a
            href="/wardrobe/add"
            className="mt-4 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white"
          >
            Ajouter un vêtement
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
