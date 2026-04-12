'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isSameDay } from 'date-fns';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { CalendarEntry } from '@/types';
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

  // Recommandations — stylist-curated outfits
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Daily reminder banner
  const [todayHasEntry, setTodayHasEntry] = useState<boolean | null>(null);

  // Tutorial visibility
  const [showTutorial, setShowTutorial] = useState(false);

  // Wardrobe preview
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

  // Next session
  const [nextSession, setNextSession] = useState<any>(null);

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

    const loadCalendar = async () => {
      const now = new Date();
      const calRes = await api.get<CalendarEntry[]>(`/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);

      if (!mounted) return;

      if (calRes.success && calRes.data) {
        const hasToday = calRes.data.some((e) => isSameDay(new Date(e.date), now));
        setTodayHasEntry(hasToday);
      } else {
        setTodayHasEntry(false);
      }
    };

    loadCalendar();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lien_token');
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/api/outfits?from_stylist=true&limit=3`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setRecommendations(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lien_token');
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/api/wardrobe?limit=4&sort=recent`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setWardrobeItems(d.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('lien_token');
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/api/calendar?upcoming=true&limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setNextSession(d.data?.[0] || null))
      .catch(() => {});
  }, []);

  const challenge: ChallengeState = {
    target: 5,
    current: Math.min(stats.looks, 5),
  };
  const challengePct = Math.round((challenge.current / challenge.target) * 100);

  return (
    <div className="w-full bg-[#F2F0EB] md:bg-transparent min-h-screen pb-24 md:pb-0 overflow-x-hidden max-w-[100vw]">
      {/* ============ TUTORIAL ============ */}
      {showTutorial && (
        <DashboardTutorial
          firstName={firstName}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* ============ HELP BUTTON ============ */}
      <TutorialHelpButton onRestart={restartTutorial} />

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
      <div className="mx-4 mb-5 md:mx-0 md:mb-12 grid grid-cols-3 gap-2 md:gap-4">
        {/* Card 1 — Mon dressing */}
        <div className="overflow-hidden rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 md:w-[14px] md:h-[14px]">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="truncate text-[10px] md:text-[11px] text-[#9B9B9B]">Mon dressing</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.wardrobe}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">vêtements</p>
          <Link href="/wardrobe" className="text-[10px] md:text-xs font-medium text-[#111111] mt-2 block">
            Voir tout →
          </Link>
        </div>

        {/* Card 2 — Mes looks */}
        <div className="overflow-hidden rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 md:w-[14px] md:h-[14px]">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="truncate text-[10px] md:text-[11px] text-[#9B9B9B]">Mes looks</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.looks}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">créés</p>
          <Link href="/outfits" className="text-[10px] md:text-xs font-medium text-[#111111] mt-2 block">
            Voir tout →
          </Link>
        </div>

        {/* Card 3 — Sessions */}
        <div className="overflow-hidden rounded-2xl bg-white p-3 md:border md:border-[#EFEFEF] md:p-5">
          <div className="flex items-center gap-1 mb-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 md:w-[14px] md:h-[14px]">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="truncate text-[10px] md:text-[11px] text-[#9B9B9B]">Sessions</span>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-[#111111] leading-none">{stats.sessions}</p>
          <p className="text-[10px] text-[#9B9B9B] mt-0.5 md:mt-2">en cours</p>
          <Link href="/calendar" className="text-[10px] md:text-xs font-medium text-[#111111] mt-2 block">
            <span className="md:hidden">Sessions →</span>
            <span className="hidden md:inline">Voir mes sessions →</span>
          </Link>
        </div>
      </div>

      {/* ============ C. RECOMMANDATIONS POUR VOUS ============ */}
      <section className="mb-5 md:mb-12 px-5 md:px-0" data-tour="look-du-jour">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl md:text-2xl text-[#111111]">
              Recommandations
            </h2>
            <p className="mt-0.5 text-xs text-[#9B9B9B]">
              Des looks sélectionnés par votre styliste
            </p>
          </div>
          <Link
            href="/outfits"
            className="flex-shrink-0 rounded-full border border-[#EFEFEF] bg-white px-3 py-1.5 text-[11px] font-medium text-[#111111]"
          >
            Voir tous les looks
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center">
            <p className="font-serif text-base text-[#111111]">Aucune recommandation</p>
            <p className="mt-1 text-xs text-[#9B9B9B]">Votre styliste n&rsquo;a pas encore partagé de looks.</p>
            <Link
              href="/stylists"
              className="mt-3 inline-flex items-center rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white"
            >
              Trouver un styliste
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {recommendations.map((look: any) => {
              const firstItem = look.items?.[0]?.item;
              const cover = firstItem?.bg_removed_url || firstItem?.photo_url || null;
              return (
                <div key={look.id} className="overflow-hidden rounded-2xl bg-white">
                  <div className="relative h-[150px]">
                    {cover ? (
                      <img
                        src={cover}
                        alt={look.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#F0EDE8]" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
                      <p className="text-[10px] italic leading-tight text-white">{look.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 p-2">
                    <button
                      type="button"
                      className="w-full rounded-full bg-[#C6A47E]/20 py-2 text-[11px] text-[#9B7B5C]"
                    >
                      Portez ce Look
                    </button>
                    <Link
                      href={`/outfits/${look.id}`}
                      className="block w-full rounded-full border border-[#EFEFEF] py-2 text-center text-[11px] text-[#111111]"
                    >
                      Afficher les détails
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ D. WARDROBE PREVIEW ============ */}
      <div className="px-5 mb-5">
        <div className="rounded-2xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base text-[#111111]">Mon Dressing</h2>
            <span className="text-sm text-[#9B9B9B]">{stats.wardrobe} pièces</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {wardrobeItems.slice(0, 4).map((item: any) => {
              const photo = item.bg_removed_url || item.photo_url || null;
              return (
                <div
                  key={item.id}
                  className="h-[95px] w-[80px] flex-shrink-0 overflow-hidden rounded-xl bg-[#F7F5F2]"
                >
                  {photo && (
                    <img
                      src={photo}
                      alt={item.name || ''}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center 15%' }}
                    />
                  )}
                </div>
              );
            })}
            <Link
              href="/wardrobe/add"
              className="flex h-[95px] w-[80px] flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#CFCFCF] bg-[#F2F0EB]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="mt-1 text-[10px] text-[#9B9B9B]">+ Ajouter</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============ E. PROCHAINE SESSION ============ */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl bg-[#111111] p-4">
          {!nextSession ? (
            <>
              <p className="text-[9px] uppercase tracking-widest text-[#C6A47E]">PROCHAINE SESSION</p>
              <p className="mt-1 font-serif text-xl text-white">Aucune session prévue</p>
              <p className="mt-1 text-xs text-[#9B9B9B]">Réservez un rendez-vous avec un styliste.</p>
              <Link
                href="/stylists"
                className="mt-3 inline-block rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#111111]"
              >
                Trouvez un styliste
              </Link>
            </>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[9px] uppercase tracking-widest text-[#C6A47E]">PROCHAINE SESSION</p>
                <p className="mt-1 font-serif text-xl text-white">
                  {new Date(nextSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <p className="mt-1 text-sm text-white">
                  {nextSession.time || ''}{nextSession.stylist?.name ? ` · ${nextSession.stylist.name}` : ''}
                </p>
                <Link
                  href="/calendar"
                  className="mt-3 inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white"
                >
                  Voir les détails
                </Link>
              </div>
              {nextSession.stylist?.avatar_url && (
                <div className="ml-4 h-14 w-14 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#C6A47E]">
                  <img
                    src={nextSession.stylist.avatar_url}
                    alt={nextSession.stylist.name || ''}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============ F. TWO BOTTOM CARDS ============ */}
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
                  {`${challenge.current} / ${challenge.target} looks créés`}
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

