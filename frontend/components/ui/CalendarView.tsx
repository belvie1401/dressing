'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import type { CalendarEntry } from '@/types';

interface CalendarViewProps {
  entries: CalendarEntry[];
  onDayClick: (date: Date) => void;
}

export default function CalendarView({ entries, onDayClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: fr });
  const calEnd = endOfWeek(monthEnd, { locale: fr });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const getEntryForDay = (day: Date) =>
    entries.find((e) => isSameDay(new Date(e.date), day));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-sm font-semibold capitalize text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-gray-400 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const entry = getEntryForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                !isCurrentMonth
                  ? 'text-gray-300'
                  : isToday
                  ? 'bg-black text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {format(day, 'd')}
              {entry && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-purple-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
