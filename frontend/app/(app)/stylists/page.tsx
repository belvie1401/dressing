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
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-serif text-xl font-semibold text-[#111111]">Nos stylistes</h1>
        <a
          href="/messages"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </a>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: 'var(--color-tag-bg)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, ville ou style…"
          className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#8A8A8A] focus:outline-none"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-[#8A8A8A]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter pills — horizontal scroll */}
      <div className="-mx-5 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5 pb-1">
          {styleFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeFilter === f
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F0EDE8] text-[#111111]'
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
                {/* Photo area */}
                <div className="relative h-[200px] overflow-hidden">
                  {stylist.avatar_url ? (
                    <Image
                      src={stylist.avatar_url}
                      alt={stylist.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#EDE5DC] text-4xl font-bold text-[#C4A882]">
                      {stylist.name.charAt(0)}
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Name + city */}
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

                  {/* Client count badge */}
                  {clientsCount != null && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span className="text-[10px] font-medium text-[#111111]">{clientsCount} clients</span>
                    </div>
                  )}
                </div>

                {/* Bottom info */}
                <div className="p-3">
                  {/* Style tags */}
                  {specs && specs.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {specs.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] text-[#111111]">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Rating + price */}
                  <div className="flex items-center justify-between">
                    {rating ? (
                      <div className="flex items-center gap-1">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#C6A47E" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="text-xs font-semibold text-[#111111]">{rating}</span>
                        {reviews && <span className="text-[10px] text-[#8A8A8A]">({reviews})</span>}
                      </div>
                    ) : <div />}
                    {price && (
                      <span className="text-xs font-medium text-[#C6A47E]">Dès {price}€</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-2 w-full rounded-full bg-[#111111] py-2 text-center text-xs font-medium text-white">
                    Voir le profil
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
