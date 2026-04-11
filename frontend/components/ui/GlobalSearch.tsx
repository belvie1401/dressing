'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { ClothingItem, Outfit, User } from '@/types';

// ─── Context ────────────────────────────────────────────────────────────────
type SearchCtx = { open: () => void; close: () => void; isOpen: boolean };

const Ctx = createContext<SearchCtx | null>(null);

export function useGlobalSearch(): SearchCtx {
  const v = useContext(Ctx);
  if (!v) {
    // Safe noop fallback so call sites outside the provider don't crash.
    return { open: () => {}, close: () => {}, isOpen: false };
  }
  return v;
}

// ─── Provider + Modal ───────────────────────────────────────────────────────
const RECENT_KEY = 'lien-recent-searches';
const MAX_RECENT = 5;

type Section = 'items' | 'outfits' | 'stylists';

interface Results {
  items: ClothingItem[];
  outfits: Outfit[];
  stylists: User[];
}

const EMPTY: Results = { items: [], outfits: [], stylists: [] };

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // ⌘K / Ctrl+K from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Ctx.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? <SearchModal onClose={close} /> : null}
    </Ctx.Provider>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────
function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  // Initial focus + load recent
  useEffect(() => {
    inputRef.current?.focus();
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Debounced fetch when query >= 2
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const [w, o, s] = await Promise.all([
        api.get<ClothingItem[]>(`/wardrobe?search=${encodeURIComponent(q)}&limit=3`),
        api.get<Outfit[]>(`/outfits?search=${encodeURIComponent(q)}&limit=3`),
        api.get<User[]>(`/stylists?search=${encodeURIComponent(q)}&limit=3`),
      ]);
      setResults({
        items: w.success && w.data ? w.data : [],
        outfits: o.success && o.data ? o.data : [],
        stylists: s.success && s.data ? s.data : [],
      });
      setLoading(false);
      setActive(0);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Flat list of selectable rows for keyboard navigation
  const flatRows = useMemo(() => {
    const rows: Array<{ section: Section; href: string; index: number }> = [];
    let i = 0;
    for (const it of results.items) {
      rows.push({ section: 'items', href: `/wardrobe/${it.id}`, index: i++ });
    }
    for (const o of results.outfits) {
      rows.push({ section: 'outfits', href: `/outfits/${o.id}`, index: i++ });
    }
    for (const s of results.stylists) {
      rows.push({ section: 'stylists', href: `/stylists/${s.id}`, index: i++ });
    }
    return rows;
  }, [results]);

  const totalResults =
    results.items.length + results.outfits.length + results.stylists.length;

  const saveRecent = useCallback((q: string) => {
    if (!q.trim()) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((p) => p !== q)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      saveRecent(query);
      onClose();
      router.push(href);
    },
    [onClose, query, router, saveRecent],
  );

  // Keyboard navigation: ↑ ↓ Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (flatRows.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((v) => (v + 1) % flatRows.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((v) => (v - 1 + flatRows.length) % flatRows.length);
      } else if (e.key === 'Enter') {
        const row = flatRows[active];
        if (row) {
          e.preventDefault();
          navigate(row.href);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flatRows, active, navigate]);

  const showRecent = query.trim().length < 2;

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fermer la recherche"
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/30"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-label="Recherche"
        className="fixed left-1/2 top-[10%] z-[61] flex max-h-[70vh] w-[92vw] max-w-[560px] -translate-x-1/2 flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* Sticky search input */}
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-[#EFEFEF] px-5 py-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher vêtements, looks, stylistes..."
            className="flex-1 bg-transparent text-base text-[#111111] outline-none placeholder:text-[#CFCFCF]"
          />
          <kbd className="rounded bg-[#F0EDE8] px-2 py-0.5 text-xs text-[#CFCFCF]">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {showRecent ? (
            <RecentAndQuickLinks
              recent={recent}
              onPick={(q) => setQuery(q)}
              onNavigate={navigate}
            />
          ) : loading ? (
            <SkeletonRows />
          ) : totalResults === 0 ? (
            <p className="py-8 text-center text-sm text-[#8A8A8A]">
              Aucun résultat pour &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ResultSections
              results={results}
              query={query}
              activeIndex={active}
              onSelect={navigate}
              onHover={setActive}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sub-views ──────────────────────────────────────────────────────────────
function RecentAndQuickLinks({
  recent,
  onPick,
  onNavigate,
}: {
  recent: string[];
  onPick: (q: string) => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="py-2">
      {recent.length > 0 ? (
        <>
          <p className="px-5 py-3 text-xs uppercase tracking-wide text-[#8A8A8A]">
            Recherches récentes
          </p>
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {recent.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onPick(q)}
                className="cursor-pointer rounded-full bg-[#F7F5F2] px-3 py-1.5 text-xs text-[#111111] transition-colors hover:bg-[#F0EDE8]"
              >
                {q}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <p className="px-5 pt-3 text-xs uppercase tracking-wide text-[#8A8A8A]">
        Accès rapide
      </p>
      <QuickLink href="/wardrobe" label="Mon dressing" onSelect={onNavigate} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        </svg>
      } />
      <QuickLink href="/outfits" label="Mes looks" onSelect={onNavigate} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      } />
      <QuickLink href="/stylists" label="Stylistes" onSelect={onNavigate} icon={
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      } />
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon,
  onSelect,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onSelect: (href: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(href)}
      className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left text-sm text-[#111111] transition-colors hover:bg-[#F7F5F2]"
    >
      <span className="text-[#8A8A8A]">{icon}</span>
      {label}
    </button>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2 p-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-[#F7F5F2]" />
      ))}
    </div>
  );
}

function ResultSections({
  results,
  query,
  activeIndex,
  onSelect,
  onHover,
}: {
  results: Results;
  query: string;
  activeIndex: number;
  onSelect: (href: string) => void;
  onHover: (i: number) => void;
}) {
  let runningIndex = 0;
  const sections: ReactNode[] = [];

  if (results.items.length > 0) {
    const startAt = runningIndex;
    sections.push(
      <SectionHeader key="h-items" label={`Vêtements (${results.items.length})`} />,
    );
    results.items.forEach((it, i) => {
      const idx = startAt + i;
      sections.push(
        <ItemRow
          key={`it-${it.id}`}
          item={it}
          query={query}
          active={idx === activeIndex}
          onClick={() => onSelect(`/wardrobe/${it.id}`)}
          onHover={() => onHover(idx)}
        />,
      );
    });
    runningIndex += results.items.length;
  }

  if (results.outfits.length > 0) {
    const startAt = runningIndex;
    sections.push(
      <SectionHeader key="h-outfits" label={`Looks (${results.outfits.length})`} />,
    );
    results.outfits.forEach((o, i) => {
      const idx = startAt + i;
      sections.push(
        <OutfitRow
          key={`o-${o.id}`}
          outfit={o}
          query={query}
          active={idx === activeIndex}
          onClick={() => onSelect(`/outfits/${o.id}`)}
          onHover={() => onHover(idx)}
        />,
      );
    });
    runningIndex += results.outfits.length;
  }

  if (results.stylists.length > 0) {
    const startAt = runningIndex;
    sections.push(
      <SectionHeader key="h-stylists" label={`Stylistes (${results.stylists.length})`} />,
    );
    results.stylists.forEach((s, i) => {
      const idx = startAt + i;
      sections.push(
        <StylistRow
          key={`s-${s.id}`}
          stylist={s}
          query={query}
          active={idx === activeIndex}
          onClick={() => onSelect(`/stylists/${s.id}`)}
          onHover={() => onHover(idx)}
        />,
      );
    });
  }

  return <div className="py-2">{sections}</div>;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="px-5 py-2 text-xs uppercase tracking-wide text-[#8A8A8A]">
      {label}
    </p>
  );
}

function highlightText(text: string | null | undefined, query: string): ReactNode {
  // Re-export to keep this file standalone — same logic as lib/highlight.
  if (!text) return text ?? '';
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-[#C6A47E]/20 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function ItemRow({
  item,
  query,
  active,
  onClick,
  onHover,
}: {
  item: ClothingItem;
  query: string;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const photo = item.bg_removed_url || item.photo_url;
  const name = item.name || item.brand || 'Vêtement';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors ${
        active ? 'bg-[#F0EDE8]' : 'hover:bg-[#F7F5F2]'
      }`}
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {highlightText(name, query)}
        </p>
        <p className="truncate text-xs text-[#8A8A8A]">
          {item.category}
          {item.brand ? ` · ${item.brand}` : ''}
        </p>
      </div>
    </button>
  );
}

function OutfitRow({
  outfit,
  query,
  active,
  onClick,
  onHover,
}: {
  outfit: Outfit;
  query: string;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const cover =
    outfit.items?.[0]?.item?.bg_removed_url ||
    outfit.items?.[0]?.item?.photo_url ||
    null;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors ${
        active ? 'bg-[#F0EDE8]' : 'hover:bg-[#F7F5F2]'
      }`}
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={cover} alt={outfit.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {highlightText(outfit.name, query)}
        </p>
        <p className="truncate text-xs text-[#8A8A8A]">
          {outfit.items?.length ?? 0} pièces
        </p>
      </div>
    </button>
  );
}

function StylistRow({
  stylist,
  query,
  active,
  onClick,
  onHover,
}: {
  stylist: User;
  query: string;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const initial = stylist.name?.charAt(0).toUpperCase() || '·';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors ${
        active ? 'bg-[#F0EDE8]' : 'hover:bg-[#F7F5F2]'
      }`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
        {stylist.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={stylist.avatar_url}
            alt={stylist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-sm text-[#C6A47E]">{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {highlightText(stylist.name, query)}
        </p>
        <p className="truncate text-xs text-[#8A8A8A]">
          {stylist.location || 'Styliste'}
        </p>
      </div>
    </button>
  );
}

// Re-export Link for convenience (keeps Next aware of internal routing)
export { Link };
