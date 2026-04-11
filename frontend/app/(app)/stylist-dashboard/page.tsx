'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { CalendarEntry } from '@/types';
import StylistTutorial from '@/components/ui/StylistTutorial';
import TutorialHelpButton from '@/components/ui/TutorialHelpButton';

// ============ TYPES ============
type StylistStats = {
  active_clients: number;
  active_clients_delta: number;
  managed_pieces: number;
  managed_pieces_delta: number;
  appointments_this_week: number;
};

type StylistClientRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string | null;
  pieces: number;
  last_update: string | null;
  tags: string[];
};

type Objectives = {
  month: string;
  new_clients: { current: number; target: number };
  lookbooks: { current: number; target: number };
  revenue: { current: number; target: number };
};

type AgendaStats = {
  occupation_rate: number;
  average_duration_min: number;
  cancellation_rate: number;
  pending_count: number;
};

function StatIcon({ name }: { name: 'users' | 'wardrobe' | 'calendar' }) {
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

function formatLastUpdate(iso: string | null): string {
  if (!iso) return 'Aucune mise à jour';
  const then = new Date(iso).getTime();
  const diffD = Math.floor((Date.now() - then) / 86400000);
  if (diffD === 0) return 'MAJ aujourd’hui';
  if (diffD === 1) return 'MAJ hier';
  if (diffD < 7) return `MAJ il y a ${diffD}j`;
  const diffW = Math.floor(diffD / 7);
  if (diffW < 4) return `MAJ il y a ${diffW}sem`;
  const diffMo = Math.floor(diffD / 30);
  return `MAJ il y a ${diffMo} mois`;
}

function buildCurrentWeek(): Array<{ num: number; label: string; today: boolean; iso: string }> {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      num: d.getDate(),
      label,
      today: d.getTime() === today.getTime(),
      iso: d.toISOString().slice(0, 10),
    };
  });
}

function formatAppointmentTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StylistDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDualRole = useAuthStore((s) => s.isDualRole);
  const activateStylistMode = useAuthStore((s) => s.activateStylistMode);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const tutorials = useAuthStore((s) => s.tutorials);
  const resetTutorial = useAuthStore((s) => s.resetTutorial);
  const [activatingClient, setActivatingClient] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? '';

  // Tutorial visibility
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!tutorials.stylist_dashboard) {
      setShowTutorial(true);
    }
  }, [_hasHydrated, tutorials.stylist_dashboard]);

  const restartTutorial = () => {
    resetTutorial('stylist_dashboard');
    setShowTutorial(true);
  };

  // Data states
  const [stats, setStats] = useState<StylistStats | null>(null);
  const [objectives, setObjectives] = useState<Objectives | null>(null);
  const [clients, setClients] = useState<StylistClientRow[] | null>(null);
  const [weekEntries, setWeekEntries] = useState<CalendarEntry[] | null>(null);
  const [agendaStats, setAgendaStats] = useState<AgendaStats | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const load = async () => {
      const [statsRes, objRes, clientsRes, weekRes, agendaRes] = await Promise.all([
        api.get<StylistStats>('/stylists/stats'),
        api.get<Objectives>('/stylists/objectives'),
        api.get<StylistClientRow[]>('/stylists/clients?limit=6'),
        api.get<CalendarEntry[]>('/calendar?week=current'),
        api.get<AgendaStats>('/calendar/agenda-stats'),
      ]);

      if (!mounted) return;

      setStats(
        statsRes.success && statsRes.data
          ? statsRes.data
          : {
              active_clients: 0,
              active_clients_delta: 0,
              managed_pieces: 0,
              managed_pieces_delta: 0,
              appointments_this_week: 0,
            }
      );
      setObjectives(
        objRes.success && objRes.data
          ? objRes.data
          : {
              month: new Date().toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric',
              }),
              new_clients: { current: 0, target: 0 },
              lookbooks: { current: 0, target: 0 },
              revenue: { current: 0, target: 0 },
            }
      );
      setClients(clientsRes.success && clientsRes.data ? clientsRes.data : []);
      setWeekEntries(weekRes.success && weekRes.data ? weekRes.data : []);
      setAgendaStats(
        agendaRes.success && agendaRes.data
          ? agendaRes.data
          : {
              occupation_rate: 0,
              average_duration_min: 0,
              cancellation_rate: 0,
              pending_count: 0,
            }
      );
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleActivateClient = async () => {
    setActivatingClient(true);
    await activateStylistMode();
    setActivatingClient(false);
    router.push('/dashboard');
  };

  const weekDays = buildCurrentWeek();

  const todayAppointments = (weekEntries ?? []).filter((e) => {
    const d = new Date(e.date);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-6 lg:px-8 lg:py-10">
      {/* ============ TUTORIAL ============ */}
      {showTutorial && (
        <StylistTutorial
          firstName={firstName}
          onClose={() => setShowTutorial(false)}
        />
      )}

      {/* ============ HELP BUTTON ============ */}
      <TutorialHelpButton onRestart={restartTutorial} />

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
          Bonjour{' '}
          {firstName ? (
            <em className="italic text-[#C6A47E]">{firstName}</em>
          ) : null}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#8A8A8A]">
          Voici un aper&ccedil;u de votre activit&eacute; et de vos clientes cette semaine.
        </p>
      </section>

      {/* ============ STATS ROW ============ */}
      <section
        data-tour="stylist-stats"
        className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_280px]"
      >
        <StatsCard
          icon="users"
          label="Clientes actives"
          value={stats?.active_clients ?? null}
          trend={
            stats
              ? stats.active_clients_delta > 0
                ? `↑ +${stats.active_clients_delta} ce mois`
                : 'Ce mois'
              : null
          }
          trendKind={stats && stats.active_clients_delta > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          icon="wardrobe"
          label="Dressings gérés"
          value={stats?.managed_pieces ?? null}
          trend={
            stats
              ? stats.managed_pieces_delta > 0
                ? `↑ +${stats.managed_pieces_delta} pièces`
                : 'Ce mois'
              : null
          }
          trendKind={stats && stats.managed_pieces_delta > 0 ? 'up' : 'neutral'}
        />
        <StatsCard
          icon="calendar"
          label="Rendez-vous"
          value={stats?.appointments_this_week ?? null}
          trend="cette semaine"
          trendKind="neutral"
        />

        {/* Objectives dark card */}
        <div className="rounded-3xl bg-[#111111] p-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C6A47E]">
              Mes objectifs
            </p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          {objectives === null ? (
            <div className="mt-3 space-y-3">
              <div className="h-6 w-24 rounded bg-white/10 animate-pulse" />
              <div className="h-2 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-2 w-full rounded bg-white/10 animate-pulse" />
              <div className="h-2 w-full rounded bg-white/10 animate-pulse" />
            </div>
          ) : objectives.new_clients.target === 0 &&
            objectives.lookbooks.target === 0 &&
            objectives.revenue.target === 0 ? (
            <>
              <p className="mt-3 font-serif text-2xl leading-tight capitalize">
                {objectives.month}
              </p>
              <p className="mt-4 text-[11px] leading-relaxed text-[#CFCFCF]">
                D&eacute;finissez vos objectifs mensuels depuis votre profil styliste
                pour suivre votre progression.
              </p>
              <Link
                href="/stylist-profile"
                className="mt-4 inline-block rounded-full bg-[#C6A47E] px-4 py-2 text-[11px] font-medium text-[#111111]"
              >
                D&eacute;finir mes objectifs
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 font-serif text-2xl leading-tight capitalize">
                {objectives.month}
              </p>
              <div className="mt-4 space-y-3">
                <ObjectiveRow
                  label="Nouvelles clientes"
                  current={objectives.new_clients.current}
                  target={objectives.new_clients.target}
                  color="#C6A47E"
                />
                <ObjectiveRow
                  label="Lookbooks créés"
                  current={objectives.lookbooks.current}
                  target={objectives.lookbooks.target}
                  color="#C6A47E"
                />
                <ObjectiveRow
                  label="Revenus"
                  current={objectives.revenue.current}
                  target={objectives.revenue.target}
                  suffix=" €"
                  color="#D4785C"
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============ DRESSINGS CLIENTES + RIGHT SIDEBAR ============ */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* ---- Left: clients grid ---- */}
        <div data-tour="clients-grid">
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

          {clients === null ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-3xl bg-[#F0EDE8] animate-pulse"
                />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <p className="font-serif text-lg text-[#111111]">
                Aucune cliente pour l&rsquo;instant
              </p>
              <p className="mt-2 text-xs text-[#8A8A8A]">
                Vos clientes actives appara&icirc;tront ici d&egrave;s qu&rsquo;une
                invitation sera accept&eacute;e.
              </p>
              <Link
                href="/stylist-profile"
                className="mt-4 inline-flex items-center rounded-full bg-[#111111] px-5 py-2.5 text-xs font-medium text-white"
              >
                Compl&eacute;ter mon profil
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clients.map((c) => {
                const firstLetter = c.name.charAt(0).toUpperCase() || '?';
                return (
                  <Link
                    key={c.id}
                    href={`/my-clients/${c.id}`}
                    className="group rounded-3xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EDE5DC] ring-2 ring-[#EFEFEF]">
                        {c.avatar_url ? (
                          <Image
                            src={c.avatar_url}
                            alt={c.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center font-serif text-sm text-[#C6A47E]">
                            {firstLetter}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#111111]">
                          {c.name || c.email || 'Cliente'}
                        </p>
                        <p className="truncate text-[11px] text-[#8A8A8A]">
                          {formatLastUpdate(c.last_update)}
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                      </svg>
                    </div>

                    {c.tags.length > 0 ? (
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
                    ) : null}
                  </Link>
                );
              })}
            </div>
          )}
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
              {weekDays.map((d) => (
                <div
                  key={d.iso}
                  className={`flex flex-col items-center justify-center rounded-xl py-2 text-[10px] ${
                    d.today
                      ? 'bg-[#111111] text-white'
                      : 'text-[#8A8A8A] hover:bg-[#F7F5F2]'
                  }`}
                >
                  <span className={d.today ? 'text-[#C6A47E]' : 'text-[#CFCFCF]'}>
                    {d.label}
                  </span>
                  <span className="mt-0.5 font-serif text-sm">{d.num}</span>
                </div>
              ))}
            </div>

            {weekEntries === null ? (
              <div className="mt-4 space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-12 rounded-2xl bg-[#F0EDE8] animate-pulse" />
                ))}
              </div>
            ) : todayAppointments.length === 0 ? (
              <p className="mt-4 text-center text-[11px] text-[#8A8A8A]">
                Aucun rendez-vous aujourd&rsquo;hui
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {todayAppointments.map((a) => (
                  <Link
                    key={a.id}
                    href="/agenda"
                    className="flex items-center gap-3 rounded-2xl bg-[#F7F5F2] px-3 py-2.5 transition-colors hover:bg-[#F0EDE8]"
                  >
                    <span className="font-serif text-sm text-[#C6A47E]">
                      {formatAppointmentTime(a.date)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[#111111]">
                        {a.client?.name || a.title || 'Rendez-vous'}
                      </p>
                      {a.event_type ? (
                        <p className="truncate text-[10px] text-[#8A8A8A]">
                          {a.event_type}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Planning stats */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-serif text-base text-[#111111]">
              Statistiques planning
            </h3>
            {agendaStats === null ? (
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-4 rounded bg-[#F0EDE8] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8A8A]">Taux d&rsquo;occupation</span>
                  <span className="font-serif text-sm text-[#111111]">
                    {agendaStats.occupation_rate}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
                  <div
                    className="h-full rounded-full bg-[#C6A47E]"
                    style={{ width: `${agendaStats.occupation_rate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#8A8A8A]">Dur&eacute;e moyenne</span>
                  <span className="font-serif text-sm text-[#111111]">
                    {agendaStats.average_duration_min} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8A8A8A]">Annulations</span>
                  <span className="font-serif text-sm text-[#111111]">
                    {agendaStats.cancellation_rate}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Client mode CTA */}
          {!isDualRole && (
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE5DC]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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

// ============ Helper components ============

type StatsCardProps = {
  icon: 'users' | 'wardrobe' | 'calendar';
  label: string;
  value: number | null;
  trend: string | null;
  trendKind: 'up' | 'neutral';
};

function StatsCard({ icon, label, value, trend, trendKind }: StatsCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
          <StatIcon name={icon} />
        </div>
        {trend ? (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              trendKind === 'up'
                ? 'bg-green-50 text-green-600'
                : 'bg-[#F0EDE8] text-[#8A8A8A]'
            }`}
          >
            {trend}
          </span>
        ) : null}
      </div>
      {value === null ? (
        <div className="mt-4 h-11 w-20 rounded bg-[#F0EDE8] animate-pulse" />
      ) : (
        <p className="mt-4 font-serif text-[44px] leading-none text-[#111111]">
          {value}
        </p>
      )}
      <p className="mt-1 text-sm text-[#8A8A8A]">{label}</p>
    </div>
  );
}

type ObjectiveRowProps = {
  label: string;
  current: number;
  target: number;
  color: string;
  suffix?: string;
};

function ObjectiveRow({ label, current, target, color, suffix = '' }: ObjectiveRowProps) {
  const pct = target <= 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className="text-[#CFCFCF]">{label}</span>
        <span className="text-white">
          {current}
          {suffix} / {target}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
