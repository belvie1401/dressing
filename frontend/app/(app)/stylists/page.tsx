'use client';

import { useState, useEffect } from 'react';
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
      <h1 className="text-2xl font-bold text-[#0D0D0D] pt-2">Stylistes</h1>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: '#EFEFEF' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un styliste..."
          className="flex-1 bg-transparent text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Chargement...</div>
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
