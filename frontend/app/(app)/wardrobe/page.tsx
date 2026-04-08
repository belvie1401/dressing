'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mon Dressing</h1>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span><strong className="text-gray-900">{items.length}</strong> vêtements</span>
        <span><strong className="text-gray-900">{neverWorn}</strong> jamais portés</span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
      ) : (
        <WardrobeGrid items={items} />
      )}

      {/* FAB */}
      <Link
        href="/wardrobe/add"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800 lg:right-8"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
