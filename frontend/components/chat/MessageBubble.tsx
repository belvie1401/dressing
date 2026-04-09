'use client';

import type { Message } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'rounded-br-md bg-[#0D0D0D] text-white'
            : 'rounded-bl-md bg-[#F0F0F0] text-[#0D0D0D]'
        }`}
      >
        {message.type === 'IMAGE' && message.metadata && (
          <img
            src={(message.metadata as Record<string, string>).image_url}
            alt="Image"
            className="mb-1 rounded-lg"
          />
        )}

        <p className="text-sm">{message.content}</p>
        <p
          className={`mt-1 text-[10px] ${
            isOwn ? 'text-white/60' : 'text-[#8A8A8A]'
          }`}
        >
          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
        </p>
      </div>
    </div>
  );
}
