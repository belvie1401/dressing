'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWardrobeStore } from '@/lib/store';
import type { ClothingItem, Outfit } from '@/types';
import { api } from '@/lib/api';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut', BOTTOM: 'Bas', DRESS: 'Robe', JACKET: 'Veste', SHOES: 'Chaussures', ACCESSORY: 'Accessoire',
};

type WardrobeTab = 'clothes' | 'looks' | 'favorites';

export default function WardrobePage() {
  const { items, isLoading, loadItems } = useWardrobeStore();
  const [tab, setTab] = useState<WardrobeTab>('clothes');
  const [search, setSearch] = useState('');
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    loadItems();
    const loadOutfits = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (res.success && res.data) setOutfits(res.data);
    };
    loadOutfits();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (item.brand?.toLowerCase().includes(q)) ||
      (categoryLabels[item.category]?.toLowerCase().includes(q)) ||
      item.colors.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header: hamburger + title + notification */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-serif text-xl font-semibold text-[#111111]">Mon dressing</h1>
        </div>
        <a href="/messages" className="flex h-10 w-10 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </a>
      </div>

      {/* Tabs: V\u00eatements / Looks / Favoris */}
      <div className="flex gap-1 rounded-full p-1" style={{ background: 'var(--color-tag-bg)' }}>
        {([
          { key: 'clothes' as WardrobeTab, label: 'V\u00eatements' },
          { key: 'looks' as WardrobeTab, label: 'Looks' },
          { key: 'favorites' as WardrobeTab, label: 'Favoris' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-[#111111] text-white'
                : 'text-[#8A8A8A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-2.5" style={{ background: 'var(--color-tag-bg)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher"
            className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#8A8A8A] focus:outline-none"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--color-tag-bg)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      {/* Tab content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        </div>
      ) : tab === 'clothes' ? (
        <>
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--color-accent-light)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#111111]">Votre dressing est vide</p>
              <p className="mt-1 text-xs text-[#8A8A8A]">Ajoutez votre premier v\u00eatement</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map((item) => (
                <a
                  key={item.id}
                  href={`/wardrobe/${item.id}`}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                  style={{ background: 'var(--color-tag-bg)' }}
                >
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                </a>
              ))}
            </div>
          )}

          {/* + Ajouter button */}
          <a
            href="/wardrobe/add"
            className="flex items-center justify-center gap-2 rounded-full border border-[#111111] py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter
          </a>
        </>
      ) : tab === 'looks' ? (
        <>
          {outfits.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-sm text-[#8A8A8A]">Aucun look cr\u00e9\u00e9 pour le moment</p>
              <a href="/outfits/create" className="mt-3 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white">
                Cr\u00e9er un look
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {outfits.map((outfit) => (
                <a
                  key={outfit.id}
                  href={`/outfits/${outfit.id}`}
                  className="overflow-hidden rounded-2xl bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="relative aspect-square" style={{ background: 'var(--color-tag-bg)' }}>
                    {outfit.items?.[0]?.item?.photo_url && (
                      <Image
                        src={outfit.items[0].item.bg_removed_url || outfit.items[0].item.photo_url}
                        alt={outfit.name}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-medium text-[#111111] truncate">{outfit.name}</p>
                    <p className="text-xs text-[#8A8A8A]">{outfit.items?.length || 0} pi\u00e8ces</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p className="mt-3 text-sm text-[#8A8A8A]">Vos favoris appara\u00eetront ici</p>
        </div>
      )}
    </div>
  );
}
