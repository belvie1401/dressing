'use client';

import { useState } from 'react';
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold capitalize text-[#0D0D0D]">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((name) => (
          <div key={name} className="py-1 text-center text-xs font-medium text-[#8A8A8A]">
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
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors ${
                !isCurrentMonth
                  ? 'text-[#E5E5E5]'
                  : isToday
                  ? 'bg-[#0D0D0D] font-semibold text-white'
                  : 'text-[#0D0D0D] hover:bg-[#F0F0F0]'
              }`}
            >
              {format(day, 'd')}
              {entry && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#0D0D0D]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
