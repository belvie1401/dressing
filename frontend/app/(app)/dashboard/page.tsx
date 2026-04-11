'use client';

import Link from 'next/link';
import Image from 'next/image';

// ============ LOOK DU JOUR IMAGES ============
const LOOK_DU_JOUR_IMAGES = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop',
];

// ============ WEEK STRIP ============
type WeekDay = {
  label: string;
  date: number;
  today: boolean;
  img: string | null;
};

const WEEK_DAYS: WeekDay[] = [
  {
    label: 'LUN',
    date: 19,
    today: false,
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=100&h=100&fit=crop',
  },
  {
    label: 'MAR',
    date: 20,
    today: false,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=100&h=100&fit=crop',
  },
  {
    label: 'MER',
    date: 21,
    today: true,
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=100&fit=crop',
  },
  { label: 'JEU', date: 22, today: false, img: null },
  { label: 'VEN', date: 23, today: false, img: null },
  { label: 'SAM', date: 24, today: false, img: null },
  { label: 'DIM', date: 25, today: false, img: null },
];

// ============ LOOKS GRID ============
const LOOKS = [
  {
    name: 'Look pour le bureau',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=400&h=500&fit=crop',
  },
  {
    name: 'Look d\u00e9contract\u00e9',
    pieces: 5,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
  },
  {
    name: 'Look minimaliste',
    pieces: 3,
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop',
  },
  {
    name: 'Look soir\u00e9e',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop',
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
      {/* ============ A. LOOK DU JOUR ============ */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[#111111]">Look du jour</h2>
          <Link href="/outfits" className="text-sm text-[#8A8A8A]">
            Modifier &rarr;
          </Link>
        </div>
        <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-[#1a1a1a]">
          <div className="absolute inset-0 flex items-center justify-center gap-6">
            {LOOK_DU_JOUR_IMAGES.map((src, i) => (
              <div
                key={src}
                className={`h-[160px] w-[110px] overflow-hidden rounded-xl ${
                  i === 1 ? 'scale-[1.05]' : ''
                }`}
              >
                <Image
                  src={src}
                  alt={`Pi\u00e8ce ${i + 1}`}
                  width={110}
                  height={160}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex h-[80px] items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-5 pb-4">
            <div>
              <p className="text-sm font-semibold text-white">Look Casual Chic</p>
              <span className="mt-1 inline-block w-fit rounded-full bg-white/20 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
                Casual
              </span>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-[#F0EDE8]"
            >
              Porter aujourd&rsquo;hui
            </button>
          </div>
        </div>
      </section>

      {/* ============ B. CETTE SEMAINE ============ */}
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[#111111]">Cette semaine</h2>
          <Link href="/calendar" className="text-sm text-[#8A8A8A]">
            Agenda &rarr;
          </Link>
        </div>
        <div className="flex gap-3">
          {WEEK_DAYS.map((day) => (
            <div
              key={`${day.label}-${day.date}`}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[10px] uppercase text-[#8A8A8A]">
                {day.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  day.today
                    ? 'bg-[#111111] font-semibold text-white'
                    : 'font-medium text-[#111111]'
                }`}
              >
                {day.date}
              </div>
              {day.img ? (
                <div className="aspect-square w-full max-w-[60px] overflow-hidden rounded-xl">
                  <Image
                    src={day.img}
                    alt=""
                    width={60}
                    height={60}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-square w-full max-w-[60px] items-center justify-center rounded-xl border-2 border-dashed border-[#CFCFCF]">
                  <span className="text-lg leading-none text-[#CFCFCF]">+</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============ C. MES LOOKS ============ */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[#111111]">Mes looks</h2>
          <Link href="/outfits" className="text-sm text-[#8A8A8A]">
            Tout voir &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {LOOKS.map((look) => (
            <Link
              key={look.name}
              href="/outfits"
              className="cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-[180px] w-full">
                <Image
                  src={look.img}
                  alt={look.name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 220px, (min-width: 768px) 33vw, 50vw"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-[#111111]">
                  {look.name}
                </p>
                <p className="mt-0.5 text-xs text-[#8A8A8A]">
                  {look.pieces} pi&egrave;ces
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ D. TWO BOTTOM CARDS ============ */}
      <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ----- Besoin d'inspiration ----- */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6">
          <div className="relative z-10 max-w-[60%]">
            <h3 className="font-serif text-base text-[#111111]">
              Besoin d&rsquo;inspiration&nbsp;?
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
              Parlez &agrave; un styliste et recevez des looks adapt&eacute;s &agrave;
              votre style et &agrave; vos envies.
            </p>
            <div className="mt-4 flex -space-x-2">
              {STYLIST_AVATARS.map((src) => (
                <div
                  key={src}
                  className="h-8 w-8 overflow-hidden rounded-full bg-[#EDE5DC] ring-2 ring-white"
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
            <Link
              href="/stylists"
              className="mt-4 inline-block rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white"
            >
              Trouver un styliste
            </Link>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[40%] opacity-80">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=400&fit=crop"
              alt=""
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        </div>

        {/* ----- Défi du mois ----- */}
        <div className="rounded-2xl bg-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-serif text-base text-[#111111]">
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
            <div className="ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE8] p-2">
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
