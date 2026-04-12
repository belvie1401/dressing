'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

type TryOnState =
  | 'idle' // has avatar, hasn't generated yet (or cleared)
  | 'no_avatar' // user hasn't uploaded a body photo yet
  | 'not_configured' // REPLICATE_API_TOKEN not set on the server
  | 'generating'
  | 'done'
  | 'error';

interface TryOnSectionProps {
  itemId: string;
  itemPhotoUrl: string;
  category: Category;
  /** Cached try-on URL coming from the server (clothing_item.try_on_url). */
  initialTryOnUrl?: string | null;
}

const PROGRESS_MESSAGES = [
  'Analyse de votre silhouette…',
  'Application du vêtement…',
  'Finalisation des détails…',
];

const ACCESSORY_LIKE: Category[] = ['SHOES', 'ACCESSORY'];

/**
 * "Essayage virtuel" card on the wardrobe item detail page.
 *
 * Owns its own state machine + Replicate API call. Reads the user from the
 * auth store to know whether a reference body photo exists, and self-triggers
 * generation when the URL contains `#tryon`.
 */
export default function TryOnSection({
  itemId,
  itemPhotoUrl,
  category,
  initialTryOnUrl,
}: TryOnSectionProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hasAvatar = !!user?.avatar_body_url;

  const [tryOnUrl, setTryOnUrl] = useState<string | null>(initialTryOnUrl || null);
  const [state, setState] = useState<TryOnState>(() => {
    if (initialTryOnUrl) return 'done';
    return hasAvatar ? 'idle' : 'no_avatar';
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [progressIdx, setProgressIdx] = useState(0);
  const autoStartRef = useRef(false);

  // Sync state when avatar appears (e.g. user uploaded one then came back)
  useEffect(() => {
    if (state === 'no_avatar' && hasAvatar) {
      setState('idle');
    }
  }, [hasAvatar, state]);

  // Cycle progress messages while generating
  useEffect(() => {
    if (state !== 'generating') return;
    const t = setInterval(() => {
      setProgressIdx((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, 5000);
    return () => clearInterval(t);
  }, [state]);

  const generateTryOn = async (force = false) => {
    if (!hasAvatar) {
      setState('no_avatar');
      return;
    }

    setState('generating');
    setErrorMsg('');
    setProgressIdx(0);

    const res = await api.post<{ url: string; cached: boolean }>(
      '/wardrobe/try-on',
      { item_id: itemId, force },
    );

    if (res.success && res.data?.url) {
      setTryOnUrl(res.data.url);
      setState('done');
      return;
    }

    const err = res as unknown as { message?: string; error?: string };
    if (err.error === 'NO_AVATAR') {
      setState('no_avatar');
      return;
    }
    if (err.error === 'TRYON_NOT_CONFIGURED') {
      setState('not_configured');
      return;
    }
    const msg = err.message || err.error || 'Essayage virtuel indisponible';
    setErrorMsg(msg.includes('timeout') ? 'Délai dépassé. Réessayez.' : msg);
    setState('error');
  };

  // Auto-trigger when navigated with #tryon hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (autoStartRef.current) return;
    if (window.location.hash !== '#tryon') return;
    autoStartRef.current = true;

    // Smooth scroll into view
    requestAnimationFrame(() => {
      const el = document.getElementById('tryon');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // If we already have a cached result there's nothing to generate
    if (initialTryOnUrl) return;
    if (hasAvatar) {
      generateTryOn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAvatar, initialTryOnUrl]);

  const handleDownload = () => {
    if (!tryOnUrl) return;
    const a = document.createElement('a');
    a.href = tryOnUrl;
    a.download = `essayage-${itemId}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  const handleShare = async () => {
    if (!tryOnUrl) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: 'Mon essayage virtuel',
          url: tryOnUrl,
        });
        return;
      } catch {
        // user canceled — fall through
      }
    }
    try {
      await navigator.clipboard.writeText(tryOnUrl);
    } catch {
      // ignore
    }
  };

  const isAccessory = ACCESSORY_LIKE.includes(category);

  return (
    <div id="tryon" className="overflow-hidden rounded-3xl bg-white shadow-sm scroll-mt-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h3 className="font-serif text-base text-[#111111]">Essayage virtuel</h3>
        <span className="rounded-full bg-[#C6A47E] px-2 py-0.5 text-[9px] font-medium text-[#111111]">
          Nouveau
        </span>
      </div>

      {/* ── No avatar yet ── */}
      {state === 'no_avatar' && (
        <div className="p-5 pt-0 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p className="mt-3 font-serif text-sm text-[#111111]">
            Ajoutez votre photo de référence
          </p>
          <p className="mt-1 text-xs text-[#8A8A8A]">
            Pour visualiser ce vêtement sur vous
          </p>
          <button
            type="button"
            onClick={() => router.push('/profile#avatar')}
            className="mt-4 cursor-pointer rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white"
          >
            Configurer mon avatar
          </button>
        </div>
      )}

      {/* ── Not configured (token missing on server) ── */}
      {state === 'not_configured' && (
        <div className="mx-5 mb-5 rounded-2xl bg-[#FFF8F6] p-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="font-serif text-base text-[#111111]">
            Essayage virtuel non disponible
          </p>
          <p className="mt-2 text-xs text-[#8A8A8A]">
            Le service d&rsquo;essayage n&rsquo;est pas encore configur&eacute;. Revenez bientôt !
          </p>
        </div>
      )}

      {/* ── Has avatar, ready to generate ── */}
      {state === 'idle' && (
        <div className="px-5 pb-5">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="h-16 w-12 overflow-hidden rounded-xl bg-[#F0EDE8]">
              {user?.avatar_body_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.avatar_body_url}
                  alt="Vous"
                  className="h-full w-full object-cover object-top"
                />
              )}
            </div>
            <ArrowRight />
            <div className="h-16 w-12 overflow-hidden rounded-xl bg-[#F0EDE8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={itemPhotoUrl}
                alt="Vêtement"
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 15%' }}
              />
            </div>
            <Equals />
            <div className="flex h-16 w-12 items-center justify-center rounded-xl bg-[#F0EDE8]">
              <span className="font-serif text-2xl text-[#CFCFCF]">?</span>
            </div>
          </div>

          {isAccessory && (
            <p className="mb-3 rounded-xl bg-[#FFF8F6] px-3 py-2 text-center text-[11px] text-[#D4785C]">
              L&rsquo;essayage virtuel fonctionne mieux pour les hauts et les robes.
            </p>
          )}

          <button
            type="button"
            onClick={() => generateTryOn()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
          >
            <Sparkles />
            Essayer ce vêtement sur moi
          </button>
          <p className="mt-2 text-center text-xs text-[#8A8A8A]">
            ⏱ Environ 30-60 secondes
          </p>
        </div>
      )}

      {/* ── Generating ── */}
      {state === 'generating' && (
        <div className="px-5 pb-5">
          <div className="flex h-[300px] w-full animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-[#EDE5DC] to-[#F0EDE8]">
            <div className="flex flex-col items-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                <circle cx="12" cy="12" r="10" opacity="0.3" />
                <path d="M22 12a10 10 0 0 1-10 10" />
              </svg>
              <p className="mt-4 font-serif text-sm text-[#111111]">Génération en cours…</p>
              <p className="mt-1 text-xs text-[#8A8A8A]">L&rsquo;IA compose votre essayage</p>
              <p className="mt-2 text-[11px] text-[#C6A47E]">{PROGRESS_MESSAGES[progressIdx]}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {state === 'done' && tryOnUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tryOnUrl}
            alt="Essayage virtuel"
            className="w-full max-h-[480px] object-cover"
          />
          <div className="flex items-center gap-3 p-4">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 cursor-pointer rounded-full border border-[#111111] py-2.5 text-sm font-medium text-[#111111]"
            >
              Télécharger
            </button>
            <button
              type="button"
              onClick={() => generateTryOn(true)}
              className="flex-1 cursor-pointer rounded-full border border-[#111111] py-2.5 text-sm font-medium text-[#111111]"
            >
              Régénérer
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Partager"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#111111] text-white"
            >
              <ShareIcon />
            </button>
          </div>
        </>
      )}

      {/* ── Error ── */}
      {state === 'error' && (
        <div className="px-5 pb-5 text-center">
          <p className="mb-3 text-sm text-[#D4785C]">{errorMsg}</p>
          <button
            type="button"
            onClick={() => generateTryOn()}
            className="cursor-pointer rounded-full border border-[#111111] px-5 py-2 text-sm font-medium text-[#111111]"
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function Equals() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="5" y1="15" x2="19" y2="15" />
    </svg>
  );
}

function Sparkles() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
