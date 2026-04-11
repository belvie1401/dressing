'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { Outfit } from '@/types';
import OnboardingTour from '@/components/ui/OnboardingTour';

// ============ TYPES ============
type CountResponse = { count: number };

type ChallengeState = {
  target: number;
  current: number;
};

function capitalize(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hasSeenTour = useAuthStore((s) => s.hasSeenTour);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const firstName = capitalize(user?.name?.split(' ')[0] ?? '');

  // Top stat cards — each a separate independent count
  const [wardrobeCount, setWardrobeCount] = useState<number | null>(null);
  const [outfitsCount, setOutfitsCount] = useState<number | null>(null);
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);

  // Recommandations — recent outfits
  const [recommendations, setRecommendations] = useState<Outfit[] | null>(null);

  // Tour visibility — also check localStorage to survive page refresh
  const [localTourDone, setLocalTourDone] = useState<boolean | null>(null);

  useEffect(() => {
    setLocalTourDone(localStorage.getItem('lien-tour-done') === 'true');
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      const [wardrobeRes, outfitsRes, sessionsRes, recsRes] = await Promise.all([
        api.get<CountResponse>('/wardrobe/count'),
        api.get<CountResponse>('/outfits/count'),
        api.get<CountResponse>('/stylists/sessions/count'),
        api.get<Outfit[]>('/outfits?limit=4&sort=recent'),
      ]);

      if (!mounted) return;

      setWardrobeCount(wardrobeRes.success && wardrobeRes.data ? wardrobeRes.data.count : 0);
      setOutfitsCount(outfitsRes.success && outfitsRes.data ? outfitsRes.data.count : 0);
      setSessionsCount(sessionsRes.success && sessionsRes.data ? sessionsRes.data.count : 0);
      setRecommendations(recsRes.success && recsRes.data ? recsRes.data : []);
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  // Show tour for new users (registered < 24h ago) who haven't seen it
  const isNewUser =
    user?.created_at
      ? Date.now() - new Date(user.created_at).getTime() < 86_400_000
      : false;
  const showTour =
    _hasHydrated && localTourDone === false && !hasSeenTour && isNewUser;

  const challenge: ChallengeState = {
    target: 5,
    current: Math.min(outfitsCount ?? 0, 5),
  };
  const challengePct =
    outfitsCount === null
      ? 0
      : Math.round((challenge.current / challenge.target) * 100);

  return (
    <>
      {/* ============ ONBOARDING TOUR ============ */}
      {showTour && (
        <OnboardingTour onComplete={() => setLocalTourDone(true)} />
      )}

      {/* ============ A. GREETING ============ */}
      <div className="mb-10">
        <h1 className="font-serif text-4xl leading-tight text-[#111111]">
          Bonjour{firstName ? ` ${firstName}` : ''}{' '}
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
        <StatCardShell
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4" r="2" />
              <line x1="12" y1="6" x2="12" y2="8" />
              <polyline points="3,15 12,8 21,15" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          }
          label="Mon dressing"
          value={wardrobeCount}
          unit="vêtements"
          ctaLabel="Voir tout"
          ctaHref="/wardrobe"
        />

        <StatCardShell
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          label="Mes looks"
          value={outfitsCount}
          unit="créés"
          ctaLabel="Voir tout"
          ctaHref="/outfits"
        />

        <StatCardShell
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label="Sessions"
          value={sessionsCount}
          unit="en cours"
          ctaLabel="Voir mes sessions"
          ctaHref="/stylists"
        />
      </div>

      {/* ============ C. RECOMMANDATIONS POUR VOUS ============ */}
      <section className="mb-12" data-tour="mes-looks">
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

        {recommendations === null ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-[#F0EDE8] animate-pulse"
              />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F0EDE8]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="font-serif text-lg text-[#111111]">
              Aucun look pour l&rsquo;instant
            </p>
            <p className="mt-2 text-xs text-[#8A8A8A]">
              Cr&eacute;ez votre premier look depuis votre dressing.
            </p>
            <Link
              href="/outfits"
              className="mt-4 inline-flex items-center rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white"
            >
              Cr&eacute;er un look
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {recommendations.map((look) => {
              const firstItem = look.items?.[0]?.item;
              const cover = firstItem?.bg_removed_url || firstItem?.photo_url || null;
              const pieces = look.items?.length ?? 0;
              return (
                <Link
                  key={look.id}
                  href={`/outfits/${look.id}`}
                  className="group relative block cursor-pointer overflow-hidden rounded-2xl bg-white"
                >
                  <div className="relative aspect-[4/5] w-full bg-[#F0EDE8]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={look.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 220px, (min-width: 768px) 30vw, 45vw"
                      />
                    ) : null}
                    <button
                      type="button"
                      aria-label="Ajouter aux favoris"
                      className="absolute right-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                      onClick={(e) => e.preventDefault()}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-4 pb-4 pt-10">
                      <p className="text-sm font-semibold text-white">{look.name}</p>
                      <p className="mt-0.5 text-xs text-white/80">
                        {pieces} pi&egrave;ce{pieces > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ D. TWO BOTTOM CARDS ============ */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ----- Besoin d'inspiration ----- */}
        <div className="relative overflow-hidden rounded-2xl bg-[#EDE5DC] p-6">
          <div className="relative z-10">
            <h3 className="font-serif text-lg text-[#111111]">
              Besoin d&rsquo;inspiration&nbsp;?
            </h3>
            <p className="mt-2 max-w-[80%] text-xs leading-relaxed text-[#8A8A8A]">
              Parlez &agrave; un styliste et recevez des looks adapt&eacute;s &agrave;
              votre style et &agrave; vos envies.
            </p>
            <Link
              href="/stylists"
              className="mt-4 inline-flex items-center rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white"
            >
              Trouver un styliste
            </Link>
          </div>
        </div>

        {/* ----- Défi du mois ----- */}
        <div className="rounded-2xl bg-[#F0EDE8] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-serif text-lg text-[#111111]">
                D&eacute;fi du mois
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
                Cr&eacute;ez {challenge.target} looks avec vos pi&egrave;ces les moins
                port&eacute;es.
              </p>
              <div className="mt-6">
                <p className="mb-2 text-xs text-[#8A8A8A]">
                  {outfitsCount === null ? (
                    <span className="inline-block h-3 w-24 rounded bg-[#F0EDE8] animate-pulse align-middle" />
                  ) : (
                    `${challenge.current} / ${challenge.target} looks créés`
                  )}
                </p>
                <div className="h-1.5 w-full rounded-full bg-[#F0EDE8]">
                  <div
                    className="h-full rounded-full bg-[#111111] transition-all"
                    style={{ width: `${challengePct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F0EDE8]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
  /** null = loading, number = real value from DB */
  value: number | null;
  unit: string;
  ctaLabel: string;
  ctaHref: string;
};

function StatCardShell({
  icon,
  label,
  value,
  unit,
  ctaLabel,
  ctaHref,
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
      </div>
      {value === null ? (
        <div className="mt-5 h-10 w-20 rounded bg-[#F0EDE8] animate-pulse" />
      ) : (
        <p className="mt-5 font-serif text-4xl leading-none text-[#111111]">
          {value}
        </p>
      )}
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
