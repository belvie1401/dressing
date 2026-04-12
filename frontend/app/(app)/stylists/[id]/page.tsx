'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { User, Lookbook, StylistClient } from '@/types';
import { api } from '@/lib/api';

export default function StylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [stylist, setStylist] = useState<User | null>(null);
  const [lookbooks, setLookbooks] = useState<Lookbook[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [stylistsRes, connectionsRes, lookbooksRes] = await Promise.all([
        api.get<User[]>('/stylists'),
        api.get<StylistClient[]>('/stylists/connections'),
        api.get<Lookbook[]>(`/lookbooks/stylist/${id}/public?limit=8`),
      ]);
      if (stylistsRes.success && stylistsRes.data) {
        const found = stylistsRes.data.find((s) => s.id === id);
        if (found) setStylist(found);
      }
      if (connectionsRes.success && connectionsRes.data) {
        setInvited(connectionsRes.data.some((c) => c.stylist_id === id));
      }
      setLookbooks(lookbooksRes.success && Array.isArray(lookbooksRes.data) ? lookbooksRes.data : []);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleInvite = async () => {
    setInviting(true);
    const res = await api.post<StylistClient>('/stylists/invite', { stylist_id: id });
    if (res.success) setInvited(true);
    setInviting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (!stylist) {
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Styliste non trouvé</div>;
  }

  const sp = stylist.style_profile as Record<string, unknown> | undefined;
  const specs = sp?.specialties as string[] | undefined;
  const rating = sp?.rating as number | undefined;
  const reviews = sp?.reviews as number | undefined;
  const bio = sp?.bio as string | undefined;
  const looksCount = sp?.looks_count as number | undefined;
  const satisfaction = sp?.satisfaction as number | undefined;
  const experience = sp?.experience as string | undefined;

  return (
    <div className="pb-28">
      {/* Hero photo (mobile: full-width; desktop: rounded) */}
      <div className="relative h-[280px] overflow-hidden md:mt-3 md:aspect-[3/4] md:h-auto md:rounded-3xl" style={{ background: 'var(--color-accent-light)' }}>
        {stylist.avatar_url ? (
          <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover object-top" sizes="100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-[#C4A882]">
            {stylist.name.charAt(0)}
          </div>
        )}
        {/* Back + favorite overlay on hero (mobile) */}
        <a
          href="/stylists"
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <button
          type="button"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Info card — overlaps hero on mobile */}
      <div className="-mt-6 relative rounded-t-3xl bg-white px-5 pt-5 md:mt-5 md:rounded-3xl md:p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {/* Name + verified + location */}
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg text-[#1A1A1A] md:text-xl md:font-bold">{stylist.name}</h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <p className="text-sm text-[#8A8A8A]">Styliste{stylist.location ? ` · ${stylist.location}` : ''}</p>

        {/* Rating */}
        {rating && (
          <div className="mt-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#C6A47E" stroke="#C6A47E" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-semibold text-[#111111]">{rating}</span>
            {reviews && <span className="text-sm text-[#8A8A8A]">({reviews} avis)</span>}
          </div>
        )}

        {/* Style tags */}
        {specs && specs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {specs.map((s) => (
              <span key={s} className="rounded-full bg-[#F2F0EC] px-3 py-1.5 text-xs text-[#1A1A1A] md:border md:border-[#E0DCD5] md:bg-transparent">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#F0F0F0] pt-4">
          <div className="text-center">
            <p className="font-serif text-xl text-[#1A1A1A]">{looksCount || 0}</p>
            <p className="mt-0.5 text-[10px] text-[#9B9B9B]">looks créés</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-xl text-[#1A1A1A]">{satisfaction || 0}%</p>
            <p className="mt-0.5 text-[10px] text-[#9B9B9B]">satisfaits</p>
          </div>
          <div className="text-center">
            <p className="font-serif text-xl text-[#1A1A1A]">{experience || '0'}</p>
            <p className="mt-0.5 text-[10px] text-[#9B9B9B]">ans exp.</p>
          </div>
        </div>
      </div>

      {/* Bio section */}
      {bio && (
        <div className="mt-6">
          <h3 className="px-5 font-serif text-lg text-[#111111]">À propos</h3>
          <p className="mt-2 px-5 text-sm leading-relaxed text-[#8A8A8A]">{bio}</p>
        </div>
      )}

      {/* Portfolio section */}
      <div className="mt-6">
        <h3 className="px-5 font-serif text-lg text-[#111111]">Portfolio</h3>
        <div className="mt-3 px-5">
          {lookbooks === null ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[180px] animate-pulse rounded-2xl bg-[#F0EDE8]" />
              ))}
            </div>
          ) : lookbooks.length === 0 ? (
            <p className="text-xs text-[#8A8A8A]">Aucun lookbook public pour l&apos;instant</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-2 md:gap-3">
              {lookbooks.map((lb) => {
                const firstPhoto =
                  lb.photos?.[0] ||
                  lb.outfits?.[0]?.outfit?.items?.[0]?.item?.bg_removed_url ||
                  lb.outfits?.[0]?.outfit?.items?.[0]?.item?.photo_url ||
                  null;
                return (
                  <div key={lb.id} className="relative aspect-square overflow-hidden rounded-xl bg-[#EDE5DC] md:h-[180px] md:aspect-auto md:rounded-2xl">
                    {firstPhoto && (
                      <Image
                        src={firstPhoto}
                        alt={lb.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    )}
                    {/* Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="truncate text-xs font-medium text-white">{lb.title}</p>
                      {lb.type && (
                        <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
                          {lb.type}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky bottom contact buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F2F0EC] bg-white px-5 py-4">
        <a
          href={`/stylists/${id}/booking`}
          className="flex w-full items-center justify-center rounded-full bg-[#C6A47E] py-4 font-serif text-base font-medium text-white md:hidden"
        >
          Démarrer une session
        </a>
        <div className="mx-auto hidden max-w-lg grid-cols-2 gap-3 md:grid">
          <a
            href={`/messages/${id}`}
            className="flex items-center justify-center rounded-full border border-[#111111] py-3 text-sm font-semibold text-[#111111]"
          >
            Envoyer un message
          </a>
          <a
            href={`/stylists/${id}/booking`}
            className="flex items-center justify-center rounded-full bg-[#D4785C] py-3 text-sm font-semibold text-white"
          >
            Réserver une session
          </a>
        </div>
      </div>
    </div>
  );
}
