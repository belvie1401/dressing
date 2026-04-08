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
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Agenda</h1>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <CalendarView entries={entries} onDayClick={setSelectedDate} />
      </div>

      {selectedDate && (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-gray-900">
            {format(selectedDate, 'dd MMMM yyyy')}
          </h3>
          {selectedEntry ? (
            <div>
              <p className="text-sm text-gray-700">
                Tenue : {selectedEntry.outfit?.name || 'Non définie'}
              </p>
              {selectedEntry.notes && (
                <p className="mt-1 text-xs text-gray-500">{selectedEntry.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucune tenue planifiée</p>
          )}
        </div>
      )}
    </div>
  );
}
