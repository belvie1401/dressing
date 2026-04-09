'use client';

import { useState, useEffect } from 'react';
import type { Lookbook } from '@/types';
import { api } from '@/lib/api';

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Brouillon', bg: '#F0F0F0', text: '#0D0D0D' },
  SENT: { label: 'Envoyé', bg: '#DBEAFE', text: '#1D4ED8' },
  APPROVED: { label: 'Approuvé', bg: '#DCFCE7', text: '#16A34A' },
  REJECTED: { label: 'Refusé', bg: '#FEE2E2', text: '#DC2626' },
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
      <h1 className="text-2xl font-bold text-[#0D0D0D] pt-2">Lookbooks</h1>

      {loading ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Chargement...</div>
      ) : lookbooks.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm text-[#8A8A8A]">Aucun lookbook</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lookbooks.map((lb) => {
            const status = statusLabels[lb.status] || statusLabels.DRAFT;
            return (
              <a
                key={lb.id}
                href={`/lookbooks/${lb.id}`}
                className="block rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#0D0D0D]">{lb.title}</h3>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: status.bg, color: status.text }}>
                    {status.label}
                  </span>
                </div>
                {lb.description && (
                  <p className="mt-1 text-xs text-[#8A8A8A]">{lb.description}</p>
                )}
                <p className="mt-2 text-[10px] text-[#8A8A8A]">
                  {lb.outfits?.length || 0} tenues · Par {lb.stylist?.name || 'Styliste'}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
