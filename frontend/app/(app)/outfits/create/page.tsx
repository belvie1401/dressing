'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ClothingItem, Outfit, Category, Occasion, Season } from '@/types';

// ─── Filter pills ───────────────────────────────────────────────────────────
type CategoryFilter = 'ALL' | Category;
const CATEGORY_PILLS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'Tout' },
  { value: 'TOP', label: 'Hauts' },
  { value: 'BOTTOM', label: 'Bas' },
  { value: 'DRESS', label: 'Robes' },
  { value: 'JACKET', label: 'Vestes' },
  { value: 'SHOES', label: 'Chaussures' },
  { value: 'ACCESSORY', label: 'Accessoires' },
];

// French labels but real Prisma enum values — sending anything else makes
// the backend Prisma-validation-error and the user sees "Erreur serveur".
const OCCASION_PILLS: Array<{ value: Occasion; label: string }> = [
  { value: 'CASUAL', label: 'Casual' },
  { value: 'WORK', label: 'Travail' },
  { value: 'EVENING', label: 'Soirée' },
  { value: 'SPORT', label: 'Sport' },
];

const SEASON_PILLS: Array<{ value: Season; label: string }> = [
  { value: 'SUMMER', label: 'Été' },
  { value: 'WINTER', label: 'Hiver' },
  { value: 'ALL', label: 'Toutes saisons' },
];

export default function OutfitCreatePage() {
  const router = useRouter();

  // ─── State ────────────────────────────────────────────────────────────────
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState<Occasion | ''>('');
  const [season, setSeason] = useState<Season | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ─── Load wardrobe ────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<ClothingItem[]>('/wardrobe')
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setWardrobeItems(res.data);
        } else {
          const err = res as unknown as { message?: string; error?: string };
          setError(
            err.message || err.error || 'Impossible de charger votre dressing.'
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // ─── Selection ────────────────────────────────────────────────────────────
  const toggleItem = (itemId: string) => {
    setError('');
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // ─── Filtered wardrobe ────────────────────────────────────────────────────
  const filteredWardrobe = useMemo(() => {
    if (categoryFilter === 'ALL') return wardrobeItems;
    return wardrobeItems.filter((it) => it.category === categoryFilter);
  }, [wardrobeItems, categoryFilter]);

  // Selected ClothingItem objects (in selection order)
  const selectedDetails = useMemo(() => {
    return selectedItems
      .map((id) => wardrobeItems.find((it) => it.id === id))
      .filter((it): it is ClothingItem => it !== undefined);
  }, [selectedItems, wardrobeItems]);

  // ─── Save ─────────────────────────────────────────────────────────────────
  const saveOutfit = async () => {
    if (selectedItems.length === 0) {
      setError('Sélectionnez au moins un vêtement');
      return;
    }
    if (!outfitName.trim()) {
      setError('Donnez un nom à votre look');
      return;
    }

    setSaving(true);
    setError('');

    const res = await api.post<Outfit>('/outfits', {
      name: outfitName.trim(),
      item_ids: selectedItems,
      occasion: occasion || undefined,
      season: season || undefined,
      ai_generated: false,
    });

    if (res.success && res.data) {
      router.push('/outfits');
      return;
    }

    const errBody = res as unknown as { message?: string; error?: string };
    setError(
      errBody.message ||
        errBody.error ||
        "Erreur lors de l'enregistrement. Réessayez."
    );
    setSaving(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* ════════ HEADER ════════ */}
      <div className="flex items-center justify-between border-b border-[#EFEFEF] bg-white px-5 py-4">
        <Link
          href="/outfits"
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] hover:bg-[#F0EDE8]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="font-serif text-lg text-[#111111]">Créer un look</h1>
        <button
          type="button"
          onClick={saveOutfit}
          disabled={selectedItems.length === 0 || saving}
          className="text-sm font-semibold text-[#C6A47E] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>

      {/* ════════ ERROR BANNER ════════ */}
      {error && (
        <div className="mx-5 mt-3 rounded-xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3">
          <p className="text-xs text-[#D4785C]">{error}</p>
        </div>
      )}

      {/* ════════ SELECTED OUTFIT PREVIEW ════════ */}
      <div className="relative mx-5 mt-4 min-h-[140px] overflow-hidden rounded-3xl bg-[#111111] p-4">
        {selectedDetails.length === 0 ? (
          <div className="flex h-[108px] items-center justify-center">
            <p className="text-center font-serif text-sm text-[#CFCFCF]">
              Sélectionnez des vêtements ci-dessous
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {selectedDetails.slice(0, 5).map((item) => {
              const src = item.bg_removed_url || item.photo_url;
              return (
                <div
                  key={item.id}
                  className="h-28 w-20 overflow-hidden rounded-xl bg-[#333333]"
                >
                  {src && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={src}
                      alt={item.name || item.category}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center 15%' }}
                    />
                  )}
                </div>
              );
            })}
            {selectedDetails.length > 5 && (
              <div className="flex h-28 w-20 items-center justify-center rounded-xl bg-[#333333]">
                <span className="font-serif text-lg text-white">
                  +{selectedDetails.length - 5}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <p className="text-xs text-white/60">
            {selectedItems.length} pièce{selectedItems.length > 1 ? 's' : ''}{' '}
            sélectionnée{selectedItems.length > 1 ? 's' : ''}
          </p>
          {selectedItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSelectedItems([]);
                setError('');
              }}
              className="cursor-pointer text-xs text-[#D4785C]"
            >
              Tout retirer
            </button>
          )}
        </div>
      </div>

      {/* ════════ "VOIR CE LOOK SUR VOUS" CTA ════════ */}
      {selectedItems.length >= 2 && (
        <button
          type="button"
          onClick={() =>
            router.push(`/outfits/preview?items=${selectedItems.join(',')}`)
          }
          className="mx-5 mt-3 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-3 rounded-2xl bg-[#EDE5DC] p-4 text-left transition-colors hover:bg-[#E5DCD0]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C6A47E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          </svg>
          <div className="flex flex-1 flex-col">
            <p className="font-serif text-sm text-[#111111]">Voir ce look sur vous</p>
            <p className="text-xs text-[#8A8A8A]">Essayage virtuel du look complet</p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#CFCFCF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* ════════ OUTFIT DETAILS ════════ */}
      <div className="mx-5 mt-3 rounded-2xl bg-white p-4">
        {/* Name */}
        <label className="mb-1 block text-xs text-[#8A8A8A]">Nom du look</label>
        <input
          type="text"
          value={outfitName}
          onChange={(e) => setOutfitName(e.target.value)}
          placeholder="Ex: Look bureau casual"
          className="w-full rounded-xl bg-[#F7F5F2] px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none"
        />

        {/* Occasion */}
        <p className="mb-2 mt-3 text-xs text-[#8A8A8A]">Occasion</p>
        <div className="flex flex-wrap gap-2">
          {OCCASION_PILLS.map((p) => {
            const active = occasion === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setOccasion(active ? '' : p.value)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs transition-colors ${
                  active
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F0EDE8] text-[#111111] hover:bg-[#EDE5DC]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Season */}
        <p className="mb-2 mt-3 text-xs text-[#8A8A8A]">Saison</p>
        <div className="flex flex-wrap gap-2">
          {SEASON_PILLS.map((p) => {
            const active = season === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSeason(active ? '' : p.value)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs transition-colors ${
                  active
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F0EDE8] text-[#111111] hover:bg-[#EDE5DC]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════ WARDROBE GRID ════════ */}
      <h2 className="mb-3 mt-6 px-5 font-serif text-base text-[#111111]">
        Mon dressing
      </h2>

      {/* Category filter pills */}
      <div className="scrollbar-hide mb-3 flex gap-2 overflow-x-auto px-5">
        {CATEGORY_PILLS.map((p) => {
          const active = categoryFilter === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setCategoryFilter(p.value)}
              className={`flex-shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs transition-colors ${
                active
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#F0EDE8] text-[#111111] hover:bg-[#EDE5DC]'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-2 px-5">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="h-[110px] animate-pulse rounded-xl bg-[#F0EDE8]"
            />
          ))}
        </div>
      ) : wardrobeItems.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="font-serif text-sm text-[#111111]">
            Votre dressing est vide
          </p>
          <p className="mt-1 text-xs text-[#8A8A8A]">
            Ajoutez des vêtements d&rsquo;abord
          </p>
          <Link
            href="/wardrobe/add"
            className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
          >
            Ajouter des vêtements
          </Link>
        </div>
      ) : filteredWardrobe.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-[#8A8A8A]">
            Aucun vêtement dans cette catégorie
          </p>
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className="mt-2 cursor-pointer text-xs font-semibold text-[#C6A47E]"
          >
            Voir tout
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 px-5">
          {filteredWardrobe.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            const src = item.bg_removed_url || item.photo_url;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`relative h-[110px] cursor-pointer overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all ${
                  isSelected ? 'border-[#111111]' : 'border-transparent'
                }`}
              >
                {src && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={src}
                    alt={item.name || item.category}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: 'center 15%' }}
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/20">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ════════ FIXED BOTTOM SAVE BAR ════════ */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#EFEFEF] bg-[#F7F5F2] px-5 py-4 lg:left-64">
        {selectedItems.length === 0 ? (
          <p className="text-center text-xs text-[#8A8A8A]">
            Sélectionnez des vêtements pour créer un look
          </p>
        ) : (
          <button
            type="button"
            onClick={saveOutfit}
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111111] py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-spin"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.3" />
                  <path d="M22 12a10 10 0 0 1-10 10" />
                </svg>
                Enregistrement…
              </>
            ) : (
              <>
                Sauvegarder le look ({selectedItems.length} pièce
                {selectedItems.length > 1 ? 's' : ''})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
