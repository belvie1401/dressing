'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { ClothingItem, ClothingComment, StylistClient, User } from '@/types';
import { api } from '@/lib/api';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<User | null>(null);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState('');
  const [commentModal, setCommentModal] = useState<ClothingItem | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [connsRes, wardrobeRes] = await Promise.all([
          api.get<StylistClient[]>('/stylists/connections'),
          api.get<ClothingItem[]>(`/stylists/client/${id}/wardrobe`),
        ]);

        if (connsRes.success && Array.isArray(connsRes.data)) {
          const conn = connsRes.data.find((c) => c.client?.id === id);
          if (conn?.client) setClient(conn.client);
        }

        if (wardrobeRes.success && Array.isArray(wardrobeRes.data)) {
          setItems(wardrobeRes.data);
        } else if (wardrobeRes.error) {
          setError(wardrobeRes.error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const displayName = client?.name || 'Cliente';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleToggleFavorite = async (item: ClothingItem) => {
    const res = await api.put<ClothingItem>(`/wardrobe/${item.id}/favorite`);
    if (res.success && res.data) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, stylist_favorite: res.data!.stylist_favorite } : it)),
      );
      showToast(res.data.stylist_favorite ? '❤️ Coup de cœur ajouté' : 'Coup de cœur retiré');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          aria-label="Retour"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#8A8A8A] uppercase tracking-wide">
            Dressing de
          </p>
          <h1 className="font-serif text-xl text-[#111111] truncate">{displayName}</h1>
        </div>
        <Link
          href={`/messages/${id}`}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
          aria-label="Envoyer un message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </Link>
      </header>

      {/* Client summary */}
      {client && (
        <section className="mx-5 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#EDE5DC]">
            {client.avatar_url ? (
              <Image src={client.avatar_url} alt={client.name} fill className="object-cover" sizes="56px" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-xl text-[#C6A47E]">
                  {client.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111]">{client.name}</p>
            <p className="text-xs text-[#8A8A8A] truncate">{client.email}</p>
            <p className="text-xs text-[#C6A47E] mt-0.5">
              {items.length} pi&egrave;ces dans le dressing
            </p>
          </div>
        </section>
      )}

      {/* Wardrobe grid */}
      <section className="mt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg text-[#111111]">Sa garde-robe</h2>
          <span className="text-xs text-[#8A8A8A]">{items.length} pièces</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="mx-5 bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-sm text-[#8A8A8A]">{error}</p>
            <p className="text-xs text-[#8A8A8A] mt-2">
              Assurez-vous que la connexion est active.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-5 bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-[#111111]">Garde-robe vide</p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Cette cliente n&rsquo;a pas encore ajout&eacute; de pi&egrave;ces.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 px-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[3/4] w-full bg-[#EDE5DC]">
                  <Image
                    src={item.bg_removed_url || item.photo_url}
                    alt={item.category}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 200px"
                  />
                  {/* Favorite heart badge */}
                  {item.stylist_favorite && (
                    <span className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#D4785C] shadow-md">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </span>
                  )}
                  {/* Comment count badge */}
                  {(item.comments?.length ?? 0) > 0 && (
                    <span className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 backdrop-blur shadow-sm">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-[10px] font-medium text-[#8A8A8A]">{item.comments!.length}</span>
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[#8A8A8A]">
                    {item.category}
                  </p>
                  <p className="text-sm font-semibold text-[#111111] truncate">
                    {item.brand || 'Sans marque'}
                  </p>
                  {/* Action buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCommentModal(item)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-full border border-[#E0E0E0] py-1.5 text-[10px] font-medium text-[#8A8A8A] transition-colors hover:bg-[#F0F0F0]"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Commenter
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(item)}
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                        item.stylist_favorite
                          ? 'border-[#D4785C] bg-[#D4785C]/10 text-[#D4785C]'
                          : 'border-[#E0E0E0] text-[#CFCFCF] hover:border-[#D4785C] hover:text-[#D4785C]'
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={item.stylist_favorite ? '#D4785C' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA — Create lookbook */}
      <div className="fixed bottom-24 left-0 right-0 px-5 lg:hidden">
        <Link
          href={`/lookbooks/create?client=${id}`}
          className="block bg-[#D4785C] text-white rounded-full py-4 text-center text-sm font-medium shadow-lg"
        >
          Cr&eacute;er un lookbook
        </Link>
      </div>

      {/* Desktop CTA inline */}
      <div className="hidden lg:block mt-8 px-5">
        <Link
          href={`/lookbooks/create?client=${id}`}
          className="block bg-[#D4785C] text-white rounded-full py-4 text-center text-sm font-medium max-w-sm mx-auto"
        >
          Cr&eacute;er un lookbook
        </Link>
      </div>

      {/* Comment modal */}
      {commentModal && (
        <CommentModal
          item={commentModal}
          onClose={() => setCommentModal(null)}
          onCommentAdded={(itemId, comment) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === itemId
                  ? { ...it, comments: [...(it.comments || []), comment] }
                  : it,
              ),
            );
            showToast('✓ Commentaire ajouté');
          }}
          onFavoriteToggled={(itemId, isFav) => {
            setItems((prev) =>
              prev.map((it) =>
                it.id === itemId ? { ...it, stylist_favorite: isFav } : it,
              ),
            );
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Comment Modal sub-component ────────────────────────────────────────────
function CommentModal({
  item,
  onClose,
  onCommentAdded,
  onFavoriteToggled,
}: {
  item: ClothingItem;
  onClose: () => void;
  onCommentAdded: (itemId: string, comment: ClothingComment) => void;
  onFavoriteToggled: (itemId: string, isFav: boolean) => void;
}) {
  const [comments, setComments] = useState<ClothingComment[]>(item.comments || []);
  const [text, setText] = useState('');
  const [isFav, setIsFav] = useState(item.stylist_favorite || false);
  const [sending, setSending] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch latest comments for this item
    api.get<ClothingComment[]>(`/wardrobe/${item.id}/comments`).then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setComments(res.data);
      }
    });
  }, [item.id]);

  const handleSubmit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await api.post<ClothingComment>(`/wardrobe/${item.id}/comments`, {
      content: text.trim(),
      is_favorite: isFav,
    });
    if (res.success && res.data) {
      setComments((prev) => [...prev, res.data!]);
      onCommentAdded(item.id, res.data);
      setText('');
      // If isFav was toggled, also update the item's favorite status
      if (isFav && !item.stylist_favorite) {
        onFavoriteToggled(item.id, true);
      }
    }
    setSending(false);
  };

  const handleFavToggle = async () => {
    const res = await api.put<ClothingItem>(`/wardrobe/${item.id}/favorite`);
    if (res.success && res.data) {
      setIsFav(res.data.stylist_favorite || false);
      onFavoriteToggled(item.id, res.data.stylist_favorite || false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 pb-8 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#E0E0E0]" />

        {/* Item preview */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#EDE5DC]">
            <Image
              src={item.bg_removed_url || item.photo_url}
              alt={item.category}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#111111] truncate">
              {item.brand || item.category}
            </p>
            <p className="text-xs text-[#8A8A8A]">{item.category}</p>
          </div>
          <button
            type="button"
            onClick={handleFavToggle}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
              isFav
                ? 'border-[#D4785C] bg-[#D4785C]/10'
                : 'border-[#E0E0E0] hover:border-[#D4785C]'
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFav ? '#D4785C' : 'none'}
              stroke={isFav ? '#D4785C' : '#CFCFCF'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Previous comments */}
        {comments.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto space-y-2">
            <p className="text-xs font-medium text-[#8A8A8A] mb-1">Commentaires précédents</p>
            {comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-[#F7F5F2] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#111111]">{c.stylist?.name || 'Vous'}</p>
                  <span className="text-[10px] text-[#CFCFCF]">{formatCommentDate(c.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-[#8A8A8A]">{c.content}</p>
                {c.is_favorite && (
                  <div className="mt-1 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="text-[10px] text-[#D4785C]">Coup de cœur</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Votre conseil sur cette pièce…"
          className="w-full rounded-2xl border border-[#E0E0E0] bg-[#F7F5F2] p-3 text-sm text-[#111111] placeholder-[#CFCFCF] outline-none focus:border-[#C6A47E] resize-none"
          rows={3}
        />

        {/* Coup de coeur toggle + Send */}
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsFav(!isFav)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isFav
                ? 'bg-[#D4785C]/10 text-[#D4785C]'
                : 'bg-[#F0F0F0] text-[#8A8A8A] hover:bg-[#D4785C]/10 hover:text-[#D4785C]'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={isFav ? '#D4785C' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Coup de cœur
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || sending}
            className="rounded-full bg-[#111111] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatCommentDate(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "\u00c0 l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
