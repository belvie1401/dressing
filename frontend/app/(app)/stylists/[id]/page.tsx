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
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Styliste non trouv\u00e9</div>;
  }

  const specs = (stylist.style_profile as Record<string, unknown>)?.specialties as string[] | undefined;
  const rating = (stylist.style_profile as Record<string, unknown>)?.rating as number | undefined;
  const reviews = (stylist.style_profile as Record<string, unknown>)?.reviews as number | undefined;
  const bio = (stylist.style_profile as Record<string, unknown>)?.bio as string | undefined;
  const looksCount = (stylist.style_profile as Record<string, unknown>)?.looks_count as number | undefined;
  const satisfaction = (stylist.style_profile as Record<string, unknown>)?.satisfaction as number | undefined;
  const experience = (stylist.style_profile as Record<string, unknown>)?.experience as string | undefined;

  return (
    <div className="space-y-5">
      {/* Back + favorite */}
      <div className="flex items-center justify-between pt-2">
        <a href="/stylists" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Hero photo */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl" style={{ background: 'var(--color-accent-light)' }}>
        {stylist.avatar_url ? (
          <Image src={stylist.avatar_url} alt={stylist.name} fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl font-bold text-[#C4A882]">
            {stylist.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {/* Name + verified + location */}
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-[#111111]">{stylist.name}</h2>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <p className="text-sm text-[#8A8A8A]">Styliste {stylist.location ? `\u00b7 ${stylist.location}` : ''}</p>

        {/* Rating */}
        {rating && (
          <div className="mt-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
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
              <span key={s} className="rounded-full border border-[#E0DCD5] px-3 py-1 text-xs font-medium text-[#111111]">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <p className="mt-4 text-sm leading-relaxed text-[#8A8A8A]">{bio}</p>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-[#111111]">{looksCount || 0}</p>
            <p className="text-[11px] text-[#8A8A8A]">looks cr\u00e9\u00e9s</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#111111]">{satisfaction || 0}%</p>
            <p className="text-[11px] text-[#8A8A8A]">clients satisfaits</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[#111111]">{experience || '0'}</p>
            <p className="text-[11px] text-[#8A8A8A]">ans d&apos;exp\u00e9rience</p>
          </div>
        </div>

        {/* Looks r\u00e9cents */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#111111]">Looks r\u00e9cents</h3>
          </div>
          {lookbooks === null ? (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 w-20 shrink-0 rounded-xl bg-[#F0EDE8] animate-pulse"
                />
              ))}
            </div>
          ) : lookbooks.length === 0 ? (
            <p className="text-xs text-[#8A8A8A]">
              Aucun look public pour l&apos;instant
            </p>
          ) : (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {lookbooks.map((lb) => {
                const firstPhoto =
                  lb.photos?.[0] ||
                  lb.outfits?.[0]?.outfit?.items?.[0]?.item?.bg_removed_url ||
                  lb.outfits?.[0]?.outfit?.items?.[0]?.item?.photo_url ||
                  null;
                return (
                  <div
                    key={lb.id}
                    className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]"
                  >
                    {firstPhoto ? (
                      <Image
                        src={firstPhoto}
                        alt={lb.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <a
          href={`/stylists/${id}/booking`}
          className="mt-5 block w-full rounded-full bg-[#D4785C] py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          D&eacute;marrer une session
        </a>
      </div>
    </div>
  );
}
