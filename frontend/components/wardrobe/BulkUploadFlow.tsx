'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Category, ClothingItem } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_PHOTOS = 30;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'TOP', label: 'Haut' },
  { value: 'BOTTOM', label: 'Bas' },
  { value: 'DRESS', label: 'Robe' },
  { value: 'JACKET', label: 'Veste' },
  { value: 'SHOES', label: 'Chaussures' },
  { value: 'ACCESSORY', label: 'Accessoire' },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface BulkItem {
  id: string;
  frontFile: File;
  frontPreview: string;
  backFile?: File;
  backPreview?: string;
  category: Category;
}

type Phase = 'select' | 'triage' | 'saving';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BulkUploadFlow() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<BulkItem[]>([]);
  const [phase, setPhase] = useState<Phase>('select');
  const [saveIndex, setSaveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // The id of the item the user has tapped to start a pairing flow.
  // The next item they tap becomes its back photo.
  const [pairingSource, setPairingSource] = useState<string | null>(null);

  // ─── File selection ──────────────────────────────────────────────────────
  const addFiles = useCallback(
    async (incoming: File[]) => {
      setError(null);
      const remaining = MAX_PHOTOS - items.length;
      if (remaining <= 0) {
        setError(`Vous avez atteint la limite de ${MAX_PHOTOS} photos.`);
        return;
      }
      const accepted = incoming
        .filter((f) => f.type.startsWith('image/'))
        .filter((f) => {
          if (f.size > MAX_FILE_SIZE) {
            setError(`«${f.name}» dépasse 10 Mo et a été ignoré.`);
            return false;
          }
          return true;
        })
        .slice(0, remaining);

      const next: BulkItem[] = await Promise.all(
        accepted.map(async (file) => ({
          id: makeId(),
          frontFile: file,
          frontPreview: await readDataUrl(file),
          category: 'TOP' as Category,
        }))
      );
      setItems((prev) => [...prev, ...next]);
    },
    [items.length]
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    if (pairingSource === id) setPairingSource(null);
  };

  const clearAll = () => {
    setItems([]);
    setError(null);
    setPairingSource(null);
  };

  // ─── Pairing logic ───────────────────────────────────────────────────────
  /**
   * Click-to-pair: tap one card to mark it as the source, then tap another
   * to merge that other card's front photo into the source as a back photo.
   * The merged card disappears from the grid.
   */
  const handleCardTap = (id: string) => {
    setError(null);
    if (pairingSource === null) {
      setPairingSource(id);
      return;
    }
    if (pairingSource === id) {
      setPairingSource(null);
      return;
    }
    setItems((prev) => {
      const source = prev.find((p) => p.id === pairingSource);
      const target = prev.find((p) => p.id === id);
      if (!source || !target) return prev;
      if (source.backFile) {
        setError(
          "Cet article a déjà une photo de dos. Retirez-la avant d'en ajouter une autre.",
        );
        return prev;
      }
      const merged: BulkItem = {
        ...source,
        backFile: target.frontFile,
        backPreview: target.frontPreview,
      };
      return prev
        .filter((p) => p.id !== target.id)
        .map((p) => (p.id === pairingSource ? merged : p));
    });
    setPairingSource(null);
  };

  const removeBackPhoto = (id: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, backFile: undefined, backPreview: undefined } : p
      )
    );
  };

  const updateCategory = (id: string, category: Category) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, category } : p)));
  };

  // ─── Bulk save ───────────────────────────────────────────────────────────
  const saveAll = async () => {
    if (items.length === 0) {
      setError('Aucun vêtement à enregistrer.');
      return;
    }

    setPhase('saving');
    setSaveIndex(0);
    setError(null);

    const body = new FormData();
    const meta = items.map((p) => ({
      name: '',
      category: p.category,
      colors: [],
      season: 'ALL',
      occasion: 'CASUAL',
    }));
    body.append('items_meta', JSON.stringify(meta));
    body.append('remove_bg', '1');
    items.forEach((p, i) => {
      body.append(`photo_${i}`, p.frontFile);
      if (p.backFile) body.append(`photo_back_${i}`, p.backFile);
    });

    const total = items.length;
    const progressTimer = setInterval(() => {
      setSaveIndex((i) => (i < total - 1 ? i + 1 : i));
    }, 600);

    try {
      const res = await api.post<ClothingItem[]>('/wardrobe/bulk', body);
      clearInterval(progressTimer);
      setSaveIndex(total);

      if (res.success && res.data && res.data.length > 0) {
        const ids = res.data.map((it) => it.id).join(',');
        router.push(`/wardrobe/pair?new=${ids}`);
        return;
      }

      const resAny = res as unknown as { error?: string; message?: string };
      setError(resAny.message || resAny.error || "Erreur lors de l'enregistrement.");
      setPhase('triage');
    } catch {
      clearInterval(progressTimer);
      setError("Erreur de connexion lors de l'enregistrement.");
      setPhase('triage');
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="pb-32">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* ════════ PHASE: SELECT ════════ */}
      {phase === 'select' && (
        <>
          {/* Drop zone */}
          <div
            className={`mx-1 cursor-pointer rounded-3xl border-2 border-dashed bg-[#EDE5DC]/20 p-8 transition-colors ${
              isDragging ? 'border-[#C6A47E] bg-[#EDE5DC]/40' : 'border-[#C6A47E]/50'
            }`}
            style={{ minHeight: '200px' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3 grid h-12 w-12 grid-cols-2 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C6A47E"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 4l-4 2-4-2-4 4v12h16V8l-4-4z" />
                  </svg>
                ))}
              </div>
              <p className="font-serif text-base text-[#111111]">
                Sélectionnez jusqu&rsquo;à {MAX_PHOTOS} photos
              </p>
              <p className="mt-1 text-xs text-[#8A8A8A]">
                Glissez vos photos ici ou cliquez pour choisir
              </p>
              <p className="mt-1 text-xs text-[#CFCFCF]">
                JPG, PNG · Max 10 Mo par photo · Fond retiré automatiquement
              </p>
            </div>
          </div>

          {/* Selected photos preview grid */}
          {items.length > 0 && (
            <>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {items.map((it, i) => (
                  <div
                    key={it.id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-[#F0EDE8]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.frontPreview}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(it.id);
                      }}
                      aria-label="Retirer cette photo"
                      className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                    <span
                      className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 font-bold text-white"
                      style={{ fontSize: '9px' }}
                    >
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats bar */}
              <div className="mt-1 flex items-center justify-between py-3">
                <p className="text-xs text-[#8A8A8A]">
                  {items.length} photo{items.length > 1 ? 's' : ''} sélectionnée
                  {items.length > 1 ? 's' : ''}
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="cursor-pointer text-xs text-[#D4785C]"
                >
                  Tout supprimer
                </button>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={() => setPhase('triage')}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111111] py-4 text-sm font-semibold text-white"
              >
                Continuer · trier devant / dos
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-xs text-[#D4785C]">
              {error}
            </div>
          )}
        </>
      )}

      {/* ════════ PHASE: TRIAGE ════════ */}
      {phase === 'triage' && (
        <>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="flex cursor-pointer items-center gap-1 text-xs text-[#8A8A8A]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Retour
              </button>
              <span className="text-xs text-[#8A8A8A]">
                {items.length} vêtement{items.length > 1 ? 's' : ''}
              </span>
            </div>
            <h2 className="font-serif text-lg text-[#111111]">
              Associez devant et dos
            </h2>
            <p className="mt-1 text-xs text-[#8A8A8A]">
              Touchez «&nbsp;Lier dos&nbsp;» sur un vêtement, puis touchez la photo
              de dos correspondante. Vous pouvez aussi changer la catégorie de
              chaque pièce.
            </p>
          </div>

          {pairingSource !== null && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[#C6A47E]/40 bg-[#FFF8EE] px-3 py-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C6A47E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
              </svg>
              <p className="flex-1 text-[11px] text-[#111111]">
                Touchez une autre photo pour l&rsquo;associer comme{' '}
                <strong>dos</strong>.
              </p>
              <button
                type="button"
                onClick={() => setPairingSource(null)}
                className="cursor-pointer text-[11px] text-[#D4785C]"
              >
                Annuler
              </button>
            </div>
          )}

          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            }}
          >
            {items.map((it, i) => {
              const isPairingSource = pairingSource === it.id;
              const isPairingTarget = pairingSource !== null && !isPairingSource;
              return (
                <div
                  key={it.id}
                  className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
                    isPairingSource
                      ? 'ring-2 ring-[#C6A47E] ring-offset-2'
                      : isPairingTarget
                        ? 'ring-1 ring-[#C6A47E]/30'
                        : ''
                  }`}
                >
                  {/* Photo: front (full) + back overlay */}
                  <button
                    type="button"
                    onClick={() => handleCardTap(it.id)}
                    className="relative block h-44 w-full cursor-pointer bg-[#F0EDE8]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.frontPreview}
                      alt="Devant"
                      className="absolute inset-0 h-full w-full object-cover"
                      style={{ objectPosition: 'center 15%' }}
                    />
                    {it.backPreview && (
                      <div className="absolute bottom-2 right-2 h-12 w-12 overflow-hidden rounded-lg border-2 border-white shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={it.backPreview}
                          alt="Dos"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white">
                      {it.backPreview ? 'Devant + Dos' : 'Devant'}
                    </span>
                    <span
                      className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 font-bold text-white"
                      style={{ fontSize: '9px' }}
                    >
                      {i + 1}
                    </span>
                  </button>

                  {/* Action row */}
                  <div className="border-t border-[#F7F5F2] p-2">
                    {/* Category compact pills */}
                    <div className="mb-2 flex flex-wrap gap-1">
                      {CATEGORIES.map((c) => {
                        const active = it.category === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => updateCategory(it.id, c.value)}
                            className={`cursor-pointer rounded-full px-2 py-0.5 text-[9px] font-medium ${
                              active
                                ? 'bg-[#111111] text-white'
                                : 'bg-[#F7F5F2] text-[#8A8A8A]'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      {it.backPreview ? (
                        <button
                          type="button"
                          onClick={() => removeBackPhoto(it.id)}
                          className="cursor-pointer text-[10px] text-[#D4785C]"
                        >
                          Retirer dos
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCardTap(it.id)}
                          className={`cursor-pointer text-[10px] font-semibold ${
                            isPairingSource ? 'text-[#D4785C]' : 'text-[#C6A47E]'
                          }`}
                        >
                          {isPairingSource ? 'Annuler' : 'Lier dos'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        aria-label="Supprimer"
                        className="cursor-pointer text-[#CFCFCF] hover:text-[#D4785C]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky save bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EFEFEF] bg-white px-5 py-4 md:left-64">
            <div className="mx-auto max-w-3xl">
              {error && <p className="mb-2 text-xs text-[#D4785C]">{error}</p>}
              <p className="mb-3 text-xs text-[#8A8A8A]">
                {items.length} vêtement{items.length > 1 ? 's' : ''} à ajouter au
                dressing · fond retiré automatiquement
              </p>
              <button
                type="button"
                onClick={saveAll}
                disabled={items.length === 0}
                className="w-full cursor-pointer rounded-full bg-[#111111] py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ajouter au dressing
              </button>
            </div>
          </div>
        </>
      )}

      {/* ════════ PHASE: SAVING ════════ */}
      {phase === 'saving' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              className="mx-auto animate-spin"
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" />
            </svg>
            <p className="mt-4 font-serif text-base text-[#111111]">
              Enregistrement… {Math.min(saveIndex + 1, items.length)}/{items.length}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
              <div
                className="h-full rounded-full bg-[#111111] transition-all duration-300"
                style={{
                  width: `${
                    ((Math.min(saveIndex + 1, items.length)) / items.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
