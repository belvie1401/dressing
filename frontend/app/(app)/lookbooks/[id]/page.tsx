'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeft, Loader2 } from 'lucide-react';
import type { Lookbook } from '@/types';
import { api } from '@/lib/api';
import LookbookViewer from '@/components/chat/LookbookViewer';

export default function LookbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [lookbook, setLookbook] = useState<Lookbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Lookbook>(`/lookbooks/${id}`);
      if (res.success && res.data) {
        setLookbook(res.data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleFeedback = async (status: 'approve' | 'reject', feedback: string) => {
    const res = await api.post<Lookbook>(`/lookbooks/${id}/feedback`, { status, feedback });
    if (res.success && res.data) {
      setLookbook(res.data);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  if (!lookbook) {
    return <div className="py-16 text-center text-sm text-gray-500">Lookbook non trouvé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <a href="/lookbooks" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
        <h1 className="text-xl font-bold text-gray-900">Lookbook</h1>
      </div>

      <LookbookViewer lookbook={lookbook} onFeedback={handleFeedback} />
    </div>
  );
}
