'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import RoleSwitcher from '@/components/ui/RoleSwitcher';

type Stat = {
  icon: 'users' | 'sparkles' | 'star' | 'euro';
  iconBg: string;
  value: string;
  label: string;
  valueClass?: string;
  trend: { text: string; kind: 'up' | 'neutral' };
};

const STATS: Stat[] = [
  {
    icon: 'users',
    iconBg: 'bg-[#EDE5DC]',
    value: '8',
    label: 'clientes actives',
    trend: { text: '\u2191 +2', kind: 'up' },
  },
  {
    icon: 'sparkles',
    iconBg: 'bg-[#F0EDE8]',
    value: '47',
    label: 'looks cr\u00e9\u00e9s',
    trend: { text: '\u2191 +5', kind: 'up' },
  },
  {
    icon: 'star',
    iconBg: 'bg-[#C6A47E]/15',
    value: '98%',
    label: 'satisfaction',
    valueClass: 'text-[#C6A47E]',
    trend: { text: '\u2192', kind: 'neutral' },
  },
  {
    icon: 'euro',
    iconBg: 'bg-[#111111]/5',
    value: '620\u20ac',
    label: 'ce mois',
    trend: { text: '\u2191 +20%', kind: 'up' },
  },
];

type PendingRequest = {
  name: string;
  initials: string;
  details: string;
  price: string;
};

const PENDING_REQUESTS: PendingRequest[] = [
  {
    name: 'Lucie B.',
    initials: 'LB',
    details: 'Session 60 min \u00b7 Lookbook',
    price: '79 \u20ac',
  },
  {
    name: 'Am\u00e9lie R.',
    initials: 'AR',
    details: 'Session 30 min \u00b7 Conseil express',
    price: '39 \u20ac',
  },
  {
    name: 'Chlo\u00e9 D.',
    initials: 'CD',
    details: 'Session 45 min \u00b7 Conseil style',
    price: '49 \u20ac',
  },
];

type Client = {
  name: string;
  avatar: string;
  status: string;
  online: boolean;
};

const CLIENTS: Client[] = [
  {
    name: 'Sophie M.',
    avatar: 'https://i.pravatar.cc/160?img=47',
    status: 'En ligne',
    online: true,
  },
  {
    name: 'Marie L.',
    avatar: 'https://i.pravatar.cc/160?img=32',
    status: 'Il y a 2h',
    online: false,
  },
  {
    name: 'Julie R.',
    avatar: 'https://i.pravatar.cc/160?img=44',
    status: 'Hier',
    online: false,
  },
  {
    name: 'Emma D.',
    avatar: 'https://i.pravatar.cc/160?img=29',
    status: 'Il y a 3j',
    online: false,
  },
];

type LookbookItem = {
  client: string;
  title: string;
  image: string;
  status: 'Approuv\u00e9' | 'En attente' | 'Envoy\u00e9';
};

const LOOKBOOKS: LookbookItem[] = [
  {
    client: 'Sophie M.',
    title: 'Printemps bureau',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=480&fit=crop',
    status: 'Envoy\u00e9',
  },
  {
    client: 'Marie L.',
    title: 'Weekend casual',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=480&fit=crop',
    status: 'Approuv\u00e9',
  },
  {
    client: 'Julie R.',
    title: 'Soir\u00e9e chic',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=480&fit=crop',
    status: 'En attente',
  },
  {
    client: 'Emma D.',
    title: 'Escapade Rome',
    image: 'https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&h=480&fit=crop',
    status: 'Envoy\u00e9',
  },
];

function StatIcon({ name }: { name: Stat['icon'] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'users':
      return (
        <svg {...common} stroke="#C6A47E">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg {...common} stroke="#111111">
          <path d="M12 3l1.9 4.5 4.8.4-3.7 3.2 1.1 4.7L12 13.5 7.9 15.8 9 11.1 5.3 7.9l4.8-.4z" />
          <path d="M5 20l.8-.8" />
          <path d="M19 4l-.8.8" />
          <path d="M18.5 20l.8-.8" />
        </svg>
      );
    case 'star':
      return (
        <svg {...common} fill="#C6A47E" stroke="#C6A47E">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'euro':
      return (
        <svg {...common} stroke="#111111">
          <path d="M18 7c-1.5-1.5-3.5-2-5.5-2A7 7 0 0 0 6 12a7 7 0 0 0 6.5 7c2 0 4-.5 5.5-2" />
          <line x1="3" y1="10" x2="14" y2="10" />
          <line x1="3" y1="14" x2="12" y2="14" />
        </svg>
      );
  }
}

const STATUS_BADGE_CLASS: Record<LookbookItem['status'], string> = {
  'Approuv\u00e9': 'bg-green-50 text-green-600',
  'En attente': 'bg-amber-50 text-amber-600',
  'Envoy\u00e9': 'bg-white text-[#111111]',
};

export default function StylistDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDualRole = useAuthStore((s) => s.isDualRole);
  const activateStylistMode = useAuthStore((s) => s.activateStylistMode);
  const initialAvailable =
    (user?.style_profile as Record<string, unknown> | undefined)?.available !== false;
  const [available, setAvailable] = useState<boolean>(initialAvailable);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [activatingClient, setActivatingClient] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Chlo\u00e9';

  const toggleAvailability = async () => {
    if (togglingStatus) return;
    const next = !available;
    setAvailable(next);
    setTogglingStatus(true);
    try {
      const existingProfile =
        (user?.style_profile as Record<string, unknown> | undefined) || {};
      const res = await api.put<{ style_profile?: Record<string, unknown> }>(
        '/auth/profile',
        {
          style_profile: { ...existingProfile, available: next },
        }
      );
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

  const handleActivateClient = async () => {
    setActivatingClient(true);
    await activateStylistMode();
    setActivatingClient(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      <RoleSwitcher />
      <div className="mx-auto max-w-md lg:max-w-6xl lg:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5">

          {/* ===== ROW 1: HEADER ===== */}
          <header className="flex justify-between items-start px-5 pt-8 pb-2 lg:px-0 lg:col-span-3">
            <div>
              <p className="text-xs text-[#8A8A8A] leading-none">Bonjour,</p>
              <h1 className="font-serif text-3xl text-[#111111] italic leading-tight mt-1">
                {firstName}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="/messages"
                aria-label="Notifications"
                className="flex items-center justify-center p-1"
              >
                <svg
                  width="20"
                  height="20"
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
              </Link>
              <button
                type="button"
                onClick={toggleAvailability}
                disabled={togglingStatus}
                className={`rounded-full px-3 py-1 text-[10px] font-medium transition-colors disabled:opacity-60 ${
                  available
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F0EDE8] text-[#8A8A8A]'
                }`}
              >
                {available ? '\u25cf Disponible' : '\u25cb Indisponible'}
              </button>
            </div>
          </header>

          {/* ===== ROW 2: NEXT SESSION ===== */}
          <section className="px-5 mt-4 mb-5 lg:px-0 lg:mt-0 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-2">
            <div className="bg-[#111111] rounded-3xl p-5">
              <p className="text-[#C6A47E] text-[9px] uppercase tracking-widest font-medium">
                AUJOURD&rsquo;HUI
              </p>
              <div className="flex justify-between items-center mt-2">
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-4xl text-white leading-none">15:00</p>
                  <p className="text-white text-sm mt-1 font-medium">
                    Session avec Sophie M.
                  </p>
                  <p className="text-[#CFCFCF] text-xs mt-1">
                    60 min &middot; Visioconf&eacute;rence
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      className="bg-white text-[#111111] rounded-full px-5 py-2 text-xs font-semibold"
                    >
                      Rejoindre
                    </button>
                    <button
                      type="button"
                      className="border border-white/20 text-white rounded-full px-5 py-2 text-xs"
                    >
                      Reporter
                    </button>
                  </div>
                </div>
                <div className="shrink-0 ml-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#C6A47E] ring-offset-2 ring-offset-[#111111] bg-[#EDE5DC] relative">
                    <Image
                      src="https://i.pravatar.cc/150?img=47"
                      alt="Sophie M."
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== ROW 3: STATS GRID ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-2">
            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-3xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.iconBg}`}>
                      <StatIcon name={s.icon} />
                    </div>
                    <span
                      className={`text-[9px] rounded-full px-2 py-0.5 font-medium ${
                        s.trend.kind === 'up'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-[#F0EDE8] text-[#8A8A8A]'
                      }`}
                    >
                      {s.trend.text}
                    </span>
                  </div>
                  <p
                    className={`font-serif text-3xl mt-2 leading-none ${
                      s.valueClass || 'text-[#111111]'
                    }`}
                  >
                    {s.value}
                  </p>
                  <p className="text-[10px] text-[#8A8A8A] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ROW 4: PENDING REQUESTS ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-3">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-serif text-base text-[#111111]">
                Demandes en attente
              </h2>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D4785C] text-white text-[9px] font-semibold">
                {PENDING_REQUESTS.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {PENDING_REQUESTS.map((r) => (
                <div
                  key={r.name}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
                >
                  <div className="w-11 h-11 rounded-full bg-[#EDE5DC] flex items-center justify-center shrink-0">
                    <span className="font-serif text-sm text-[#C6A47E]">
                      {r.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111] truncate">
                      {r.name}
                    </p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5 truncate">
                      {r.details}
                    </p>
                    <p className="text-xs text-[#C6A47E] font-medium mt-0.5">
                      {r.price}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      className="bg-[#111111] text-white rounded-full px-4 py-1.5 text-[11px] font-medium"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      className="text-[#8A8A8A] text-[11px] text-center"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ROW 5: RECENT CLIENTS ===== */}
          <section className="mb-5 lg:mb-0 lg:col-span-3 lg:row-start-4">
            <div className="flex justify-between items-baseline mb-3 px-5 lg:px-0">
              <h2 className="font-serif text-base text-[#111111]">Mes clientes</h2>
              <Link href="/my-clients" className="text-xs text-[#8A8A8A]">
                Voir tout &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 px-5 lg:px-0">
                {CLIENTS.map((c) => (
                  <Link
                    key={c.name}
                    href="/my-clients"
                    className="w-[76px] flex-shrink-0 text-center"
                  >
                    <div
                      className={`relative w-14 h-14 rounded-full mx-auto overflow-hidden ring-2 ${
                        c.online ? 'ring-[#4ade80]' : 'ring-[#EFEFEF]'
                      }`}
                    >
                      <Image
                        src={c.avatar}
                        alt={c.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-[#111111] mt-2 truncate px-1">
                      {c.name}
                    </p>
                    <p className="text-[9px] text-[#8A8A8A] truncate px-1">
                      {c.status}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ===== ROW 6: RECENT LOOKBOOKS ===== */}
          <section className="mb-5 lg:mb-0 lg:col-span-3 lg:row-start-5">
            <div className="flex justify-between items-baseline mb-3 px-5 lg:px-0">
              <h2 className="font-serif text-base text-[#111111]">
                Derniers lookbooks
              </h2>
              <Link
                href="/lookbooks/create"
                className="text-xs text-[#C6A47E] font-medium"
              >
                Cr&eacute;er &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-5 lg:px-0">
                {LOOKBOOKS.map((lb) => (
                  <Link
                    key={`${lb.title}-${lb.client}`}
                    href="/lookbooks"
                    className="w-[150px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm bg-white"
                  >
                    <div className="relative h-[110px] w-full bg-[#EDE5DC]">
                      <Image
                        src={lb.image}
                        alt={lb.title}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      <span
                        className={`absolute top-2 left-2 text-[9px] rounded-full px-2 py-0.5 font-medium ${STATUS_BADGE_CLASS[lb.status]}`}
                      >
                        {lb.status}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[9px] text-[#CFCFCF] truncate">
                        {lb.client}
                      </p>
                      <p className="text-xs font-semibold text-[#111111] truncate mt-0.5">
                        {lb.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ===== ROW 7: CLIENT CTA + WALLET PREVIEW (desktop: stacked in col-3 row-3) ===== */}
          <section className="px-5 mb-6 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-3 flex flex-col gap-4">
            {/* Client mode CTA — only when NOT yet dual-role */}
            {!isDualRole && (
              <div className="bg-white rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EDE5DC] flex items-center justify-center shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C6A47E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111111]">
                      G&eacute;rez aussi votre dressing
                    </p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">
                      Activez votre espace cliente
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleActivateClient}
                    disabled={activatingClient}
                    className="bg-[#F0EDE8] text-[#111111] rounded-full px-3 py-1.5 text-xs font-medium shrink-0 disabled:opacity-60"
                  >
                    {activatingClient ? '...' : 'Activer'}
                  </button>
                </div>
              </div>
            )}

            {/* Wallet preview */}
            <div className="bg-[#111111] rounded-3xl p-5 flex justify-between items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[#CFCFCF] text-[10px] uppercase tracking-wide">
                  Solde disponible
                </p>
                <p className="font-serif text-4xl text-white mt-1 leading-none">
                  620
                </p>
                <p className="text-[#CFCFCF] text-sm mt-1">euros</p>
                <p className="text-[#C6A47E] text-xs mt-2">En attente : 158 &euro;</p>
              </div>
              <Link
                href="/wallet"
                className="bg-[#C6A47E] text-[#111111] rounded-full px-4 py-2 text-xs font-semibold shrink-0"
              >
                Retirer &rarr;
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
