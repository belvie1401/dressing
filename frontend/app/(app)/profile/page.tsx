'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useWardrobeStore } from '@/lib/store';
import StyleDNAProfile from '@/components/ai/StyleDNAProfile';
import type { Subscription } from '@/types';
import { api } from '@/lib/api';

const planLabels: Record<string, string> = {
  FREE: 'Gratuit',
  CLIENT_PRO: 'Client Pro',
  STYLIST_PRO: 'Styliste Pro',
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { items, loadItems } = useWardrobeStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadItems();
    const loadSub = async () => {
      const res = await api.get<Subscription>('/subscriptions');
      if (res.success && res.data) {
        setSubscription(res.data);
      }
    };
    loadSub();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const totalWorn = items.filter((i) => i.wear_count > 0).length;
  const neverWorn = items.filter((i) => i.wear_count === 0).length;
  const neverWornPercent = items.length > 0 ? Math.round((neverWorn / items.length) * 100) : 0;
  const mostWorn = items.length > 0
    ? items.reduce((max, i) => (i.wear_count > max.wear_count ? i : max), items[0])
    : null;

  const colorCounts: Record<string, number> = {};
  for (const item of items) {
    for (const color of item.colors) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  const favoriteColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-5">
      {/* User info */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xl font-bold text-white">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0) || '?'
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#0D0D0D]">{user?.name}</h1>
          <p className="text-sm text-[#8A8A8A]">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-[#F0F0F0] px-2.5 py-0.5 text-xs font-medium text-[#0D0D0D]">
            {user?.role === 'STYLIST' ? 'Styliste' : 'Client'}
          </span>
        </div>
      </div>

      {/* Subscription */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0D0D0D]">
              {planLabels[(subscription as any)?.plan] || 'Gratuit'}
            </p>
            <p className="text-xs text-[#8A8A8A]">
              {subscription?.status === 'active' ? 'Actif' : 'Inactif'}
            </p>
          </div>
        </div>
        {(!subscription || (subscription as any)?.plan === 'FREE') && (
          <button className="rounded-full bg-[#0D0D0D] px-4 py-2 text-xs font-medium text-white">
            Passer au Pro
          </button>
        )}
      </div>

      {/* Style DNA */}
      <StyleDNAProfile />

      {/* Wardrobe stats */}
      <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h2 className="mb-3 text-sm font-semibold text-[#0D0D0D]">Statistiques du dressing</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#0D0D0D]">{items.length}</p>
            <p className="text-xs text-[#8A8A8A]">Total articles</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#0D0D0D]">{totalWorn}</p>
            <p className="text-xs text-[#8A8A8A]">Portés</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#0D0D0D]">{neverWornPercent}%</p>
            <p className="text-xs text-[#8A8A8A]">Jamais portés</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-lg font-bold text-[#0D0D0D]">{favoriteColor || '-'}</p>
            <p className="text-xs text-[#8A8A8A]">Couleur favorite</p>
          </div>
        </div>
        {mostWorn && mostWorn.wear_count > 0 && (
          <p className="mt-3 text-xs text-[#8A8A8A]">
            Article le plus porté : <strong className="text-[#0D0D0D]">{mostWorn.brand || mostWorn.category}</strong> ({mostWorn.wear_count} fois)
          </p>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-sm font-medium text-red-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Se déconnecter
      </button>
    </div>
  );
}
