'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Lookbook } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type TabKey = 'ALL' | 'BEFORE_AFTER' | 'THEME' | 'CLIENT';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'BEFORE_AFTER', label: 'Avant/Apr\u00e8s' },
  { key: 'THEME', label: 'Th\u00e9matiques' },
  { key: 'CLIENT', label: 'Clients' },
];

const TYPE_LABEL: Record<string, string> = {
  BEFORE_AFTER: 'Avant/Apr\u00e8s',
  COMPLETE_LOOK: 'Look complet',
  THEME: 'Th\u00e9matique',
  STYLE_ADVICE: 'Conseil style',
};

function coverImage(lb: Lookbook): string | null {
  if (lb.photos && lb.photos.length > 0) return lb.photos[0];
  if (lb.after_photos && lb.after_photos.length > 0) return lb.after_photos[0];
  if (lb.before_photos && lb.before_photos.length > 0) return lb.before_photos[0];
  const firstOutfitItem = lb.outfits?.[0]?.outfit?.items?.[0]?.item;
  if (firstOutfitItem) return firstOutfitItem.bg_removed_url || firstOutfitItem.photo_url;
  return null;
}

export default function LookbooksPage() {
  const user = useAuthStore((s) => s.user);
  const isStylist = user?.role === 'STYLIST';
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>('ALL');

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Lookbook[]>('/lookbooks');
      if (res.success && res.data) setLookbooks(res.data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    switch (tab) {
      case 'BEFORE_AFTER':
        return lookbooks.filter((lb) => lb.type === 'BEFORE_AFTER');
      case 'THEME':
        return lookbooks.filter((lb) => lb.type === 'THEME');
      case 'CLIENT':
        return lookbooks.filter((lb) => !!lb.client_id);
      default:
        return lookbooks;
    }
  }, [lookbooks, tab]);

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* Header */}
      <header className="px-5 pt-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[#111111]">
            {isStylist ? 'Mon Portfolio' : 'Mes lookbooks'}
          </h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            {isStylist
              ? 'Votre vitrine professionnelle'
              : 'Vos cr\u00e9ations personnalis\u00e9es'}
          </p>
        </div>
        {isStylist && (
          <Link
            href="/lookbooks/create"
            className="bg-[#111111] text-white rounded-full px-4 py-2 text-xs font-medium"
          >
            + Cr&eacute;er
          </Link>
        )}
      </header>

      {/* Tabs */}
      <nav className="mt-5 px-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap ${
                tab === t.key
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#8A8A8A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Grid */}
      <main className="mt-5 px-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#EDE5DC] flex items-center justify-center mx-auto mb-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#111111]">
              {isStylist ? 'Votre portfolio est vide' : 'Aucun lookbook'}
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              {isStylist
                ? 'Cr\u00e9ez votre premi\u00e8re prestation'
                : 'Vos stylistes partageront vos lookbooks ici'}
            </p>
            {isStylist && (
              <Link
                href="/lookbooks/create"
                className="mt-5 inline-block bg-[#111111] text-white rounded-full px-5 py-2.5 text-xs font-medium"
              >
                + Cr&eacute;er un portfolio
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((lb) => (
              <PortfolioCard key={lb.id} lookbook={lb} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PortfolioCard({ lookbook }: { lookbook: Lookbook }) {
  const cover = coverImage(lookbook);
  const typeLabel = lookbook.type ? TYPE_LABEL[lookbook.type] || lookbook.type : null;

  return (
    <Link
      href={`/lookbooks/${lookbook.id}`}
      className="bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col"
    >
      <div className="relative h-[180px] w-full bg-[#EDE5DC]">
        {cover ? (
          <Image
            src={cover}
            alt={lookbook.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Category badge top-left */}
        {typeLabel && (
          <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] rounded-full px-2 py-1 backdrop-blur">
            {typeLabel}
          </span>
        )}

        {/* Price badge top-right */}
        {typeof lookbook.price === 'number' && lookbook.price > 0 && (
          <span className="absolute top-2 right-2 bg-white text-[#111111] text-xs rounded-full px-2 py-1 font-semibold">
            {lookbook.price} euros
          </span>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-[#111111] truncate">
          {lookbook.title}
        </p>
        {lookbook.description && (
          <p className="text-xs text-[#8A8A8A] mt-1 line-clamp-2 leading-relaxed">
            {lookbook.description}
          </p>
        )}
        {lookbook.client?.name && (
          <p className="text-[10px] text-[#CFCFCF] mt-2 truncate">
            pour {lookbook.client.name}
          </p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-[#111111] underline">Voir le d&eacute;tail</span>
          <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {lookbook.favorite_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
