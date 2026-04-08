'use client';

import type { Category, Season } from '@/types';

const categories: { value: Category | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tout' },
  { value: 'TOP', label: 'Hauts' },
  { value: 'BOTTOM', label: 'Bas' },
  { value: 'DRESS', label: 'Robes' },
  { value: 'JACKET', label: 'Vestes' },
  { value: 'SHOES', label: 'Chaussures' },
  { value: 'ACCESSORY', label: 'Accessoires' },
];

const seasons: { value: Season | 'ALL_SEASONS'; label: string }[] = [
  { value: 'ALL_SEASONS', label: 'Toutes saisons' },
  { value: 'SUMMER', label: 'Été' },
  { value: 'WINTER', label: 'Hiver' },
  { value: 'ALL', label: 'Toute saison' },
];

interface ClothingFiltersProps {
  selectedCategory: string;
  selectedSeason: string;
  onCategoryChange: (category: string) => void;
  onSeasonChange: (season: string) => void;
}

export default function ClothingFilters({
  selectedCategory,
  selectedSeason,
  onCategoryChange,
  onSeasonChange,
}: ClothingFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Season selector */}
      <div className="flex gap-2">
        {seasons.map((s) => (
          <button
            key={s.value}
            onClick={() => onSeasonChange(s.value)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              selectedSeason === s.value
                ? 'bg-black text-white'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
