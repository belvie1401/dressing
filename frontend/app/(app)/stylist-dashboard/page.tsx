'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

const clients = [
  { name: 'Sophie M.', avatar: 'https://i.pravatar.cc/160?img=47', lastSeen: 'Il y a 2 h', online: true },
  { name: 'Marie L.', avatar: 'https://i.pravatar.cc/160?img=32', lastSeen: 'Hier', online: true },
  { name: 'Julie R.', avatar: 'https://i.pravatar.cc/160?img=44', lastSeen: 'Il y a 3 j', online: false },
  { name: 'Emma D.', avatar: 'https://i.pravatar.cc/160?img=29', lastSeen: '1 sem.', online: false },
  { name: 'Lou P.', avatar: 'https://i.pravatar.cc/160?img=16', lastSeen: '2 sem.', online: false },
  { name: 'Iris K.', avatar: 'https://i.pravatar.cc/160?img=24', lastSeen: '1 mois', online: false },
];

const pendingRequests = [
  {
    name: 'Lucie B.',
    avatar: 'https://i.pravatar.cc/120?img=48',
    duration: '60 min',
    type: 'Stylisme complet',
    price: '79',
  },
  {
    name: 'Am\u00e9lie R.',
    avatar: 'https://i.pravatar.cc/120?img=5',
    duration: '30 min',
    type: 'Conseil express',
    price: '39',
  },
];

const lookbooks = [
  {
    client: 'Sophie M.',
    name: 'Printemps bureau',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=480&fit=crop',
    status: 'Envoy\u00e9',
    statusClass: 'bg-[#F0EDE8] text-[#111111]',
  },
  {
    client: 'Marie L.',
    name: 'Weekend casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=480&fit=crop',
    status: 'Approuv\u00e9',
    statusClass: 'bg-green-50 text-green-600',
  },
  {
    client: 'Julie R.',
    name: 'Soir\u00e9e chic',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=480&fit=crop',
    status: 'En attente',
    statusClass: 'bg-amber-50 text-amber-600',
  },
  {
    client: 'Emma D.',
    name: 'Escapade Rome',
    image: 'https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&h=480&fit=crop',
    status: 'Envoy\u00e9',
    statusClass: 'bg-[#F0EDE8] text-[#111111]',
  },
];

export default function StylistDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const initialAvailable =
    (user?.style_profile as Record<string, unknown> | undefined)?.available !== false;
  const [available, setAvailable] = useState<boolean>(initialAvailable);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Chlo\u00e9';

  const toggleAvailability = async () => {
    if (togglingStatus) return;
    const next = !available;
    setAvailable(next);
    setTogglingStatus(true);
    try {
      const existingProfile =
        (user?.style_profile as Record<string, unknown> | undefined) || {};
      const res = await api.put<{ style_profile?: Record<string, unknown> }>('/auth/profile', {
        style_profile: { ...existingProfile, available: next },
      });
      if (res.success && user) {
        useAuthStore.setState({
          user: {
            ...user,
            style_profile: { ...existingProfile, available: next },
          },
        });
      }
    } finally {
      setTogglingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* ============== HEADER ============== */}
      <header className="px-5 pt-8 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8A8A8A] font-light">Bonjour,</p>
            <h1 className="font-serif text-3xl text-[#111111] italic leading-tight mt-1">
              {firstName}
            </h1>
            <button
              type="button"
              onClick={toggleAvailability}
              disabled={togglingStatus}
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                available
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F0EDE8] text-[#8A8A8A]'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  available ? 'bg-white' : 'bg-[#8A8A8A]'
                }`}
              />
              {available ? 'Disponible' : 'Indisponible'}
            </button>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#EFEFEF]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#D4785C]" />
          </button>
        </div>
      </header>

      {/* ============== METRICS STRIP ============== */}
      <section className="mb-8">
        <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide">
          {/* Card 1 — Clientes */}
          <div className="w-[140px] flex-shrink-0 bg-white rounded-3xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#EDE5DC] flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6A47E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="font-serif text-4xl text-[#111111] mt-3 leading-none">12</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Clientes actives</p>
          </div>

          {/* Card 2 — Looks */}
          <div className="w-[140px] flex-shrink-0 bg-white rounded-3xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.9 4.5 4.8.4-3.7 3.2 1.1 4.7L12 13.5 7.9 15.8 9 11.1 5.3 7.9l4.8-.4z" />
                <path d="M5 20l.8-.8" />
                <path d="M19 4l-.8.8" />
                <path d="M18.5 20l.8-.8" />
              </svg>
            </div>
            <p className="font-serif text-4xl text-[#111111] mt-3 leading-none">47</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Lookbooks cr&eacute;&eacute;s</p>
          </div>

          {/* Card 3 — Satisfaction */}
          <div className="w-[140px] flex-shrink-0 bg-white rounded-3xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(198, 164, 126, 0.15)' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="#C6A47E"
                stroke="#C6A47E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="mt-3 leading-none">
              <span className="font-serif text-4xl text-[#C6A47E]">98</span>
              <span className="font-serif text-xl text-[#C6A47E]">%</span>
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">Satisfaction</p>
          </div>

          {/* Card 4 — Revenus */}
          <div className="w-[140px] flex-shrink-0 bg-white rounded-3xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(17, 17, 17, 0.05)' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 7c-1.5-1.5-3.5-2-5.5-2A7 7 0 0 0 6 12a7 7 0 0 0 6.5 7c2 0 4-.5 5.5-2" />
                <line x1="3" y1="10" x2="14" y2="10" />
                <line x1="3" y1="14" x2="12" y2="14" />
              </svg>
            </div>
            <p className="mt-3 leading-none">
              <span className="font-serif text-3xl text-[#111111]">1&nbsp;240</span>
              <span className="text-sm text-[#8A8A8A] ml-1">euros</span>
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">Revenus ce mois</p>
          </div>
        </div>
      </section>

      {/* ============== PROCHAINE SESSION ============== */}
      <section className="mx-5 mb-8">
        <div className="bg-[#111111] rounded-3xl p-6 relative overflow-hidden">
          {/* subtle gold glow */}
          <div
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C6A47E 0%, transparent 70%)' }}
          />

          <div className="flex justify-between items-start relative">
            <div className="min-w-0 flex-1">
              <p className="text-[#C6A47E] text-xs uppercase tracking-[0.2em] font-medium">
                Aujourd&rsquo;hui
              </p>
              <p className="font-serif text-4xl text-white mt-1 leading-none">15:00</p>
              <p className="text-white text-sm mt-2">Session avec Sophie M.</p>
              <p className="text-[#CFCFCF] text-xs mt-1">60 min &middot; Visioconf&eacute;rence</p>

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  className="bg-white text-[#111111] rounded-full px-5 py-2 text-xs font-semibold"
                >
                  Rejoindre
                </button>
                <button
                  type="button"
                  className="border border-white/30 text-white rounded-full px-5 py-2 text-xs"
                >
                  Reporter
                </button>
              </div>
            </div>

            <div className="shrink-0 ml-4">
              <div className="rounded-full p-[2px]" style={{ background: '#C6A47E' }}>
                <div className="rounded-full p-[2px] bg-[#111111]">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-[#EDE5DC]">
                    <Image
                      src="https://i.pravatar.cc/200?img=47"
                      alt="Sophie M."
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== DEMANDES EN ATTENTE ============== */}
      <section className="mb-8">
        <div className="flex items-center gap-2 px-5 mb-4">
          <h2 className="font-serif text-lg text-[#111111]">Demandes</h2>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D4785C] text-white text-[10px] font-semibold">
            {pendingRequests.length}
          </span>
        </div>

        <div className="px-5 flex flex-col gap-3">
          {pendingRequests.map((r) => (
            <div
              key={r.name}
              className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center"
            >
              <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-[#EDE5DC]">
                <Image
                  src={r.avatar}
                  alt={r.name}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111111] truncate">{r.name}</p>
                <p className="text-xs text-[#8A8A8A] mt-0.5 truncate">
                  {r.duration} &middot; {r.type}
                </p>
                <p className="text-xs text-[#C6A47E] font-medium mt-0.5">
                  {r.price} euros
                </p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  className="bg-[#111111] text-white rounded-full px-4 py-1.5 text-xs font-medium"
                >
                  Accepter
                </button>
                <button type="button" className="text-[#8A8A8A] text-xs text-center">
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== MES CLIENTES ============== */}
      <section className="mb-8">
        <div className="flex justify-between items-center px-5 mb-4">
          <h2 className="font-serif text-lg text-[#111111]">Mes clientes</h2>
          <a href="/my-clients" className="text-sm text-[#8A8A8A]">
            Voir tout
          </a>
        </div>

        <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide">
          {clients.map((c) => (
            <a
              key={c.name}
              href="/my-clients"
              className="w-[88px] flex-shrink-0 text-center"
            >
              <div
                className={`relative w-16 h-16 rounded-full mx-auto ring-2 ring-offset-2 ring-offset-[#F7F5F2] overflow-hidden ${
                  c.online ? 'ring-[#4ade80]' : 'ring-[#EFEFEF]'
                }`}
              >
                <Image
                  src={c.avatar}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <p className="text-xs font-medium text-[#111111] mt-2 truncate px-1">
                {c.name}
              </p>
              <p className="text-[10px] text-[#8A8A8A] truncate px-1">{c.lastSeen}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ============== DERNIERS LOOKBOOKS ============== */}
      <section className="mb-8">
        <div className="flex justify-between items-center px-5 mb-4">
          <h2 className="font-serif text-lg text-[#111111]">Derniers lookbooks</h2>
          <a href="/lookbooks/create" className="text-sm text-[#C6A47E] font-medium">
            Nouveau
          </a>
        </div>

        <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide">
          {lookbooks.map((lb) => (
            <a
              key={lb.name + lb.client}
              href="/lookbooks"
              className="w-[160px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm bg-white"
            >
              <div className="relative h-[120px] w-full bg-[#EDE5DC]">
                <Image
                  src={lb.image}
                  alt={lb.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="p-3">
                <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wide">
                  {lb.client}
                </p>
                <p className="text-sm font-semibold text-[#111111] truncate mt-0.5">
                  {lb.name}
                </p>
                <span
                  className={`inline-block mt-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${lb.statusClass}`}
                >
                  {lb.status}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
