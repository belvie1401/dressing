'use client';

import { useState, useEffect } from 'react';
import type { WeatherData } from '@/types';
import { api } from '@/lib/api';

export default function WeatherBanner() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const res = await api.get<WeatherData>('/weather/current?city=Paris');
        if (res.success && res.data) {
          setWeather(res.data);
        }
      } catch {
        // silently fail
      }
    };
    loadWeather();
  }, []);

  if (!weather) {
    return (
      <div className="animate-pulse rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="h-14" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--color-app-bg)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-[#0D0D0D]">{weather.temp}°C</p>
            <p className="text-xs capitalize text-[#8A8A8A]">{weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-[#0D0D0D]">{weather.city}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8A8A8A]">
            {weather.humidity}% · {weather.wind_speed} km/h
          </div>
        </div>
      </div>
      <a
        href="/outfits/create"
        className="mt-3 flex items-center gap-2 text-xs font-medium text-[#0D0D0D]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        Tenue suggérée pour aujourd&apos;hui
      </a>
    </div>
  );
}
