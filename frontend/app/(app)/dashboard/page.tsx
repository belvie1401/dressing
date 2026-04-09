'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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

  const recentItems = items.slice(0, 4);
  const neverWorn = items.filter((i) => i.wear_count === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="text-xs text-[#8A8A8A]">Bonjour</p>
            <p className="text-sm font-semibold text-[#0D0D0D]">{user?.name || 'Mon Dressing'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/wardrobe" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </a>
          <a href="/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </a>
        </div>
      </div>

      {/* Hero heading */}
      <div>
        <h1 className="text-4xl font-bold leading-tight text-[#0D0D0D]">
          Discover<br />Your Best Clothes
        </h1>
      </div>

      {/* Search bar */}
      <div className="relative">
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
      </div>

      {/* Weather */}
      <WeatherBanner />

      {/* AI suggestion card */}
      <a href="/outfits/create" className="block rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0D0D0D]">Look du jour</p>
            <p className="text-xs text-[#8A8A8A]">Laissez l&apos;IA composer votre tenue</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </a>

      {/* Recent items */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#0D0D0D]">Derniers ajouts</h2>
          <a href="/wardrobe" className="text-xs font-medium text-[#8A8A8A]">
            Tout voir
          </a>
        </div>
        {recentItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {recentItems.map((item) => (
              <a key={item.id} href={`/wardrobe/${item.id}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <Image
                  src={item.bg_removed_url || item.photo_url}
                  alt={item.category}
                  fill
                  className="object-contain p-2"
                  sizes="200px"
                />
                {item.brand && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2 backdrop-blur-sm">
                    <p className="text-xs font-medium text-[#0D0D0D] truncate">{item.brand}</p>
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p className="text-sm text-[#8A8A8A]">Aucun vêtement ajouté</p>
            <a href="/wardrobe/add" className="mt-3 inline-block rounded-full bg-[#0D0D0D] px-5 py-2 text-xs font-medium text-white">
              Ajouter
            </a>
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-[#0D0D0D]">{items.length}</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Vêtements</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-[#0D0D0D]">{neverWorn}</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Jamais portés</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-2xl font-bold text-[#0D0D0D]">{calendarEntries.length}</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Planifiées</p>
        </div>
      </div>
    </div>
  );
}
