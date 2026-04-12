'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWardrobeStore } from '@/lib/store';
import type { Category, ClothingItem, Occasion, Outfit, Season } from '@/types';
import { api } from '@/lib/api';
import ClothingCard from '@/components/wardrobe/ClothingCard';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut', BOTTOM: 'Bas', DRESS: 'Robe', JACKET: 'Veste', SHOES: 'Chaussures', ACCESSORY: 'Accessoire',
};

const occasionLabels: Record<string, string> = {
  CASUAL: 'décontracté',
  WORK: 'travail',
  EVENING: 'soirée',
  SPORT: 'sport',
};

type WardrobeTab = 'clothes' | 'looks' | 'favorites';
type CategoryFilter = 'ALL' | 'TOP' | 'BOTTOM' | 'DRESS' | 'JACKET' | 'SHOES' | 'ACCESSORY' | 'ARCHIVED';

const TABS: Array<{ key: WardrobeTab; label: string }> = [
  { key: 'clothes', label: 'Vêtements' },
  { key: 'looks', label: 'Looks' },
  { key: 'favorites', label: 'Favoris' },
];

const CATEGORY_PILLS: Array<{ key: CategoryFilter; label: string }> = [
  { key: 'ALL', label: 'Tout' },
  { key: 'TOP', label: 'Hauts' },
  { key: 'BOTTOM', label: 'Bas' },
  { key: 'DRESS', label: 'Robes' },
  { key: 'JACKET', label: 'Vestes' },
  { key: 'SHOES', label: 'Chaussures' },
  { key: 'ACCESSORY', label: 'Accessoires' },
  { key: 'ARCHIVED', label: 'Archivés' },
];

interface Filters {
  categories: Category[];
  colors: string[];
  seasons: Season[];
  occasions: Occasion[];
  wornStatus: 'any' | 'worn' | 'never_worn';
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: Filters = {
  categories: [],
  colors: [],
  seasons: [],
  occasions: [],
  wornStatus: 'any',
  priceMin: '',
  priceMax: '',
  dateFrom: '',
  dateTo: '',
};

const FILTER_CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'TOP', label: 'Hauts' },
  { key: 'BOTTOM', label: 'Bas' },
  { key: 'DRESS', label: 'Robes' },
  { key: 'JACKET', label: 'Vestes' },
  { key: 'SHOES', label: 'Chaussures' },
  { key: 'ACCESSORY', label: 'Accessoires' },
];

const COLOR_OPTIONS = [
  { name: 'Noir', hex: '#000000' },
  { name: 'Blanc', hex: '#FFFFFF' },
  { name: 'Gris', hex: '#808080' },
  { name: 'Bleu', hex: '#2563EB' },
  { name: 'Rouge', hex: '#DC2626' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Vert', hex: '#16A34A' },
  { name: 'Jaune', hex: '#EAB308' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Violet', hex: '#9333EA' },
  { name: 'Marron', hex: '#92400E' },
  { name: 'Beige', hex: '#D4B896' },
];

const SEASON_OPTIONS: Array<{ key: Season; label: string }> = [
  { key: 'SUMMER', label: 'Été' },
  { key: 'WINTER', label: 'Hiver' },
  { key: 'ALL', label: 'Toutes saisons' },
];

const OCCASION_OPTIONS: Array<{ key: Occasion; label: string }> = [
  { key: 'CASUAL', label: 'Décontracté' },
  { key: 'WORK', label: 'Travail' },
  { key: 'EVENING', label: 'Soirée' },
  { key: 'SPORT', label: 'Sport' },
];

const countActiveFilters = (f: Filters): number => {
  let count = 0;
  if (f.categories.length) count++;
  if (f.colors.length) count++;
  if (f.seasons.length) count++;
  if (f.occasions.length) count++;
  if (f.wornStatus !== 'any') count++;
  if (f.priceMin || f.priceMax) count++;
  if (f.dateFrom || f.dateTo) count++;
  return count;
};

export default function WardrobePage() {
  const { items, isLoading, loadItems } = useWardrobeStore();
  const [tab, setTab] = useState<WardrobeTab>('clothes');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [archivedItems, setArchivedItems] = useState<ClothingItem[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [toast, setToast] = useState('');
  const [planInfo, setPlanInfo] = useState<{ plan: string; limit: number | null } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    loadItems();
    const loadOutfits = async () => {
      const res = await api.get<Outfit[]>('/outfits');
      if (res.success && res.data) setOutfits(res.data);
    };
    const loadPlanInfo = async () => {
      const res = await api.get<{ count: number; plan: string; limit: number | null }>('/wardrobe/count');
      if (res.success && res.data) {
        setPlanInfo({ plan: res.data.plan, limit: res.data.limit });
      }
    };
    loadOutfits();
    loadPlanInfo();
  }, []);

  const loadArchivedItems = async () => {
    setLoadingArchived(true);
    const res = await api.get<ClothingItem[]>('/wardrobe?archived=true');
    if (res.success && res.data) setArchivedItems(res.data);
    setLoadingArchived(false);
  };

  useEffect(() => {
    if (categoryFilter === 'ARCHIVED') loadArchivedItems();
  }, [categoryFilter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const activeCount = countActiveFilters(filters);

  const openFilters = () => {
    setPendingFilters({ ...filters });
    setShowFilters(true);
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    if (pendingFilters.categories.length > 0) {
      setCategoryFilter('ALL');
    }
    setShowFilters(false);
  };

  const resetPendingFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
  };

  const togglePendingArray = <K extends keyof Filters>(key: K, value: Filters[K] extends Array<infer U> ? U : never) => {
    setPendingFilters(prev => {
      const arr = prev[key] as unknown[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  };

  const trimmedSearch = search.trim();
  const hasSearch = trimmedSearch.length > 0;

  const isArchivedView = categoryFilter === 'ARCHIVED';

  const filteredItems = isArchivedView
    ? archivedItems
    : items.filter((item) => {
        if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
        if (filters.categories.length && !filters.categories.includes(item.category)) return false;
        if (filters.colors.length && !item.colors.some(c => filters.colors.some(fc => c.toLowerCase().includes(fc.toLowerCase())))) return false;
        if (filters.seasons.length && !filters.seasons.includes(item.season)) return false;
        if (filters.occasions.length && !filters.occasions.includes(item.occasion)) return false;
        if (filters.wornStatus === 'worn' && item.wear_count === 0) return false;
        if (filters.wornStatus === 'never_worn' && item.wear_count > 0) return false;
        if (filters.priceMin && item.purchase_price != null && item.purchase_price < Number(filters.priceMin)) return false;
        if (filters.priceMax && item.purchase_price != null && item.purchase_price > Number(filters.priceMax)) return false;
        if (filters.dateFrom && item.purchase_date && item.purchase_date < filters.dateFrom) return false;
        if (filters.dateTo && item.purchase_date && item.purchase_date > filters.dateTo) return false;
        if (!hasSearch) return true;
        const q = trimmedSearch.toLowerCase();
        return (
          item.name?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.material?.toLowerCase().includes(q) ||
          categoryLabels[item.category]?.toLowerCase().includes(q) ||
          occasionLabels[item.occasion]?.toLowerCase().includes(q) ||
          item.colors.some((c) => c.toLowerCase().includes(q))
        );
      });

  return (
    // -mb-24 lg:-mb-8 cancels the parent <main>'s bottom padding so the
    // fixed-header + scroll layout occupies the full viewport height.
    <div className="-mb-24 flex h-[100dvh] flex-col bg-[#F7F5F2] lg:-mb-8">
      {/* ============ FIXED HEADER ============ */}
      <div className="flex-shrink-0 border-b border-[#EFEFEF] bg-white">
        {/* Top row: menu + title + notif */}
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 cursor-pointer items-center justify-center" aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className="font-serif text-xl font-semibold text-[#111111]">Mon dressing</h1>
          </div>
          <a href="/messages" className="flex h-10 w-10 items-center justify-center" aria-label="Messages">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </a>
        </div>

        {/* Tabs row */}
        <div className="mt-3 grid h-12 grid-cols-3">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex cursor-pointer items-center justify-center text-sm font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-[#111111] text-white'
                    : 'bg-transparent text-[#8A8A8A] hover:text-[#111111]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[#F0EDE8] px-4 py-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent text-sm text-[#111111] placeholder-[#8A8A8A] outline-none"
            />
            {hasSearch ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-xs text-[#8A8A8A] transition-colors hover:bg-white hover:text-[#111111]"
                aria-label="Effacer la recherche"
              >
                <span aria-hidden="true">&times;</span>
                Effacer
              </button>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Filtres"
            onClick={openFilters}
            className="relative flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#F0EDE8]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Category filter pills */}
        {tab === 'clothes' && (
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {CATEGORY_PILLS.map((pill) => {
              const active = categoryFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setCategoryFilter(pill.key)}
                  className={`flex-shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F0EDE8] text-[#8A8A8A] hover:text-[#111111]'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ============ LIMIT BANNERS (FREE plan) ============ */}
      {planInfo?.plan === 'FREE' && planInfo.limit && (() => {
        const percentage = (items.length / planInfo.limit) * 100;
        if (percentage >= 100) {
          return (
            <div className="mx-4 mt-3 rounded-2xl bg-[#111111] p-4">
              <p className="font-serif text-sm text-white">Dressing complet</p>
              <p className="mt-1 text-xs text-[#CFCFCF]">
                Vous avez atteint la limite de {planInfo.limit} pi&egrave;ces du plan Gratuit.
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/pricing"
                  className="rounded-full bg-[#C6A47E] px-4 py-2 text-xs font-semibold text-[#111111] no-underline"
                >
                  Passer au Pro
                </Link>
                <button
                  type="button"
                  onClick={() => showToast('Archivage bient&ocirc;t disponible')}
                  className="cursor-pointer rounded-full border border-white px-4 py-2 text-xs text-white"
                >
                  Archiver des pi&egrave;ces
                </button>
              </div>
            </div>
          );
        }
        if (percentage >= 90) {
          return (
            <div className="mx-4 mt-3 rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#D4785C]">
                    {items.length}/{planInfo.limit} v&ecirc;tements utilis&eacute;s
                  </p>
                  <div className="mt-1 h-1.5 w-48 rounded-full bg-[#F0EDE8]">
                    <div
                      className="h-full rounded-full bg-[#D4785C]"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="rounded-full bg-[#D4785C] px-3 py-1.5 text-xs font-semibold text-white no-underline"
                >
                  Passer au Pro
                </Link>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* ============ SCROLLABLE CONTENT ============ */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        ) : tab === 'clothes' && isArchivedView ? (
          // ─── ARCHIVED VIEW ─────────────────────────────────────────
          loadingArchived ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
            </div>
          ) : archivedItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              </div>
              <p className="font-serif text-base text-[#111111]">Aucun v&ecirc;tement archiv&eacute;</p>
              <p className="mt-1 text-xs text-[#8A8A8A]">Les pi&egrave;ces archiv&eacute;es apparaîtront ici</p>
            </div>
          ) : (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
            >
              {archivedItems.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  isArchived
                  onToast={showToast}
                  onRemoved={() => {
                    loadArchivedItems();
                    loadItems();
                  }}
                />
              ))}
            </div>
          )
        ) : tab === 'clothes' ? (
          hasSearch ? (
            // ─── SEARCH MODE ───────────────────────────────────────────
            filteredItems.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <p className="font-serif text-base text-[#111111] mt-3">
                  Aucun résultat pour &laquo;{trimmedSearch}&raquo;
                </p>
                <p className="text-xs text-[#8A8A8A] mt-1">Essayez un autre mot-clé</p>
              </div>
            ) : (
              <>
                <p className="py-2 text-xs text-[#8A8A8A]">
                  {filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''} pour &laquo;{trimmedSearch}&raquo;
                </p>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
                >
                  {filteredItems.map((item) => (
                    <ClothingCard
                      key={item.id}
                      item={item}
                      onToast={showToast}
                      searchQuery={trimmedSearch}
                      onRemoved={loadItems}
                    />
                  ))}
                </div>
              </>
            )
          ) : items.length === 0 ? (
            // ─── EMPTY DRESSING ────────────────────────────────────────
            <div className="flex flex-col items-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#111111]">Votre dressing est vide</p>
              <p className="mt-1 text-xs text-[#8A8A8A]">Ajoutez votre premier vêtement</p>
              <a
                href="/wardrobe/add"
                className="mt-4 rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold text-white"
              >
                Ajouter un vêtement
              </a>
            </div>
          ) : (
            // ─── DEFAULT GRID + ADD BUTTON ─────────────────────────────
            <>
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="text-sm text-[#8A8A8A]">Aucun vêtement dans cette catégorie</p>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ALL')}
                    className="mt-3 cursor-pointer rounded-full bg-[#F0EDE8] px-4 py-2 text-xs font-medium text-[#111111] hover:bg-[#EDE5DC]"
                  >
                    Voir tout
                  </button>
                </div>
              ) : (
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
                >
                  {filteredItems.map((item) => (
                    <ClothingCard key={item.id} item={item} onToast={showToast} onRemoved={loadItems} />
                  ))}
                </div>
              )}

              {/* + Ajouter button */}
              <a
                href="/wardrobe/add"
                className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#111111] py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter
              </a>
            </>
          )
        ) : tab === 'looks' ? (
          outfits.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-sm text-[#8A8A8A]">Aucun look créé pour le moment</p>
              <a href="/outfits/create" className="mt-3 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white">
                Créer un look
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {outfits.map((outfit) => (
                <a
                  key={outfit.id}
                  href={`/outfits/${outfit.id}`}
                  className="overflow-hidden rounded-2xl bg-white"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div className="relative aspect-square bg-[#F0EDE8]">
                    {outfit.items?.[0]?.item?.photo_url && (
                      <Image
                        src={outfit.items[0].item.bg_removed_url || outfit.items[0].item.photo_url}
                        alt={outfit.name}
                        fill
                        className="object-cover"
                        sizes="50vw"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-sm font-medium text-[#111111]">{outfit.name}</p>
                    <p className="text-xs text-[#8A8A8A]">{outfit.items?.length || 0} pièces</p>
                  </div>
                </a>
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="mt-3 text-sm text-[#8A8A8A]">Vos favoris apparaîtront ici</p>
          </div>
        )}
      </div>

      {/* ============ FILTER PANEL ============ */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className="flex-shrink-0 bg-black/40"
            style={{ height: '10%' }}
            onClick={() => setShowFilters(false)}
          />
          <div className="flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0EDE8] px-5 pb-3 pt-5">
              <h2 className="font-serif text-lg font-semibold text-[#111111]">Filtres</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F0EDE8]"
                aria-label="Fermer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              {/* Catégorie */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Catégorie</h3>
                <div className="flex flex-wrap gap-2">
                  {FILTER_CATEGORIES.map((cat) => {
                    const active = pendingFilters.categories.includes(cat.key);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => togglePendingArray('categories', cat.key)}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-[#111111] text-white' : 'bg-[#F0EDE8] text-[#8A8A8A]'}`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Couleurs */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Couleurs</h3>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((color) => {
                    const active = pendingFilters.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => togglePendingArray('colors', color.name)}
                        className="flex cursor-pointer flex-col items-center gap-1"
                        aria-label={color.name}
                      >
                        <div
                          className={`h-8 w-8 rounded-full border-2 ${active ? 'border-[#111111] ring-2 ring-[#111111]/20' : 'border-[#E0E0E0]'}`}
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[10px] text-[#8A8A8A]">{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saison */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Saison</h3>
                <div className="flex flex-wrap gap-2">
                  {SEASON_OPTIONS.map((s) => {
                    const active = pendingFilters.seasons.includes(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => togglePendingArray('seasons', s.key)}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-[#111111] text-white' : 'bg-[#F0EDE8] text-[#8A8A8A]'}`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occasion */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Occasion</h3>
                <div className="flex flex-wrap gap-2">
                  {OCCASION_OPTIONS.map((o) => {
                    const active = pendingFilters.occasions.includes(o.key);
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => togglePendingArray('occasions', o.key)}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-[#111111] text-white' : 'bg-[#F0EDE8] text-[#8A8A8A]'}`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* État de port */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">État de port</h3>
                <div className="flex gap-2">
                  {([['any', 'Tous'], ['worn', 'Déjà porté'], ['never_worn', 'Jamais porté']] as const).map(([val, label]) => {
                    const active = pendingFilters.wornStatus === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPendingFilters((prev) => ({ ...prev, wornStatus: val }))}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-[#111111] text-white' : 'bg-[#F0EDE8] text-[#8A8A8A]'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prix d'achat */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Prix d&rsquo;achat</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min €"
                    value={pendingFilters.priceMin}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, priceMin: e.target.value }))}
                    className="w-24 rounded-xl border border-[#E0E0E0] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
                  />
                  <span className="text-xs text-[#8A8A8A]">à</span>
                  <input
                    type="number"
                    placeholder="Max €"
                    value={pendingFilters.priceMax}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, priceMax: e.target.value }))}
                    className="w-24 rounded-xl border border-[#E0E0E0] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Période d'achat */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111111]">Période d&rsquo;achat</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={pendingFilters.dateFrom}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                    className="rounded-xl border border-[#E0E0E0] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
                  />
                  <span className="text-xs text-[#8A8A8A]">à</span>
                  <input
                    type="date"
                    value={pendingFilters.dateTo}
                    onChange={(e) => setPendingFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                    className="rounded-xl border border-[#E0E0E0] px-3 py-2 text-sm text-[#111111] outline-none focus:border-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-[#F0EDE8] px-5 py-4">
              <button
                type="button"
                onClick={resetPendingFilters}
                className="flex-1 cursor-pointer rounded-full border border-[#111111] py-3 text-sm font-medium text-[#111111]"
              >
                Effacer tout
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
