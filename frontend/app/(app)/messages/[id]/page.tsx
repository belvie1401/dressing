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
      <div className="flex items-center gap-3 pb-3 pt-2">
        <a href="/messages" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-xs font-semibold text-[#8A8A8A]">
            {recipient?.name?.charAt(0) || '?'}
          </div>
          <span className="text-sm font-semibold text-[#111111]">{recipient?.name || 'Chargement...'}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <ChatWindow
          recipientId={id}
          recipientName={recipient?.name || 'Chargement...'}
        />
      </div>
    </div>
  );
}
