'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StylistClient, User, ConnectionStatus } from '@/types';
import { api } from '@/lib/api';

type TabKey = 'ACTIVE' | 'PENDING' | 'ENDED';

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  ACTIVE: 'Active',
  PENDING: 'En attente',
  ENDED: 'Archiv\u00e9e',
};

const STATUS_CLASS: Record<ConnectionStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-600',
  PENDING: 'bg-amber-50 text-amber-600',
  ENDED: 'bg-[#F0EDE8] text-[#8A8A8A]',
};

interface ClientRow {
  connectionId: string;
  client: User;
  status: ConnectionStatus;
  wardrobeCount?: number;
  lastActivity?: string;
}

export default function MyClientsPage() {
  const [tab, setTab] = useState<TabKey>('ACTIVE');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const res = await api.get<StylistClient[]>('/stylists/connections');
      if (!mounted) return;
      if (res.success && Array.isArray(res.data)) {
        const mapped: ClientRow[] = res.data
          .filter((c) => !!c.client)
          .map((c) => ({
            connectionId: c.id,
            client: c.client as User,
            status: c.status,
            wardrobeCount: undefined,
            lastActivity: c.started_at
              ? `Connect\u00e9e depuis ${new Date(c.started_at).toLocaleDateString('fr-FR')}`
              : 'Nouvelle demande',
          }));
        setRows(mapped);
      } else {
        setRows([]);
      }
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (r.status !== tab) return false;
      if (!search) return true;
      return r.client.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [rows, tab, search]);

  const counts = useMemo(
    () => ({
      ACTIVE: rows.filter((r) => r.status === 'ACTIVE').length,
      PENDING: rows.filter((r) => r.status === 'PENDING').length,
      ENDED: rows.filter((r) => r.status === 'ENDED').length,
    }),
    [rows]
  );

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* Header */}
      <header className="px-5 pt-6">
        <h1 className="font-serif text-2xl text-[#111111]">Mes clientes</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">
          Suivez et accompagnez votre client&egrave;le
        </p>

        {/* Search bar */}
        <div className="mt-5 flex items-center gap-3 rounded-full bg-[#F0EDE8] px-4 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une cliente..."
            className="flex-1 bg-transparent text-sm text-[#111111] placeholder:text-[#8A8A8A] focus:outline-none"
          />
        </div>
      </header>

      {/* Tabs */}
      <nav className="px-5 mt-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <TabPill
            label={`Actives`}
            count={counts.ACTIVE}
            active={tab === 'ACTIVE'}
            onClick={() => setTab('ACTIVE')}
          />
          <TabPill
            label="En attente"
            count={counts.PENDING}
            active={tab === 'PENDING'}
            onClick={() => setTab('PENDING')}
          />
          <TabPill
            label="Archiv\u00e9es"
            count={counts.ENDED}
            active={tab === 'ENDED'}
            onClick={() => setTab('ENDED')}
          />
        </div>
      </nav>

      {/* Client list */}
      <main className="mt-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-5 bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#EDE5DC] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#111111]">
              Aucune cliente {tab === 'ACTIVE' ? 'active' : tab === 'PENDING' ? 'en attente' : 'archiv\u00e9e'}
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Vos clientes appara\u00eetront ici
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((row) => (
              <ClientCard key={row.connectionId} row={row} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TabPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap flex items-center gap-2 ${
        active
          ? 'bg-[#111111] text-white'
          : 'bg-white text-[#8A8A8A]'
      }`}
    >
      {label}
      <span
        className={`text-[10px] ${
          active ? 'text-[#C6A47E]' : 'text-[#CFCFCF]'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function ClientCard({ row }: { row: ClientRow }) {
  const { client, status, wardrobeCount, lastActivity } = row;
  return (
    <Link
      href={`/my-clients/${client.id}`}
      className="bg-white rounded-2xl p-4 mx-5 flex items-center gap-3 shadow-sm"
    >
      <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-[#EDE5DC]">
        {client.avatar_url ? (
          <Image src={client.avatar_url} alt={client.name} fill className="object-cover" sizes="48px" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-semibold text-[#C6A47E]">{client.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#111111] truncate">{client.name}</p>
        {lastActivity && (
          <p className="text-xs text-[#8A8A8A] mt-0.5 truncate">{lastActivity}</p>
        )}
        {wardrobeCount !== undefined && wardrobeCount > 0 && (
          <p className="text-xs text-[#8A8A8A] mt-0.5">
            Garde-robe : {wardrobeCount} pi&egrave;ces
          </p>
        )}
      </div>
      <div className="flex flex-col items-end shrink-0 gap-1">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
        {status === 'ACTIVE' && (
          <span className="text-[10px] text-[#C6A47E]">Voir le dressing</span>
        )}
      </div>
    </Link>
  );
}
