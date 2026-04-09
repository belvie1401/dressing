'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WardrobeScanner, { type ScanResult } from '@/components/wardrobe/WardrobeScanner';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';
import type { ClothingItem } from '@/types';

export default function WardrobeAddPage() {
  const router = useRouter();
  const addItem = useWardrobeStore((s) => s.addItem);
  const [formData, setFormData] = useState({
    brand: '',
    purchase_price: '',
    purchase_date: '',
  });

  const handleScanComplete = async (
    result: ScanResult,
    imageBase64: string
  ) => {
    const body = {
      photo_url: `data:image/jpeg;base64,${imageBase64}`,
      category: result.category || 'TOP',
      colors: result.secondary_colors
        ? [result.primary_color, ...(result.secondary_colors as string[])]
        : [result.primary_color],
      material: result.material_guess,
      season: (result.season_tags as string[])?.[0] || 'ALL',
      occasion: (result.occasion_tags as string[])?.[0] || 'CASUAL',
      brand: formData.brand || undefined,
      purchase_price: formData.purchase_price || undefined,
      purchase_date: formData.purchase_date || undefined,
      ai_tags: result,
    };

    const res = await api.post<ClothingItem>('/wardrobe', body);
    if (res.success && res.data) {
      addItem(res.data);
      router.push('/wardrobe');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <a href="/wardrobe" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#0D0D0D]">Ajouter un vêtement</h1>
      </div>

      <WardrobeScanner onScanComplete={handleScanComplete} />

      {/* Optional form fields */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#0D0D0D]">Informations complémentaires</h2>
        <input
          type="text"
          placeholder="Marque"
          value={formData.brand}
          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
          className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
        />
        <input
          type="number"
          placeholder="Prix d'achat (€)"
          value={formData.purchase_price}
          onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
          className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
        />
        <input
          type="date"
          value={formData.purchase_date}
          onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
        />
      </div>
    </div>
  );
}
