'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

import { ArrowLeft, Loader2 } from 'lucide-react';
import type { ClothingItem } from '@/types';
import { api } from '@/lib/api';
import WearBadge from '@/components/wardrobe/WearBadge';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut', BOTTOM: 'Bas', DRESS: 'Robe', JACKET: 'Veste', SHOES: 'Chaussures', ACCESSORY: 'Accessoire',
};

export default function WardrobeItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

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
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!item) {
    return <div className="py-16 text-center text-sm text-gray-500">Vêtement non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/wardrobe" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h1 className="text-xl font-bold text-gray-900">{categoryLabels[item.category] || item.category}</h1>
      </div>

      {/* Photo */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={item.bg_removed_url || item.photo_url}
          alt={item.category}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 500px"
        />
      </div>

      {/* Wear badge */}
      <div className="flex items-center justify-between">
        <WearBadge wearCount={item.wear_count} lastWornAt={item.last_worn_at} size="lg" />
        {item.brand && <span className="text-sm text-gray-500">{item.brand}</span>}
      </div>

      {/* Mark worn button */}
      <button
        onClick={handleMarkWorn}
        className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Marquer comme porté aujourd&apos;hui
      </button>

      {/* Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Détails</h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{item.season}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{item.occasion}</span>
          {item.material && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{item.material}</span>}
          {item.colors.map((c) => (
            <span key={c} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{c}</span>
          ))}
        </div>
      </div>

      {/* Create outfit CTA */}
      <a
        href="/outfits/create"
        className="block w-full rounded-full border border-gray-200 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Créer un look avec cet article
      </a>
    </div>
  );
}
