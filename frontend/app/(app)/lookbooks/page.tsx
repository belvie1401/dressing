'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Lookbook } from '@/types';
import { api } from '@/lib/api';

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600' },
  SENT: { label: 'Envoyé', color: 'bg-blue-100 text-blue-700' },
  APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Refusé', color: 'bg-red-100 text-red-700' },
};

export default function LookbooksPage() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Lookbook[]>('/lookbooks');
      if (res.success && res.data) {
        setLookbooks(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Lookbooks</h1>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
      ) : lookbooks.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">Aucun lookbook</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lookbooks.map((lb) => {
            const status = statusLabels[lb.status] || statusLabels.DRAFT;
            return (
              <Link
                key={lb.id}
                href={`/lookbooks/${lb.id}`}
                className="block rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{lb.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                {lb.description && (
                  <p className="mt-1 text-xs text-gray-500">{lb.description}</p>
                )}
                <p className="mt-2 text-[10px] text-gray-400">
                  {lb.outfits?.length || 0} tenues • Par {lb.stylist?.name || 'Styliste'}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
