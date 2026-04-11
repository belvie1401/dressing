'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Category, Season, Occasion, ClothingItem } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_PHOTOS = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ANALYSIS_DELAY_MS = 500;

const COLOR_HEXES: Record<string, string> = {
  Blanc: '#FFFFFF',
  Noir: '#111111',
  Gris: '#9CA3AF',
  Beige: '#E8D9C4',
  Marron: '#6B4423',
  Rouge: '#DC2626',
  Rose: '#F9A8D4',
  Orange: '#F97316',
  Jaune: '#FACC15',
  Vert: '#16A34A',
  Bleu: '#2563EB',
  'Bleu marine': '#1E3A8A',
  Violet: '#7C3AED',
  Camel: '#C19A6B',
  Kaki: '#78866B',
  Multicolore: '#999999',
};
const COLOR_NAMES = Object.keys(COLOR_HEXES);

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'TOP', label: 'Haut' },
  { value: 'BOTTOM', label: 'Bas' },
  { value: 'DRESS', label: 'Robe' },
  { value: 'JACKET', label: 'Veste' },
  { value: 'SHOES', label: 'Chaussures' },
  { value: 'ACCESSORY', label: 'Accessoire' },
];

const SEASONS: Array<{ value: Season; label: string }> = [
  { value: 'SUMMER', label: 'Été' },
  { value: 'WINTER', label: 'Hiver' },
  { value: 'ALL', label: 'Toutes' },
];

const OCCASIONS: Array<{ value: Occasion; label: string }> = [
  { value: 'CASUAL', label: 'Décontracté' },
  { value: 'WORK', label: 'Travail' },
  { value: 'EVENING', label: 'Soirée' },
  { value: 'SPORT', label: 'Sport' },
];

// ─── Types ───────────────────────────────────────────────────────────────────
type AIScan = {
  name?: string;
  category?: Category;
  primary_color?: string;
  colors?: string[];
  material?: string;
  season?: Season;
  occasion?: Occasion;
  brand?: string | null;
  style_tags?: string[];
};

type PhotoStatus = 'pending' | 'analyzing' | 'done' | 'error';

interface BulkPhoto {
  id: string;
  file: File;
  preview: string;
  status: PhotoStatus;
  ai?: AIScan;
  // Editable fields (start as AI defaults)
  name: string;
  category: Category;
  colors: string[];
  material: string;
  season: Season;
  occasion: Occasion;
  brand: string;
}

type Phase = 'select' | 'analyzing' | 'review' | 'saving';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function fileToBase64(file: File): Promise<string> {
  return readDataUrl(file).then((dataUrl) => dataUrl.split(',')[1] ?? '');
}

function normalizeColor(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  return COLOR_NAMES.find((n) => n.toLowerCase() === t) ?? null;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BulkUploadFlow() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<BulkPhoto[]>([]);
  const [phase, setPhase] = useState<Phase>('select');
  const [analyzeIndex, setAnalyzeIndex] = useState(0);
  const [saveIndex, setSaveIndex] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ─── File selection ──────────────────────────────────────────────────────
  const addFiles = useCallback(
    async (incoming: File[]) => {
      setError(null);
      const remaining = MAX_PHOTOS - photos.length;
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

      const next: BulkPhoto[] = await Promise.all(
        accepted.map(async (file) => ({
          id: makeId(),
          file,
          preview: await readDataUrl(file),
          status: 'pending' as PhotoStatus,
          name: '',
          category: 'TOP' as Category,
          colors: [],
          material: '',
          season: 'ALL' as Season,
          occasion: 'CASUAL' as Occasion,
          brand: '',
        }))
      );
      setPhotos((prev) => [...prev, ...next]);
    },
    [photos.length]
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

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    setPhotos([]);
    setError(null);
  };

  // ─── Analysis loop ───────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (photos.length === 0) return;
    setPhase('analyzing');
    setError(null);

    for (let i = 0; i < photos.length; i++) {
      setAnalyzeIndex(i);
      const photo = photos[i];

      setPhotos((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: 'analyzing' } : p))
      );

      try {
        const base64 = await fileToBase64(photo.file);
        const res = await api.post<AIScan>('/ai/scan-clothing', {
          image_base64: base64,
        });

        if (res.success && res.data) {
          const ai = res.data;
          const aiColors = (ai.colors ?? (ai.primary_color ? [ai.primary_color] : []))
            .filter((c): c is string => typeof c === 'string')
            .map(normalizeColor)
            .filter((c): c is string => c !== null);

          setPhotos((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                    ...p,
                    status: 'done',
                    ai,
                    name: ai.name ?? p.name,
                    category: ai.category ?? p.category,
                    colors: aiColors.length > 0 ? Array.from(new Set(aiColors)) : p.colors,
                    material: ai.material ?? p.material,
                    season: ai.season ?? p.season,
                    occasion: ai.occasion ?? p.occasion,
                    brand: ai.brand ?? p.brand,
                  }
                : p
            )
          );
        } else {
          setPhotos((prev) =>
            prev.map((p, idx) => (idx === i ? { ...p, status: 'error' } : p))
          );
        }
      } catch {
        setPhotos((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: 'error' } : p))
        );
      }

      // Small delay between requests
      await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));
    }

    setPhase('review');
  };

  // ─── Review-screen edits ─────────────────────────────────────────────────
  const updatePhoto = <K extends keyof BulkPhoto>(
    id: string,
    key: K,
    value: BulkPhoto[K]
  ) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  };

  const toggleColor = (id: string, color: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = p.colors.includes(color)
          ? p.colors.filter((c) => c !== color)
          : [...p.colors, color];
        return { ...p, colors: next };
      })
    );
  };

  // ─── Bulk save ───────────────────────────────────────────────────────────
  const saveAll = async () => {
    const eligible = photos.filter((p) => p.status !== 'error');
    if (eligible.length === 0) {
      setError('Aucun vêtement à enregistrer.');
      return;
    }

    setPhase('saving');
    setSaveIndex(0);
    setError(null);

    const body = new FormData();
    const meta = eligible.map((p) => ({
      name: p.name.trim(),
      category: p.category,
      colors: p.colors,
      material: p.material.trim() || undefined,
      season: p.season,
      occasion: p.occasion,
      brand: p.brand.trim() || undefined,
      ai_tags: p.ai,
    }));
    body.append('items_meta', JSON.stringify(meta));
    body.append('remove_bg', '1');
    eligible.forEach((p, i) => body.append(`photo_${i}`, p.file));

    // Progress bar advances optimistically while the single bulk request runs.
    const totalToSave = eligible.length;
    const progressTimer = setInterval(() => {
      setSaveIndex((i) => (i < totalToSave - 1 ? i + 1 : i));
    }, 600);

    try {
      const res = await api.post<ClothingItem[]>('/wardrobe/bulk', body);
      clearInterval(progressTimer);
      setSaveIndex(totalToSave);

      if (res.success && res.data && res.data.length > 0) {
        const ids = res.data.map((it) => it.id).join(',');
        router.push(`/wardrobe/pair?new=${ids}`);
        return;
      }

      const resAny = res as unknown as { error?: string; message?: string };
      setError(resAny.message || resAny.error || "Erreur lors de l'enregistrement.");
      setPhase('review');
    } catch {
      clearInterval(progressTimer);
      setError("Erreur de connexion lors de l'enregistrement.");
      setPhase('review');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  const eligibleCount = photos.filter((p) => p.status !== 'error').length;

  return (
    <div className="pb-32">
      {/* ════════ HIDDEN FILE INPUT ════════ */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFileInputChange}
      />

      {/* ════════ PHASE: SELECT / ANALYZING ════════ */}
      {(phase === 'select' || phase === 'analyzing') && (
        <>
          {/* ─── Drop zone ─── */}
          <div
            className={`mx-1 cursor-pointer rounded-3xl border-2 border-dashed bg-[#EDE5DC]/20 p-8 transition-colors ${
              isDragging
                ? 'border-[#C6A47E] bg-[#EDE5DC]/40'
                : 'border-[#C6A47E]/50'
            }`}
            style={{ minHeight: '200px' }}
            onClick={() => phase === 'select' && fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (phase === 'select') setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* 2x2 shirt grid icon */}
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
                JPG, PNG · Max 10 Mo par photo
              </p>
            </div>
          </div>

          {/* ─── Selected photos preview grid ─── */}
          {photos.length > 0 && (
            <>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-xl bg-[#F0EDE8]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                    />

                    {/* Status overlay */}
                    {photo.status === 'analyzing' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="animate-spin"
                        >
                          <circle cx="12" cy="12" r="10" opacity="0.3" />
                          <path d="M22 12a10 10 0 0 1-10 10" />
                        </svg>
                        <p className="mt-1 text-[10px] text-white">Analyse...</p>
                      </div>
                    )}
                    {photo.status === 'done' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#16A34A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                    {photo.status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </div>
                    )}

                    {/* Remove button (only when not analyzing) */}
                    {phase === 'select' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
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
                    )}

                    {/* Index */}
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
                  {photos.length} photo{photos.length > 1 ? 's' : ''} sélectionnée
                  {photos.length > 1 ? 's' : ''}
                </p>
                {phase === 'select' && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="cursor-pointer text-xs text-[#D4785C]"
                  >
                    Tout supprimer
                  </button>
                )}
              </div>

              {/* Analyze button (select phase only) */}
              {phase === 'select' && (
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111111] py-4 text-sm font-semibold text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Analyser {photos.length} vêtement{photos.length > 1 ? 's' : ''} avec
                  l&rsquo;IA
                </button>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-xs text-[#D4785C]">
              {error}
            </div>
          )}

          {/* Analyzing progress bar (fixed bottom) */}
          {phase === 'analyzing' && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EFEFEF] bg-white px-5 py-3 md:left-64">
              <div className="mx-auto max-w-3xl">
                <p className="text-sm font-medium text-[#111111]">
                  Analyse en cours… {Math.min(analyzeIndex + 1, photos.length)}/
                  {photos.length}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
                  <div
                    className="h-full rounded-full bg-[#111111] transition-all duration-300"
                    style={{
                      width: `${
                        ((Math.min(analyzeIndex + 1, photos.length)) / photos.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════ PHASE: REVIEW ════════ */}
      {phase === 'review' && (
        <>
          <div className="mb-4">
            <h2 className="font-serif text-lg text-[#111111]">
              Vérifiez les {photos.length} vêtements détectés
            </h2>
            <p className="mt-1 text-xs text-[#8A8A8A]">
              L&rsquo;IA a prérempli les informations. Modifiez si nécessaire.
            </p>
          </div>

          {photos.map((photo) => {
            const expanded = expandedId === photo.id;
            const errored = photo.status === 'error';
            return (
              <div
                key={photo.id}
                className="mb-3 overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Header row */}
                <div
                  className="flex cursor-pointer items-center border-b border-[#F7F5F2] p-3"
                  onClick={() => setExpandedId(expanded ? null : photo.id)}
                >
                  {/* Thumb */}
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#F0EDE8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.preview}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center 15%' }}
                    />
                  </div>

                  {/* Info */}
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111111]">
                      {photo.name || 'Vêtement sans nom'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span
                        className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[#111111]"
                        style={{ fontSize: '9px' }}
                      >
                        {CATEGORIES.find((c) => c.value === photo.category)?.label ??
                          photo.category}
                      </span>
                      {photo.colors.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[#111111]"
                          style={{ fontSize: '9px' }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right cluster */}
                  <div className="ml-2 flex items-center gap-2">
                    {errored ? (
                      <span className="text-xs text-[#D4785C]">Erreur</span>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8A8A8A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(photo.id);
                      }}
                      aria-label="Retirer ce vêtement"
                      className="flex h-6 w-6 cursor-pointer items-center justify-center text-[#CFCFCF] hover:text-[#D4785C]"
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

                {/* Expanded edit form */}
                {expanded && (
                  <div className="flex flex-col gap-3 p-4">
                    {/* Name */}
                    <input
                      type="text"
                      value={photo.name}
                      onChange={(e) => updatePhoto(photo.id, 'name', e.target.value)}
                      placeholder="Nom du vêtement"
                      className="w-full rounded-xl bg-[#F7F5F2] px-3 py-2 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none"
                    />

                    {/* Category pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => {
                        const active = photo.category === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => updatePhoto(photo.id, 'category', c.value)}
                            className={`cursor-pointer rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                              active
                                ? 'bg-[#111111] text-white'
                                : 'bg-[#F7F5F2] text-[#8A8A8A] hover:text-[#111111]'
                            }`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Colors */}
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_NAMES.map((name) => {
                        const selected = photo.colors.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleColor(photo.id, name)}
                            aria-label={name}
                            title={name}
                            className={`h-6 w-6 cursor-pointer rounded-full transition-transform ${
                              selected
                                ? 'scale-110 ring-2 ring-[#111111] ring-offset-1'
                                : 'ring-1 ring-[#EFEFEF]'
                            }`}
                            style={{ background: COLOR_HEXES[name] }}
                          />
                        );
                      })}
                    </div>

                    {/* Season + Occasion */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8A8A8A]">
                          Saison
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {SEASONS.map((s) => {
                            const active = photo.season === s.value;
                            return (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() => updatePhoto(photo.id, 'season', s.value)}
                                className={`cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  active
                                    ? 'bg-[#111111] text-white'
                                    : 'bg-[#F7F5F2] text-[#8A8A8A]'
                                }`}
                              >
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-[#8A8A8A]">
                          Occasion
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {OCCASIONS.map((o) => {
                            const active = photo.occasion === o.value;
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() =>
                                  updatePhoto(photo.id, 'occasion', o.value)
                                }
                                className={`cursor-pointer rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  active
                                    ? 'bg-[#111111] text-white'
                                    : 'bg-[#F7F5F2] text-[#8A8A8A]'
                                }`}
                              >
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Sticky save bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EFEFEF] bg-white px-5 py-4 md:left-64">
            <div className="mx-auto max-w-3xl">
              {error && (
                <p className="mb-2 text-xs text-[#D4785C]">{error}</p>
              )}
              <p className="mb-3 text-xs text-[#8A8A8A]">
                {eligibleCount} vêtement{eligibleCount > 1 ? 's' : ''} prêt
                {eligibleCount > 1 ? 's' : ''} à être ajouté
                {eligibleCount > 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={saveAll}
                disabled={eligibleCount === 0}
                className="w-full cursor-pointer rounded-full bg-[#111111] py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ajouter tous au dressing
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
              Enregistrement… {Math.min(saveIndex + 1, eligibleCount)}/{eligibleCount}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F0EDE8]">
              <div
                className="h-full rounded-full bg-[#111111] transition-all duration-300"
                style={{
                  width: `${
                    ((Math.min(saveIndex + 1, eligibleCount)) / eligibleCount) * 100
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
