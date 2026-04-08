'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';
import type { User } from '@/types';
import { api } from '@/lib/api';
import ChatWindow from '@/components/chat/ChatWindow';

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipient, setRecipient] = useState<User | null>(null);

  useEffect(() => {
    // Load recipient info from conversations or a dedicated endpoint
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
      <div className="flex items-center gap-3 pb-2">
        <a href="/messages" className="rounded-lg p-1 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </a>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl bg-white shadow-sm">
        <ChatWindow
          recipientId={id}
          recipientName={recipient?.name || 'Chargement...'}
        />
      </div>
    </div>
  );
}
