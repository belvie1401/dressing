'use client';


import Image from 'next/image';
import type { ClothingItem } from '@/types';
import WearBadge from './WearBadge';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut',
  BOTTOM: 'Bas',
  DRESS: 'Robe',
  JACKET: 'Veste',
  SHOES: 'Chaussures',
  ACCESSORY: 'Accessoire',
};

interface ClothingCardProps {
  item: ClothingItem;
}

export default function ClothingCard({ item }: ClothingCardProps) {
  const imageUrl = item.bg_removed_url || item.photo_url;

  return (
    <a href={`/wardrobe/${item.id}`} className="group relative block overflow-hidden rounded-xl bg-gray-50">
      <div className="relative aspect-square">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.category}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
            Pas de photo
          </div>
        )}

        {/* Category tag */}
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur-sm">
          {categoryLabels[item.category] || item.category}
        </span>

        {/* Wear badge */}
        <div className="absolute bottom-2 left-2">
          <WearBadge wearCount={item.wear_count} lastWornAt={item.last_worn_at} />
        </div>
      </div>

      {item.brand && (
        <div className="px-2 py-1.5">
          <p className="truncate text-xs text-gray-500">{item.brand}</p>
        </div>
      )}
    </a>
  );
}
