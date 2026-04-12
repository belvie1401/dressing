'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CalendarEntry, Outfit } from '@/types';
import { api } from '@/lib/api';
import CalendarView from '@/components/ui/CalendarView';

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'calendrier' | 'historique'>('calendrier');
  const [showAddModal, setShowAddModal] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<CalendarEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const now = new Date();
    api
      .get<CalendarEntry[]>(`/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then((res) => {
        if (res.success && res.data) setEntries(res.data);
      });
  }, []);

  useEffect(() => {
    if (activeTab !== 'historique') return;
    setHistoryLoading(true);
    const promises = [-2, -1, 0].map((offset) => {
      const d = new Date();
      d.setMonth(d.getMonth() + offset);
      return api.get<CalendarEntry[]>(`/calendar?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
    });
    Promise.all(promises).then((results) => {
      const all: CalendarEntry[] = [];
      for (const r of results) {
        if (r.success && r.data) all.push(...r.data);
      }
      const past = all
        .filter((e) => e.outfit_id && new Date(e.date) <= new Date())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistoryEntries(past);
      setHistoryLoading(false);
    });
  }, [activeTab]);

  const selectedEntry = selectedDate
    ? entries.find((e) => isSameDay(new Date(e.date), selectedDate))
    : null;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="font-serif text-2xl text-[#111111]">Agenda</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-sm font-medium text-[#C6A47E]"
        >
          + Ajouter
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 rounded-2xl bg-[#F0EDE8] p-1">
        {(['calendrier', 'historique'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-[#111111] shadow-sm' : 'text-[#8A8A8A]'
            }`}
          >
            {tab === 'calendrier' ? 'Calendrier' : 'Historique'}
          </button>
        ))}
      </div>

      {activeTab === 'calendrier' ? (
        <>
          {/* Calendar */}
          <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <CalendarView entries={entries} onDayClick={setSelectedDate} />
          </div>

          {/* Day detail */}
          {selectedDate && (
            <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="mb-3 text-sm font-semibold capitalize text-[#111111]">
                {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
              </h3>

              {selectedEntry?.outfit ? (
                <div className="flex items-center gap-3">
                  {/* Outfit thumbnail */}
                  {(() => {
                    const firstItem = selectedEntry.outfit?.items?.[0]?.item;
                    const thumb = selectedEntry.outfit?.try_on_url || firstItem?.bg_removed_url || firstItem?.photo_url || null;
                    return thumb ? (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
                        <Image src={thumb} alt={selectedEntry.outfit!.name} fill className="object-cover" sizes="64px" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDE5DC]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                    );
                  })()}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111111]">{selectedEntry.outfit.name}</p>
                    {selectedEntry.outfit.items && (
                      <p className="text-xs text-[#8A8A8A]">{selectedEntry.outfit.items.length} pièce{selectedEntry.outfit.items.length > 1 ? 's' : ''}</p>
                    )}
                    {selectedEntry.notes && (
                      <p className="mt-1 text-xs text-[#8A8A8A]">{selectedEntry.notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  <p className="font-serif text-sm text-[#111111]">Qu&apos;est-ce que vous portez aujourd&apos;hui&nbsp;?</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-3 rounded-2xl border border-[#E0E0E0] p-3 text-left transition-colors hover:bg-[#F7F5F2]"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F0EDE8]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111111]">Choisir depuis mes looks</p>
                        <p className="text-xs text-[#8A8A8A]">Sélectionner un look existant</p>
                      </div>
                    </button>
                    <a
                      href="/outfits/create"
                      className="flex items-center gap-3 rounded-2xl border border-[#E0E0E0] p-3 transition-colors hover:bg-[#F7F5F2]"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F0EDE8]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111111]">Créer un nouveau look</p>
                        <p className="text-xs text-[#8A8A8A]">Assembler des pièces</p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* History tab */
        <div className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
            </div>
          ) : historyEntries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[#8A8A8A]">Aucun look enregistré pour l&apos;instant</p>
              <button
                type="button"
                onClick={() => { setActiveTab('calendrier'); setShowAddModal(true); }}
                className="mt-3 text-xs font-medium text-[#C6A47E]"
              >
                Ajouter un look
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F7F5F2]">
              {historyEntries.map((e) => {
                const d = new Date(e.date);
                const firstItem = e.outfit?.items?.[0]?.item;
                const thumb = e.outfit?.try_on_url || firstItem?.bg_removed_url || firstItem?.photo_url || null;
                const pieces = e.outfit?.items?.length ?? 0;
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Date badge */}
                    <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-[#F0EDE8]">
                      <span className="font-serif text-lg leading-none text-[#111111]">{format(d, 'd')}</span>
                      <span className="text-[10px] text-[#8A8A8A]">{format(d, 'MMM', { locale: fr })}</span>
                    </div>
                    {/* Outfit thumbnail */}
                    {thumb ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                        <Image src={thumb} alt={e.outfit?.name || ''} fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#EDE5DC]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </div>
                    )}
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#111111]">{e.outfit?.name || 'Look sans nom'}</p>
                      <p className="text-xs text-[#8A8A8A]">
                        {pieces} pièce{pieces > 1 ? 's' : ''}
                        {e.weather_data && (
                          <span className="ml-2">
                            · {(e.weather_data as Record<string, unknown>).description as string}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <AddEntryModal
          initialDate={selectedDate || new Date()}
          onClose={() => setShowAddModal(false)}
          onSaved={(entry) => {
            setEntries((prev) => {
              const without = prev.filter((e) => !isSameDay(new Date(e.date), new Date(entry.date)));
              return [...without, entry];
            });
            setShowAddModal(false);
          }}
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
  const [source, setSource] = useState<'looks' | 'new'>('looks');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [outfitsLoading, setOutfitsLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const dateStr = format(initialDate, 'yyyy-MM-dd');

  useEffect(() => {
    api.get<Outfit[]>('/outfits').then((res) => {
      if (res.success && res.data) setOutfits(res.data);
      setOutfitsLoading(false);
    });
  }, []);

  const filteredOutfits = outfits.filter(
    (o) => !search || o.name.toLowerCase().includes(search.toLowerCase()),
  );

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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white pb-8">
        {/* Handle */}
        <div className="mx-auto mb-4 mt-3 h-1 w-10 rounded-full bg-[#E0E0E0]" />
        <div className="px-6">
          <h2 className="font-serif text-xl text-[#111111]">Ajouter au calendrier</h2>
          <p className="mt-1 text-sm capitalize text-[#8A8A8A]">
            {format(initialDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>

          {/* Source toggle */}
          <div className="mt-4 flex gap-1 rounded-2xl bg-[#F0EDE8] p-1">
            {(['looks', 'new'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSource(s)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                  source === s ? 'bg-white text-[#111111] shadow-sm' : 'text-[#8A8A8A]'
                }`}
              >
                {s === 'looks' ? 'Depuis mes looks' : 'Nouveau look'}
              </button>
            ))}
          </div>

          {source === 'new' ? (
            <div className="mt-4">
              <a
                href={`/outfits/create?date=${dateStr}`}
                className="block w-full rounded-full bg-[#111111] py-3 text-center text-sm font-semibold text-white"
              >
                Cr&eacute;er un look &rarr;
              </a>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="mt-4 flex items-center gap-2 rounded-full bg-[#F7F5F2] px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un look…"
                  className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#CFCFCF] focus:outline-none"
                />
              </div>

              {/* Outfit grid */}
              <div className="mt-3 max-h-52 overflow-y-auto">
                {outfitsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-xl bg-[#F0EDE8]" />
                    ))}
                  </div>
                ) : filteredOutfits.length === 0 ? (
                  <p className="py-6 text-center text-xs text-[#8A8A8A]">Aucun look trouvé</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {filteredOutfits.map((o) => {
                      const firstItem = o.items?.[0]?.item;
                      const thumb = o.try_on_url || firstItem?.bg_removed_url || firstItem?.photo_url || null;
                      const isSelected = selectedOutfit === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => setSelectedOutfit(o.id)}
                          className={`relative aspect-square overflow-hidden rounded-xl transition-all ${
                            isSelected ? 'ring-2 ring-[#111111]' : ''
                          }`}
                        >
                          {thumb ? (
                            <Image src={thumb} alt={o.name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#EDE5DC] p-1 text-center text-[10px] leading-tight text-[#8A8A8A]">
                              {o.name.slice(0, 12)}
                            </div>
                          )}
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
                    })}
                  </div>
                )}
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!selectedOutfit || saving}
                className="mt-4 w-full rounded-full bg-[#111111] py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
