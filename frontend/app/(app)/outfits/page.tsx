'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Outfit } from '@/types';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (!mounted) return;
      setOutfits(res.success && res.data ? res.data : []);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="pt-6 px-5">
      {/* Header */}
      <h1 className="font-serif text-[24px] font-semibold text-[#111111]">Vos looks</h1>
      <p className="mt-1 text-sm text-[#8A8A8A]">
        Tous les looks cr&eacute;&eacute;s &agrave; partir de votre dressing
      </p>

      {/* Content */}
      <div className="mt-5 space-y-4 pb-24">
        {outfits === null ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-72 rounded-3xl bg-[#F0EDE8] animate-pulse"
              />
            ))}
          </div>
        ) : outfits.length === 0 ? (
          <EmptyState />
        ) : (
          outfits.map((look) => {
            const firstItem = look.items?.[0]?.item;
            const cover =
              firstItem?.bg_removed_url || firstItem?.photo_url || null;
            const pieces = look.items?.length ?? 0;
            return (
              <div
                key={look.id}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                {/* Image section */}
                <div className="relative aspect-[4/3] bg-[#F0EDE8]">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={look.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                  )}

                  {/* Heart — top-right */}
                  <button
                    type="button"
                    onClick={() => toggleLike(look.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={likedIds.has(look.id) ? '#D4785C' : 'none'}
                      stroke={likedIds.has(look.id) ? '#D4785C' : 'white'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>

                  {look.ai_generated ? (
                    <div className="absolute bottom-3 left-3">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ background: 'rgba(198,164,126,0.2)', color: '#C6A47E' }}
                      >
                        G&eacute;n&eacute;r&eacute; par IA
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Info section */}
                <div className="p-4">
                  <p className="text-[16px] font-semibold text-[#111111]">
                    {look.name}
                  </p>
                  <p className="text-sm text-[#8A8A8A]">
                    {pieces} pi&egrave;ce{pieces > 1 ? 's' : ''}
                    {look.occasion ? ` · ${look.occasion.toLowerCase()}` : ''}
                  </p>

                  {/* Item thumbnails */}
                  <div className="mt-2 flex">
                    {(look.items ?? []).slice(0, 5).map((oi, i) => {
                      const thumb = oi.item?.bg_removed_url || oi.item?.photo_url;
                      return (
                        <div
                          key={`${look.id}-${oi.item_id}`}
                          className={`h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-[#EDE5DC] ${
                            i > 0 ? '-ml-2' : ''
                          }`}
                        >
                          {thumb ? (
                            <Image
                              src={thumb}
                              alt=""
                              width={32}
                              height={32}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/outfits/${look.id}`}
                      className="flex-1 rounded-full border border-[#111111] px-3 py-2 text-center text-xs font-medium text-[#111111]"
                    >
                      Voir le look
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await api.post(`/outfits/${look.id}/wear`);
                      }}
                      className="flex-1 rounded-full bg-[#111111] px-3 py-2 text-xs font-medium text-white"
                    >
                      Porter aujourd&apos;hui
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
      <p className="font-serif text-base font-semibold text-[#111111]">
        Aucun look pour l&rsquo;instant
      </p>
      <p className="mt-1 text-sm text-[#8A8A8A]">
        Cr&eacute;ez votre premier look &agrave; partir de votre dressing.
      </p>
      <Link
        href="/wardrobe"
        className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
      >
        Voir mon dressing
      </Link>
    </div>
  );
}
