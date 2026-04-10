'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CalendarEntry, StylistClient, User } from '@/types';
import { api } from '@/lib/api';

type ViewMode = 'calendar' | 'list';

const EVENT_TYPES = [
  { value: 'SESSION_DRESSING', label: 'Session Dressing' },
  { value: 'LOOKBOOK', label: 'Lookbook' },
  { value: 'CONSEIL', label: 'Conseil' },
];

const DURATIONS = [30, 60, 90];

interface EventDraft {
  id?: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  duration_min: number;
  client_id: string;
  event_type: string;
  notes: string;
  zoom_link: string;
}

function emptyDraft(date?: Date): EventDraft {
  const d = date || new Date();
  return {
    date: format(d, 'yyyy-MM-dd'),
    time: '10:00',
    duration_min: 60,
    client_id: '',
    event_type: 'SESSION_DRESSING',
    notes: '',
    zoom_link: '',
  };
}

export default function AgendaPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [view, setView] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventModal, setEventModal] = useState<EventDraft | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  const loadEntries = async () => {
    const res = await api.get<CalendarEntry[]>(
      `/calendar?month=${currentMonth.getMonth() + 1}&year=${currentMonth.getFullYear()}`
    );
    if (res.success && res.data) {
      setEntries(res.data);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [currentMonth]);

  useEffect(() => {
    const loadClients = async () => {
      const res = await api.get<StylistClient[]>('/stylists/connections');
      if (res.success && Array.isArray(res.data)) {
        setClients(
          res.data
            .filter((c) => c.status === 'ACTIVE' && c.client)
            .map((c) => c.client as User)
        );
      }
    };
    loadClients();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: fr });
  const calEnd = endOfWeek(monthEnd, { locale: fr });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const entriesByDay = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      const key = format(new Date(e.date), 'yyyy-MM-dd');
      const list = map.get(key) || [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [entries]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return entries
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

  const openDay = (day: Date) => {
    setSelectedDate(day);
  };

  const openAdd = (day?: Date) => {
    setEventModal(emptyDraft(day || selectedDate || new Date()));
  };

  const saveEvent = async () => {
    if (!eventModal) return;
    setSaving(true);
    try {
      const isoDate = new Date(`${eventModal.date}T${eventModal.time}:00`);
      const client = clients.find((c) => c.id === eventModal.client_id);
      const eventTypeLabel =
        EVENT_TYPES.find((t) => t.value === eventModal.event_type)?.label ||
        eventModal.event_type;
      const payload = {
        date: isoDate.toISOString(),
        duration_min: eventModal.duration_min,
        client_id: eventModal.client_id || null,
        event_type: eventModal.event_type,
        title: client ? `${eventTypeLabel} avec ${client.name}` : eventTypeLabel,
        notes: eventModal.notes || null,
        zoom_link: eventModal.zoom_link || null,
      };
      const res = await api.post<CalendarEntry>('/calendar', payload);
      if (res.success) {
        await loadEntries();
        setEventModal(null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* Header */}
      <header className="px-5 pt-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[#111111]">Agenda</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            Vos rendez-vous et sessions
          </p>
        </div>
        <button
          type="button"
          onClick={() => openAdd()}
          className="text-sm text-[#C6A47E] font-medium"
        >
          + Ajouter
        </button>
      </header>

      {/* View tabs */}
      <div className="px-5 mt-5">
        <div className="bg-white rounded-full p-1 flex text-xs w-fit">
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`rounded-full px-4 py-1.5 ${
              view === 'calendar' ? 'bg-[#111111] text-white' : 'text-[#8A8A8A]'
            }`}
          >
            Calendrier
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`rounded-full px-4 py-1.5 ${
              view === 'list' ? 'bg-[#111111] text-white' : 'text-[#8A8A8A]'
            }`}
          >
            Liste
          </button>
        </div>
      </div>

      {view === 'calendar' && (
        <section className="mx-5 mt-5 bg-white rounded-3xl p-4 shadow-sm">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center"
              aria-label="Mois pr\u00e9c\u00e9dent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2 className="font-serif text-lg capitalize text-[#111111]">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center"
              aria-label="Mois suivant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div
                key={d}
                className="text-[10px] text-[#8A8A8A] text-center uppercase tracking-wide py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEntries = entriesByDay.get(key) || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => openDay(day)}
                  className={`relative min-h-[60px] p-1 rounded-lg text-left flex flex-col ${
                    !isCurrentMonth ? 'opacity-30' : ''
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {isToday ? (
                      <span className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-medium flex items-center justify-center">
                        {format(day, 'd')}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#111111]">
                        {format(day, 'd')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEntries.slice(0, 2).map((e) => {
                      const isPending = e.event_type === 'PENDING';
                      const label =
                        e.client?.name ||
                        e.title ||
                        (e.outfit?.name ?? 'RDV');
                      return (
                        <span
                          key={e.id}
                          className={`rounded-full px-2 py-0.5 text-[10px] truncate ${
                            isPending
                              ? 'bg-[#C6A47E]/20 text-[#C6A47E]'
                              : 'bg-[#111111] text-white'
                          }`}
                        >
                          {label}
                        </span>
                      );
                    })}
                    {dayEntries.length > 2 && (
                      <span className="text-[9px] text-[#8A8A8A] px-1">
                        +{dayEntries.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {view === 'list' && (
        <section className="mt-5 px-5">
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-[#111111]">
                Aucun rendez-vous \u00e0 venir
              </p>
              <p className="text-xs text-[#8A8A8A] mt-1">
                Ajoutez votre premier rendez-vous
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((e) => {
                const d = new Date(e.date);
                return (
                  <div
                    key={e.id}
                    className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 items-center"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#F0EDE8] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-[#8A8A8A] uppercase">
                        {format(d, 'MMM', { locale: fr })}
                      </span>
                      <span className="font-serif text-lg text-[#111111] leading-none">
                        {format(d, 'dd')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111111] truncate">
                        {e.title || e.client?.name || 'Rendez-vous'}
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5">
                        {format(d, 'HH:mm')}{' '}
                        {e.duration_min && `\u00b7 ${e.duration_min} min`}
                      </p>
                      {e.zoom_link && (
                        <a
                          href={e.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] mt-1"
                          style={{ color: '#2D8CFF' }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          Rejoindre Zoom
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Day detail sheet */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[#EFEFEF] rounded-full mx-auto mb-4" />
            <h3 className="font-serif text-xl text-[#111111] capitalize">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              {(entriesByDay.get(format(selectedDate, 'yyyy-MM-dd')) || []).map(
                (e) => {
                  const d = new Date(e.date);
                  return (
                    <div
                      key={e.id}
                      className="bg-[#F7F5F2] rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-serif text-lg text-[#111111]">
                          {format(d, 'HH:mm')}
                        </p>
                        {e.duration_min && (
                          <span className="text-xs text-[#8A8A8A]">
                            {e.duration_min} min
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#111111]">
                        {e.title || e.client?.name || 'Rendez-vous'}
                      </p>
                      {e.notes && (
                        <p className="text-xs text-[#8A8A8A] mt-1">{e.notes}</p>
                      )}
                      {e.zoom_link && (
                        <a
                          href={e.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs mt-2"
                          style={{ color: '#2D8CFF' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          Ouvrir Zoom
                        </a>
                      )}
                    </div>
                  );
                }
              )}
              {(entriesByDay.get(format(selectedDate, 'yyyy-MM-dd')) || [])
                .length === 0 && (
                <p className="text-sm text-[#8A8A8A] text-center py-4">
                  Aucun rendez-vous ce jour
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                openAdd(selectedDate);
                setSelectedDate(null);
              }}
              className="mt-5 w-full bg-[#111111] text-white rounded-full py-3 text-sm font-medium"
            >
              + Ajouter un rendez-vous
            </button>
          </div>
        </div>
      )}

      {/* Add event modal */}
      {eventModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
          onClick={() => setEventModal(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-[#111111]">Nouveau rendez-vous</h3>
              <button
                type="button"
                onClick={() => setEventModal(null)}
                className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
                aria-label="Fermer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Date */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={eventModal.date}
                  onChange={(e) =>
                    setEventModal({ ...eventModal, date: e.target.value })
                  }
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              {/* Heure de début */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Heure de d&eacute;but
                </label>
                <input
                  type="time"
                  value={eventModal.time}
                  onChange={(e) =>
                    setEventModal({ ...eventModal, time: e.target.value })
                  }
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>

              {/* Durée pills */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Dur&eacute;e
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setEventModal({ ...eventModal, duration_min: m })
                      }
                      className={`rounded-full px-4 py-2 text-xs ${
                        eventModal.duration_min === m
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F0EDE8] text-[#8A8A8A]'
                      }`}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Cliente */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Cliente
                </label>
                <select
                  value={eventModal.client_id}
                  onChange={(e) =>
                    setEventModal({ ...eventModal, client_id: e.target.value })
                  }
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                >
                  <option value="">S&eacute;lectionner une cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setEventModal({ ...eventModal, event_type: t.value })
                      }
                      className={`rounded-full px-4 py-2 text-xs ${
                        eventModal.event_type === t.value
                          ? 'bg-[#111111] text-white'
                          : 'bg-[#F0EDE8] text-[#8A8A8A]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Notes
                </label>
                <textarea
                  value={eventModal.notes}
                  onChange={(e) =>
                    setEventModal({ ...eventModal, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] resize-none"
                  placeholder="Notes de s\u00e9ance, objectifs..."
                />
              </div>

              {/* Zoom link optional */}
              <div>
                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Lien Zoom (optionnel)
                </label>
                <input
                  type="url"
                  value={eventModal.zoom_link}
                  onChange={(e) =>
                    setEventModal({ ...eventModal, zoom_link: e.target.value })
                  }
                  placeholder="https://zoom.us/j/..."
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setEventModal(null)}
                className="flex-1 rounded-full border border-[#EFEFEF] py-3 text-sm text-[#8A8A8A]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={saveEvent}
                disabled={saving}
                className="flex-1 rounded-full bg-[#111111] py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
