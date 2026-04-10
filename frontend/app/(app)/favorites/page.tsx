'use client';

import { useState } from 'react';
import Image from 'next/image';

type FavTab = 'looks' | 'stylistes';

interface FavLook {
  id: string;
  name: string;
  stylist: string;
  image: string;
}

interface FavStylist {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  rating: number;
  reviews: number;
  price: string;
}

const initialLooks: FavLook[] = [
  { id: '1', name: 'Look Casual Chic', stylist: 'Camille D.', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400' },
  { id: '2', name: '\u00c9l\u00e9gance du soir', stylist: 'L\u00e9a P.', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
  { id: '3', name: 'Style Minimal', stylist: 'Hugo B.', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400' },
  { id: '4', name: 'Chic Parisien', stylist: 'Camille D.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
];

const initialStylists: FavStylist[] = [
  { id: 's1', name: 'Camille D.', location: 'Paris', specialties: ['Minimal', 'Chic'], rating: 4.9, reviews: 120, price: '\u00c0 partir de 49\u20ac' },
  { id: 's2', name: 'L\u00e9a P.', location: 'Lyon', specialties: ['Chic', 'Audacieux'], rating: 4.9, reviews: 164, price: '\u00c0 partir de 59\u20ac' },
];

export default function FavoritesPage() {
  const [tab, setTab] = useState<FavTab>('looks');
  const [savedLooks, setSavedLooks] = useState<FavLook[]>(initialLooks);
  const [savedStylists, setSavedStylists] = useState<FavStylist[]>(initialStylists);

  const removeLook = (id: string) => {
    setSavedLooks((prev) => prev.filter((l) => l.id !== id));
  };

  const removeStylist = (id: string) => {
    setSavedStylists((prev) => prev.filter((s) => s.id !== id));
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
      <div className="mt-5">
        {tab === 'looks' ? (
          savedLooks.length === 0 ? (
            /* Empty state — Looks */
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <p className="font-serif text-base font-semibold text-[#111111]">Aucun look sauvegard&eacute;</p>
              <p className="mt-1 text-sm text-[#8A8A8A]">Explorez les looks de nos stylistes</p>
              <a
                href="/stylists"
                className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
              >
                Voir les stylistes
              </a>
            </div>
          ) : (
            /* Looks grid */
            <div className="grid grid-cols-2 gap-3">
              {savedLooks.map((look) => (
                <div key={look.id} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={look.image}
                    alt={look.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
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
                    <p className="text-[11px] text-white/70">{look.stylist}</p>
                  </div>
                </div>
              ))}
            </div>
          )
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
            <a
              href="/stylists"
              className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
            >
              Trouver un styliste
            </a>
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
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EDE5DC]">
                  <span className="text-lg font-semibold text-[#C6A47E]">{stylist.name.charAt(0)}</span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">{stylist.name}</p>
                  <p className="text-xs text-[#8A8A8A]">{stylist.location}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {stylist.specialties.map((s) => (
                      <span key={s} className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-xs text-[#111111]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {stylist.rating} ({stylist.reviews})
                    </span>
                    <span className="text-xs text-[#8A8A8A]">{stylist.price}</span>
                  </div>
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
