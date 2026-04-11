'use client';

import Link from 'next/link';
import Image from 'next/image';

// ============ STAT CARDS (top row) ============
type StatCard = {
  label: string;
  value: string;
  unit: string;
  ctaLabel: string;
  ctaHref: string;
};

const STAT_CARDS: StatCard[] = [
  {
    label: 'Mon dressing',
    value: '82',
    unit: 'v\u00eatements',
    ctaLabel: 'Voir tout',
    ctaHref: '/wardrobe',
  },
  {
    label: 'Mes looks',
    value: '24',
    unit: 'cr\u00e9\u00e9s',
    ctaLabel: 'Voir tout',
    ctaHref: '/outfits',
  },
  {
    label: 'Sessions',
    value: '3',
    unit: 'en cours',
    ctaLabel: 'Voir mes sessions',
    ctaHref: '/stylists',
  },
];

// Thumbnails displayed in each stat card header
const DRESSING_THUMB =
  'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=120&h=160&fit=crop';
const LOOKS_THUMBS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=100&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=80&h=100&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=80&h=100&fit=crop',
];
const SESSION_AVATARS = [
  'https://i.pravatar.cc/40?img=47',
  'https://i.pravatar.cc/40?img=32',
  'https://i.pravatar.cc/40?img=44',
];

// ============ RECOMMANDATIONS ============
type Look = {
  name: string;
  pieces: number;
  img: string;
};

const RECOMMANDATIONS: Look[] = [
  {
    name: 'Look pour le bureau',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=500&h=650&fit=crop',
  },
  {
    name: 'Look d\u00e9contract\u00e9',
    pieces: 5,
    img: 'https://images.unsplash.com/photo-1485462537746-965f33f41199?w=500&h=650&fit=crop',
  },
  {
    name: 'Look minimaliste',
    pieces: 3,
    img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=650&fit=crop',
  },
  {
    name: 'Look soir\u00e9e',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=650&fit=crop',
  },
];

// ============ STYLIST AVATARS (bottom card) ============
const STYLIST_AVATARS = [
  'https://i.pravatar.cc/40?img=47',
  'https://i.pravatar.cc/40?img=32',
  'https://i.pravatar.cc/40?img=44',
];

export default function DashboardPage() {
  return (
    <>
      {/* ============ A. GREETING ============ */}
      <div className="mb-10">
        <h1 className="font-serif text-4xl leading-tight text-[#111111]">
          Bonjour Camille{' '}
          <span className="inline-block" aria-hidden>
            &#128075;
          </span>
        </h1>
        <p className="mt-2 text-sm text-[#8A8A8A]">
          Votre dressing, vos stylistes, votre style. Tout est connect&eacute;.
        </p>
      </div>

      {/* ============ B. STAT CARDS ============ */}
      <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* --- Card 1: Mon dressing --- */}
        <StatCardShell
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="4" r="2" />
              <line x1="12" y1="6" x2="12" y2="8" />
              <polyline points="3,15 12,8 21,15" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          }
          label={STAT_CARDS[0].label}
          value={STAT_CARDS[0].value}
          unit={STAT_CARDS[0].unit}
          ctaLabel={STAT_CARDS[0].ctaLabel}
          ctaHref={STAT_CARDS[0].ctaHref}
          thumb={
            <div className="h-[76px] w-[56px] overflow-hidden rounded-xl bg-[#F0EDE8]">
              <Image
                src={DRESSING_THUMB}
                alt=""
                width={56}
                height={76}
                className="h-full w-full object-cover"
              />
            </div>
          }
        />

        {/* --- Card 2: Mes looks --- */}
        <StatCardShell
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          label={STAT_CARDS[1].label}
          value={STAT_CARDS[1].value}
          unit={STAT_CARDS[1].unit}
          ctaLabel={STAT_CARDS[1].ctaLabel}
          ctaHref={STAT_CARDS[1].ctaHref}
          thumb={
            <div className="flex -space-x-2">
              {LOOKS_THUMBS.map((src, i) => (
                <div
                  key={src}
                  className="h-10 w-10 overflow-hidden rounded-lg bg-[#F0EDE8] ring-2 ring-white"
                  style={{ zIndex: LOOKS_THUMBS.length - i }}
                >
                  <Image
                    src={src}
                    alt=""
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          }
        />

        {/* --- Card 3: Sessions --- */}
        <StatCardShell
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label={STAT_CARDS[2].label}
          value={STAT_CARDS[2].value}
          unit={STAT_CARDS[2].unit}
          ctaLabel={STAT_CARDS[2].ctaLabel}
          ctaHref={STAT_CARDS[2].ctaHref}
          thumb={
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {SESSION_AVATARS.map((src, i) => (
                  <div
                    key={src}
                    className="h-8 w-8 overflow-hidden rounded-full bg-[#EDE5DC] ring-2 ring-white"
                    style={{ zIndex: SESSION_AVATARS.length - i }}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="ml-1 text-[10px] text-[#8A8A8A]">+1</span>
            </div>
          }
        />
      </div>

      {/* ============ C. RECOMMANDATIONS POUR VOUS ============ */}
      <section className="mb-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-[#111111]">
              Recommandations pour vous
            </h2>
            <p className="mt-1 text-sm text-[#8A8A8A]">
              Des inspirations s&eacute;lectionn&eacute;es par votre styliste
            </p>
          </div>
          <Link
            href="/outfits"
            className="cursor-pointer rounded-full border border-[#EFEFEF] bg-white px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-[#F0EDE8]"
          >
            Voir tous les looks
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {RECOMMANDATIONS.map((look) => (
            <Link
              key={look.name}
              href="/outfits"
              className="group relative block cursor-pointer overflow-hidden rounded-2xl bg-white"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={look.img}
                  alt={look.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 220px, (min-width: 768px) 30vw, 45vw"
                />
                {/* Heart button */}
                <button
                  type="button"
                  aria-label="Ajouter aux favoris"
                  className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                {/* Bottom gradient overlay with label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-4 pb-4 pt-10">
                  <p className="text-sm font-semibold text-white">{look.name}</p>
                  <p className="mt-0.5 text-xs text-white/80">
                    {look.pieces} pi&egrave;ces
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ D. TWO BOTTOM CARDS ============ */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ----- Besoin d'inspiration ----- */}
        <div className="relative overflow-hidden rounded-2xl border border-[#EFEFEF] bg-white p-6">
          <div className="relative z-10 max-w-[60%]">
            <h3 className="font-serif text-lg text-[#111111]">
              Besoin d&rsquo;inspiration&nbsp;?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
              Parlez &agrave; un styliste et recevez des looks adapt&eacute;s &agrave;
              votre style et &agrave; vos envies.
            </p>
            <Link
              href="/stylists"
              className="mt-4 inline-flex items-center rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white"
            >
              Trouver un styliste
            </Link>
            <div className="mt-4 flex -space-x-2">
              {STYLIST_AVATARS.map((src) => (
                <div
                  key={src}
                  className="h-7 w-7 overflow-hidden rounded-full bg-[#EDE5DC] ring-2 ring-white"
                >
                  <Image
                    src={src}
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[40%] opacity-80">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop"
              alt=""
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        </div>

        {/* ----- Défi du mois ----- */}
        <div className="rounded-2xl border border-[#EFEFEF] bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-serif text-lg text-[#111111]">
                D&eacute;fi du mois
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
                Cr&eacute;ez 5 looks avec vos pi&egrave;ces les moins port&eacute;es.
              </p>
              <div className="mt-6">
                <p className="mb-2 text-xs text-[#8A8A8A]">
                  2 / 5 looks cr&eacute;&eacute;s
                </p>
                <div className="h-1.5 w-full rounded-full bg-[#F0EDE8]">
                  <div
                    className="h-full rounded-full bg-[#111111]"
                    style={{ width: '40%' }}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F0EDE8]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6A47E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ============ STAT CARD SHELL ============
type StatCardShellProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  ctaLabel: string;
  ctaHref: string;
  thumb: React.ReactNode;
};

function StatCardShell({
  icon,
  label,
  value,
  unit,
  ctaLabel,
  ctaHref,
  thumb,
}: StatCardShellProps) {
  return (
    <div className="rounded-2xl border border-[#EFEFEF] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F7F5F2]">
            {icon}
          </div>
          <span className="text-xs text-[#8A8A8A]">{label}</span>
        </div>
        <div>{thumb}</div>
      </div>
      <p className="mt-5 font-serif text-4xl leading-none text-[#111111]">
        {value}
      </p>
      <p className="mt-2 text-xs text-[#8A8A8A]">{unit}</p>
      <Link
        href={ctaHref}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#111111]"
      >
        {ctaLabel} &rarr;
      </Link>
    </div>
  );
}
