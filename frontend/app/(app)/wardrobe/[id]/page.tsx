'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { ClothingItem } from '@/types';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';
import WearBadge from '@/components/wardrobe/WearBadge';
import View360 from '@/components/wardrobe/View360';
import TryOnSection from '@/components/wardrobe/TryOnSection';

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
  const [uploadingBack, setUploadingBack] = useState(false);
  const markWornInStore = useWardrobeStore((s) => s.markWorn);
  const backInputRef = useRef<HTMLInputElement>(null);

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
      setToast('✓ Enregistré !');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleBackPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !item) return;
    setUploadingBack(true);
    const body = new FormData();
    body.append('photo_back', file);
    body.append('remove_bg', '1');
    const res = await api.put<ClothingItem>(`/wardrobe/${id}`, body);
    if (res.success && res.data) {
      setItem(res.data);
      setToast('✓ Vue 360° activée !');
      setTimeout(() => setToast(''), 3000);
    } else {
      setToast("Échec de l'ajout de la photo dos");
      setTimeout(() => setToast(''), 3000);
    }
    setUploadingBack(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#111111]">Détails</h1>
      </div>

      {/* Large product photo (or 360° view when back photo exists) */}
      {item.has_360_view && (item.photo_back_removed || item.photo_back_url) ? (
        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl" style={{ background: 'var(--color-app-bg)' }}>
          <View360
            frontUrl={item.bg_removed_url || item.photo_url}
            backUrl={item.photo_back_removed || item.photo_back_url || ''}
            alt={item.name || item.category}
            fit="contain"
          />
        </div>
      ) : (
        <div className="relative aspect-square overflow-hidden rounded-3xl" style={{ background: 'var(--color-app-bg)' }}>
          <Image
            src={item.bg_removed_url || item.photo_url}
            alt={item.category}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        </div>
      )}

      {/* Add back photo CTA (when missing) */}
      {!item.has_360_view && (
        <>
          <button
            type="button"
            onClick={() => backInputRef.current?.click()}
            disabled={uploadingBack}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C6A47E]/50 bg-[#EDE5DC]/30 py-3 text-sm font-medium text-[#C6A47E] transition-colors hover:bg-[#EDE5DC]/50 disabled:opacity-60"
          >
            {uploadingBack ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" />
                </svg>
                Envoi en cours…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Ajouter la vue dos (360°)
              </>
            )}
          </button>
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackPhotoUpload}
            className="hidden"
          />
        </>
      )}

      {/* Virtual try-on */}
      <TryOnSection
        itemId={item.id}
        itemPhotoUrl={item.bg_removed_url || item.photo_url}
        category={item.category}
        initialTryOnUrl={item.try_on_url || null}
      />

      {/* Product info card */}
      <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {/* Name + category pill */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">
              {item.brand || categoryLabels[item.category] || item.category}
            </h2>
            {item.brand && (
              <p className="text-sm text-[#8A8A8A] mt-0.5">{categoryLabels[item.category]}</p>
            )}
          </div>
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">
            {categoryLabels[item.category]}
          </span>
        </div>

        {/* Price */}
        {item.purchase_price && (
          <p className="mt-2 text-xl font-bold text-[#111111]">{item.purchase_price.toFixed(2)}€</p>
        )}

        {/* Wear badge */}
        <div className="mt-3">
          <WearBadge wearCount={item.wear_count} lastWornAt={item.last_worn_at} size="lg" />
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">{seasonLabels[item.season] || item.season}</span>
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">{occasionLabels[item.occasion] || item.occasion}</span>
          {item.material && <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">{item.material}</span>}
          {item.colors.map((c) => (
            <span key={c} className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">{c}</span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleMarkWorn}
            className="flex-1 rounded-full border border-[#111111] py-3 text-center text-sm font-semibold text-[#111111]"
          >
            Marquer comme porté
          </button>
          <a
            href="/outfits/create"
            className="flex-1 rounded-full bg-[#111111] py-3 text-center text-sm font-semibold text-white"
          >
            Créer un look
          </a>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
