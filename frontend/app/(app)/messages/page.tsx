'use client';

import { useEffect } from 'react';

import { useChatStore } from '@/lib/store';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MessagesPage() {
  const { conversations, isLoading, loadConversations } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Messages</h1>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement...</div>
      ) : conversations.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">Aucune conversation</p>
          <p className="mt-1 text-xs text-gray-400">
            Connectez-vous avec un styliste pour commencer
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <a
              key={conv.contact.id}
              href={`/messages/${conv.contact.id}`}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-100"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {conv.contact.avatar_url ? (
                  <img src={conv.contact.avatar_url} alt={conv.contact.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-500">
                    {conv.contact.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{conv.contact.name}</p>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(conv.lastMessage.created_at), 'HH:mm', { locale: fr })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="truncate text-xs text-gray-500">{conv.lastMessage.content}</p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                  {conv.unreadCount}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
