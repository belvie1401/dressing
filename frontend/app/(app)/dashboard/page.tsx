'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { Outfit, CalendarEntry } from '@/types';
import DashboardTutorial from '@/components/ui/DashboardTutorial';
import TutorialHelpButton from '@/components/ui/TutorialHelpButton';


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
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const tutorials = useAuthStore((s) => s.tutorials);
  const resetTutorial = useAuthStore((s) => s.resetTutorial);
  const firstName = capitalize(user?.name?.split(' ')[0] ?? '');

  // Stats
  const [stats, setStats] = useState({ wardrobe: 0, looks: 0, sessions: 0 });

  // Recommandations — recent outfits
  const [recommendations, setRecommendations] = useState<Outfit[] | null>(null);

  // Daily reminder banner
  const [todayHasEntry, setTodayHasEntry] = useState<boolean | null>(null);

  // Tutorial visibility
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!tutorials.client_dashboard) {
      setShowTutorial(true);
    }
  }, [_hasHydrated, tutorials.client_dashboard]);

  const restartTutorial = () => {
    resetTutorial('client_dashboard');
    setShowTutorial(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('lien_token');
    const h: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const API = process.env.NEXT_PUBLIC_API_URL;

    fetch(`${API}/api/wardrobe/count`, { headers: h })
      .then((r) => r.json())
      .then((d) => setStats((p) => ({ ...p, wardrobe: d.count || 0 })))
      .catch(() => {});

    fetch(`${API}/api/outfits/count`, { headers: h })
      .then((r) => r.json())
      .then((d) => setStats((p) => ({ ...p, looks: d.count || 0 })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadRest = async () => {
      const now = new Date();
      const [recsRes, calRes] = await Promise.all([
        api.get<Outfit[]>('/outfits?limit=4&sort=recent'),
        api.get<CalendarEntry[]>(`/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
      ]);

      if (!mounted) return;

      setRecommendations(recsRes.success && recsRes.data ? recsRes.data : []);

      if (calRes.success && calRes.data) {
        const hasToday = calRes.data.some((e) => isSameDay(new Date(e.date), now));
        setTodayHasEntry(hasToday);
      } else {
        setTodayHasEntry(false);
      }
    };

    loadRest();
    return () => {
      mounted = false;
    };
  }, []);

  const challenge: ChallengeState = {
    target: 5,
    current: Math.min(stats.looks, 5),
  };
  const challengePct = Math.round((challenge.current / challenge.target) * 100);

  return (
    <div className="bg-[#F2F0EB] md:bg-transparent min-h-screen pb-24 md:pb-0 overflow-x-hidden">
      {/* ============ TUTORIAL ============ */}
      {showTutorial && (
        <DashboardTutorial
          firstName={firstName}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* ============ HELP BUTTON ============ */}
      <TutorialHelpButton onRestart={restartTutorial} />

      {/* ============ MOBILE TOP BAR ============ */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 md:hidden">
        <button type="button" className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <button type="button" className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <Link href="/wardrobe/add" className="flex h-12 items-center gap-2 rounded-full bg-[#111111] px-5 text-sm font-medium text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ajouter
          </Link>
        </div>
      </div>

      {/* ============ A. GREETING ============ */}
      <div className="px-5 mt-2 mb-4 md:px-0 md:mt-0 md:mb-6">
        <h1 className="font-serif text-4xl md:text-4xl font-semibold leading-tight text-[#111111]">
          Bonjour{firstName ? ` ${firstName}` : ''}{' '}
          <span className="inline-block" aria-hidden>
            &#128075;
          </span>
        </h1>
        <p className="mt-2 text-sm text-[#9B9B9B] md:text-[#8A8A8A] leading-relaxed">
          Votre dressing, vos stylistes, votre style. Tout est connect&eacute;.
        </p>
      </div>

      {/* ============ DAILY REMINDER BANNER ============ */}
      {todayHasEntry === false && (
        <div className="mx-5 mb-5 md:mx-0 md:mb-6 rounded-2xl bg-[#EDE5DC] p-4 md:p-3">
          <div className="flex items-center gap-4 md:gap-3">
            <div className="flex h-12 w-12 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-2xl md:rounded-full bg-white/60">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base md:text-sm font-semibold text-[#111111] leading-snug">Qu&apos;est-ce que vous portez aujourd&apos;hui&nbsp;?</p>
              <p className="text-xs text-[#9B9B9B] md:text-[#8A8A8A] mt-1">Enregistrez votre look du jour</p>
            </div>
            <Link
              href="/calendar"
              className="flex-shrink-0 rounded-full bg-[#111111] px-4 md:px-3 py-2.5 md:py-1.5 text-sm md:text-xs font-medium text-white"
            >
              Ajouter
            </Link>
          </div>
        </div>
      )}

      {/* ============ B. STAT CARDS ============ */}
      <div className="mx-5 mb-5 md:mx-0 md:mb-12 grid grid-cols-3 gap-3 md:gap-4">
        {/* Card 1 — Mon dressing */}
        <div className="rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[11px] text-[#9B9B9B]">Mon dressing</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.wardrobe}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">vêtements</p>
          <Link href="/wardrobe" className="text-[11px] md:text-xs font-medium text-[#111111] mt-2 block">
            Voir tout →
          </Link>
        </div>

        {/* Card 2 — Mes looks */}
        <div className="rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-[11px] text-[#9B9B9B]">Mes looks</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.looks}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">créés</p>
          <Link href="/outfits" className="text-[11px] md:text-xs font-medium text-[#111111] mt-2 block">
            Voir tout →
          </Link>
        </div>

        {/* Card 3 — Sessions */}
        <div className="rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-[11px] text-[#9B9B9B]">Sessions</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.sessions}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">en cours</p>
          <Link href="/calendar" className="text-[11px] md:text-xs font-medium text-[#111111] mt-2 block">
            Voir mes sessions →
          </Link>
        </div>
      </div>

      {/* ============ C. RECOMMANDATIONS POUR VOUS ============ */}
      <section className="mb-8 md:mb-12 px-5 md:px-0" data-tour="look-du-jour">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg md:text-2xl text-[#111111]">
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
      <section
        data-tour="cette-semaine"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 px-5 md:px-0"
      >
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
    </div>
  );
}

