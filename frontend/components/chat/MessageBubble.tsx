'use client';

import type { Message } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Zoom link — render as a special card, full-width-ish
  if (message.type === 'ZOOM_LINK') {
    const zoomUrl =
      (message.metadata as Record<string, string> | undefined)?.zoom_url ||
      message.content;
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className="max-w-[85%] rounded-2xl p-4"
          style={{ background: 'rgba(45, 140, 255, 0.1)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2D8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p className="font-semibold text-sm text-[#111111]">Rejoindre la visio</p>
          </div>
          <p className="text-xs text-[#8A8A8A] truncate mb-3">{zoomUrl}</p>
          <button
            type="button"
            onClick={() => window.open(zoomUrl, '_blank', 'noopener,noreferrer')}
            className="rounded-full px-4 py-2 text-xs font-medium text-white"
            style={{ background: '#2D8CFF' }}
          >
            Ouvrir Zoom
          </button>
          <p className="text-[10px] text-[#8A8A8A] mt-2">
            {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
          </p>
        </div>
      </div>
    );
  }

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
