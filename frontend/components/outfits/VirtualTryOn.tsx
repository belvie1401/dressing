'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

interface VirtualTryOnProps {
  outfitId: string;
  tryOnUrl?: string;
}

type TryOnState = 'idle' | 'no_avatar' | 'not_configured' | 'generating' | 'done' | 'error';

export default function VirtualTryOn({ outfitId, tryOnUrl }: VirtualTryOnProps) {
  const user = useAuthStore((s) => s.user);
  const hasAvatar = !!user?.avatar_body_url;

  const [state, setState] = useState<TryOnState>(() => {
    if (tryOnUrl) return 'done';
    return hasAvatar ? 'idle' : 'no_avatar';
  });
  const [imageUrl, setImageUrl] = useState(tryOnUrl || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!hasAvatar) {
      setState('no_avatar');
      return;
    }

    setState('generating');
    setErrorMsg('');

    const res = await api.post<{ url: string; cached: boolean }>(
      `/outfits/${outfitId}/try-on`,
      {},
    );

    if (res.success && res.data?.url) {
      setImageUrl(res.data.url);
      setState('done');
      return;
    }

    const err = res as unknown as { message?: string; error?: string };
    if (err.error === 'TRYON_NOT_CONFIGURED') {
      setState('not_configured');
      return;
    }
    setErrorMsg(err.message || 'Essayage virtuel indisponible');
    setState('error');
  };

  return (
    <div className="space-y-4">
      {state === 'done' && imageUrl ? (
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Essayage virtuel" className="w-full" />
        </div>
      ) : state === 'not_configured' ? (
        <div className="rounded-2xl bg-[#FFF8F6] p-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="font-serif text-base text-[#111111]">Essayage virtuel non disponible</p>
          <p className="mt-2 text-xs text-[#8A8A8A]">
            Le service d&rsquo;essayage n&rsquo;est pas encore configur&eacute;. Revenez bientôt !
          </p>
        </div>
      ) : state === 'no_avatar' ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p className="font-serif text-sm text-[#111111]">Ajoutez votre photo de r&eacute;f&eacute;rence</p>
          <p className="text-xs text-[#8A8A8A]">Pour visualiser cette tenue sur vous</p>
          <a
            href="/profile#avatar"
            className="rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white"
          >
            Configurer mon avatar
          </a>
        </div>
      ) : state === 'error' ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm text-[#D4785C]">{errorMsg}</p>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full border border-[#111111] px-5 py-2 text-sm font-medium text-[#111111]"
          >
            R&eacute;essayer
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white py-12" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0D0D0D]">Essayage virtuel</p>
          <p className="text-xs text-[#8A8A8A]">Visualisez cette tenue sur vous</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state === 'generating'}
            className="flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {state === 'generating' ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                G&eacute;n&eacute;ration...
              </>
            ) : (
              'Essayer virtuellement'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
