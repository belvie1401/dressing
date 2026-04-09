'use client';

import { useState, useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { useAuthStore, useChatStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  isOnline?: boolean;
}

export default function ChatWindow({ recipientId, recipientName, isOnline }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const { messages, loadMessages, addMessage } = useChatStore();

  const chatMessages = messages[recipientId] || [];

  useEffect(() => {
    loadMessages(recipientId);

    const socket = getSocket();
    const handleReceived = (msg: Message) => {
      if (msg.from_id === recipientId) {
        addMessage(recipientId, msg);
        socket.emit('message:read', { from_id: recipientId });
      }
    };

    socket.on('message:received', handleReceived);
    return () => {
      socket.off('message:received', handleReceived);
    };
  }, [recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const socket = getSocket();
    socket.emit('message:send', {
      to_id: recipientId,
      content: input.trim(),
      type: 'TEXT',
    });

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      from_id: user.id,
      to_id: recipientId,
      content: input.trim(),
      type: 'TEXT',
      created_at: new Date().toISOString(),
    };
    addMessage(recipientId, optimistic);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[#F0F0F0] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#0D0D0D]">{recipientName}</h2>
          {isOnline && (
            <span className="h-2 w-2 rounded-full bg-green-500" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {[...chatMessages].reverse().map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.from_id === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#F0F0F0] p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrire un message..."
            className="flex-1 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-sm text-[#0D0D0D] placeholder-[#8A8A8A] focus:border-[#0D0D0D] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full bg-[#0D0D0D] p-2 text-white disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
