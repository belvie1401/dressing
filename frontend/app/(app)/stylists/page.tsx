'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { User, StylistClient } from '@/types';
import { api } from '@/lib/api';

const styleFilters = ['Tous', 'Minimal', 'Chic', 'Street', 'Casual', 'Disponible', 'À partir de 30€'];

export default function StylistsPage() {
  const [stylists, setStylists] = useState<User[]>([]);
  const [connections, setConnections] = useState<StylistClient[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [stylistsRes, connectionsRes] = await Promise.all([
        api.get<User[]>('/stylists'),
        api.get<StylistClient[]>('/stylists/connections'),
      ]);
      if (stylistsRes.success && stylistsRes.data) setStylists(stylistsRes.data);
      if (connectionsRes.success && connectionsRes.data) setConnections(connectionsRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = stylists.filter((s) => {
    const sp = s.style_profile as Record<string, unknown> | undefined;
    const specs = sp?.specialties as string[] | undefined;
    const price = sp?.price as number | undefined;
    const available = sp?.available as boolean | undefined;

    if (search) {
      const q = search.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchCity = (s.location || '').toLowerCase().includes(q);
      const matchStyle = (specs || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchStyle) return false;
    }
    if (activeFilter === 'Disponible') {
      if (!available) return false;
    } else if (activeFilter === 'À partir de 30€') {
      if (!price || price > 30) return false;
    } else if (activeFilter !== 'Tous') {
      if (!specs?.some((sp) => sp.toLowerCase().includes(activeFilter.toLowerCase()))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-10">
      {/* Header — mobile: hamburger + centered + bell */}
      <div className="flex items-center justify-between px-5 py-4 md:px-0 md:pt-2">
        <button className="flex h-9 w-9 cursor-pointer items-center justify-center md:hidden" aria-label="Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="font-serif text-lg text-[#1A1A1A] md:text-xl md:font-semibold" style={{ fontWeight: 500 }}>Nos stylistes</h1>
        <a
          href="/messages"
          className="flex h-9 w-9 items-center justify-center"
          aria-label="Notifications"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </a>
      </div>

      {/* Search + filter */}
      <div className="mx-5 flex items-center gap-3 md:mx-0">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F2F0EC] px-4 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un styliste"
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder-[#9B9B9B] focus:outline-none"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-[#9B9B9B]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2F0EC]" aria-label="Filtres">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      {/* Filter pills — horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5 pb-1">
          {styleFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-sm transition-all ${
                activeFilter === f
                  ? 'bg-[#1A1A1A] text-white'
                  : 'border border-[#EFEFEF] bg-white text-[#1A1A1A]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Aucun styliste trouvé</div>
      ) : (
        <>
        {/* Mobile: list layout / Desktop: grid */}
        <div className="flex flex-col gap-0 md:hidden">
          {filtered.map((stylist) => {
            const sp = stylist.style_profile as Record<string, unknown> | undefined;
            const specs = sp?.specialties as string[] | undefined;
            const rating = sp?.rating as number | undefined;
            const reviews = sp?.reviews as number | undefined;
            const price = sp?.price as number | undefined;

            return (
              <a
                key={stylist.id}
                href={`/stylists/${stylist.id}`}
                className="flex items-center gap-3 border-b border-[#F2F0EC] bg-white px-5 py-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  {stylist.avatar_url ? (
                    <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover object-top" sizes="64px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#EDE5DC] text-xl font-bold text-[#C4A882]">
                      {stylist.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A] truncate">{stylist.name}</p>
                  {stylist.location && (
                    <p className="mt-0.5 text-xs text-[#9B9B9B]">{stylist.location}</p>
                  )}
                  {specs && specs.length > 0 && (
                    <p className="mt-0.5 text-xs text-[#9B9B9B]">
                      Spécialité: {specs.slice(0, 3).join(', ')}
                    </p>
                  )}
                  {rating != null && (
                    <div className="mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#C6A47E" stroke="#C6A47E" strokeWidth="1.5">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="text-xs font-semibold">{rating}</span>
                      {reviews != null && <span className="text-xs text-[#9B9B9B]">({reviews})</span>}
                    </div>
                  )}
                  {price != null && (
                    <p className="mt-1 text-xs font-medium text-[#1A1A1A]">À partir de {price}€</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* Desktop: card grid */}
        <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-3">
          {filtered.map((stylist) => {
            const sp = stylist.style_profile as Record<string, unknown> | undefined;
            const specs = sp?.specialties as string[] | undefined;
            const rating = sp?.rating as number | undefined;
            const reviews = sp?.reviews as number | undefined;
            const price = sp?.price as number | undefined;
            const clientsCount = sp?.clients_count as number | undefined;

            return (
              <a
                key={stylist.id}
                href={`/stylists/${stylist.id}`}
                className="block cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="relative h-[200px] overflow-hidden">
                  {stylist.avatar_url ? (
                    <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover" sizes="33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#EDE5DC] text-4xl font-bold text-[#C4A882]">
                      {stylist.name.charAt(0)}
                    </div>
                  )}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="font-serif text-base font-medium leading-tight text-white">{stylist.name}</p>
                    {stylist.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {stylist.location}
                      </p>
                    )}
                  </div>
                  {clientsCount != null && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur">
                      <span className="text-[10px] font-medium text-[#111111]">{clientsCount} clients</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {specs && specs.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {specs.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] text-[#111111]">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    {rating ? (
                      <div className="flex items-center gap-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#C6A47E" stroke="#C6A47E" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-xs font-semibold text-[#111111]">{rating}</span>
                        {reviews && <span className="text-[10px] text-[#8A8A8A]">({reviews})</span>}
                      </div>
                    ) : <div />}
                    {price && <span className="text-xs font-medium text-[#C6A47E]">Dès {price}€</span>}
                  </div>
                  <div className="mt-2 w-full rounded-full bg-[#111111] py-2 text-center text-xs font-medium text-white">
                    Voir le profil
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
