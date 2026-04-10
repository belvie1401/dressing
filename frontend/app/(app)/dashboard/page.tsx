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
      if (res.success && res.data) setCalendarEntries(res.data);
    };
    const loadOutfit = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (res.success && res.data && res.data.length > 0) setTodayOutfit(res.data[0]);
    };
    loadCalendar();
    loadOutfit();
  }, []);

  const handleWearToday = async () => {
    if (!todayOutfit) return;
    const res = await api.post<Outfit>(`/outfits/${todayOutfit.id}/wear`);
    if (res.success) {
      setToast('\u2713 Look enregistr\u00e9 !');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const recentItems = items.slice(0, 4);
  const neverWorn = items.filter((i) => i.wear_count === 0).length;

  // Current week days
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    return d;
  });
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full" style={{ background: 'var(--color-accent-light)' }}>
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-base font-semibold text-[#C4A882]">
                {user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-[#8A8A8A]">Bonjour,</p>
            <p className="text-lg font-bold leading-tight text-[#0D0D0D]">
              {user?.name?.split(' ')[0] || 'Sophie'}
            </p>
          </div>
        </div>
        <a href="/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </a>
      </div>

      {/* Look du jour */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#0D0D0D]">Look du jour</h2>
          <a href="/outfits" className="text-xs text-[#8A8A8A]">Modifier &rarr;</a>
        </div>
        <div className="relative h-[200px] overflow-hidden rounded-3xl bg-[#1A1A1A]">
          <div className="flex h-full items-center justify-center gap-3 px-4">
            {(todayOutfit?.items?.slice(0, 3) || []).map((oi, i) => (
              <div key={i} className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={oi.item?.bg_removed_url || oi.item?.photo_url || ''}
                  alt="item"
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
            ))}
            {(!todayOutfit || !todayOutfit.items?.length) && (
              <p className="text-sm text-gray-400">Aucun look planifi\u00e9</p>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-3">
            <div>
              <p className="text-sm font-semibold text-white">{todayOutfit?.name || 'Votre look'}</p>
              <span className="mt-0.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-gray-300">
                {todayOutfit?.occasion || 'Casual'}
              </span>
            </div>
            {todayOutfit && (
              <button onClick={handleWearToday} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0D0D0D]">
                Porter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cette semaine */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#0D0D0D]">Cette semaine</h2>
          <a href="/calendar" className="text-xs text-[#8A8A8A]">Tout voir &rarr;</a>
        </div>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 scrollbar-hide">
          {weekDays.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString();
            const entry = calendarEntries.find(
              (e) => new Date(e.date).toDateString() === day.toDateString()
            );
            return (
              <a key={i} href="/calendar" className="w-[72px] shrink-0 text-center">
                <p className="text-[11px] text-[#8A8A8A]">{dayLabels[i]}</p>
                <div className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  isToday ? 'bg-[#0D0D0D] font-bold text-white' : 'text-[#0D0D0D]'
                }`}>
                  {day.getDate()}
                </div>
                {entry?.outfit?.items?.[0]?.item?.photo_url ? (
                  <div className="relative mx-auto mt-1 h-14 w-14 overflow-hidden rounded-xl">
                    <Image
                      src={entry.outfit.items[0].item.bg_removed_url || entry.outfit.items[0].item.photo_url}
                      alt="outfit"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-[#E0DCD5]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C4A882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Derni\u00e8res pi\u00e8ces */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-[#0D0D0D]">Derni\u00e8res pi\u00e8ces</h2>
          <a href="/wardrobe" className="text-xs text-[#8A8A8A]">Mon dressing &rarr;</a>
        </div>
        {recentItems.length > 0 ? (
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 scrollbar-hide">
            {recentItems.map((item) => (
              <a
                key={item.id}
                href={`/wardrobe/${item.id}`}
                className="w-[120px] shrink-0 overflow-hidden rounded-2xl bg-white"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="relative h-[130px] w-full" style={{ background: 'var(--color-tag-bg)' }}>
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-[#0D0D0D]">{item.brand || item.category}</p>
                  <span className={`text-[10px] ${item.wear_count > 0 ? 'text-green-600' : 'text-[#8A8A8A]'}`}>
                    {item.wear_count === 0 ? 'Jamais port\u00e9' : `Port\u00e9 ${item.wear_count}x`}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p className="text-sm text-[#8A8A8A]">Ajoutez vos premiers v\u00eatements</p>
            <a href="/wardrobe/add" className="mt-3 inline-block rounded-full bg-[#0D0D0D] px-5 py-2 text-xs font-medium text-white">
              Ajouter
            </a>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold text-[#0D0D0D]">{items.length}</p>
          <p className="text-[11px] text-[#8A8A8A] mt-1">V\u00eatements</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold text-[#0D0D0D]">{neverWorn}</p>
          <p className="text-[11px] text-[#8A8A8A] mt-1">Jamais port\u00e9s</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-xl font-bold text-[#0D0D0D]">{calendarEntries.length}</p>
          <p className="text-[11px] text-[#8A8A8A] mt-1">Planifi\u00e9es</p>
        </div>
      </div>

      {/* Styliste CTA */}
      <div className="mb-4 overflow-hidden rounded-3xl bg-[#1A1A1A] p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: 'var(--color-cta)' }}>
              NOUVEAU
            </span>
            <p className="text-base font-bold text-white">Votre styliste personnel</p>
            <p className="mt-1 max-w-[200px] text-xs text-gray-400">
              Laissez un expert composer vos looks avec vos pi\u00e8ces existantes
            </p>
            <a
              href="/stylists"
              className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#0D0D0D] transition-opacity hover:opacity-90"
            >
              Trouver un styliste &rarr;
            </a>
          </div>
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
            <Image
              src="https://i.pravatar.cc/150?img=32"
              alt="Styliste"
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
