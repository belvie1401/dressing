'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ClothingItem } from '@/types';
import { api } from '@/lib/api';

interface OutfitBuilderProps {
  onSave: (name: string, itemIds: string[]) => void;
}

export default function OutfitBuilder({ onSave }: OutfitBuilderProps) {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWardrobe = async () => {
      const res = await api.get<ClothingItem[]>('/wardrobe');
      if (res.success && res.data) {
        setWardrobe(res.data);
      }
      setIsLoading(false);
    };
    loadWardrobe();
  }, []);

  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedItems = wardrobe.filter((i) => selectedIds.has(i.id));

  const handleSave = () => {
    if (name.trim() && selectedIds.size > 0) {
      onSave(name.trim(), Array.from(selectedIds));
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-[#8A8A8A]">Chargement...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la tenue..."
        className="w-full rounded-full border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Wardrobe items */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#0D0D0D]">Votre dressing</h3>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {wardrobe.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                    isSelected ? 'border-[#0D0D0D] ring-2 ring-[#0D0D0D]/20' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D]/20">
                      <div className="rounded-full bg-[#0D0D0D] p-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected items canvas */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#0D0D0D]">
            Tenue ({selectedItems.length} articles)
          </h3>
          {selectedItems.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E5] text-sm text-[#8A8A8A]">
              Sélectionnez des vêtements
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-[#0D0D0D]/50 p-1 text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!name.trim() || selectedIds.size === 0}
          className="flex-1 rounded-full bg-[#0D0D0D] py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          Enregistrer la tenue
        </button>
        <button className="flex items-center gap-2 rounded-full bg-[#F0F0F0] px-5 py-3 text-sm font-medium text-[#0D0D0D]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5 8 14.5l1.5-4.5L6 7.5h4.5z" />
          </svg>
          Générer avec l&apos;IA
        </button>
      </div>
    </div>
  );
}
