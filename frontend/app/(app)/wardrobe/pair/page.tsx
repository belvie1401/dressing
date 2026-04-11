'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ClothingItem, Occasion, Outfit } from '@/types';

const OCCASION_PILLS: Array<{ value: Occasion; label: string }> = [
  { value: 'CASUAL', label: 'Décontracté' },
  { value: 'WORK', label: 'Travail' },
  { value: 'EVENING', label: 'Soirée' },
  { value: 'SPORT', label: 'Sport' },
];

const CATEGORY_LABELS: Record<string, string> = {
  TOP: 'Haut',
  BOTTOM: 'Bas',
  DRESS: 'Robe',
  JACKET: 'Veste',
  SHOES: 'Chaussures',
  ACCESSORY: 'Accessoire',
};

export default function WardrobePairPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse ?new=id1,id2,id3 → list of ids
  const newIds = useMemo(() => {
    const raw = searchParams?.get('new') ?? '';
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }, [searchParams]);

  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState<Occasion>('CASUAL');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // ── Load wardrobe ──────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await api.get<ClothingItem[]>('/wardrobe');
      if (!mounted) return;
      if (res.success && res.data) setAllItems(res.data);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Newly-added items, in URL order
  const newItems = useMemo(() => {
    const byId = new Map(allItems.map((it) => [it.id, it]));
    return newIds.map((id) => byId.get(id)).filter((it): it is ClothingItem => !!it);
  }, [allItems, newIds]);

  // Items the user has explicitly added from the existing dressing
  // (anything in selectedIds that isn't part of the newIds set)
  const newIdSet = useMemo(() => new Set(newIds), [newIds]);
  const extraSelectedIds = useMemo(
    () => selectedIds.filter((id) => !newIdSet.has(id)),
    [selectedIds, newIdSet]
  );

  // Combined "left column" list = new items first, then anything pulled
  // from the existing dressing
  const leftListItems = useMemo(() => {
    const extras = extraSelectedIds
      .map((id) => allItems.find((it) => it.id === id))
      .filter((it): it is ClothingItem => !!it);
    return [...newItems, ...extras];
  }, [newItems, extraSelectedIds, allItems]);

  // ── Selection handlers ─────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeFromOutfit = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const selectedItems = useMemo(
    () =>
      selectedIds
        .map((id) => allItems.find((it) => it.id === id))
        .filter((it): it is ClothingItem => !!it),
    [selectedIds, allItems]
  );

  const clearOutfit = () => {
    setSelectedIds([]);
    setOutfitName('');
  };

  // ── Save outfit ────────────────────────────────────────────────────────
  const saveOutfit = async () => {
    if (selectedIds.length === 0) {
      setToast('Sélectionnez au moins une pièce.');
      setTimeout(() => setToast(null), 2500);
      return;
    }
    setSaving(true);
    const res = await api.post<Outfit>('/outfits', {
      name: outfitName.trim() || 'Nouveau look',
      occasion,
      item_ids: selectedIds,
    });
    setSaving(false);

    if (res.success && res.data) {
      setToast('Look enregistré !');
      setTimeout(() => setToast(null), 2000);
      clearOutfit();
    } else {
      setToast("Erreur lors de l'enregistrement.");
      setTimeout(() => setToast(null), 2500);
    }
  };

  // ── Picker (existing wardrobe) ─────────────────────────────────────────
  const pickerResults = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    const candidates = allItems.filter((it) => !newIdSet.has(it.id));
    if (!q) return candidates;
    return candidates.filter(
      (it) =>
        it.name?.toLowerCase().includes(q) ||
        it.brand?.toLowerCase().includes(q) ||
        CATEGORY_LABELS[it.category]?.toLowerCase().includes(q) ||
        it.colors?.some((c) => c.toLowerCase().includes(q))
    );
  }, [allItems, newIdSet, pickerSearch]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-32">
      {/* ============ HEADER ============ */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/wardrobe"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          aria-label="Retour"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className="font-serif text-xl text-[#111111]">Créer des associations</h1>
          <p className="mt-0.5 text-xs text-[#8A8A8A]">
            Combinez vos nouvelles pièces pour créer des looks complets.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
        </div>
      ) : leftListItems.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center">
          <p className="font-serif text-lg text-[#111111]">
            Aucune nouvelle pièce à associer
          </p>
          <p className="mt-2 text-xs text-[#8A8A8A]">
            Ajoutez d&rsquo;abord des vêtements à votre dressing.
          </p>
          <Link
            href="/wardrobe/add"
            className="mt-4 inline-flex rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white"
          >
            Ajouter un vêtement
          </Link>
        </div>
      ) : (
        <>
          {/* ============ TWO COLUMNS ============ */}
          <div className="grid grid-cols-2 gap-4">
            {/* ── LEFT — new items ── */}
            <div>
              <p className="mb-3 font-serif text-sm text-[#8A8A8A]">Nouvelles pièces</p>
              <div className="space-y-2">
                {leftListItems.map((item) => {
                  const selected = selectedIds.includes(item.id);
                  const cover = item.bg_removed_url || item.photo_url;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border-2 bg-white p-2 transition-colors ${
                        selected ? 'border-[#111111]' : 'border-transparent'
                      }`}
                    >
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[#F0EDE8]">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={item.name || ''}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: 'center 15%' }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-xs font-medium text-[#111111]">
                          {item.name || 'Vêtement'}
                        </p>
                        <span
                          className="mt-0.5 inline-block rounded-full bg-[#F0EDE8] px-1.5 py-0.5 text-[#111111]"
                          style={{ fontSize: '9px' }}
                        >
                          {CATEGORY_LABELS[item.category] ?? item.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-3 cursor-pointer text-xs text-[#C6A47E] hover:underline"
              >
                + Ajouter depuis mon dressing
              </button>
            </div>

            {/* ── RIGHT — outfit canvas ── */}
            <div>
              <p className="mb-3 font-serif text-sm text-[#8A8A8A]">Mon look</p>
              <div
                className="rounded-2xl bg-[#F0EDE8] p-4"
                style={{ minHeight: '200px' }}
              >
                {selectedItems.length === 0 ? (
                  <p className="mt-6 text-center text-xs text-[#CFCFCF]">
                    Sélectionnez des pièces à gauche
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item) => {
                      const cover = item.bg_removed_url || item.photo_url;
                      return (
                        <div key={item.id} className="relative h-24 w-20">
                          <div className="h-full w-full overflow-hidden rounded-xl bg-white">
                            {cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={cover}
                                alt={item.name || ''}
                                className="h-full w-full object-cover"
                                style={{ objectPosition: 'center 15%' }}
                              />
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromOutfit(item.id)}
                            aria-label="Retirer du look"
                            className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============ NAME + OCCASION ============ */}
          <div className="mt-6">
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="Nom du look (ex: Look bureau décontracté)"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {OCCASION_PILLS.map((p) => {
                const active = occasion === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setOccasion(p.value)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#111111] text-white'
                        : 'bg-[#F0EDE8] text-[#8A8A8A] hover:text-[#111111]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============ ACTIONS ============ */}
          <button
            type="button"
            onClick={saveOutfit}
            disabled={saving || selectedIds.length === 0}
            className="mt-4 w-full cursor-pointer rounded-full bg-[#111111] py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Enregistrement…' : 'Sauvegarder ce look'}
          </button>
          <button
            type="button"
            onClick={clearOutfit}
            className="mt-2 block w-full cursor-pointer text-center text-xs text-[#8A8A8A] hover:text-[#111111]"
          >
            Créer un autre look
          </button>
          <Link
            href="/wardrobe"
            className="mt-4 block text-center text-xs text-[#C6A47E] hover:underline"
          >
            Terminer
          </Link>
        </>
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* ============ EXISTING-DRESSING PICKER MODAL ============ */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="flex h-[80vh] w-full max-w-md flex-col rounded-t-3xl bg-white sm:rounded-3xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EFEFEF] p-4">
              <h2 className="font-serif text-base text-[#111111]">
                Ajouter depuis mon dressing
              </h2>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Fermer"
                className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#8A8A8A]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="border-b border-[#EFEFEF] p-3">
              <div className="flex items-center gap-2 rounded-full bg-[#F0EDE8] px-4 py-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A8A8A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Rechercher dans mon dressing"
                  className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#8A8A8A] outline-none"
                />
              </div>
            </div>

            {/* Results grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {pickerResults.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#8A8A8A]">
                  Aucun vêtement
                </p>
              ) : (
                <div
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  }}
                >
                  {pickerResults.map((item) => {
                    const selected = selectedIds.includes(item.id);
                    const cover = item.bg_removed_url || item.photo_url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelect(item.id)}
                        className={`relative overflow-hidden rounded-xl bg-white transition-transform ${
                          selected ? 'ring-2 ring-[#111111]' : 'ring-1 ring-[#EFEFEF]'
                        }`}
                        style={{ height: '140px' }}
                      >
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={item.name || ''}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: 'center 15%' }}
                          />
                        ) : null}
                        {selected && (
                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-white">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                          <p
                            className="truncate font-medium text-white"
                            style={{ fontSize: '10px' }}
                          >
                            {item.name || CATEGORY_LABELS[item.category]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#EFEFEF] p-3">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-full cursor-pointer rounded-full bg-[#111111] py-3 text-xs font-semibold text-white"
              >
                Terminé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
