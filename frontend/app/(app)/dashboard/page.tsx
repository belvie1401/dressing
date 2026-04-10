'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuthStore, useWardrobeStore } from '@/lib/store';
import type { CalendarEntry, Outfit } from '@/types';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { items, loadItems } = useWardrobeStore();
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [todayOutfit, setTodayOutfit] = useState<Outfit | null>(null);
  const [toast, setToast] = useState('');

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
    const loadOutfit = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (res.success && res.data && res.data.length > 0) {
        setTodayOutfit(res.data[0]);
      }
    };
    loadCalendar();
    loadOutfit();
  }, []);

  const handleWearToday = async () => {
    if (!todayOutfit) return;
    const res = await api.post<Outfit>(`/outfits/${todayOutfit.id}/wear`);
    if (res.success) {
      setToast('\u2713 Look enregistr\u00e9 pour aujourd\u2019hui !');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const recentItems = items.slice(0, 4);
  const neverWorn = items.filter((i) => i.wear_count === 0).length;

  // Current week days (Mon–Sun)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const weekOutfits: Record<number, string> = {
    0: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=150',
    1: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150',
    2: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=150',
  };

  const placeholderItems = [
    { name: 'T-Shirt Blanc', wear_count: 3, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' },
    { name: 'Jean Slim', wear_count: 7, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
    { name: 'Sneakers', wear_count: 12, image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300' },
    { name: 'Veste Noire', wear_count: 0, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#8A8A8A]">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <p className="text-[13px] text-gray-500">Bonjour,</p>
            <p className="text-[22px] font-bold leading-tight text-[#0D0D0D]">
              {user?.name?.split(' ')[0] || 'Sophie'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </a>
          <a href="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Weather banner */}
      <div className="rounded-2xl bg-white p-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">☀️</span>
            <div>
              <span className="text-base font-bold text-[#0D0D0D]">22°C</span>
              <p className="text-[12px] text-gray-500">Marseille</p>
            </div>
          </div>
          <a href="/outfits" className="text-[12px] text-[#8A8A8A] underline">
            Tenue du jour →
          </a>
        </div>
      </div>

      {/* Look du jour */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0D0D0D]">Look du jour</h2>
          <a href="/outfits" className="text-[13px] text-gray-400">Modifier →</a>
        </div>
        <div className="relative h-[220px] overflow-hidden rounded-3xl bg-gray-900">
          {/* Clothing images */}
          <div className="flex h-full items-center justify-center gap-3 px-4">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"
                alt="Top"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"
                alt="Shoes"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200"
                alt="Sneakers"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
          </div>
          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent" />
          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-3">
            <div>
              <p className="text-[14px] font-bold text-white">Look Casual Chic</p>
              <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] text-gray-300">
                Casual
              </span>
            </div>
            <button
              onClick={handleWearToday}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black"
            >
              Porter aujourd&apos;hui
            </button>
          </div>
        </div>
      </div>

      {/* Looks de la semaine */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0D0D0D]">Cette semaine</h2>
          <a href="/calendar" className="text-[13px] text-gray-400">Tout voir →</a>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 scrollbar-hide">
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const outfitImage = weekOutfits[i];
            return (
              <a
                key={i}
                href="/calendar"
                className="w-[72px] shrink-0 text-center"
              >
                <p className="text-[11px] text-gray-400">{dayLabels[i]}</p>
                <div className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  isToday
                    ? 'bg-[#0D0D0D] font-bold text-white'
                    : 'bg-gray-100 text-[#0D0D0D]'
                }`}>
                  {day.getDate()}
                </div>
                {outfitImage ? (
                  <div className="relative mx-auto mt-1 h-14 w-14 overflow-hidden rounded-xl">
                    <Image
                      src={outfitImage}
                      alt={`Look ${dayLabels[i]}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Dernières pièces */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0D0D0D]">Dernières pièces</h2>
          <a href="/wardrobe" className="text-[13px] text-gray-400">Mon dressing →</a>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 scrollbar-hide">
          {(recentItems.length > 0 ? recentItems : placeholderItems).map((item, i) => (
            <a
              key={'id' in item ? item.id : i}
              href={'id' in item ? `/wardrobe/${item.id}` : '/wardrobe/add'}
              className="w-[130px] shrink-0 overflow-hidden rounded-2xl bg-white p-2"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="relative h-[140px] w-full overflow-hidden rounded-xl bg-[#F0F0F0]">
                <Image
                  src={'photo_url' in item ? (item.bg_removed_url || item.photo_url) : item.image}
                  alt={'category' in item ? item.category : item.name}
                  fill
                  className="object-cover"
                  sizes="130px"
                />
              </div>
              <p className="mt-2 truncate text-[12px] font-semibold text-[#0D0D0D]">
                {'category' in item ? (item.brand || item.category) : item.name}
              </p>
              <span className={`mt-0.5 inline-block text-[11px] font-medium ${
                item.wear_count > 0 ? 'text-green-600' : 'text-[#8A8A8A]'
              }`}>
                {item.wear_count === 0 ? 'Jamais porté' : `Porté ${item.wear_count}x`}
              </span>
            </a>
          ))}
        </div>
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
