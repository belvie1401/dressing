'use client';

import { useParams } from 'next/navigation';

export default function StylistDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <a href="/stylists" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#0D0D0D]">Profil du styliste</h1>
      </div>

      <div className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <p className="text-sm text-[#8A8A8A]">Détails du styliste à venir</p>
      </div>
    </div>
  );
}
