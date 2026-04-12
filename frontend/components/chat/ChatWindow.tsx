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

type SheetMode = null | 'root' | 'zoom';

export default function ChatWindow({ recipientId, recipientName, isOnline }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [zoomLink, setZoomLink] = useState('https://zoom.us/j/');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const pushOptimistic = (content: string, type: Message['type'], metadata?: Record<string, unknown>) => {
    if (!user) return;
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      from_id: user.id,
      to_id: recipientId,
      content,
      type,
      metadata,
      created_at: new Date().toISOString(),
    };
    addMessage(recipientId, optimistic);
  };

  const handleSend = () => {
    if (!input.trim() || !user) return;

    const socket = getSocket();
    socket.emit('message:send', {
      to_id: recipientId,
      content: input.trim(),
      type: 'TEXT',
    });

    pushOptimistic(input.trim(), 'TEXT');
    setInput('');
  };

  const handleSendZoom = () => {
    const url = zoomLink.trim();
    if (!url || !user) return;

    const socket = getSocket();
    socket.emit('message:send', {
      to_id: recipientId,
      content: url,
      type: 'ZOOM_LINK',
      metadata: { zoom_url: url },
    });

    pushOptimistic(url, 'ZOOM_LINK', { zoom_url: url });
    setZoomLink('https://zoom.us/j/');
    setSheet(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const socket = getSocket();
      socket.emit('message:send', {
        to_id: recipientId,
        content: file.name,
        type: 'IMAGE',
        metadata: { image_url: dataUrl },
      });
      pushOptimistic(file.name, 'IMAGE', { image_url: dataUrl });
      setSheet(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {[...chatMessages].reverse().map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.from_id === user?.id} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#F2F0EC] px-4 py-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Écrire un message..."
            className="flex-1 rounded-full bg-[#F2F0EC] px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#9B9B9B] outline-none"
          />
          <button
            type="button"
            onClick={() => setSheet('root')}
            className="flex shrink-0 items-center justify-center text-[#9B9B9B]"
            aria-label="Plus d'options"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          {input.trim() ? (
            <button
              onClick={handleSend}
              className="flex shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] p-2 text-white"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          ) : (
            <button type="button" className="flex shrink-0 items-center justify-center text-[#9B9B9B]" aria-label="Micro">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </div>

      {/* Action sheet backdrop */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setSheet(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {sheet === 'root' && (
              <>
                <div className="w-10 h-1 bg-[#EFEFEF] rounded-full mx-auto mb-4" />
                <h3 className="font-serif text-lg text-[#111111] text-center mb-4">
                  Que voulez-vous envoyer ?
                </h3>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSheet('zoom')}
                    className="flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(45, 140, 255, 0.1)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D8CFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111111]">
                        Envoyer un lien Zoom
                      </p>
                      <p className="text-xs text-[#8A8A8A]">
                        Invitez votre cliente en visio
                      </p>
                    </div>
                  </button>

                  <a
                    href="/lookbooks"
                    onClick={() => setSheet(null)}
                    className="flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EDE5DC] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111111]">
                        Partager un lookbook
                      </p>
                      <p className="text-xs text-[#8A8A8A]">
                        Envoyez une création
                      </p>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111111]">
                        Envoyer une photo
                      </p>
                      <p className="text-xs text-[#8A8A8A]">
                        Depuis votre galerie
                      </p>
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSheet(null)}
                  className="mt-4 w-full text-center text-sm text-[#8A8A8A] py-2"
                >
                  Annuler
                </button>
              </>
            )}

            {sheet === 'zoom' && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setSheet('root')}
                    className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
                    aria-label="Retour"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <h3 className="font-serif text-lg text-[#111111]">
                    Envoyer un lien Zoom
                  </h3>
                </div>

                <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                  Lien de la réunion
                </label>
                <input
                  type="url"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                  className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
                  placeholder="https://zoom.us/j/..."
                  autoFocus
                />
                <p className="text-xs text-[#8A8A8A] mt-2">
                  La cliente recevra un lien cliquable pour rejoindre la visio.
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSheet(null)}
                    className="flex-1 rounded-full border border-[#EFEFEF] py-3 text-sm text-[#8A8A8A]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSendZoom}
                    disabled={!zoomLink.trim() || zoomLink === 'https://zoom.us/j/'}
                    className="flex-1 rounded-full bg-[#2D8CFF] py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
