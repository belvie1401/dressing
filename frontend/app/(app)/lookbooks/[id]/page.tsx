'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Lookbook } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const TYPE_LABEL: Record<string, string> = {
  BEFORE_AFTER: 'Avant / Après',
  COMPLETE_LOOK: 'Look complet',
  THEME: 'Thématique',
  STYLE_ADVICE: 'Conseil style',
};

export default function LookbookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [lookbook, setLookbook] = useState<Lookbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await api.get<Lookbook>(`/lookbooks/${id}`);
      if (res.success && res.data) setLookbook(res.data);
      setLoading(false);
    };
    load();
  }, [id]);

  const isOwner = user?.id === lookbook?.stylist_id;
  const isClientViewer = !isOwner;

  const heroImage = useMemo(() => {
    if (!lookbook) return null;
    if (lookbook.type === 'BEFORE_AFTER') return null; // render side-by-side
    if (lookbook.photos && lookbook.photos.length > 0) return lookbook.photos[0];
    if (lookbook.after_photos && lookbook.after_photos.length > 0)
      return lookbook.after_photos[0];
    const firstItem = lookbook.outfits?.[0]?.outfit?.items?.[0]?.item;
    return firstItem ? firstItem.bg_removed_url || firstItem.photo_url : null;
  }, [lookbook]);

  const allPhotos = useMemo(() => {
    if (!lookbook) return [];
    if (lookbook.type === 'BEFORE_AFTER') {
      return [...(lookbook.before_photos || []), ...(lookbook.after_photos || [])];
    }
    return lookbook.photos || [];
  }, [lookbook]);

  const handleDelete = async () => {
    if (!lookbook) return;
    if (!confirm('Supprimer définitivement cette prestation ?')) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/lookbooks/${lookbook.id}`);
      if (res.success) {
        router.push('/lookbooks');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (!lookbook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F5F2] px-5">
        <div className="text-center">
          <p className="text-sm text-[#8A8A8A]">Portfolio non trouv&eacute;</p>
          <Link
            href="/lookbooks"
            className="mt-4 inline-block text-sm text-[#111111] underline"
          >
            Retour au portfolio
          </Link>
        </div>
      </div>
    );
  }

  const typeLabel = lookbook.type ? TYPE_LABEL[lookbook.type] || lookbook.type : null;

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* Back button overlay */}
      <button
        type="button"
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm backdrop-blur"
        aria-label="Retour"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Hero */}
      {lookbook.type === 'BEFORE_AFTER' ? (
        <div className="grid grid-cols-2 h-[300px] relative">
          <div className="relative bg-[#EDE5DC]">
            {lookbook.before_photos && lookbook.before_photos[0] ? (
              <Image
                src={lookbook.before_photos[0]}
                alt="Avant"
                fill
                className="object-cover"
                sizes="50vw"
              />
            ) : null}
            <span className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              Avant
            </span>
          </div>
          <div className="relative bg-[#EDE5DC]">
            {lookbook.after_photos && lookbook.after_photos[0] ? (
              <Image
                src={lookbook.after_photos[0]}
                alt="Après"
                fill
                className="object-cover"
                sizes="50vw"
              />
            ) : null}
            <span className="absolute bottom-3 right-3 bg-[#C6A47E] text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
              Apr&egrave;s
            </span>
          </div>
        </div>
      ) : (
        <div className="relative h-[300px] w-full bg-[#EDE5DC]">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={lookbook.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Info card */}
      <section className="mx-5 bg-white rounded-3xl p-5 -mt-8 relative shadow-sm">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {typeLabel && (
              <span className="inline-block bg-[#F0EDE8] text-[#111111] text-[10px] rounded-full px-3 py-1 uppercase tracking-wide">
                {typeLabel}
              </span>
            )}
          </div>
          {typeof lookbook.price === 'number' && lookbook.price > 0 && (
            <span className="font-serif text-2xl text-[#111111] shrink-0">
              {lookbook.price} <span className="text-sm text-[#8A8A8A]">euros</span>
            </span>
          )}
        </div>

        <h1 className="font-serif text-2xl text-[#111111] mt-2 leading-tight">
          {lookbook.title}
        </h1>

        {lookbook.description && (
          <p className="text-sm text-[#8A8A8A] mt-2 leading-relaxed whitespace-pre-line">
            {lookbook.description}
          </p>
        )}

        {lookbook.tags && lookbook.tags.length > 0 && (
          <>
            <div className="mt-4 border-t border-[#EFEFEF]" />
            <div className="mt-4 flex flex-wrap gap-2">
              {lookbook.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#F0EDE8] text-[#111111] text-xs px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {lookbook.client?.name && (
          <p className="text-xs text-[#CFCFCF] mt-4">
            pour {lookbook.client.name}
          </p>
        )}

        {lookbook.stylist?.name && (
          <div className="mt-4 flex items-center gap-2 border-t border-[#EFEFEF] pt-4">
            <div className="w-8 h-8 rounded-full bg-[#EDE5DC] flex items-center justify-center overflow-hidden">
              {lookbook.stylist.avatar_url ? (
                <Image
                  src={lookbook.stylist.avatar_url}
                  alt={lookbook.stylist.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-[#C6A47E]">
                  {lookbook.stylist.name.charAt(0)}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8A8A8A]">
              Par <span className="text-[#111111] font-semibold">{lookbook.stylist.name}</span>
            </p>
          </div>
        )}
      </section>

      {/* All photos grid */}
      {allPhotos.length > 1 && (
        <section className="mt-6">
          <h2 className="px-5 font-serif text-lg text-[#111111] mb-3">
            Toutes les photos
          </h2>
          <div className="grid grid-cols-2 gap-2 px-5">
            {allPhotos.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#EDE5DC]"
              >
                <Image
                  src={url}
                  alt={`${lookbook.title} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 200px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Owner actions — Edit / Delete */}
      {isOwner && (
        <div className="mt-8 px-5 flex items-center justify-between">
          <Link
            href={`/lookbooks/create?edit=${lookbook.id}`}
            className="rounded-full border border-[#111111] text-[#111111] px-5 py-2.5 text-sm font-medium"
          >
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-[#E53E3E] px-2 disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      )}

      {/* Client CTA — sticky bottom */}
      {isClientViewer && (
        <div className="fixed bottom-24 left-0 right-0 px-5 lg:bottom-8">
          <Link
            href={
              lookbook.stylist?.id
                ? `/stylists/${lookbook.stylist.id}/booking`
                : '/stylists'
            }
            className="block bg-[#D4785C] text-white rounded-full py-4 text-center text-sm font-medium shadow-xl"
          >
            R&eacute;server cette prestation
          </Link>
        </div>
      )}
    </div>
  );
}
