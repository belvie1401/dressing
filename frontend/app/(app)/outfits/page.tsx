'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Outfit, OutfitItem } from '@/types';

type LooksTab = 'mine' | 'stylist';

export default function OutfitsPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<Outfit[] | null>(null);
  const [activeTab, setActiveTab] = useState<LooksTab>('mine');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    api.get<Outfit[]>('/outfits').then((res) => {
      if (!mounted) return;
      setOutfits(res.success && res.data ? res.data : []);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (id: string) => {
    const res = await api.delete(`/outfits/${id}`);
    if (res.success) {
      setOutfits((prev) => prev?.filter((o) => o.id !== id) ?? []);
      showToast('Look supprimé');
    }
    setConfirmDelete(null);
    setMenuOpen(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* ══ Header ══ */}
      <div className="flex items-center justify-between px-5 pt-6">
        <h1 className="font-serif text-2xl font-semibold text-[#111111]">Mes looks</h1>
        <Link
          href="/outfits/create"
          className="rounded-full bg-[#111111] px-4 py-2 text-sm font-medium text-white"
        >
          + Créer
        </Link>
      </div>

      {/* ══ Tab pills ══ */}
      <div className="mx-5 mt-4 grid h-12 grid-cols-2 rounded-2xl bg-[#F0EDE8] p-1">
        {([
          { key: 'mine' as const, label: 'Mes looks' },
          { key: 'stylist' as const, label: 'Looks styliste' },
        ]).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex cursor-pointer items-center justify-center rounded-xl text-sm font-medium transition-all ${
              activeTab === t.key
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-[#8A8A8A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ Content ══ */}
      <div className="mt-4 px-4">
        {activeTab === 'mine' ? (
          outfits === null ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[180px] animate-pulse rounded-xl bg-[#F0EDE8]" />
              ))}
            </div>
          ) : outfits.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="font-serif text-base font-semibold text-[#111111]">
                Aucun look pour l&rsquo;instant
              </p>
              <p className="mt-1 text-sm text-[#8A8A8A]">
                Créez votre premier look à partir de votre dressing.
              </p>
              <Link
                href="/outfits/create"
                className="mt-4 inline-flex rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white"
              >
                Créer un look
              </Link>
            </div>
          ) : (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
            >
              {outfits.map((look) => (
                <div
                  key={look.id}
                  className="relative h-[180px] cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm"
                  onClick={() => router.push(`/outfits/${look.id}`)}
                >
                  {/* Collage */}
                  <CompactCollage items={look.items ?? []} />

                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                    <p className="truncate text-[11px] font-medium text-white">
                      {look.name}
                    </p>
                    <p className="text-[9px] text-white/60">
                      {look.items?.length ?? 0} pièces
                    </p>
                  </div>

                  {/* AI badge */}
                  {look.ai_generated && (
                    <div className="absolute left-1.5 top-1.5 z-10">
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                        style={{ background: 'rgba(198,164,126,0.3)', color: '#C6A47E' }}
                      >
                        IA
                      </span>
                    </div>
                  )}

                  {/* 3-dots menu */}
                  <div
                    className="absolute right-1.5 top-1.5 z-10"
                    ref={menuOpen === look.id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === look.id ? null : look.id);
                      }}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 backdrop-blur-sm"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <circle cx="12" cy="6" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="18" r="2" />
                      </svg>
                    </button>
                    {menuOpen === look.id && (
                      <div className="absolute right-0 top-8 w-36 overflow-hidden rounded-xl bg-white shadow-lg">
                        <Link
                          href={`/outfits/${look.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block px-4 py-2.5 text-xs text-[#111111] hover:bg-[#F7F5F2]"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(look.id);
                          }}
                          className="w-full cursor-pointer px-4 py-2.5 text-left text-xs text-[#D4785C] hover:bg-[#FFF8F6]"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── Stylist tab — empty state ── */
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EDE5DC]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="font-serif text-base text-[#111111]">Aucun look de styliste</p>
            <p className="mt-1 text-xs text-[#8A8A8A]">
              Connectez-vous à un styliste pour recevoir des propositions de looks.
            </p>
            <Link
              href="/stylists"
              className="mt-4 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white"
            >
              Trouver un styliste
            </Link>
          </div>
        )}
      </div>

      {/* ══ Confirm delete modal ══ */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative z-10 mx-6 w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <p className="font-serif text-base text-[#111111]">Supprimer ce look ?</p>
            <p className="mt-1 text-xs text-[#8A8A8A]">Cette action est irréversible.</p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 cursor-pointer rounded-full border border-[#111111] py-2.5 text-sm font-medium text-[#111111]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 cursor-pointer rounded-full bg-[#D4785C] py-2.5 text-sm font-medium text-white"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Toast ══ */}
      {toast && (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ─── Compact collage for grid cards ─────────────────────────────────────── */
function CompactCollage({ items }: { items: OutfitItem[] }) {
  const photos = items
    .slice(0, 4)
    .map((oi) => oi.item?.bg_removed_url || oi.item?.photo_url || null);

  if (photos.length === 0 || photos.every((p) => !p)) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#EDE5DC]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    );
  }

  if (photos.length === 1) {
    return photos[0] ? (
      <Image
        src={photos[0]}
        alt=""
        fill
        className="object-cover"
        style={{ objectPosition: 'center 15%' }}
        sizes="180px"
      />
    ) : (
      <div className="absolute inset-0 bg-[#EDE5DC]" />
    );
  }

  if (photos.length === 2) {
    return (
      <div className="absolute inset-0 grid grid-cols-2 gap-px">
        {photos.map((p, i) => (
          <div key={i} className="relative overflow-hidden bg-[#F7F5F2]">
            {p && (
              <Image
                src={p}
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: 'center 15%' }}
                sizes="90px"
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div className="absolute inset-0 flex gap-px">
        <div className="relative flex-1 overflow-hidden bg-[#F7F5F2]">
          {photos[0] && (
            <Image
              src={photos[0]}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: 'center 15%' }}
              sizes="90px"
            />
          )}
        </div>
        <div className="flex w-1/2 flex-col gap-px">
          {[photos[1], photos[2]].map((p, i) => (
            <div key={i} className="relative flex-1 overflow-hidden bg-[#F7F5F2]">
              {p && (
                <Image
                  src={p}
                  alt=""
                  fill
                  className="object-cover"
                  style={{ objectPosition: 'center 15%' }}
                  sizes="90px"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4 items → 2×2 grid
  return (
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px">
      {photos.map((p, i) => (
        <div key={i} className="relative overflow-hidden bg-[#F7F5F2]">
          {p && (
            <Image
              src={p}
              alt=""
              fill
              className="object-cover"
              style={{ objectPosition: 'center 15%' }}
              sizes="90px"
            />
          )}
        </div>
      ))}
    </div>
  );
}
