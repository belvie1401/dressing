'use client';

import { useRouter } from 'next/navigation';
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
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <a href="/outfits" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#111111]">Créer une tenue</h1>
      </div>

      <OutfitBuilder onSave={handleSave} />
    </div>
  );
}
