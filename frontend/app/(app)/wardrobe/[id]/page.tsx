'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import type { ClothingItem, ClothingComment } from '@/types';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';
import WearBadge from '@/components/wardrobe/WearBadge';
import View360 from '@/components/wardrobe/View360';
import TryOnSection from '@/components/wardrobe/TryOnSection';

const categoryLabels: Record<string, string> = {
  TOP: 'Haut', BOTTOM: 'Bas', DRESS: 'Robe', JACKET: 'Veste', SHOES: 'Chaussures', ACCESSORY: 'Accessoire',
};

const seasonLabels: Record<string, string> = {
  SUMMER: 'Été', WINTER: 'Hiver', ALL: 'Toute saison',
};

const occasionLabels: Record<string, string> = {
  CASUAL: 'Casual', WORK: 'Travail', EVENING: 'Soirée', SPORT: 'Sport',
};

const COLOR_HEX: Record<string, string> = {
  Blanc: '#FFFFFF', Noir: '#111111', Gris: '#9CA3AF', Beige: '#E8D9C4',
  Marron: '#6B4423', Rouge: '#DC2626', Rose: '#F9A8D4', Orange: '#F97316',
  Jaune: '#FACC15', Vert: '#16A34A', Bleu: '#2563EB', 'Bleu marine': '#1E3A8A',
  Violet: '#7C3AED', Camel: '#C19A6B', Kaki: '#78866B', Multicolore: '#888888',
  Marine: '#1E3A5F',
};

export default function WardrobeItemPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [uploadingBack, setUploadingBack] = useState(false);
  const markWornInStore = useWardrobeStore((s) => s.markWorn);
  const backInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<ClothingItem>(`/wardrobe/${id}`);
      if (res.success && res.data) {
        setItem(res.data);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleMarkWorn = async () => {
    if (!item) return;
    const res = await api.post<ClothingItem>(`/wardrobe/${id}/wear`);
    if (res.success && res.data) {
      setItem(res.data);
      markWornInStore(id);
      setToast('✓ Enregistré !');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const handleBackPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !item) return;
    setUploadingBack(true);
    const body = new FormData();
    body.append('photo_back', file);
    body.append('remove_bg', '1');
    const res = await api.put<ClothingItem>(`/wardrobe/${id}`, body);
    if (res.success && res.data) {
      setItem(res.data);
      setToast('✓ Vue 360° activée !');
      setTimeout(() => setToast(''), 3000);
    } else {
      setToast("Échec de l'ajout de la photo dos");
      setTimeout(() => setToast(''), 3000);
    }
    setUploadingBack(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return <div className="py-16 text-center text-sm text-[#8A8A8A]">Vêtement non trouvé</div>;
  }

  return (
    <div className="space-y-5">
      {/* Back button + edit */}
      <div className="flex items-center gap-3 pt-2">
        <a href="/wardrobe" className="flex h-10 w-10 items-center justify-center rounded-full bg-white" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </a>
        <h1 className="flex-1 text-lg font-semibold text-[#111111]">Détails</h1>
        <a
          href={`/wardrobe/${id}/edit`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
          aria-label="Modifier"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </a>
      </div>

      {/* Large product photo (or 360° view when back photo exists) */}
      {item.has_360_view && (item.photo_back_removed || item.photo_back_url) ? (
        <div className="relative h-[320px] w-full overflow-hidden rounded-3xl" style={{ background: 'var(--color-app-bg)' }}>
          <View360
            frontUrl={item.bg_removed_url || item.photo_url}
            backUrl={item.photo_back_removed || item.photo_back_url || ''}
            alt={item.name || item.category}
            fit="contain"
          />
        </div>
      ) : (
        <div className="relative aspect-square overflow-hidden rounded-3xl" style={{ background: 'var(--color-app-bg)' }}>
          <Image
            src={item.bg_removed_url || item.photo_url}
            alt={item.category}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        </div>
      )}

      {/* Add back photo CTA (when missing) */}
      {!item.has_360_view && (
        <>
          <button
            type="button"
            onClick={() => backInputRef.current?.click()}
            disabled={uploadingBack}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#C6A47E]/50 bg-[#EDE5DC]/30 py-3 text-sm font-medium text-[#C6A47E] transition-colors hover:bg-[#EDE5DC]/50 disabled:opacity-60"
          >
            {uploadingBack ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" />
                </svg>
                Envoi en cours…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Ajouter la vue dos (360°)
              </>
            )}
          </button>
          <input
            ref={backInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackPhotoUpload}
            className="hidden"
          />
        </>
      )}

      {/* Virtual try-on */}
      <TryOnSection
        itemId={item.id}
        itemPhotoUrl={item.bg_removed_url || item.photo_url}
        category={item.category}
        initialTryOnUrl={item.try_on_url || null}
      />

      {/* Product info card */}
      <div className="rounded-3xl bg-white p-5" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        {/* Name + category pill */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">
              {item.brand || categoryLabels[item.category] || item.category}
            </h2>
            {item.brand && (
              <p className="mt-0.5 text-sm text-[#8A8A8A]">{categoryLabels[item.category]}</p>
            )}
          </div>
          <span className="rounded-full bg-[#F0F0F0] px-3 py-1 text-xs font-medium text-[#111111]">
            {categoryLabels[item.category]}
          </span>
        </div>

        {/* Price */}
        {item.purchase_price != null && item.purchase_price > 0 && (
          <p className="mt-2 text-xl font-bold text-[#111111]">{item.purchase_price.toFixed(2)}€</p>
        )}

        {/* Wear badge */}
        <div className="mt-3">
          <WearBadge wearCount={item.wear_count} lastWornAt={item.last_worn_at} size="lg" />
        </div>

        {/* ── Informations ── */}
        <h3 className="mt-5 font-serif text-base text-[#111111]">Informations</h3>
        <div className="mt-3 flex flex-col divide-y divide-[#F7F5F2]">
          <InfoRow label="Catégorie">
            <span className="rounded-full bg-[#F0EDE8] px-3 py-1 text-xs font-medium text-[#111111]">
              {categoryLabels[item.category] || item.category}
            </span>
          </InfoRow>
          <InfoRow label="Couleurs">
            {item.colors.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.colors.map((c) => (
                  <div
                    key={c}
                    className="h-5 w-5 rounded-full border border-[#EFEFEF]"
                    style={{ backgroundColor: COLOR_HEX[c] || '#CFCFCF' }}
                    title={c}
                  />
                ))}
              </div>
            ) : (
              <span className="text-sm text-[#8A8A8A]">—</span>
            )}
          </InfoRow>
          <InfoRow label="Saison">
            <span className="text-sm font-medium text-[#111111]">
              {seasonLabels[item.season] || item.season}
            </span>
          </InfoRow>
          <InfoRow label="Occasion">
            <span className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] font-medium text-[#111111]">
              {occasionLabels[item.occasion] || item.occasion}
            </span>
          </InfoRow>
          <InfoRow label="Matière">
            <span className="text-sm font-medium text-[#111111]">{item.material || '—'}</span>
          </InfoRow>
          <InfoRow label="Marque">
            <span className="text-sm font-medium text-[#111111]">{item.brand || '—'}</span>
          </InfoRow>
          <InfoRow label="Prix d'achat">
            <span className="text-sm font-medium text-[#111111]">
              {item.purchase_price != null && item.purchase_price > 0
                ? `${item.purchase_price.toFixed(2)} €`
                : '—'}
            </span>
          </InfoRow>
          <InfoRow label="Date d'achat">
            <span className="text-sm font-medium text-[#111111]">
              {item.purchase_date
                ? new Date(item.purchase_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </span>
          </InfoRow>
          <InfoRow label="Ajouté le">
            <span className="text-sm font-medium text-[#111111]">
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </InfoRow>
          <InfoRow label="Porté">
            {item.wear_count === 0 ? (
              <span className="text-sm text-[#8A8A8A]">Jamais porté</span>
            ) : (
              <span className="text-sm font-medium text-[#111111]">
                {item.wear_count} fois
                {item.last_worn_at && (
                  <>
                    {' · Dernier : '}
                    {new Date(item.last_worn_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </>
                )}
              </span>
            )}
          </InfoRow>
        </div>

        <a
          href={`/wardrobe/${id}/edit`}
          className="mt-4 block text-center text-xs font-medium text-[#C6A47E]"
        >
          Modifier les informations
        </a>

        {/* CTA buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleMarkWorn}
            className="flex-1 rounded-full border border-[#111111] py-3 text-center text-sm font-semibold text-[#111111]"
          >
            Marquer comme porté
          </button>
          <a
            href="/outfits/create"
            className="flex-1 rounded-full bg-[#111111] py-3 text-center text-sm font-semibold text-white"
          >
            Créer un look
          </a>
        </div>
      </div>

      {/* ============ STYLIST FEEDBACK SECTION ============ */}
      <StylistFeedback itemId={item.id} comments={item.comments} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Stylist Feedback sub-component ─────────────────────────────────────────
function StylistFeedback({
  itemId,
  comments: initialComments,
}: {
  itemId: string;
  comments?: ClothingComment[];
}) {
  const [comments, setComments] = useState<ClothingComment[]>(initialComments || []);
  const [hasStylist, setHasStylist] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has an active stylist connection
    api
      .get<Array<{ status: string }>>('/stylists/my-stylist')
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setHasStylist(true);
        } else {
          setHasStylist(false);
        }
      })
      .catch(() => setHasStylist(false));

    // Fetch comments if not provided via initial load
    if (!initialComments || initialComments.length === 0) {
      api
        .get<ClothingComment[]>(`/wardrobe/${itemId}/comments`)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setComments(res.data);
          }
        });
    }
  }, [itemId, initialComments]);

  return (
    <div className="mt-6">
      <h3 className="px-5 font-serif text-base text-[#111111]">Avis de votre styliste</h3>

      {comments.length === 0 && hasStylist === false ? (
        <div className="mx-5 mt-3 rounded-2xl bg-[#F0EDE8] p-4">
          <p className="text-xs leading-relaxed text-[#8A8A8A]">
            Connectez-vous &agrave; un styliste pour recevoir des conseils personnalis&eacute;s sur vos pi&egrave;ces.
          </p>
          <a href="/stylists" className="mt-2 inline-block text-xs text-[#C6A47E]">
            Trouver un styliste
          </a>
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-2 px-5 text-xs text-[#8A8A8A]">Aucun commentaire pour l&apos;instant.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-3 px-5">
          {comments.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EDE5DC]">
                  {c.stylist?.avatar_url ? (
                    <Image
                      src={c.stylist.avatar_url}
                      alt={c.stylist.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#C6A47E]">
                      {c.stylist?.name?.charAt(0) || 'S'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-[#111111]">{c.stylist?.name || 'Styliste'}</p>
                    <span className="text-[10px] text-[#CFCFCF]">{formatCommentDate(c.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-[#8A8A8A]">{c.content}</p>
                </div>
              </div>
              {c.is_favorite && (
                <div className="mt-3 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-xs font-medium text-[#D4785C]">
                    Coup de coeur de {c.stylist?.name || 'votre styliste'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-xs uppercase tracking-wide text-[#8A8A8A]">{label}</span>
      <div>{children}</div>
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
