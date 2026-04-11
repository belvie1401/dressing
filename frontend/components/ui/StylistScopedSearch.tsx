'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { highlight } from '@/lib/highlight';

interface StylistClientResult {
  id: string;
  name: string;
  avatar_url?: string | null;
  email?: string | null;
  location?: string | null;
}

interface StylistItemResult {
  id: string;
  user_id: string;
  name?: string | null;
  brand?: string | null;
  category: string;
  photo_url?: string | null;
  bg_removed_url?: string | null;
  client_name?: string;
}

interface ScopedSearchResults {
  clients: StylistClientResult[];
  items: StylistItemResult[];
}

const EMPTY: ScopedSearchResults = { clients: [], items: [] };

/**
 * StylistScopedSearch — inline input + dropdown shown in the stylist
 * dashboard top bar. Searches the stylist's own clients (by name/email/city)
 * and clothing items across those clients via GET /api/stylists/search?q=.
 *
 * Smaller variant of the global search modal: dropdown anchored to the input,
 * 300ms debounce, click-outside / Esc to close, ⌘K shortcut focuses input.
 */
export default function StylistScopedSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ScopedSearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  // ⌘K focuses this input (still works alongside the global search modal)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click outside closes the dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

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
      const res = await api.get<ScopedSearchResults>(
        `/stylists/search?q=${encodeURIComponent(q)}`,
      );
      if (res.success && res.data) {
        setResults(res.data);
      } else {
        setResults(EMPTY);
      }
      setLoading(false);
      setActive(0);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Flat row list for keyboard nav
  const flatRows = useMemo(() => {
    const rows: Array<{ kind: 'client' | 'item'; href: string }> = [];
    for (const c of results.clients) {
      rows.push({ kind: 'client', href: `/my-clients/${c.id}` });
    }
    for (const it of results.items) {
      rows.push({ kind: 'item', href: `/stylist-dashboard/clients/${it.user_id}` });
    }
    return rows;
  }, [results]);

  const total = results.clients.length + results.items.length;

  const navigate = (href: string) => {
    setOpen(false);
    setQuery('');
    router.push(href);
  };

  // Arrow / Enter / Esc on the input
  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
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

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative hidden flex-1 max-w-md md:block">
      <label className="relative block">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8A8A8A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          placeholder="Rechercher une cliente, un v&ecirc;tement..."
          className="w-full rounded-full bg-[#F7F5F2] py-2 pl-9 pr-16 text-sm text-[#111111] placeholder:text-[#8A8A8A] outline-none focus:ring-1 focus:ring-[#111111]/10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#EFEFEF] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#8A8A8A]">
          &#8984; K
        </span>
      </label>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-[#EFEFEF] bg-white shadow-xl">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-[#F7F5F2]" />
              ))}
            </div>
          ) : total === 0 ? (
            <p className="py-6 text-center text-sm text-[#8A8A8A]">
              Aucun r&eacute;sultat pour &laquo;{query.trim()}&raquo;
            </p>
          ) : (
            <div className="py-2">
              {results.clients.length > 0 ? (
                <>
                  <SectionHeader label={`Clientes (${results.clients.length})`} />
                  {results.clients.map((c, i) => {
                    const idx = i;
                    return (
                      <ClientRow
                        key={c.id}
                        client={c}
                        query={query}
                        active={idx === active}
                        onClick={() => navigate(`/my-clients/${c.id}`)}
                        onHover={() => setActive(idx)}
                      />
                    );
                  })}
                </>
              ) : null}

              {results.items.length > 0 ? (
                <>
                  <SectionHeader label={`V\u00eatements (${results.items.length})`} />
                  {results.items.map((it, i) => {
                    const idx = results.clients.length + i;
                    return (
                      <ItemRow
                        key={it.id}
                        item={it}
                        query={query}
                        active={idx === active}
                        onClick={() => navigate(`/stylist-dashboard/clients/${it.user_id}`)}
                        onHover={() => setActive(idx)}
                      />
                    );
                  })}
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: ReactNode }) {
  return (
    <p className="px-4 py-1.5 text-[10px] uppercase tracking-wide text-[#8A8A8A]">
      {label}
    </p>
  );
}

function ClientRow({
  client,
  query,
  active,
  onClick,
  onHover,
}: {
  client: StylistClientResult;
  query: string;
  active: boolean;
  onClick: () => void;
  onHover: () => void;
}) {
  const initial = client.name?.charAt(0).toUpperCase() || '·';
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        active ? 'bg-[#F0EDE8]' : 'hover:bg-[#F7F5F2]'
      }`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
        {client.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={client.avatar_url}
            alt={client.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-serif text-xs text-[#C6A47E]">{initial}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {highlight(client.name, query)}
        </p>
        <p className="truncate text-[11px] text-[#8A8A8A]">
          {client.location || 'Cliente'}
        </p>
      </div>
    </button>
  );
}

function ItemRow({
  item,
  query,
  active,
  onClick,
  onHover,
}: {
  item: StylistItemResult;
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
      className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        active ? 'bg-[#F0EDE8]' : 'hover:bg-[#F7F5F2]'
      }`}
    >
      <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">
          {highlight(name, query)}
        </p>
        <p className="truncate text-[11px] text-[#8A8A8A]">
          {item.client_name ? item.client_name : item.category}
          {item.brand ? ` · ${item.brand}` : ''}
        </p>
      </div>
    </button>
  );
}
