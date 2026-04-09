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
      <h1 className="text-2xl font-bold text-[#0D0D0D] pt-2">Messages</h1>

      {/* Search */}
      <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: '#EFEFEF' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-sm text-[#8A8A8A]">Rechercher une conversation...</span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-sm text-[#8A8A8A]">Chargement...</div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm text-[#8A8A8A]">Aucune conversation</p>
          <p className="mt-1 text-xs text-[#8A8A8A]">
            Connectez-vous avec un styliste pour commencer
          </p>
          <a href="/stylists" className="mt-4 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-sm font-medium text-white">
            Trouver un styliste
          </a>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv) => (
            <a
              key={conv.contact.id}
              href={`/messages/${conv.contact.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 transition-colors" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F0F0F0]">
                {conv.contact.avatar_url ? (
                  <img src={conv.contact.avatar_url} alt={conv.contact.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-[#8A8A8A]">
                    {conv.contact.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#0D0D0D]">{conv.contact.name}</p>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-[#8A8A8A]">
                      {format(new Date(conv.lastMessage.created_at), 'HH:mm', { locale: fr })}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className="truncate text-xs text-[#8A8A8A]">{conv.lastMessage.content}</p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D0D0D] text-[10px] font-bold text-white">
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
