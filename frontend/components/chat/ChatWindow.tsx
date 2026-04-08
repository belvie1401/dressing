'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
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
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">{recipientName}</h2>
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
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrire un message..."
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full bg-black p-2 text-white hover:bg-gray-800 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
