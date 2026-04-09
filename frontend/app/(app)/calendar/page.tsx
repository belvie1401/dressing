'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { CalendarEntry } from '@/types';
import { api } from '@/lib/api';
import CalendarView from '@/components/ui/CalendarView';

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const res = await api.get<CalendarEntry[]>(
        `/calendar?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
      );
      if (res.success && res.data) {
        setEntries(res.data);
      }
    };
    load();
  }, []);

  const selectedEntry = selectedDate
    ? entries.find(
        (e) => format(new Date(e.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
    : null;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[#0D0D0D] pt-2">Agenda</h1>

      <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <CalendarView entries={entries} onDayClick={setSelectedDate} />
      </div>

      {selectedDate && (
        <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 className="mb-2 text-sm font-semibold text-[#0D0D0D]">
            {format(selectedDate, 'dd MMMM yyyy')}
          </h3>
          {selectedEntry ? (
            <div>
              <p className="text-sm text-[#0D0D0D]">
                Tenue : {selectedEntry.outfit?.name || 'Non définie'}
              </p>
              {selectedEntry.notes && (
                <p className="mt-1 text-xs text-[#8A8A8A]">{selectedEntry.notes}</p>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[#8A8A8A]">Aucune tenue planifiée</p>
              <a href="/outfits" className="mt-2 inline-block text-xs font-medium text-[#0D0D0D] underline">
                Choisir une tenue
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
