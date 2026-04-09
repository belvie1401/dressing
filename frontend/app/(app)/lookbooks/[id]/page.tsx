'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0D0D0D] border-t-transparent" />
      </div>
    );
  }

  if (!lookbook) {
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Lookbook non trouvé</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pt-2">
        <a href="/lookbooks" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="text-lg font-semibold text-[#0D0D0D]">Lookbook</h1>
      </div>

      <LookbookViewer lookbook={lookbook} onFeedback={handleFeedback} />
    </div>
  );
}
