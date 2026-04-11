'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { User } from '@/types';

/* ── Duration options ── */
const durations = [
  { label: '30 min', price: 49, minutes: 30 },
  { label: '60 min', price: 79, minutes: 60 },
  { label: '90 min', price: 99, minutes: 90 },
];

/* ── Time slots ── */
const slots = ['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

/* ── Calendar helpers ── */
const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  // Monday = 0 offset
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  return days;
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const today = new Date();

  const [stylist, setStylist] = useState<User | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1); // index, default 60 min
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('15:00');
  const [toast, setToast] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await api.get<User[]>('/stylists');
      if (!mounted) return;
      if (res.success && res.data) {
        const found = res.data.find((s) => s.id === id);
        if (found) setStylist(found);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const calDays = getCalendarDays(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const handleDateClick = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    if (selectedDate && isSameDay(selectedDate, d)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(d);
    }
  };

  const handleContinue = async () => {
    if (!selectedDate || !selectedSlot) {
      setToast('Veuillez sélectionner une date et un créneau');
      setTimeout(() => setToast(''), 3000);
      return;
    }
    setSubmitting(true);
    const [hh, mm] = selectedSlot.split(':').map(Number);
    const dt = new Date(selectedDate);
    dt.setHours(hh, mm, 0, 0);
    const res = await api.post('/calendar/book', {
      stylist_id: id,
      date: dt.toISOString(),
      duration_min: dur.minutes,
      price: dur.price,
    });
    setSubmitting(false);
    if (res.success) {
      setShowConfirm(true);
    } else {
      setToast(res.error || 'Erreur lors de la réservation');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const dur = durations[selectedDuration];
  const formattedDate = selectedDate
    ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
    : '';
  const rating = (stylist?.style_profile as Record<string, unknown> | undefined)?.rating as number | undefined;
  const reviews = (stylist?.style_profile as Record<string, unknown> | undefined)?.reviews as number | undefined;

  return (
    <div className="pb-36">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 mb-5">
        <Link
          href={`/stylists/${id}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="font-serif text-[18px] font-semibold text-[#111111]">R&eacute;server une session</h1>
      </div>

      {/* Stylist summary card */}
      <div className="mx-5 mb-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EDE5DC]">
          {stylist?.avatar_url ? (
            <Image
              src={stylist.avatar_url}
              alt={stylist.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-semibold text-[#C6A47E]">
                {stylist?.name?.charAt(0) ?? ''}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#111111]">
            {stylist?.name ?? ''}
          </p>
          <p className="text-[12px] text-[#8A8A8A]">Styliste</p>
          {rating != null ? (
            <div className="mt-0.5 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#C6A47E" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[12px] text-[#C6A47E]">
                {rating}
                {reviews != null ? ` (${reviews} avis)` : ''}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── SECTION 1: Durée ── */}
      <div className="mx-5 mb-6">
        <h2 className="font-serif text-[16px] font-semibold text-[#111111] mb-3">Choisissez une dur&eacute;e</h2>
        <div className="grid grid-cols-3 gap-3">
          {durations.map((d, i) => (
            <button
              key={d.label}
              onClick={() => setSelectedDuration(i)}
              className={`rounded-2xl bg-white p-3 text-center border-2 transition-all shadow-sm ${
                selectedDuration === i ? 'border-[#111111]' : 'border-transparent'
              }`}
            >
              <p className="text-[14px] font-bold text-[#111111]">{d.label}</p>
              <p className="text-[12px] text-[#8A8A8A]">{d.price}&euro;</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: Date (Calendar) ── */}
      <div className="mx-5 mb-6">
        <h2 className="font-serif text-[16px] font-semibold text-[#111111] mb-3">Choisissez une date</h2>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F0EDE8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#111111]">
              {monthNames[calMonth]} {calYear}
            </span>
            <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F0EDE8]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {dayHeaders.map((dh) => (
              <div key={dh} className="text-center text-[11px] font-medium text-[#8A8A8A] py-1">{dh}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {calDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const cellDate = new Date(calYear, calMonth, day);
              const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const isToday = isSameDay(cellDate, today);
              const isSelected = selectedDate ? isSameDay(selectedDate, cellDate) : false;

              return (
                <button
                  key={`d${day}`}
                  disabled={isPast}
                  onClick={() => handleDateClick(day)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all ${
                    isSelected
                      ? 'bg-[#111111] font-bold text-white'
                      : isPast
                        ? 'text-[#CFCFCF] cursor-not-allowed'
                        : 'bg-[#F0EDE8] text-[#111111] hover:bg-[#111111] hover:text-white'
                  } ${isToday && !isSelected ? 'underline' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Créneaux ── */}
      {selectedDate && (
        <div className="mx-5 mb-6">
          <h2 className="font-serif text-[16px] font-semibold text-[#111111] mb-3">Cr&eacute;neaux disponibles</h2>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedSlot === slot
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F0EDE8] text-[#111111]'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA Fixed bottom ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#F0EDE8] px-5 py-4" style={{ background: '#F7F5F2' }}>
        <button
          onClick={handleContinue}
          disabled={submitting}
          className="w-full rounded-full py-4 text-base font-semibold text-white disabled:opacity-60"
          style={{ background: '#D4785C' }}
        >
          {submitting ? 'Réservation...' : 'Continuer'}
        </button>
        <div className="mt-2 flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs text-[#8A8A8A]">Paiement s&eacute;curis&eacute;</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-8">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-semibold text-[#111111]">Session confirm&eacute;e !</h2>
            <div className="mt-4 space-y-2 text-sm text-[#8A8A8A]">
              <p>
                <span className="font-medium text-[#111111]">Styliste :</span> {stylist?.name ?? ''}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Date :</span> {formattedDate}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Dur&eacute;e :</span> {dur.label}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Cr&eacute;neau :</span> {selectedSlot}
              </p>
              <p>
                <span className="font-medium text-[#111111]">Prix :</span> {dur.price}&euro;
              </p>
            </div>
            <Link
              href="/messages"
              className="mt-6 inline-block w-full rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white"
            >
              Acc&eacute;der au chat
            </Link>
            <button
              onClick={() => setShowConfirm(false)}
              className="mt-2 w-full py-2 text-sm text-[#8A8A8A]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
