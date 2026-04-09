'use client';

import Image from 'next/image';
import type { ClothingItem } from '@/types';

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
    <a href={`/wardrobe/${item.id}`} className="group relative block overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="relative aspect-[3/4]" style={{ background: 'var(--color-app-bg)' }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.category}
            fill
            className="object-contain p-3 transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8A8A8A]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Price badge top-right */}
        {item.purchase_price && (
          <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[#0D0D0D]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            {item.purchase_price.toFixed(0)}€
          </span>
        )}

        {/* Heart icon bottom-right */}
        <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Card info */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium text-[#0D0D0D] truncate">
          {item.brand || categoryLabels[item.category] || item.category}
        </p>
        <p className="text-xs text-[#8A8A8A] mt-0.5">
          {categoryLabels[item.category]} {item.material ? `· ${item.material}` : ''}
        </p>
      </div>
    </a>
  );
}
