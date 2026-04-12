'use client';

import { useEffect, useRef, useState } from 'react';
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
  const { user, logout, loadUser } = useAuthStore();
  const { items, loadItems } = useWardrobeStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [avatarBodyUrl, setAvatarBodyUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarToast, setAvatarToast] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadItems();
    // Refresh user from server so a freshly-uploaded avatar_body_url is
    // visible without a hard reload.
    loadUser();
    const loadSub = async () => {
      const res = await api.get<Subscription>('/subscriptions');
      if (res.success && res.data) {
        setSubscription(res.data);
      }
    };
    loadSub();
  }, []);

  // Mirror server state into local state so the preview updates instantly
  // after upload + after a hydration round-trip.
  useEffect(() => {
    setAvatarBodyUrl(user?.avatar_body_url || null);
  }, [user?.avatar_body_url]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ─── Avatar upload ────────────────────────────────────────────────────────
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Optimistic preview
    const localPreview = URL.createObjectURL(file);
    setAvatarBodyUrl(localPreview);
    setUploadingAvatar(true);

    const body = new FormData();
    body.append('photo', file);
    const res = await api.post<{ id: string; avatar_body_url: string | null }>(
      '/auth/upload-body-photo',
      body,
    );

    if (res.success && res.data?.avatar_body_url) {
      setAvatarBodyUrl(res.data.avatar_body_url);
      setAvatarToast('Photo de référence sauvegardée !');
      // Refresh the auth store so other pages see the new avatar
      loadUser();
    } else {
      const err = res as unknown as { message?: string; error?: string };
      setAvatarBodyUrl(user?.avatar_body_url || null);
      setAvatarToast(err.message || err.error || "Échec de l'envoi de la photo");
    }
    setUploadingAvatar(false);
    setTimeout(() => setAvatarToast(''), 3500);
  };

  const removeAvatar = async () => {
    if (!avatarBodyUrl) return;
    setUploadingAvatar(true);
    const res = await api.put<{ avatar_body_url: string | null }>('/auth/profile', {
      avatar_body_url: null,
    });
    if (res.success) {
      setAvatarBodyUrl(null);
      setAvatarToast('Photo retirée');
      loadUser();
    }
    setUploadingAvatar(false);
    setTimeout(() => setAvatarToast(''), 3000);
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
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EDE5DC] text-xl font-bold text-[#C6A47E]">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0) || '?'
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-[#111111]">{user?.name}</h1>
          <p className="text-sm text-[#8A8A8A]">{user?.email}</p>
          <span className="mt-1 inline-block rounded-full bg-[#F0EDE8] px-2.5 py-0.5 text-xs font-medium text-[#111111]">
            {user?.role === 'STYLIST' ? 'Styliste' : 'Client'}
          </span>
        </div>
      </div>

      {/* Subscription */}
      <div className="flex items-center justify-between rounded-2xl border border-[#C6A47E] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE5DC]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#C6A47E" stroke="#C6A47E" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">
              {planLabels[(subscription as any)?.plan] || 'Gratuit'}
            </p>
            <p className="text-xs text-[#8A8A8A]">
              {subscription?.status === 'active' ? 'Actif' : 'Inactif'}
            </p>
          </div>
        </div>
        {(!subscription || (subscription as any)?.plan === 'FREE') && (
          <a href="/pricing" className="rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white">
            Passer au Pro
          </a>
        )}
      </div>

      {/* Style DNA */}
      <StyleDNAProfile />

      {/* ════════ MON AVATAR ════════ */}
      <div id="avatar" className="scroll-mt-4">
        <h2 className="font-serif text-lg text-[#111111]">Mon avatar</h2>
        <p className="mt-1 text-xs text-[#8A8A8A]">
          Prenez une photo de référence pour visualiser les vêtements sur vous.
        </p>

        <div className="mt-3 rounded-3xl bg-white p-5 shadow-sm">
          {!avatarBodyUrl ? (
            <div className="flex flex-col items-center py-2">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-[#CFCFCF]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <p className="mt-4 font-serif text-sm text-[#111111]">
                Ajouter ma photo de référence
              </p>

              <p className="mt-2 text-xs text-[#8A8A8A]">Pour de meilleurs résultats :</p>

              <ul className="mt-2 flex flex-col gap-1">
                {[
                  'Photo de face, corps entier visible',
                  'Fond uni de préférence',
                  'Bonne luminosité',
                  'Vêtements ajustés ou près du corps',
                ].map((tip) => (
                  <li key={tip} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6A47E]" />
                    <span className="text-xs text-[#8A8A8A]">{tip}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="cursor-pointer rounded-full bg-[#111111] px-5 py-2.5 text-sm text-white disabled:opacity-60"
                >
                  Prendre une photo
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="cursor-pointer rounded-full border border-[#111111] px-5 py-2.5 text-sm text-[#111111] disabled:opacity-60"
                >
                  Choisir dans galerie
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative h-32 w-24 overflow-hidden rounded-2xl bg-[#F0EDE8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarBodyUrl}
                  alt="Photo de référence"
                  className="h-full w-full object-cover object-top"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                      <circle cx="12" cy="12" r="10" opacity="0.3" />
                      <path d="M22 12a10 10 0 0 1-10 10" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <p className="font-serif text-base text-[#111111]">Photo de référence</p>
                <p className="mt-1 text-xs text-[#8A8A8A]">
                  Utilisée pour l&rsquo;essayage virtuel
                </p>

                <div className="mt-3 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="cursor-pointer text-left text-xs font-medium text-[#C6A47E] disabled:opacity-60"
                  >
                    Changer la photo
                  </button>
                  <button
                    type="button"
                    onClick={removeAvatar}
                    disabled={uploadingAvatar}
                    className="cursor-pointer text-left text-xs text-[#8A8A8A] disabled:opacity-60"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}

          {avatarToast && (
            <p className="mt-4 rounded-xl bg-[#F0EDE8] px-3 py-2 text-center text-xs text-[#111111]">
              {avatarToast}
            </p>
          )}
        </div>

        {/* Hidden file inputs (camera + gallery) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleAvatarFile}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFile}
          className="hidden"
        />
      </div>

      {/* Wardrobe stats */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-serif mb-3 text-sm font-semibold text-[#111111]">Statistiques du dressing</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#111111]">{items.length}</p>
            <p className="text-[11px] text-[#8A8A8A]">Articles</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#111111]">{totalWorn}</p>
            <p className="text-[11px] text-[#8A8A8A]">Port&eacute;s</p>
          </div>
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-2xl font-bold text-[#111111]">{neverWornPercent}%</p>
            <p className="text-[11px] text-[#8A8A8A]">Jamais port&eacute;s</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
            <p className="text-lg font-bold text-[#111111]">{favoriteColor || '-'}</p>
            <p className="text-[11px] text-[#8A8A8A]">Couleur favorite</p>
          </div>
          {mostWorn && mostWorn.wear_count > 0 && (
            <div className="rounded-2xl p-3 text-center" style={{ background: 'var(--color-app-bg)' }}>
              <p className="text-lg font-bold text-[#111111] truncate">{mostWorn.brand || mostWorn.category}</p>
              <p className="text-[11px] text-[#8A8A8A]">Plus port&eacute; ({mostWorn.wear_count}x)</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-[#8A8A8A] hover:text-[#D4785C] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Se d&eacute;connecter
      </button>
    </div>
  );
}
