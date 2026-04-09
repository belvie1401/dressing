'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { Outfit } from '@/types';
import { api } from '@/lib/api';
import WearBadge from '@/components/wardrobe/WearBadge';
import VirtualTryOn from '@/components/outfits/VirtualTryOn';

export default function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Outfit>(`/outfits/${id}`);
      if (res.success && res.data) {
        setOutfit(res.data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleMarkWorn = async () => {
    if (!outfit) return;
    const res = await api.post<Outfit>(`/outfits/${id}/wear`);
    if (res.success && res.data) {
      setOutfit({ ...outfit, worn_count: res.data.worn_count, last_worn_at: res.data.last_worn_at });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
      </div>
    );
  }

  if (!outfit) {
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Tenue non trouvée</div>;
  }

  const items = outfit.items?.map((oi) => oi.item).filter(Boolean) || [];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <a href="/outfits" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#0D0D0D]">{outfit.name}</h1>
        {outfit.ai_generated && (
          <span className="ml-auto rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-xs font-medium text-purple-700">IA</span>
        )}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) =>
          item ? (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <Image src={item.bg_removed_url || item.photo_url} alt={item.category} fill className="object-contain p-3" sizes="200px" />
            </div>
          ) : null
        )}
      </div>

      {/* Horizontal thumbnail strip */}
      {items.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {items.map((item) =>
            item ? (
              <div key={item.id} className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Image src={item.bg_removed_url || item.photo_url} alt={item.category} width={64} height={64} className="h-full w-full object-contain p-1" />
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Info card */}
      <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <WearBadge wearCount={outfit.worn_count} lastWornAt={outfit.last_worn_at} size="lg" />
          <span className="text-sm text-[#8A8A8A]">{items.length} articles</span>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleMarkWorn}
            className="flex-1 rounded-full bg-[#0D0D0D] py-3 text-center text-sm font-semibold text-white"
          >
            Marquer porté
          </button>
          <a
            href={`/calendar`}
            className="flex-1 rounded-full border border-[#0D0D0D] py-3 text-center text-sm font-semibold text-[#0D0D0D]"
          >
            Planifier
          </a>
        </div>
      </div>

      <VirtualTryOn outfitId={outfit.id} tryOnUrl={outfit.try_on_url} />
    </div>
  );
}
