'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';

const clients = [
  { name: 'Sophie M.', avatar: 'https://i.pravatar.cc/120?img=47', active: true },
  { name: 'Marie L.', avatar: 'https://i.pravatar.cc/120?img=32', active: true },
  { name: 'Julie R.', avatar: 'https://i.pravatar.cc/120?img=44', active: false },
  { name: 'Emma D.', avatar: 'https://i.pravatar.cc/120?img=29', active: false },
];

const pendingRequests = [
  {
    name: 'Lucie B.',
    avatar: 'https://i.pravatar.cc/80?img=48',
    detail: 'Demande une session · 60 min',
    price: '49 €',
  },
  {
    name: 'Amélie R.',
    avatar: 'https://i.pravatar.cc/80?img=5',
    detail: 'Demande une session · 30 min',
    price: '29 €',
  },
];

const lookbooks = [
  {
    client: 'Sophie M.',
    name: 'Printemps bureau',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop',
    status: 'Envoyé',
    statusClass: 'bg-[#F0EDE8] text-[#111111]',
  },
  {
    client: 'Marie L.',
    name: 'Weekend casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop',
    status: 'Approuvé',
    statusClass: 'bg-green-100 text-green-700',
  },
  {
    client: 'Julie R.',
    name: 'Soirée chic',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop',
    status: 'En attente',
    statusClass: 'bg-amber-100 text-amber-700',
  },
];

export default function StylistDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [available, setAvailable] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Chloé';

  return (
    <div className="pb-24">
      {/* A. HEADER */}
      <div className="flex items-center justify-between px-5 pt-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#EDE5DC]">
            {user?.avatar_url ? (
              <Image src={user.avatar_url} alt={user.name} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-semibold text-[#C6A47E]">{firstName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs text-[#8A8A8A]">Bonjour,</p>
            <p className="font-serif text-lg text-[#111111] leading-tight">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EFEFEF]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <button
            aria-label="Mon activit&eacute;"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#EFEFEF]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Status pill */}
      <div className="px-5 mb-6">
        <button
          type="button"
          onClick={() => setAvailable((a) => !a)}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            available ? 'bg-green-100 text-green-700' : 'bg-[#F0EDE8] text-[#8A8A8A]'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${available ? 'bg-green-500' : 'bg-[#8A8A8A]'}`} />
          {available ? 'Disponible' : 'Indisponible'}
        </button>
      </div>

      {/* B. STATS ROW */}
      <div className="flex gap-3 px-5 mb-6 overflow-x-auto scrollbar-hide">
        {/* Card 1 — Clients actifs */}
        <div className="w-[130px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-[#EFEFEF]">
          <div className="w-8 h-8 rounded-full bg-[#EDE5DC] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="font-serif text-3xl text-[#111111] leading-none">8</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Clientes actives</p>
        </div>

        {/* Card 2 — Looks créés */}
        <div className="w-[130px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-[#EFEFEF]">
          <div className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
            </svg>
          </div>
          <p className="font-serif text-3xl text-[#111111] leading-none">47</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Looks cr&eacute;&eacute;s</p>
        </div>

        {/* Card 3 — Satisfaction */}
        <div className="w-[130px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-[#EFEFEF]">
          <div className="w-8 h-8 rounded-full bg-[#C6A47E]/15 flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="font-serif text-3xl text-[#C6A47E] leading-none">98%</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Satisfaction</p>
        </div>

        {/* Card 4 — Ce mois */}
        <div className="w-[130px] flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-[#EFEFEF]">
          <div className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 6c-1.5-1.5-3.5-2-6-2-5 0-9 4-9 9s4 9 9 9c2.5 0 4.5-0.5 6-2" />
              <line x1="3" y1="10" x2="15" y2="10" />
              <line x1="3" y1="14" x2="13" y2="14" />
            </svg>
          </div>
          <p className="font-serif text-2xl text-[#111111] leading-none">620 &euro;</p>
          <p className="text-xs text-[#8A8A8A] mt-1">Revenus ce mois</p>
        </div>
      </div>

      {/* C. CLIENTES RECENTES */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-serif text-base text-[#111111]">Mes clientes</h2>
          <a href="/my-clients" className="text-sm text-[#8A8A8A]">
            Tout voir
          </a>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
          {clients.map((c) => (
            <a
              key={c.name}
              href="/my-clients"
              className="w-[100px] flex-shrink-0 text-center"
            >
              <div className="relative mx-auto">
                <div className="relative h-16 w-16 mx-auto overflow-hidden rounded-full bg-[#EDE5DC]">
                  <Image src={c.avatar} alt={c.name} fill className="object-cover" sizes="64px" />
                </div>
                <span
                  className={`absolute bottom-0 right-3 h-3 w-3 rounded-full border-2 border-[#F7F5F2] ${
                    c.active ? 'bg-green-500' : 'bg-[#CFCFCF]'
                  }`}
                />
              </div>
              <p className="text-xs font-semibold text-[#111111] mt-2 truncate">{c.name}</p>
              <p className="text-[10px] text-[#8A8A8A]">Voir</p>
            </a>
          ))}
        </div>
      </div>

      {/* D. DEMANDES EN ATTENTE */}
      <div className="mb-6">
        <div className="flex items-center px-5 mb-3">
          <h2 className="font-serif text-base text-[#111111]">Demandes</h2>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4785C] text-white text-[10px] font-semibold ml-2 px-1.5">
            {pendingRequests.length}
          </span>
        </div>
        <div className="px-5 flex flex-col gap-3">
          {pendingRequests.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#EFEFEF] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image src={r.avatar} alt={r.name} fill className="object-cover" sizes="40px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111] truncate">{r.name}</p>
                  <p className="text-xs text-[#8A8A8A] mt-0.5 truncate">{r.detail}</p>
                  <p className="text-xs text-[#C6A47E] font-medium">{r.price}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <button
                  type="button"
                  className="bg-[#111111] text-white rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  Accepter
                </button>
                <button
                  type="button"
                  className="text-[#8A8A8A] text-xs"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* E. LOOKBOOKS RECENTS */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h2 className="font-serif text-base text-[#111111]">Mes lookbooks</h2>
          <a href="/lookbooks/create" className="text-sm text-[#C6A47E] font-medium">
            Cr&eacute;er
          </a>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto scrollbar-hide">
          {lookbooks.map((lb) => (
            <a
              key={lb.name}
              href="/lookbooks"
              className="w-[160px] flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EFEFEF]"
            >
              <div className="relative h-[120px] w-full">
                <Image src={lb.image} alt={lb.name} fill className="object-cover" sizes="160px" />
              </div>
              <div className="p-3">
                <p className="text-xs text-[#8A8A8A]">{lb.client}</p>
                <p className="text-sm font-semibold text-[#111111] truncate">{lb.name}</p>
                <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${lb.statusClass}`}>
                  {lb.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* F. PROCHAIN RDV */}
      <div className="mb-6">
        <h2 className="font-serif text-base text-[#111111] px-5 mb-3">Prochain rendez-vous</h2>
        <div className="mx-5 bg-[#111111] rounded-3xl p-5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[#C6A47E] text-xs font-medium">Aujourd&rsquo;hui</p>
            <p className="text-white font-semibold mt-1">15:00 &mdash; Session avec Sophie M.</p>
            <p className="text-[#CFCFCF] text-xs mt-1">60 min &middot; Visioconf&eacute;rence</p>
          </div>
          <a
            href="/calendar"
            className="bg-white text-[#111111] rounded-full px-4 py-2 text-xs font-semibold shrink-0"
          >
            Rejoindre
          </a>
        </div>
      </div>
    </div>
  );
}
