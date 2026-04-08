'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { Plus, Sparkles, ChevronRight } from 'lucide-react';
import { useAuthStore, useWardrobeStore } from '@/lib/store';
import WeatherBanner from '@/components/ui/WeatherBanner';
import type { CalendarEntry } from '@/types';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { items, loadItems } = useWardrobeStore();
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);

  useEffect(() => {
    loadItems();
    const loadCalendar = async () => {
      const now = new Date();
      const res = await api.get<CalendarEntry[]>(
        `/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
      );
      if (res.success && res.data) {
        setCalendarEntries(res.data);
      }
    };
    loadCalendar();
  }, []);

  const recentItems = items.slice(0, 3);
  const neverWorn = items.filter((i) => i.wear_count === 0).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Bonjour{user?.name ? `, ${user.name}` : ''} !
        </h1>
        <p className="text-sm text-gray-500">Voici votre dressing aujourd&apos;hui</p>
      </div>

      {/* Weather */}
      <WeatherBanner />

      {/* AI suggestion card */}
      <a href="/outfits/create" className="block rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/80 p-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Look du jour</p>
            <p className="text-xs text-gray-500">Laissez l&apos;IA composer votre tenue</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </a>

      {/* Recent items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Derniers ajouts</h2>
          <a href="/wardrobe" className="text-xs font-medium text-gray-500 hover:text-gray-700">
            Tout voir
          </a>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {recentItems.map((item) => (
              <a key={item.id} href={`/wardrobe/${item.id}`} className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={item.bg_removed_url || item.photo_url}
                  alt={item.category}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun vêtement ajouté</p>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500">Vêtements</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{neverWorn}</p>
          <p className="text-xs text-gray-500">Jamais portés</p>
        </div>
        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{calendarEntries.length}</p>
          <p className="text-xs text-gray-500">Tenues planifiées</p>
        </div>
      </div>

      {/* FAB */}
      <a
        href="/wardrobe/add"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-gray-800 lg:right-8"
      >
        <Plus className="h-6 w-6" />
      </a>
    </div>
  );
}
