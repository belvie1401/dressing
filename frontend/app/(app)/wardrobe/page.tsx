'use client';

import { useEffect } from 'react';
import { useWardrobeStore } from '@/lib/store';
import WardrobeGrid from '@/components/wardrobe/WardrobeGrid';

export default function WardrobePage() {
  const { items, isLoading, loadItems } = useWardrobeStore();

  useEffect(() => {
    loadItems();
  }, []);

  const neverWorn = items.filter((i) => i.wear_count === 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-[#0D0D0D]">Mon Dressing</h1>
        <a
          href="/wardrobe/add"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D0D0D]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </a>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: '#EFEFEF' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-sm text-[#8A8A8A]">Rechercher dans mon dressing...</span>
        <div className="ml-auto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3">
        <span className="rounded-full bg-[#F0F0F0] px-3 py-1.5 text-xs font-medium text-[#0D0D0D]">
          <strong>{items.length}</strong> vêtements
        </span>
        <span className="rounded-full bg-[#F0F0F0] px-3 py-1.5 text-xs font-medium text-[#0D0D0D]">
          <strong>{neverWorn}</strong> jamais portés
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Chargement...</div>
      ) : (
        <WardrobeGrid items={items} />
      )}
    </div>
  );
}
