'use client';

import { useState } from 'react';

import { Plus } from 'lucide-react';
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
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Votre dressing est vide</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez votre premier vêtement pour commencer
          </p>
          <a
            href="/wardrobe/add"
            className="mt-4 rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Ajouter un vêtement
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
