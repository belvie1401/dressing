'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { ClothingItem } from '@/types';

type ItemTryOnState = 'idle' | 'generating' | 'done' | 'error';

interface ItemTryOnRecord {
  state: ItemTryOnState;
  url: string | null;
  error?: string;
}

/**
 * /outfits/preview?items=id1,id2,id3
 *
 * Sequentially tries on each selected item on the user's reference avatar.
 * Falls back to a flat-lay collage view (background-removed items arranged
 * on a beige canvas) when there's no avatar yet, since the per-item
 * Replicate calls would all fail with NO_AVATAR anyway.
 */
export default function OutfitPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const itemIds = useMemo(() => {
    const raw = searchParams.get('items') || '';
    return raw.split(',').filter(Boolean);
  }, [searchParams]);

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [tryOns, setTryOns] = useState<Record<string, ItemTryOnRecord>>({});
  const [view, setView] = useState<'tryon' | 'collage'>('tryon');

  const hasAvatar = !!user?.avatar_body_url;

  // Load each item's full data so we have photos + metadata
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (itemIds.length === 0) {
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        itemIds.map((id) => api.get<ClothingItem>(`/wardrobe/${id}`)),
      );
      if (!mounted) return;
      const ok = results
        .map((r) => (r.success ? r.data : null))
        .filter((it): it is ClothingItem => it !== null && it !== undefined);
      setItems(ok);
      setLoading(false);

      // Pre-seed any items that already have a cached try_on_url
      const seed: Record<string, ItemTryOnRecord> = {};
      for (const it of ok) {
        if (it.try_on_url) {
          seed[it.id] = { state: 'done', url: it.try_on_url };
        } else {
          seed[it.id] = { state: 'idle', url: null };
        }
      }
      setTryOns(seed);

      // If user has no avatar, switch to collage by default
      if (!hasAvatar) setView('collage');
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIds.join(','), hasAvatar]);

  const generateForItem = async (item: ClothingItem) => {
    setTryOns((prev) => ({
      ...prev,
      [item.id]: { state: 'generating', url: prev[item.id]?.url || null },
    }));

    const res = await api.post<{ url: string; cached: boolean }>(
      '/wardrobe/try-on',
      { item_id: item.id },
    );

    if (res.success && res.data?.url) {
      setTryOns((prev) => ({
        ...prev,
        [item.id]: { state: 'done', url: res.data!.url },
      }));
      return;
    }
    const err = res as unknown as { message?: string; error?: string };
    setTryOns((prev) => ({
      ...prev,
      [item.id]: {
        state: 'error',
        url: prev[item.id]?.url || null,
        error: err.message || err.error || 'Essayage indisponible',
      },
    }));
  };

  const activeItem = items[activeIdx];
  const activeTryOn = activeItem ? tryOns[activeItem.id] : undefined;

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] p-6 text-center">
        <p className="font-serif text-sm text-[#111111]">Aucun vêtement à afficher</p>
        <Link
          href="/outfits/create"
          className="mt-4 inline-flex rounded-full bg-[#111111] px-5 py-2.5 text-sm text-white"
        >
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-[#EFEFEF] bg-white px-5 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#111111] hover:bg-[#F0EDE8]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="font-serif text-lg text-[#111111]">Voir le look</h1>
        <div className="w-9" />
      </div>

      {/* ── View toggle ── */}
      <div className="mx-5 mt-3 flex gap-2 rounded-full bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setView('tryon')}
          disabled={!hasAvatar}
          className={`flex-1 cursor-pointer rounded-full py-2 text-xs font-medium transition-colors ${
            view === 'tryon'
              ? 'bg-[#111111] text-white'
              : 'text-[#111111]'
          } ${!hasAvatar ? 'opacity-40' : ''}`}
        >
          Essayage virtuel
        </button>
        <button
          type="button"
          onClick={() => setView('collage')}
          className={`flex-1 cursor-pointer rounded-full py-2 text-xs font-medium transition-colors ${
            view === 'collage'
              ? 'bg-[#111111] text-white'
              : 'text-[#111111]'
          }`}
        >
          Vue collage
        </button>
      </div>

      {!hasAvatar && view === 'tryon' && (
        <div className="mx-5 mt-3 rounded-2xl bg-[#FFF8F6] p-3 text-center">
          <p className="text-xs text-[#D4785C]">
            Ajoutez votre photo de référence pour l&rsquo;essayage virtuel.
          </p>
          <button
            type="button"
            onClick={() => router.push('/profile#avatar')}
            className="mt-2 cursor-pointer text-xs font-semibold text-[#C6A47E]"
          >
            Configurer mon avatar
          </button>
        </div>
      )}

      {/* ── Try-on view (one item at a time) ── */}
      {view === 'tryon' && hasAvatar && (
        <div className="mx-5 mt-4">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {activeItem && activeTryOn?.state === 'done' && activeTryOn.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeTryOn.url}
                alt={activeItem.name || activeItem.category}
                className="h-[440px] w-full object-cover"
              />
            ) : activeTryOn?.state === 'generating' ? (
              <div className="flex h-[440px] w-full animate-pulse items-center justify-center bg-gradient-to-br from-[#EDE5DC] to-[#F0EDE8]">
                <div className="flex flex-col items-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" className="animate-spin">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                    <path d="M22 12a10 10 0 0 1-10 10" />
                  </svg>
                  <p className="mt-4 font-serif text-sm text-[#111111]">Génération en cours…</p>
                </div>
              </div>
            ) : activeTryOn?.state === 'error' ? (
              <div className="flex h-[440px] flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-[#D4785C]">{activeTryOn.error}</p>
                <button
                  type="button"
                  onClick={() => activeItem && generateForItem(activeItem)}
                  className="mt-3 cursor-pointer rounded-full border border-[#111111] px-4 py-2 text-xs font-medium text-[#111111]"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="flex h-[440px] flex-col items-center justify-center px-6 text-center">
                {activeItem && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeItem.bg_removed_url || activeItem.photo_url}
                      alt={activeItem.name || activeItem.category}
                      className="h-40 w-32 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => generateForItem(activeItem)}
                      className="mt-4 cursor-pointer rounded-full bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Essayer ce vêtement
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Item carousel */}
          <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto">
            {items.map((it, idx) => {
              const active = idx === activeIdx;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`relative h-20 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                    active ? 'border-[#111111]' : 'border-transparent'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.bg_removed_url || it.photo_url}
                    alt={it.name || it.category}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: 'center 15%' }}
                  />
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-center text-xs text-[#8A8A8A]">
            {activeIdx + 1} / {items.length} — {activeItem?.name || activeItem?.category}
          </p>
        </div>
      )}

      {/* ── Collage view (all items arranged on a flat canvas) ── */}
      {view === 'collage' && (
        <div className="mx-5 mt-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#F7F5F2] to-[#EDE5DC] p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex h-44 items-center justify-center rounded-2xl bg-white/40 p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.bg_removed_url || it.photo_url}
                    alt={it.name || it.category}
                    className="max-h-full max-w-full object-contain"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-[#8A8A8A]">
            {items.length} pièce{items.length > 1 ? 's' : ''} dans ce look
          </p>
        </div>
      )}
    </div>
  );
}
