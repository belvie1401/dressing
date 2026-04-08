'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { User, StylistClient } from '@/types';
import { api } from '@/lib/api';
import StylistCard from '@/components/ui/StylistCard';

export default function StylistsPage() {
  const [stylists, setStylists] = useState<User[]>([]);
  const [connections, setConnections] = useState<StylistClient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [stylistsRes, connectionsRes] = await Promise.all([
        api.get<User[]>('/stylists'),
        api.get<StylistClient[]>('/stylists/connections'),
      ]);
      if (stylistsRes.success && stylistsRes.data) {
        setStylists(stylistsRes.data);
      }
      if (connectionsRes.success && connectionsRes.data) {
        setConnections(connectionsRes.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const connectedIds = new Set(connections.map((c) => c.stylist_id));

  const filtered = stylists.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInvite = async (stylistId: string) => {
    const res = await api.post<StylistClient>('/stylists/invite', { stylist_id: stylistId });
    if (res.success && res.data) {
      setConnections([...connections, res.data]);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Stylistes</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un styliste..."
          className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-black focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((stylist) => (
            <StylistCard
              key={stylist.id}
              stylist={stylist}
              isConnected={connectedIds.has(stylist.id)}
              onInvite={handleInvite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
