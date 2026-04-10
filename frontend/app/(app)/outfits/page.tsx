'use client';

import { useState } from 'react';
import Image from 'next/image';

type LookTab = 'pour_vous' | 'en_attente' | 'approuves';

interface LookCard {
  id: string;
  name: string;
  stylist: string;
  image: string;
  items: string[];
}

const pourVousLooks: LookCard[] = [
  {
    id: 'pv1',
    name: 'D\u00e9contract\u00e9 chic',
    stylist: 'Camille D.',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    items: ['T', 'J', 'S', 'V'],
  },
  {
    id: 'pv2',
    name: '\u00c9l\u00e9gance du soir',
    stylist: 'L\u00e9a P.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
    items: ['R', 'C', 'B'],
  },
];

const enAttenteLooks: LookCard[] = [
  {
    id: 'ea1',
    name: 'Casual vendredi',
    stylist: 'Hugo B.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    items: ['P', 'J', 'B', 'S'],
  },
  {
    id: 'ea2',
    name: 'Look boh\u00e8me',
    stylist: 'Camille D.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    items: ['R', 'S', 'C'],
  },
];

const approuvesLooks: LookCard[] = [
  {
    id: 'ap1',
    name: 'Minimal chic',
    stylist: 'Camille D.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
    items: ['H', 'P', 'C', 'S'],
  },
  {
    id: 'ap2',
    name: 'Chic Parisien',
    stylist: 'L\u00e9a P.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600',
    items: ['V', 'J', 'E'],
  },
];

export default function OutfitsPage() {
  const [tab, setTab] = useState<LookTab>('pour_vous');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dataMap: Record<LookTab, LookCard[]> = {
    pour_vous: pourVousLooks,
    en_attente: enAttenteLooks,
    approuves: approuvesLooks,
  };

  const looks = dataMap[tab];

  return (
    <div className="pt-6 px-5">
      {/* Header */}
      <h1 className="font-serif text-[24px] font-semibold text-[#111111]">Vos looks</h1>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 rounded-full p-1" style={{ background: 'var(--color-tag-bg)' }}>
        {([
          { key: 'pour_vous' as LookTab, label: 'Pour vous' },
          { key: 'en_attente' as LookTab, label: 'En attente' },
          { key: 'approuves' as LookTab, label: 'Approuv\u00e9s' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
              tab === t.key ? 'bg-[#111111] text-white' : 'text-[#111111]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-5 space-y-4 pb-24">
        {looks.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          looks.map((look) => (
            <div key={look.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
              {/* Image section */}
              <div className="relative aspect-[4/3]">
                <Image
                  src={look.image}
                  alt={look.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />

                {/* Stylist avatar pill — top-left */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EDE5DC]">
                    <span className="text-[8px] font-bold text-[#C6A47E]">{look.stylist.charAt(0)}</span>
                  </div>
                  <span className="text-xs text-white">{look.stylist}</span>
                </div>

                {/* Heart — top-right */}
                <button
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

                {/* Status badge overlay — en_attente / approuves */}
                {tab === 'en_attente' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'rgba(198,164,126,0.2)', color: '#C6A47E' }}>
                      En attente de validation
                    </span>
                  </div>
                )}
                {tab === 'approuves' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      Approuv&eacute;
                    </span>
                  </div>
                )}
              </div>

              {/* Info section */}
              <div className="p-4">
                <p className="text-[16px] font-semibold text-[#111111]">{look.name}</p>
                <p className="text-sm text-[#8A8A8A]">{look.stylist}</p>

                {/* Item thumbnails */}
                <div className="mt-2 flex">
                  {look.items.map((initial, i) => (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#EDE5DC] text-[10px] font-bold text-[#C6A47E] ${i > 0 ? '-ml-2' : ''}`}
                    >
                      {initial}
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex gap-2">
                  {tab === 'pour_vous' && (
                    <>
                      <button className="flex-1 rounded-full border border-[#111111] px-3 py-2 text-xs font-medium text-[#111111]">
                        Demander une modification
                      </button>
                      <button className="flex-1 rounded-full bg-[#111111] px-3 py-2 text-xs font-medium text-white">
                        J&apos;adore ce look
                      </button>
                    </>
                  )}
                  {tab === 'en_attente' && (
                    <>
                      <button className="flex-1 rounded-full border border-red-300 px-3 py-2 text-xs font-medium text-red-400">
                        Annuler
                      </button>
                      <a href="/stylists" className="flex flex-1 items-center justify-center rounded-full bg-[#111111] px-3 py-2 text-xs font-medium text-white">
                        Voir le styliste
                      </a>
                    </>
                  )}
                  {tab === 'approuves' && (
                    <>
                      <button className="flex-1 rounded-full border border-[#111111] px-3 py-2 text-xs font-medium text-[#111111]">
                        Porter aujourd&apos;hui
                      </button>
                      <button className="flex-1 rounded-full bg-[#111111] px-3 py-2 text-xs font-medium text-white">
                        Voir le look
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: LookTab }) {
  const messages: Record<LookTab, { title: string; subtitle: string }> = {
    pour_vous: {
      title: 'Aucun look pour vous',
      subtitle: 'Connectez-vous avec un styliste pour recevoir des propositions',
    },
    en_attente: {
      title: 'Aucun look en attente',
      subtitle: 'Vos demandes en cours appara\u00eetront ici',
    },
    approuves: {
      title: 'Aucun look approuv\u00e9',
      subtitle: 'Les looks que vous validez appara\u00eetront ici',
    },
  };

  const { title, subtitle } = messages[tab];

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <p className="font-serif text-base font-semibold text-[#111111]">{title}</p>
      <p className="mt-1 text-sm text-[#8A8A8A]">{subtitle}</p>
      <a
        href="/stylists"
        className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
      >
        Voir les stylistes
      </a>
    </div>
  );
}
