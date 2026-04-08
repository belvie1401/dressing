'use client';

import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Sparkles } from 'lucide-react';
import type { WeatherData } from '@/types';
import { api } from '@/lib/api';
import Link from 'next/link';

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
      <div className="animate-pulse rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 p-4">
        <div className="h-16" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/80 p-2">
            <Cloud className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{weather.temp}°C</p>
            <p className="text-xs capitalize text-gray-500">{weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{weather.city}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <Droplets className="h-3 w-3" />
            {weather.humidity}%
            <Wind className="h-3 w-3 ml-1" />
            {weather.wind_speed} km/h
          </div>
        </div>
      </div>
      <Link
        href="/outfits/create"
        className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700"
      >
        <Sparkles className="h-3 w-3" />
        Tenue suggérée pour aujourd&apos;hui
      </Link>
    </div>
  );
}
