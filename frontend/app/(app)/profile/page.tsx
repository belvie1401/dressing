'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Crown } from 'lucide-react';
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

  // Favorite color
  const colorCounts: Record<string, number> = {};
  for (const item of items) {
    for (const color of item.colors) {
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }
  }
  const favoriteColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-500">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0) || '?'
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{user?.name}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {user?.role === 'STYLIST' ? 'Styliste' : 'Client'}
          </span>
        </div>
      </div>

      {/* Subscription */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {planLabels[(subscription as any)?.plan] || 'Gratuit'}
            </p>
            <p className="text-xs text-gray-500">
              {subscription?.status === 'active' ? 'Actif' : 'Inactif'}
            </p>
          </div>
        </div>
        {(!subscription || (subscription as any)?.plan === 'FREE') && (
          <button className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-800">
            Passer au Pro
          </button>
        )}
      </div>

      {/* Style DNA */}
      <StyleDNAProfile />

      {/* Wardrobe stats */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Statistiques du dressing</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-500">Total articles</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalWorn}</p>
            <p className="text-xs text-gray-500">Portés</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{neverWornPercent}%</p>
            <p className="text-xs text-gray-500">Jamais portés</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-lg font-bold text-gray-900">{favoriteColor || '-'}</p>
            <p className="text-xs text-gray-500">Couleur favorite</p>
          </div>
        </div>
        {mostWorn && mostWorn.wear_count > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            Article le plus porté : <strong>{mostWorn.brand || mostWorn.category}</strong> ({mostWorn.wear_count} fois)
          </p>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </button>
    </div>
  );
}
