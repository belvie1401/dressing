'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Outfit, User } from '@/types';

type FavTab = 'looks' | 'stylistes';

export default function FavoritesPage() {
  const [tab, setTab] = useState<FavTab>('looks');
  const [savedLooks, setSavedLooks] = useState<Outfit[] | null>(null);
  const [savedStylists, setSavedStylists] = useState<User[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [looksRes, stylistsRes] = await Promise.all([
        api.get<Outfit[]>('/favorites/outfits'),
        api.get<User[]>('/favorites/stylists'),
      ]);
      if (!mounted) return;
      setSavedLooks(looksRes.success && Array.isArray(looksRes.data) ? looksRes.data : []);
      setSavedStylists(stylistsRes.success && Array.isArray(stylistsRes.data) ? stylistsRes.data : []);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const removeLook = async (id: string) => {
    setSavedLooks((prev) => (prev ?? []).filter((l) => l.id !== id));
    await api.delete(`/favorites/outfits/${id}`);
  };

  const removeStylist = async (id: string) => {
    setSavedStylists((prev) => (prev ?? []).filter((s) => s.id !== id));
    await api.delete(`/favorites/stylists/${id}`);
  };

  return (
    <div className="px-5 pt-6">
      {/* Header */}
      <h1 className="font-serif text-[24px] font-semibold text-[#111111]">Favoris</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-full p-1" style={{ background: 'var(--color-tag-bg)' }}>
        <button
          onClick={() => setTab('looks')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
            tab === 'looks' ? 'bg-[#111111] text-white' : 'text-[#111111]'
          }`}
        >
          Looks
        </button>
        <button
          onClick={() => setTab('stylistes')}
          className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
            tab === 'stylistes' ? 'bg-[#111111] text-white' : 'text-[#111111]'
          }`}
        >
          Stylistes
        </button>
      </div>

      {/* Tab content */}
      <div className="mt-5 pb-24">
        {tab === 'looks' ? (
          savedLooks === null ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-[#F0EDE8] animate-pulse" />
              ))}
            </div>
          ) : savedLooks.length === 0 ? (
            /* Empty state — Looks */
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="font-serif text-base font-semibold text-[#111111]">Aucun look sauvegard&eacute;</p>
              <p className="mt-1 text-sm text-[#8A8A8A]">Explorez les looks de nos stylistes</p>
              <Link
                href="/stylists"
                className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
              >
                Voir les stylistes
              </Link>
            </div>
          ) : (
            /* Looks grid */
            <div className="grid grid-cols-2 gap-3">
              {savedLooks.map((look) => {
                const firstItem = look.items?.[0]?.item;
                const cover = firstItem?.bg_removed_url || firstItem?.photo_url || null;
                return (
                  <div key={look.id} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#F0EDE8]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={look.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 200px"
                      />
                    ) : null}
                    {/* Dark gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Heart top-right */}
                    <button
                      onClick={() => removeLook(look.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-[13px] font-bold text-white">{look.name}</p>
                      {look.occasion ? (
                        <p className="text-[11px] text-white/70">{look.occasion.toLowerCase()}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : savedStylists === null ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#F0EDE8] animate-pulse" />
            ))}
          </div>
        ) : savedStylists.length === 0 ? (
          /* Empty state — Stylistes */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="font-serif text-base font-semibold text-[#111111]">Aucun styliste sauvegard&eacute;</p>
            <p className="mt-1 text-sm text-[#8A8A8A]">D&eacute;couvrez nos stylistes professionnels</p>
            <Link
              href="/stylists"
              className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
            >
              Trouver un styliste
            </Link>
          </div>
        ) : (
          /* Stylists list */
          <div className="space-y-3">
            {savedStylists.map((stylist) => (
              <div
                key={stylist.id}
                className="relative flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm"
              >
                {/* Avatar */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#EDE5DC]">
                  {stylist.avatar_url ? (
                    <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-lg font-semibold text-[#C6A47E]">{stylist.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">{stylist.name}</p>
                  {stylist.email ? (
                    <p className="text-xs text-[#8A8A8A]">{stylist.email}</p>
                  ) : null}
                </div>

                {/* Heart */}
                <button
                  onClick={() => removeStylist(stylist.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
