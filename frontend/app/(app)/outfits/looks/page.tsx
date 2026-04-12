'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Lookbook } from '@/types';

type LookTab = 'pour_vous' | 'en_attente' | 'approuves';

const TABS: Array<{ key: LookTab; label: string; status?: string }> = [
  { key: 'pour_vous', label: 'Pour vous' },
  { key: 'en_attente', label: 'En attente', status: 'SENT' },
  { key: 'approuves', label: 'Approuvés', status: 'APPROVED' },
];

export default function LooksPage() {
  const [lookbooks, setLookbooks] = useState<Lookbook[] | null>(null);
  const [activeTab, setActiveTab] = useState<LookTab>('pour_vous');

  useEffect(() => {
    let mounted = true;
    api.get<Lookbook[]>('/lookbooks').then((res) => {
      if (!mounted) return;
      setLookbooks(res.success && res.data ? res.data : []);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = lookbooks?.filter((lb) => {
    if (activeTab === 'pour_vous') return true;
    const tab = TABS.find((t) => t.key === activeTab);
    return tab?.status ? lb.status === tab.status : true;
  }) ?? [];

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-24">
      {/* Header */}
      <div className="flex items-center px-5 py-4">
        <Link href="/outfits" className="flex h-8 w-8 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="flex-1 text-center font-serif text-lg text-[#1A1A1A]" style={{ fontWeight: 500 }}>
          Vos looks
        </h1>
        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 mt-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs transition-colors ${
              activeTab === t.key
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-[#F2F0EC] text-[#9B9B9B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-5 mt-4">
        {lookbooks === null ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A1A1A] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="font-serif text-base text-[#1A1A1A]">Aucun look pour le moment</p>
            <p className="mt-1 text-xs text-[#9B9B9B]">
              Les looks proposés par votre styliste apparaîtront ici.
            </p>
          </div>
        ) : (
          filtered.map((lb) => <LookCard key={lb.id} lookbook={lb} />)
        )}
      </div>
    </div>
  );
}

function LookCard({ lookbook }: { lookbook: Lookbook }) {
  const photos = (lookbook.photos || []).slice(0, 4);
  const outfitPhotos = lookbook.outfits
    ?.flatMap((o) => o.outfit?.items?.map((i) => i.item?.bg_removed_url || i.item?.photo_url) ?? [])
    .filter(Boolean)
    .slice(0, 4) ?? [];
  const allPhotos = photos.length > 0 ? photos : outfitPhotos;

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      {/* Collage */}
      <div className="relative" style={{ minHeight: '280px' }}>
        {allPhotos.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center bg-[#F2F0EC]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        ) : allPhotos.length === 1 ? (
          <div className="relative h-[280px]">
            <Image src={allPhotos[0]!} alt="" fill className="object-cover object-top" sizes="100vw" />
          </div>
        ) : (
          <div className="flex h-[280px] gap-px">
            <div className="relative w-[60%]">
              <Image src={allPhotos[0]!} alt="" fill className="object-cover object-top" sizes="60vw" />
            </div>
            <div className="flex w-[40%] flex-col gap-px">
              {allPhotos.slice(1, 3).map((p, i) => (
                <div key={i} className="relative flex-1">
                  {p && <Image src={p} alt="" fill className="object-cover object-top" sizes="40vw" />}
                </div>
              ))}
              {allPhotos.length >= 4 && (
                <div className="relative flex-1">
                  <Image src={allPhotos[3]!} alt="" fill className="object-cover object-top" sizes="40vw" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Heart */}
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="font-serif text-base text-[#1A1A1A]">{lookbook.title}</p>
        {lookbook.description && (
          <p className="mt-0.5 text-xs text-[#9B9B9B]">{lookbook.description}</p>
        )}

        {/* Stylist */}
        {lookbook.stylist && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EDE5DC] text-[10px] font-semibold text-[#C6A47E]">
              {lookbook.stylist.avatar_url ? (
                <img src={lookbook.stylist.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                lookbook.stylist.name?.charAt(0) || '?'
              )}
            </div>
            <span className="text-xs text-[#9B9B9B]">{lookbook.stylist.name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-full border border-[#1A1A1A] py-2.5 text-center text-xs text-[#1A1A1A]"
          >
            Demander une modification
          </button>
          <button
            type="button"
            className="flex-1 cursor-pointer rounded-full bg-[#1A1A1A] py-2.5 text-center text-xs text-white"
          >
            J&apos;adore ce look
          </button>
        </div>
      </div>
    </div>
  );
}
