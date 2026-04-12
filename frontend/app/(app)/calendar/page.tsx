'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CalendarEntry, Outfit } from '@/types';
import { api } from '@/lib/api';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch entries when month changes
  useEffect(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    api
      .get<CalendarEntry[]>(`/calendar?month=${month}&year=${year}`)
      .then((res) => {
        if (res.success && res.data) setEntries(res.data);
      });
  }, [currentMonth]);

  // ── Build calendar grid ──────────────────────────────────────────────────
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEntryForDay = (d: Date) =>
    entries.find((e) => e.outfit_id && isSameDay(new Date(e.date), d));

  const getAppointmentForDay = (d: Date) =>
    entries.find((e) => e.event_type && isSameDay(new Date(e.date), d));

  const selectedEntry = selectedDay ? getEntryForDay(selectedDay) : null;
  const selectedAppointment = selectedDay ? getAppointmentForDay(selectedDay) : null;

  const handleRemoveOutfit = async () => {
    if (!selectedEntry) return;
    await api.delete(`/calendar/${selectedEntry.id}`);
    setEntries((prev) => prev.filter((e) => e.id !== selectedEntry.id));
  };

  const handleSaved = (entry: CalendarEntry) => {
    setEntries((prev) => {
      const without = prev.filter(
        (e) => !isSameDay(new Date(e.date), new Date(entry.date)),
      );
      return [...without, entry];
    });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* ══ Header ══ */}
      <div className="flex items-center justify-between px-5 pt-6">
        <h1 className="font-serif text-2xl text-[#111111]">Calendrier</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer text-sm font-medium text-[#C6A47E]"
        >
          + Ajouter
        </button>
      </div>

      {/* ══ Month navigation ══ */}
      <div className="mt-4 flex items-center justify-between px-5">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-[#F0EDE8]"
          aria-label="Mois précédent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <p className="font-serif text-lg capitalize text-[#111111]">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </p>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-[#F0EDE8]"
          aria-label="Mois suivant"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ══ Day headers ══ */}
      <div className="mb-2 mt-4 grid grid-cols-7 px-4">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#8A8A8A]">
            {d}
          </div>
        ))}
      </div>

      {/* ══ Calendar grid ══ */}
      <div className="grid grid-cols-7 gap-1 px-4">
        {days.map((d, i) => {
          const entry = getEntryForDay(d);
          const hasAppointment = !!getAppointmentForDay(d);
          const inMonth = isSameMonth(d, currentMonth);
          const today = isToday(d);
          const selected = selectedDay ? isSameDay(d, selectedDay) : false;

          const firstItem = entry?.outfit?.items?.[0]?.item;
          const thumb =
            firstItem?.bg_removed_url || firstItem?.photo_url || null;

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`relative min-h-[56px] md:min-h-[70px] cursor-pointer overflow-hidden rounded-xl border transition-colors ${
                selected
                  ? 'border-[#C6A47E]'
                  : today
                    ? 'border-[#111111]'
                    : 'border-transparent hover:border-[#EFEFEF]'
              } ${thumb ? '' : 'bg-white'}`}
            >
              {/* Outfit thumbnail background */}
              {thumb && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                    style={{ objectPosition: 'center 15%' }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </>
              )}

              {/* Date number */}
              <div className="absolute left-2 top-1.5">
                {today ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#111111]">
                    <span className="text-[11px] font-medium text-white">
                      {format(d, 'd')}
                    </span>
                  </div>
                ) : (
                  <span
                    className={`text-[11px] font-medium ${
                      inMonth
                        ? thumb
                          ? 'text-white'
                          : 'text-[#111111]'
                        : 'text-[#CFCFCF]'
                    }`}
                  >
                    {format(d, 'd')}
                  </span>
                )}
              </div>

              {/* Appointment gold dot */}
              {hasAppointment && (
                <div className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C6A47E]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ══ Day detail slide-up modal ══ */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1" onClick={() => setSelectedDay(null)} />
          <div className="max-h-[60vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            {/* Handle bar */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E0E0E0]" />

            <div className="flex items-center justify-between">
              <p className="font-serif text-lg capitalize text-[#111111]">
                {format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F0EDE8]"
                aria-label="Fermer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ── Outfit section ── */}
            {selectedEntry?.outfit ? (
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-3">
                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
                  {(() => {
                    const item = selectedEntry.outfit?.items?.[0]?.item;
                    const src =
                      item?.bg_removed_url || item?.photo_url || null;
                    return src ? (
                      <Image
                        src={src}
                        alt=""
                        width={64}
                        height={80}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: 'center 15%' }}
                      />
                    ) : null;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">
                    {selectedEntry.outfit.name}
                  </p>
                  <p className="text-xs text-[#8A8A8A]">
                    {selectedEntry.outfit.items?.length ?? 0} pièces
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(null);
                      setShowAddModal(true);
                    }}
                    className="cursor-pointer text-xs text-[#C6A47E]"
                  >
                    Changer
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveOutfit}
                    className="cursor-pointer text-xs text-[#8A8A8A]"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-[#8A8A8A]">Aucune tenue ce jour</p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 cursor-pointer rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white"
                >
                  Ajouter une tenue
                </button>
              </div>
            )}

            {/* ── Appointment section ── */}
            {selectedAppointment?.event_type && (
              <div className="mt-4">
                <p className="font-serif text-base text-[#111111]">
                  Rendez-vous
                </p>
                <div className="mt-2 rounded-2xl bg-[#111111] p-4">
                  <div className="flex items-center gap-3">
                    {selectedAppointment.client?.avatar_url ? (
                      <Image
                        src={selectedAppointment.client.avatar_url}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333333]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedAppointment.title ||
                          `Session avec ${selectedAppointment.client?.name || 'Styliste'}`}
                      </p>
                      <p className="text-xs text-[#CFCFCF]">
                        {selectedAppointment.duration_min
                          ? `${selectedAppointment.duration_min} min`
                          : ''}
                        {selectedAppointment.event_type
                          ? ` · ${selectedAppointment.event_type}`
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ Add entry modal ══ */}
      {showAddModal && (
        <AddEntryModal
          initialDate={selectedDay || new Date()}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─── Add Entry Modal ─────────────────────────────────────────────────────────
function AddEntryModal({
  initialDate,
  onClose,
  onSaved,
}: {
  initialDate: Date;
  onClose: () => void;
  onSaved: (entry: CalendarEntry) => void;
}) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState(format(initialDate, 'yyyy-MM-dd'));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<Outfit[]>('/outfits').then((res) => {
      if (res.success && res.data) setOutfits(res.data);
      setOutfitsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!selectedOutfit || saving) return;
    setSaving(true);
    const res = await api.post<CalendarEntry>('/calendar', {
      date: dateStr,
      outfit_id: selectedOutfit,
    });
    if (res.success && res.data) {
      onSaved(res.data);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white pb-8">
        {/* Handle */}
        <div className="mx-auto mb-4 mt-3 h-1 w-10 rounded-full bg-[#E0E0E0]" />

        <div className="px-6">
          <h2 className="font-serif text-xl text-[#111111]">
            Ajouter au calendrier
          </h2>

          {/* Date picker */}
          <label className="mb-1 mt-4 block text-xs text-[#8A8A8A]">
            Date
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full rounded-xl border border-[#E0E0E0] px-4 py-3 text-sm text-[#111111] outline-none focus:border-[#111111]"
          />

          {/* Outfit picker label */}
          <p className="mb-3 mt-4 text-xs text-[#8A8A8A]">Choisir un look</p>

          {/* Outfit horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {outfitsLoading ? (
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[140px] w-[120px] flex-shrink-0 animate-pulse rounded-xl bg-[#F0EDE8]"
                />
              ))
            ) : outfits.length === 0 ? (
              <p className="py-6 text-xs text-[#8A8A8A]">
                Aucun look. Créez-en un d&rsquo;abord.
              </p>
            ) : (
              outfits.map((o) => {
                const firstItem = o.items?.[0]?.item;
                const thumb =
                  o.try_on_url ||
                  firstItem?.bg_removed_url ||
                  firstItem?.photo_url ||
                  null;
                const isSelected = selectedOutfit === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setSelectedOutfit(o.id)}
                    className={`relative h-[140px] w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all ${
                      isSelected ? 'ring-2 ring-[#111111]' : ''
                    }`}
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={o.name}
                        fill
                        className="object-cover"
                        style={{ objectPosition: 'center 15%' }}
                        sizes="120px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EDE5DC] p-1 text-center text-[10px] leading-tight text-[#8A8A8A]">
                        {o.name.slice(0, 16)}
                      </div>
                    )}
                    {/* Bottom name overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 pt-4">
                      <p className="truncate text-[10px] text-white">
                        {o.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Create new look option */}
          <a
            href={`/outfits/create?date=${dateStr}`}
            className="mt-3 block text-center text-xs font-medium text-[#C6A47E]"
          >
            Ou créer un nouveau look →
          </a>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedOutfit || saving}
            className="mt-4 w-full cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
