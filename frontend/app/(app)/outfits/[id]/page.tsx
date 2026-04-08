'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  if (!outfit) {
    return <div className="py-16 text-center text-sm text-gray-500">Tenue non trouvée</div>;
  }

  const items = outfit.items?.map((oi) => oi.item).filter(Boolean) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/outfits" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{outfit.name}</h1>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) =>
          item ? (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <Image src={item.bg_removed_url || item.photo_url} alt={item.category} fill className="object-cover" sizes="200px" />
            </div>
          ) : null
        )}
      </div>

      <div className="flex items-center justify-between">
        <WearBadge wearCount={outfit.worn_count} lastWornAt={outfit.last_worn_at} size="lg" />
        {outfit.ai_generated && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">Généré par IA</span>
        )}
      </div>

      <button
        onClick={handleMarkWorn}
        className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Marquer comme porté
      </button>

      <VirtualTryOn outfitId={outfit.id} tryOnUrl={outfit.try_on_url} />
    </div>
  );
}
