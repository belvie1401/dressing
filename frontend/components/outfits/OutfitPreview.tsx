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
    <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="grid grid-cols-2 gap-0.5" style={{ background: 'var(--color-app-bg)' }}>
        {items.slice(0, 4).map((item) =>
          item ? (
            <div key={item.id} className="relative aspect-square bg-white">
              <Image
                src={item.bg_removed_url || item.photo_url}
                alt={item.category}
                fill
                className="object-contain p-2"
                sizes="150px"
              />
            </div>
          ) : null
        )}
        {items.length === 0 && (
          <div className="col-span-2 flex aspect-video items-center justify-center text-sm text-[#8A8A8A]">
            Aucun vêtement
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-3">
        <div>
          <p className="text-sm font-semibold text-[#0D0D0D]">{outfit.name}</p>
          <p className="text-xs text-[#8A8A8A]">{items.length} articles</p>
        </div>
        <WearBadge wearCount={outfit.worn_count} lastWornAt={outfit.last_worn_at} />
      </div>
    </div>
  );
}
