'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { ClothingItem, StylistClient, User } from '@/types';
import { api } from '@/lib/api';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<User | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [connsRes, wardrobeRes] = await Promise.all([
          api.get<StylistClient[]>('/stylists/connections'),
          api.get<ClothingItem[]>(`/stylists/client/${id}/wardrobe`),
        ]);

        if (connsRes.success && Array.isArray(connsRes.data)) {
          const conn = connsRes.data.find((c) => c.client?.id === id);
          if (conn?.client) setClient(conn.client);
        }

        if (wardrobeRes.success && Array.isArray(wardrobeRes.data)) {
          setItems(wardrobeRes.data);
        } else if (wardrobeRes.error) {
          setError(wardrobeRes.error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const displayName = client?.name || 'Cliente';

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          aria-label="Retour"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">
            Dressing de
          </p>
          <h1 className="font-serif text-xl text-[#111111] truncate">{displayName}</h1>
        </div>
        <Link
          href={`/messages/${id}`}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          aria-label="Envoyer un message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Link>
      </header>

      {/* Client summary */}
      {client && (
        <section className="mx-5 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#EDE5DC]">
            {client.avatar_url ? (
              <Image src={client.avatar_url} alt={client.name} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-xl text-[#C6A47E]">
                  {client.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111]">{client.name}</p>
            <p className="text-xs text-[#8A8A8A] truncate">{client.email}</p>
            <p className="text-xs text-[#C6A47E] mt-0.5">
              {items.length} pi&egrave;ces dans le dressing
            </p>
          </div>
        </section>
      )}

      {/* Wardrobe grid */}
      <section className="mt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg text-[#111111]">Sa garde-robe</h2>
          <span className="text-xs text-[#8A8A8A]">Lecture seule</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="mx-5 bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-sm text-[#8A8A8A]">{error}</p>
            <p className="text-xs text-[#8A8A8A] mt-2">
              Assurez-vous que la connexion est active.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-5 bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-[#111111]">Garde-robe vide</p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Cette cliente n&rsquo;a pas encore ajout&eacute; de pi&egrave;ces.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[3/4] w-full bg-[#EDE5DC]">
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                    {item.category}
                  </p>
                  <p className="text-sm font-semibold text-[#111111] truncate">
                    {item.brand || 'Sans marque'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA — Create lookbook */}
      <div className="fixed bottom-24 left-0 right-0 px-5 lg:hidden">
        <Link
          href={`/lookbooks/create?client=${id}`}
          className="block bg-[#D4785C] text-white rounded-full py-4 text-center text-sm font-medium shadow-lg"
        >
          Cr&eacute;er un lookbook
        </Link>
      </div>

      {/* Desktop CTA inline */}
      <div className="hidden lg:block mt-8 px-5">
        <Link
          href={`/lookbooks/create?client=${id}`}
          className="block bg-[#D4785C] text-white rounded-full py-4 text-center text-sm font-medium max-w-sm mx-auto"
        >
          Cr&eacute;er un lookbook
        </Link>
      </div>
    </div>
  );
}
