'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

// ============ STAT CARDS ============
type StatCard = {
  label: string;
  value: string;
  trend: string;
  trendKind: 'up' | 'neutral';
  icon: 'users' | 'wardrobe' | 'calendar';
};

const STATS: StatCard[] = [
  {
    label: 'Clientes actives',
    value: '15',
    trend: '\u2191 +3 ce mois',
    trendKind: 'up',
    icon: 'users',
  },
  {
    label: 'Dressings g\u00e9r\u00e9s',
    value: '82',
    trend: '\u2191 +12 pi\u00e8ces',
    trendKind: 'up',
    icon: 'wardrobe',
  },
  {
    label: 'Rendez-vous',
    value: '5',
    trend: 'cette semaine',
    trendKind: 'neutral',
    icon: 'calendar',
  },
];

function StatIcon({ name }: { name: StatCard['icon'] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: '#C6A47E',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'wardrobe':
      return (
        <svg {...common}>
          <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
          <line x1="8" y1="6" x2="8" y2="8" />
          <line x1="16" y1="6" x2="16" y2="8" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
  }
}

// ============ CLIENT CARDS ============
type Client = {
  name: string;
  initials: string;
  avatar: string;
  pieces: number;
  lastUpdate: string;
  status: 'En ligne' | 'Hors ligne';
  tags: string[];
};

const CLIENTS: Client[] = [
  {
    name: 'Sophie Moreau',
    initials: 'SM',
    avatar: 'https://i.pravatar.cc/160?img=47',
    pieces: 28,
    lastUpdate: 'MAJ il y a 2h',
    status: 'En ligne',
    tags: ['Chic', 'Minimaliste'],
  },
  {
    name: 'Marie Laurent',
    initials: 'ML',
    avatar: 'https://i.pravatar.cc/160?img=32',
    pieces: 34,
    lastUpdate: 'MAJ hier',
    status: 'Hors ligne',
    tags: ['Boh\u00e8me', 'Couleurs'],
  },
  {
    name: 'Julie Roche',
    initials: 'JR',
    avatar: 'https://i.pravatar.cc/160?img=44',
    pieces: 20,
    lastUpdate: 'MAJ il y a 3j',
    status: 'En ligne',
    tags: ['Classique'],
  },
  {
    name: 'Emma Dubois',
    initials: 'ED',
    avatar: 'https://i.pravatar.cc/160?img=29',
    pieces: 42,
    lastUpdate: 'MAJ il y a 1j',
    status: 'Hors ligne',
    tags: ['\u00c9dgy', 'Street'],
  },
  {
    name: 'L\u00e9a Bernard',
    initials: 'LB',
    avatar: 'https://i.pravatar.cc/160?img=48',
    pieces: 18,
    lastUpdate: 'MAJ hier',
    status: 'Hors ligne',
    tags: ['Sportif'],
  },
  {
    name: 'Chlo\u00e9 Martin',
    initials: 'CM',
    avatar: 'https://i.pravatar.cc/160?img=41',
    pieces: 26,
    lastUpdate: 'MAJ il y a 5h',
    status: 'En ligne',
    tags: ['Romantique'],
  },
];

// ============ MINI CALENDAR ============
const CAL_DAYS = [
  { num: 10, label: 'Lun' },
  { num: 11, label: 'Mar', today: true },
  { num: 12, label: 'Mer' },
  { num: 13, label: 'Jeu' },
  { num: 14, label: 'Ven' },
  { num: 15, label: 'Sam' },
  { num: 16, label: 'Dim' },
];

const CAL_APPTS = [
  { time: '10:00', title: 'Sophie M.', type: 'Session 60 min' },
  { time: '14:00', title: 'Marie L.', type: 'Conseil style' },
  { time: '16:30', title: 'Julie R.', type: 'Lookbook' },
];

// ============ TIPS ============
const TIPS = [
  {
    title: 'Boostez vos r\u00e9servations',
    text: 'Les stylistes qui r\u00e9pondent en moins d\u20191h ont 2\u00d7 plus de rendez-vous.',
  },
  {
    title: 'Soignez vos lookbooks',
    text: 'Ajoutez au moins 3 photos par look pour augmenter le taux de validation.',
  },
];

export default function StylistDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDualRole = useAuthStore((s) => s.isDualRole);
  const activateStylistMode = useAuthStore((s) => s.activateStylistMode);
  const [activatingClient, setActivatingClient] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Chlo\u00e9';

  const handleActivateClient = async () => {
    setActivatingClient(true);
    await activateStylistMode();
    setActivatingClient(false);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8 lg:py-10">
      {/* ============ GREETING ============ */}
      <section className="mb-8">
        <p className="text-sm text-[#8A8A8A]">
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
        <h1 className="font-serif text-3xl text-[#111111] sm:text-4xl lg:text-[42px] mt-1">
          Bonjour <em className="italic text-[#C6A47E]">{firstName}</em>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#8A8A8A]">
          Voici un aper&ccedil;u de votre activit&eacute; et de vos clientes cette semaine.
        </p>
      </section>

      {/* ============ STATS ROW: 3 cards + objectives ============ */}
      <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_280px]">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
                <StatIcon name={s.icon} />
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  s.trendKind === 'up'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#F0EDE8] text-[#8A8A8A]'
                }`}
              >
                {s.trend}
              </span>
            </div>
            <p className="mt-4 font-serif text-[44px] leading-none text-[#111111]">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-[#8A8A8A]">{s.label}</p>
          </div>
        ))}

        {/* Objectives dark card */}
        <div className="rounded-3xl bg-[#111111] p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C6A47E]">
              Mes objectifs
            </p>
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
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <p className="mt-3 font-serif text-2xl leading-tight">
            Avril <span className="text-[#C6A47E]">2026</span>
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#CFCFCF]">Nouvelles clientes</span>
                <span className="text-white">8 / 10</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#C6A47E]" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#CFCFCF]">Lookbooks cr&eacute;&eacute;s</span>
                <span className="text-white">12 / 20</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#C6A47E]" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#CFCFCF]">Revenus</span>
                <span className="text-white">620 / 1000 &euro;</span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#D4785C]" style={{ width: '62%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ DRESSINGS CLIENTS + RIGHT SIDEBAR ============ */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* ---- Left: clients grid ---- */}
        <div>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#111111]">
                Dressings clientes
              </h2>
              <p className="mt-1 text-sm text-[#8A8A8A]">
                Explorez et g&eacute;rez les dressings de vos clientes
              </p>
            </div>
            <Link
              href="/my-clients"
              className="text-sm text-[#C6A47E] font-medium hover:underline"
            >
              Voir tout &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CLIENTS.map((c) => (
              <Link
                key={c.name}
                href="/my-clients"
                className="group rounded-3xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-[#EFEFEF]">
                    <Image
                      src={c.avatar}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                    {c.status === 'En ligne' && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#4ade80]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111111]">
                      {c.name}
                    </p>
                    <p className="truncate text-[11px] text-[#8A8A8A]">
                      {c.lastUpdate}
                    </p>
                  </div>
                  <svg
                    className="shrink-0 text-[#CFCFCF] transition-colors group-hover:text-[#111111]"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F7F5F2] px-4 py-3">
                  <div>
                    <p className="font-serif text-2xl leading-none text-[#111111]">
                      {c.pieces}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#8A8A8A]">
                      pi&egrave;ces dans le dressing
                    </p>
                  </div>
                  <svg
                    width="20"
                    height="20"
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

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-[#EDE5DC] px-2.5 py-1 text-[10px] font-medium text-[#C6A47E]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ---- Right: sidebar column ---- */}
        <aside className="flex flex-col gap-5">
          {/* Mini calendar */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-base text-[#111111]">
                Cette semaine
              </h3>
              <Link href="/agenda" className="text-[11px] text-[#8A8A8A]">
                Voir agenda
              </Link>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {CAL_DAYS.map((d) => (
                <div
                  key={d.num}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 text-[10px] ${
                    d.today
                      ? 'bg-[#111111] text-white'
                      : 'text-[#8A8A8A] hover:bg-[#F7F5F2]'
                  }`}
                >
                  <span
                    className={d.today ? 'text-[#C6A47E]' : 'text-[#CFCFCF]'}
                  >
                    {d.label}
                  </span>
                  <span className="mt-0.5 font-serif text-sm">{d.num}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {CAL_APPTS.map((a) => (
                <div
                  key={a.time + a.title}
                  className="flex items-center gap-3 rounded-2xl bg-[#F7F5F2] px-3 py-2.5"
                >
                  <span className="font-serif text-sm text-[#C6A47E]">
                    {a.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#111111]">
                      {a.title}
                    </p>
                    <p className="truncate text-[10px] text-[#8A8A8A]">
                      {a.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planning stats */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-serif text-base text-[#111111]">
              Statistiques planning
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">Taux d&rsquo;occupation</span>
                <span className="font-serif text-sm text-[#111111]">72%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
                <div className="h-full rounded-full bg-[#C6A47E]" style={{ width: '72%' }} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#8A8A8A]">Dur&eacute;e moyenne</span>
                <span className="font-serif text-sm text-[#111111]">55 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">Annulations</span>
                <span className="font-serif text-sm text-[#111111]">2%</span>
              </div>
            </div>
          </div>

          {/* Conseils & performance */}
          <div className="rounded-3xl bg-[#EDE5DC] p-5">
            <div className="mb-3 flex items-center gap-2">
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
                <path d="M12 3l1.9 4.5 4.8.4-3.7 3.2 1.1 4.7L12 13.5 7.9 15.8 9 11.1 5.3 7.9l4.8-.4z" />
              </svg>
              <h3 className="font-serif text-base text-[#111111]">
                Conseils &amp; performance
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {TIPS.map((t) => (
                <div key={t.title} className="rounded-2xl bg-white/60 p-3">
                  <p className="text-xs font-semibold text-[#111111]">{t.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8A8A8A]">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Client mode CTA — only when NOT yet dual-role */}
          {!isDualRole && (
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE5DC]">
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">
                    G&eacute;rez aussi votre dressing
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8A8A8A]">
                    Activez votre espace cliente en un clic.
                  </p>
                  <button
                    type="button"
                    onClick={handleActivateClient}
                    disabled={activatingClient}
                    className="mt-3 rounded-full bg-[#F0EDE8] px-3 py-1.5 text-[11px] font-medium text-[#111111] disabled:opacity-60"
                  >
                    {activatingClient ? 'Activation...' : 'Activer mon espace cliente'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
