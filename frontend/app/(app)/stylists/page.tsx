'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { User, StylistClient } from '@/types';
import { api } from '@/lib/api';

const styleFilters = ['Tous', 'Minimal', 'Chic', 'Street', 'Casual'];

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
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter !== 'Tous') {
      const specs = (s.style_profile as Record<string, unknown>)?.specialties as string[] | undefined;
      if (!specs?.some((sp) => sp.toLowerCase().includes(activeFilter.toLowerCase()))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="font-serif text-xl font-semibold text-[#0D0D0D]">Nos stylistes</h1>
        </div>
        <a href="/messages" className="flex h-10 w-10 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </a>
      </div>

      {/* Search + filter icon */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-2.5" style={{ background: 'var(--color-tag-bg)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un styliste"
            className="flex-1 bg-transparent text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:outline-none"
          />
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'var(--color-tag-bg)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      {/* Style filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {styleFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === f
                ? 'bg-[#0D0D0D] text-white'
                : 'bg-white text-[#0D0D0D] border border-[#E0DCD5]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stylists list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Aucun styliste trouv\u00e9</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((stylist) => {
            const specs = (stylist.style_profile as Record<string, unknown>)?.specialties as string[] | undefined;
            const rating = (stylist.style_profile as Record<string, unknown>)?.rating as number | undefined;
            const reviews = (stylist.style_profile as Record<string, unknown>)?.reviews as number | undefined;
            const price = (stylist.style_profile as Record<string, unknown>)?.price as number | undefined;

            return (
              <a
                key={stylist.id}
                href={`/stylists/${stylist.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3.5 transition-colors"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full" style={{ background: 'var(--color-accent-light)' }}>
                  {stylist.avatar_url ? (
                    <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#C4A882]">
                      {stylist.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">{stylist.name}</p>
                  {stylist.location && (
                    <p className="text-xs text-[#8A8A8A]">{stylist.location}</p>
                  )}
                  {specs && specs.length > 0 && (
                    <p className="mt-0.5 text-xs text-[#8A8A8A]">
                      Sp\u00e9cialit\u00e9 : {specs.join(', ')}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2">
                    {rating && (
                      <span className="flex items-center gap-0.5 text-xs text-[#0D0D0D]">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {rating} {reviews ? `(${reviews})` : ''}
                      </span>
                    )}
                  </div>
                </div>
                {price && (
                  <span className="shrink-0 text-xs font-medium text-[#8A8A8A]">\u00c0 partir de {price}\u20ac</span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
