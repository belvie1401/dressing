'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClothingItem } from '@/types';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';

const categoryAbbrev: Record<string, string> = {
  TOP: 'Haut',
  BOTTOM: 'Bas',
  DRESS: 'Robe',
  JACKET: 'Veste',
  SHOES: 'Shoes',
  ACCESSORY: 'Acc.',
};

interface ClothingCardProps {
  item: ClothingItem;
  onToast?: (msg: string) => void;
}

/**
 * ClothingCard — grid tile with inline 360° mini viewer.
 *
 * Behavior:
 *  - Tap / click (no drag) navigates to /wardrobe/[id]
 *  - When `has_360_view`, horizontal drag/swipe flips between front & back
 *    (40px threshold) without triggering navigation
 *  - Desktop hover reveals a quick-action bar (Voir / Favori / Porter)
 */
export default function ClothingCard({ item, onToast }: ClothingCardProps) {
  const router = useRouter();
  const markWornInStore = useWardrobeStore((s) => s.markWorn);

  const frontUrl = item.bg_removed_url || item.photo_url;
  const backUrl = item.photo_back_removed || item.photo_back_url || '';
  const has360 = !!item.has_360_view && !!backUrl;

  // Inline 360° state (per card)
  const [showBack, setShowBack] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const THRESHOLD = 40;

  const pointerDown = (x: number) => {
    draggedRef.current = false;
    if (has360) {
      startXRef.current = x;
      setIsDragging(true);
    }
  };

  const pointerMove = (x: number) => {
    if (!has360 || startXRef.current === null) return;
    const delta = x - startXRef.current;
    if (Math.abs(delta) >= THRESHOLD) {
      draggedRef.current = true;
      setShowBack((v) => !v);
      startXRef.current = x; // reset anchor so continued drag keeps flipping
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch {
          // ignore
        }
      }
    }
  };

  const pointerEnd = () => {
    startXRef.current = null;
    setIsDragging(false);
  };

  const handleCardClick = () => {
    // Suppress click when a drag just happened (360° swipe)
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    router.push(`/wardrobe/${item.id}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    pointerDown(e.touches[0].clientX);
    // Long-press (500ms) → navigate as a fallback action sheet trigger
    longPressTimerRef.current = setTimeout(() => {
      router.push(`/wardrobe/${item.id}`);
    }, 500);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerMove(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pointerEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!has360) return;
    e.preventDefault();
    pointerDown(e.clientX);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null) return;
    pointerMove(e.clientX);
  };
  const handleMouseUp = () => pointerEnd();
  const handleMouseLeave = () => {
    if (startXRef.current !== null) pointerEnd();
  };

  // Quick-action handlers
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/wardrobe/${item.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToast?.('Ajouté aux favoris');
  };

  const handleWear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markWornInStore(item.id);
      onToast?.('Porté aujourd\u2019hui !');
    } catch {
      // Fallback direct call
      const res = await api.post<ClothingItem>(`/wardrobe/${item.id}/wear`);
      if (res.success) onToast?.('Porté aujourd\u2019hui !');
    }
  };

  const displayName =
    item.name || item.brand || categoryAbbrev[item.category] || 'Vêtement';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/wardrobe/${item.id}`);
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[3/4] cursor-pointer select-none overflow-hidden rounded-2xl bg-white shadow-sm"
      style={{
        touchAction: has360 ? 'pan-y' : undefined,
        cursor: isDragging ? 'grabbing' : 'pointer',
      }}
    >
      {/* Photo area */}
      <div className="absolute inset-0 bg-[#F7F5F2]">
        {has360 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frontUrl}
              alt={`${displayName} — face`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
              style={{ opacity: showBack ? 0 : 1 }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backUrl}
              alt={`${displayName} — dos`}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
              style={{ opacity: showBack ? 1 : 0 }}
            />
          </>
        ) : frontUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={frontUrl}
            alt={displayName}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#CFCFCF]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* 360° badge (top-left) */}
      {has360 && (
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-[#111111]/70 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
          360°
        </span>
      )}

      {/* Category badge (top-right) */}
      <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-medium text-[#111111] backdrop-blur-sm">
        {categoryAbbrev[item.category] || item.category}
      </span>

      {/* Bottom info overlay (hidden on hover to reveal action bar) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-2.5 pb-3 transition-opacity duration-200 group-hover:opacity-0">
        <p className="truncate text-xs font-medium text-white">{displayName}</p>
        <div className="mt-0.5 flex items-center gap-1">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              item.wear_count === 0 ? 'bg-[#CFCFCF]' : 'bg-[#4ade80]'
            }`}
          />
          <span className="text-[10px] text-white/70">
            {item.wear_count === 0
              ? 'Jamais porté'
              : `Porté ${item.wear_count}\u00d7`}
          </span>
        </div>
      </div>

      {/* Hover quick-action bar (desktop only) */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex translate-y-full items-center justify-around bg-white py-2 transition-transform duration-200 group-hover:translate-y-0">
        <button
          type="button"
          onClick={handleView}
          aria-label="Voir"
          className="flex cursor-pointer flex-col items-center gap-0.5 px-2 text-[10px] font-medium text-[#111111]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Voir
        </button>
        <button
          type="button"
          onClick={handleFavorite}
          aria-label="Favori"
          className="flex cursor-pointer flex-col items-center gap-0.5 px-2 text-[10px] font-medium text-[#111111]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favori
        </button>
        <button
          type="button"
          onClick={handleWear}
          aria-label="Porter"
          className="flex cursor-pointer flex-col items-center gap-0.5 px-2 text-[10px] font-medium text-[#111111]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          </svg>
          Porter
        </button>
      </div>
    </div>
  );
}
