'use client';

import Image from 'next/image';
import type { Outfit } from '@/types';
import WearBadge from '../wardrobe/WearBadge';

interface OutfitPreviewProps {
  outfit: Outfit;
}

export default function OutfitPreview({ outfit }: OutfitPreviewProps) {
  const items = outfit.items?.map((oi) => oi.item).filter(Boolean) || [];

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-50">
      <div className="grid grid-cols-2 gap-0.5">
        {items.slice(0, 4).map((item) =>
          item ? (
            <div key={item.id} className="relative aspect-square">
              <Image
                src={item.bg_removed_url || item.photo_url}
                alt={item.category}
                fill
                className="object-cover"
                sizes="150px"
              />
            </div>
          ) : null
        )}
        {items.length === 0 && (
          <div className="col-span-2 flex aspect-video items-center justify-center text-sm text-gray-400">
            Aucun vêtement
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">{outfit.name}</p>
          <p className="text-xs text-gray-500">{items.length} articles</p>
        </div>
        <WearBadge wearCount={outfit.worn_count} lastWornAt={outfit.last_worn_at} />
      </div>
    </div>
  );
}
