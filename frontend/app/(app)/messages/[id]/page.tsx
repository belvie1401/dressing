'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { User } from '@/types';
import { api } from '@/lib/api';
import ChatWindow from '@/components/chat/ChatWindow';

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipient, setRecipient] = useState<User | null>(null);

  useEffect(() => {
    const loadRecipient = async () => {
      const res = await api.get<{ contact: User }[]>('/messages');
      if (res.success && res.data) {
        const conv = (res.data as any[]).find((c: any) => c.contact?.id === id);
        if (conv) {
          setRecipient(conv.contact);
        }
      }
    };
    loadRecipient();
  }, [id]);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 md:px-0 md:pb-3 md:pt-2">
        <div className="flex items-center gap-3">
          <a href="/messages" className="flex h-8 w-8 items-center justify-center rounded-full bg-white md:h-10 md:w-10" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-semibold text-[#9B9B9B]">
              {recipient?.name?.charAt(0) || '?'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#1A1A1A]">{recipient?.name || 'Chargement...'}</span>
              <span className="text-xs text-green-500">En ligne</span>
            </div>
          </div>
        </div>
        <button type="button" className="flex h-8 w-8 items-center justify-center text-[#9B9B9B]" aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-hidden bg-white md:rounded-2xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <ChatWindow
          recipientId={id}
          recipientName={recipient?.name || 'Chargement...'}
        />
      </div>
    </div>
  );
}
