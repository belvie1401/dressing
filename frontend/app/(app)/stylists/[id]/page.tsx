'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StylistDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/stylists" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Profil du styliste</h1>
      </div>

      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">Détails du styliste à venir</p>
      </div>
    </div>
  );
}
