'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { ClothingItem } from '@/types';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';
import WearBadge from '@/components/wardrobe/WearBadge';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut', BOTTOM: 'Bas', DRESS: 'Robe', JACKET: 'Veste', SHOES: 'Chaussures', ACCESSORY: 'Accessoire',
};

const seasonLabels: Record<string, string> = {
  SUMMER: 'Été', WINTER: 'Hiver', ALL: 'Toute saison',
};

const occasionLabels: Record<string, string> = {
  CASUAL: 'Casual', WORK: 'Travail', EVENING: 'Soirée', SPORT: 'Sport',
};

export default function WardrobeItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const markWornInStore = useWardrobeStore((s) => s.markWorn);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<ClothingItem>(`/wardrobe/${id}`);
      if (res.success && res.data) {
        setItem(res.data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleMarkWorn = async () => {
    if (!item) return;
    const res = await api.post<ClothingItem>(`/wardrobe/${id}/wear`);
    if (res.success && res.data) {
      setItem(res.data);
      markWornInStore(id);
      setToast('\u2713 Enregistr\u00e9 !');
      setTimeout(() => setToast(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Vêtement non trouvé</div>;
  }

  return (
    <div className="space-y-5">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <a href="/wardrobe" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#0D0D0D]">Détails</h1>
      </div>

      {/* Large product photo */}
      <div className="relative aspect-square overflow-hidden rounded-3xl" style={{ background: 'var(--color-app-bg)' }}>
        <Image
          src={item.bg_removed_url || item.photo_url}
          alt={item.category}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 500px"
        />
      </div>

      {/* Product info card */}
      <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {/* Name + category pill */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0D0D0D]">
              {item.brand || categoryLabels[item.category] || item.category}
            </h2>
            {item.brand && (
              <p className="text-sm text-[#8A8A8A] mt-0.5">{categoryLabels[item.category]}</p>
            )}
          </div>
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">
            {categoryLabels[item.category]}
          </span>
        </div>

        {/* Price */}
        {item.purchase_price && (
          <p className="mt-2 text-xl font-bold text-[#0D0D0D]">{item.purchase_price.toFixed(2)}€</p>
        )}

        {/* Wear badge */}
        <div className="mt-3">
          <WearBadge wearCount={item.wear_count} lastWornAt={item.last_worn_at} size="lg" />
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">{seasonLabels[item.season] || item.season}</span>
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">{occasionLabels[item.occasion] || item.occasion}</span>
          {item.material && <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">{item.material}</span>}
          {item.colors.map((c) => (
            <span key={c} className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#0D0D0D]">{c}</span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleMarkWorn}
            className="flex-1 rounded-full border border-[#0D0D0D] py-3 text-center text-sm font-semibold text-[#0D0D0D]"
          >
            Marquer comme porté
          </button>
          <a
            href="/outfits/create"
            className="flex-1 rounded-full bg-[#0D0D0D] py-3 text-center text-sm font-semibold text-white"
          >
            Créer un look
          </a>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
