'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import OutfitBuilder from '@/components/outfits/OutfitBuilder';
import { api } from '@/lib/api';
import type { Outfit } from '@/types';

export default function OutfitCreatePage() {
  const router = useRouter();

  const handleSave = async (name: string, itemIds: string[]) => {
    const res = await api.post<Outfit>('/outfits', {
      name,
      item_ids: itemIds,
    });
    if (res.success && res.data) {
      router.push(`/outfits/${res.data.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/outfits" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h1 className="text-xl font-bold text-gray-900">Créer une tenue</h1>
      </div>

      <OutfitBuilder onSave={handleSave} />
    </div>
  );
}
