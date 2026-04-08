'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, X } from 'lucide-react';
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
    return <div className="py-8 text-center text-sm text-gray-500">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Name input */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la tenue..."
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Wardrobe items */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Votre dressing</h3>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {wardrobe.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                    isSelected ? 'border-black ring-2 ring-black/20' : 'border-transparent'
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="rounded-full bg-black p-1">
                        <Check className="h-3 w-3 text-white" />
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
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Tenue ({selectedItems.length} articles)
          </h3>
          {selectedItems.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400">
              Sélectionnez des vêtements
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                  >
                    <X className="h-3 w-3" />
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
          className="flex-1 rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          Enregistrer la tenue
        </button>
        <button className="flex items-center gap-2 rounded-full bg-purple-100 px-5 py-3 text-sm font-medium text-purple-700 hover:bg-purple-200">
          <Sparkles className="h-4 w-4" />
          Générer avec l&apos;IA
        </button>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
