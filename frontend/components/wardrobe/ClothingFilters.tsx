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
      {/* Category pills - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#0D0D0D] text-white'
                : 'bg-white text-[#0D0D0D] border border-[#E5E5E5]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Season selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {seasons.map((s) => (
          <button
            key={s.value}
            onClick={() => onSeasonChange(s.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              selectedSeason === s.value
                ? 'bg-[#0D0D0D] text-white'
                : 'bg-[#F0F0F0] text-[#0D0D0D]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
