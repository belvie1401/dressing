'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useWardrobeStore } from '@/lib/store';
import type { ClothingItem, Category, Season, Occasion } from '@/types';

// ─── Colour palette (16 entries, matching the AI enum) ───────────────────────
type ColorOption = { name: string; hex: string; ring?: boolean };
const COLORS: ColorOption[] = [
  { name: 'Blanc', hex: '#FFFFFF', ring: true },
  { name: 'Noir', hex: '#111111' },
  { name: 'Gris', hex: '#9CA3AF' },
  { name: 'Beige', hex: '#E8D9C4' },
  { name: 'Marron', hex: '#6B4423' },
  { name: 'Rouge', hex: '#DC2626' },
  { name: 'Rose', hex: '#F9A8D4' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Jaune', hex: '#FACC15' },
  { name: 'Vert', hex: '#16A34A' },
  { name: 'Bleu', hex: '#2563EB' },
  { name: 'Bleu marine', hex: '#1E3A8A' },
  { name: 'Violet', hex: '#7C3AED' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Kaki', hex: '#78866B' },
  { name: 'Multicolore', hex: 'linear-gradient(135deg,#F97316,#DC2626,#2563EB,#16A34A)' },
];

// ─── Enum options (aligned with Prisma schema) ───────────────────────────────
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
  { value: 'ALL', label: 'Toutes saisons' },
];

const OCCASIONS: Array<{ value: Occasion; label: string }> = [
  { value: 'CASUAL', label: 'Décontracté' },
  { value: 'WORK', label: 'Travail' },
  { value: 'EVENING', label: 'Soirée' },
  { value: 'SPORT', label: 'Sport' },
];

// ─── AI scan result shape ────────────────────────────────────────────────────
type AIScan = {
  name?: string;
  category?: Category;
  primary_color?: string;
  colors?: string[];
  color_hexes?: string[];
  material?: string;
  season?: Season;
  occasion?: Occasion;
  brand?: string | null;
  style_tags?: string[];
  confidence?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function hashImage(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function normalizeColorName(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const match = COLORS.find((c) => c.name.toLowerCase() === trimmed);
  return match ? match.name : null;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function WardrobeAddPage() {
  const router = useRouter();
  const addItem = useWardrobeStore((s) => s.addItem);

  // Hidden file inputs — one per (side × source) combination
  const frontCameraRef = useRef<HTMLInputElement>(null);
  const frontGalleryRef = useRef<HTMLInputElement>(null);
  const backCameraRef = useRef<HTMLInputElement>(null);
  const backGalleryRef = useRef<HTMLInputElement>(null);

  // Photo state — front (required) + back (optional)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [photoHash, setPhotoHash] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AIScan | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('TOP');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [season, setSeason] = useState<Season>('ALL');
  const [occasion, setOccasion] = useState<Occasion>('CASUAL');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<ClothingItem | null>(null);

  // ── Handle file selection ──
  const handleFileSelected = useCallback(async (selected: File) => {
    setError(null);
    setDuplicate(null);
    setFile(selected);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);

    // Compute hash + run AI scan in parallel
    setScanning(true);
    try {
      const [hash, base64] = await Promise.all([
        hashImage(selected),
        fileToBase64(selected),
      ]);
      setPhotoHash(hash);

      const res = await api.post<AIScan>('/ai/scan-clothing', { image_base64: base64 });
      if (res.success && res.data) {
        const ai = res.data;
        setScanResult(ai);

        // Prefill form fields from AI result (only if still empty)
        if (ai.name) setName((prev) => prev || ai.name!);
        if (ai.category) setCategory(ai.category);
        if (ai.material) setMaterial((prev) => prev || ai.material!);
        if (ai.season) setSeason(ai.season);
        if (ai.occasion) setOccasion(ai.occasion);
        if (ai.brand) setBrand((prev) => prev || ai.brand!);

        // Map AI colour names to our palette
        const aiColors = (ai.colors ?? [ai.primary_color]).filter(
          (c): c is string => typeof c === 'string'
        );
        const mapped = aiColors
          .map(normalizeColorName)
          .filter((c): c is string => c !== null);
        if (mapped.length > 0) setSelectedColors(Array.from(new Set(mapped)));
      }
    } catch {
      // Silent fail — user can fill the form manually
    } finally {
      setScanning(false);
    }
  }, []);

  const onFrontFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelected(selected);
    e.target.value = '';
  };

  const onBackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setError(null);
      setBackFile(selected);
      const reader = new FileReader();
      reader.onload = () => setBackPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
    e.target.value = '';
  };

  const handleResetFront = () => {
    setFile(null);
    setPreview(null);
    setPhotoHash(null);
    setScanResult(null);
    setError(null);
  };

  const handleResetBack = () => {
    setBackFile(null);
    setBackPreview(null);
  };

  const has360 = !!preview && !!backPreview;

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  // ── Submit ──
  const canSave = !!file && !saving && !scanning;

  const handleSubmit = async (confirmDuplicate = false) => {
    if (!file || !canSave) return;
    setSaving(true);
    setError(null);

    const body = new FormData();
    body.append('photo', file);
    if (backFile) body.append('photo_back', backFile);
    body.append('name', name.trim());
    body.append('category', category);
    body.append('colors', JSON.stringify(selectedColors));
    body.append('material', material.trim());
    body.append('season', season);
    body.append('occasion', occasion);
    body.append('brand', brand.trim());
    if (price) body.append('purchase_price', price);
    if (purchaseDate) body.append('purchase_date', purchaseDate);
    if (photoHash) body.append('photo_hash', photoHash);
    if (confirmDuplicate) body.append('duplicate_confirmed', '1');
    if (scanResult) body.append('ai_tags', JSON.stringify(scanResult));
    body.append('remove_bg', '1');

    const res = await api.post<ClothingItem>('/wardrobe', body);
    const resAny = res as unknown as {
      success: boolean;
      data?: ClothingItem;
      error?: string;
      message?: string;
      existing_item?: ClothingItem;
      status?: number;
    };

    if (res.success && res.data) {
      addItem(res.data);
      router.push('/wardrobe');
      return;
    }

    if (resAny.status === 409 && resAny.existing_item) {
      setDuplicate(resAny.existing_item);
    } else {
      setError(resAny.message || resAny.error || "Une erreur est survenue lors de l'enregistrement.");
    }
    setSaving(false);
  };

  const confirmAddDuplicate = () => {
    setDuplicate(null);
    handleSubmit(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pb-24">
      {/* ============ HEADER ============ */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/wardrobe"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            aria-label="Retour"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="font-serif text-2xl text-[#111111]">Ajouter un vêtement</h1>
        </div>
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={!canSave}
          className="cursor-pointer rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      {/* ============ PHOTO UPLOAD (2-photo 360°) ============ */}
      <section className="mb-6">
        <h2 className="font-serif text-base text-[#111111]">Photos du vêtement</h2>
        <p className="mt-1 mb-4 text-xs text-[#8A8A8A]">
          Ajoutez une photo de face et de dos pour activer la vue 360°
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* ---- ZONE 1 — FRONT (required) ---- */}
          <PhotoZone
            side="front"
            label="Face"
            requiredLabel="Requis"
            preview={preview}
            scanning={scanning}
            onCameraClick={() => frontCameraRef.current?.click()}
            onGalleryClick={() => frontGalleryRef.current?.click()}
            onRemove={handleResetFront}
          />

          {/* ---- ZONE 2 — BACK (optional) ---- */}
          <PhotoZone
            side="back"
            label="Dos"
            requiredLabel="Optionnel"
            preview={backPreview}
            scanning={false}
            onCameraClick={() => backCameraRef.current?.click()}
            onGalleryClick={() => backGalleryRef.current?.click()}
            onRemove={handleResetBack}
          />
        </div>

        {/* ---- 360° activation status ---- */}
        {preview && !backPreview && (
          <p className="mt-2 text-center text-xs text-[#8A8A8A]">
            Ajoutez une photo de dos pour activer la vue 360°
          </p>
        )}
        {has360 && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v2" />
              <path d="M12 19v2" />
              <path d="M3 12h2" />
              <path d="M19 12h2" />
              <path d="M18.364 5.636l-1.414 1.414" />
              <path d="M7.05 16.95l-1.414 1.414" />
              <path d="M18.364 18.364l-1.414-1.414" />
              <path d="M7.05 7.05L5.636 5.636" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-xs font-medium text-[#C6A47E]">
              Vue 360° activée&nbsp;!
            </span>
          </div>
        )}

        {/* ---- Hidden file inputs (4 total) ---- */}
        <input
          ref={frontCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFrontFileInput}
          className="hidden"
        />
        <input
          ref={frontGalleryRef}
          type="file"
          accept="image/*"
          onChange={onFrontFileInput}
          className="hidden"
        />
        <input
          ref={backCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onBackFileInput}
          className="hidden"
        />
        <input
          ref={backGalleryRef}
          type="file"
          accept="image/*"
          onChange={onBackFileInput}
          className="hidden"
        />
      </section>

      {/* ============ AI ANALYSIS CARD ============ */}
      {scanResult && (
        <section className="mb-6 rounded-2xl bg-[#EDE5DC] p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p className="font-serif text-sm text-[#111111]">Analyse IA</p>
            </div>
            {typeof scanResult.confidence === 'number' && (
              <span className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-medium text-[#111111]">
                Confiance&nbsp;{scanResult.confidence}%
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[#8A8A8A]">
            Les champs ci-dessous ont été remplis automatiquement. Vérifiez et
            ajustez avant d&rsquo;enregistrer.
          </p>
          {scanResult.style_tags && scanResult.style_tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {scanResult.style_tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/60 px-2.5 py-1 text-[10px] font-medium text-[#111111]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ FORM FIELDS ============ */}
      <div className="space-y-6">
        {/* ----- Name ----- */}
        <Field label="Nom du vêtement">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Chemise blanche oversize"
            className="w-full rounded-xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
          />
        </Field>

        {/* ----- Category ----- */}
        <Field label="Catégorie">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#EFEFEF] bg-white text-[#111111] hover:bg-[#F7F5F2]'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ----- Colours ----- */}
        <Field
          label="Couleurs"
          hint={
            selectedColors.length > 0
              ? `${selectedColors.length} sélectionnée${selectedColors.length > 1 ? 's' : ''}`
              : 'Choisissez une ou plusieurs couleurs'
          }
        >
          <div className="grid grid-cols-8 gap-3">
            {COLORS.map((c) => {
              const selected = selectedColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={selected}
                  className={`relative h-10 w-10 cursor-pointer rounded-full transition-transform ${
                    selected ? 'scale-110 ring-2 ring-[#111111] ring-offset-2' : 'ring-1 ring-[#EFEFEF]'
                  }`}
                  style={{
                    background: c.hex.startsWith('linear-gradient') ? c.hex : c.hex,
                  }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.ring ? '#111111' : '#FFFFFF'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ----- Material ----- */}
        <Field label="Matière">
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Ex. Coton, Laine, Jean…"
            className="w-full rounded-xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
          />
        </Field>

        {/* ----- Season ----- */}
        <Field label="Saison">
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => {
              const active = season === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSeason(s.value)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#EFEFEF] bg-white text-[#111111] hover:bg-[#F7F5F2]'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ----- Occasion ----- */}
        <Field label="Occasion">
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => {
              const active = occasion === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOccasion(o.value)}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#EFEFEF] bg-white text-[#111111] hover:bg-[#F7F5F2]'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* ----- Brand ----- */}
        <Field label="Marque (optionnel)">
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex. Zara, Uniqlo…"
            className="w-full rounded-xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
          />
        </Field>

        {/* ----- Price + Date ----- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prix d'achat (optionnel)">
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-[#EFEFEF] bg-white px-4 py-3 pr-10 text-sm text-[#111111] placeholder-[#8A8A8A] focus:border-[#111111] focus:outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8A8A8A]">
                €
              </span>
            </div>
          </Field>
          <Field label="Date d'achat (optionnel)">
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full rounded-xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
            />
          </Field>
        </div>
      </div>

      {/* ============ ERROR ============ */}
      {error && (
        <div className="mt-6 rounded-xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
          {error}
        </div>
      )}

      {/* ============ FIXED BOTTOM SAVE BUTTON ============ */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EFEFEF] bg-white/95 p-4 backdrop-blur-sm md:left-64">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!canSave}
            className="w-full cursor-pointer rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? 'Enregistrement…' : 'Ajouter à mon dressing'}
          </button>
        </div>
      </div>

      {/* ============ DUPLICATE MODAL ============ */}
      {duplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF3C7]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 className="font-serif text-xl text-[#111111]">
              Vêtement déjà présent&nbsp;?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
              Cette photo correspond à un vêtement déjà enregistré dans votre dressing.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F7F5F2] p-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EDE8]">
                {(duplicate.bg_removed_url || duplicate.photo_url) && (
                  <Image
                    src={duplicate.bg_removed_url || duplicate.photo_url}
                    alt={duplicate.name || 'Vêtement existant'}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111111]">
                  {duplicate.name || CATEGORIES.find((c) => c.value === duplicate.category)?.label || 'Vêtement'}
                </p>
                <p className="text-xs text-[#8A8A8A]">
                  {duplicate.colors?.slice(0, 3).join(' · ') || '—'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push('/wardrobe')}
                className="cursor-pointer rounded-full bg-[#111111] py-3 text-xs font-semibold text-white"
              >
                Voir dans mon dressing
              </button>
              <button
                type="button"
                onClick={confirmAddDuplicate}
                className="cursor-pointer rounded-full border border-[#EFEFEF] bg-white py-3 text-xs font-medium text-[#111111]"
              >
                Ajouter quand même
              </button>
              <button
                type="button"
                onClick={() => setDuplicate(null)}
                className="cursor-pointer py-2 text-xs text-[#8A8A8A] hover:text-[#111111]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-[#8A8A8A]">
          {label}
        </label>
        {hint && <span className="text-[10px] text-[#8A8A8A]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── PhotoZone — single-side upload card (front or back) ────────────────────
function PhotoZone({
  side,
  label,
  requiredLabel,
  preview,
  scanning,
  onCameraClick,
  onGalleryClick,
  onRemove,
}: {
  side: 'front' | 'back';
  label: string;
  requiredLabel: string;
  preview: string | null;
  scanning: boolean;
  onCameraClick: () => void;
  onGalleryClick: () => void;
  onRemove: () => void;
}) {
  const isBack = side === 'back';
  const borderClass = isBack
    ? 'border-dashed border-[#C6A47E]/40 bg-[#EDE5DC]/20'
    : 'border-dashed border-[#CFCFCF] bg-white';

  return (
    <div
      className={`relative h-[200px] overflow-hidden rounded-2xl border-2 ${
        preview ? 'border-solid border-[#EFEFEF]' : borderClass
      }`}
    >
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-cover"
          />
          {/* Bottom label bar */}
          <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1.5 text-center text-xs font-medium text-white">
            {label}
          </div>
          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Supprimer la photo ${label}`}
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* Scanning overlay (front only) */}
          {scanning && side === 'front' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#111111]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" />
                </svg>
                Analyse IA…
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center px-2">
          {/* 360° pill badge (back only) */}
          {isBack && (
            <span className="absolute right-2 top-2 rounded-full bg-[#C6A47E]/10 px-2 py-0.5 text-[9px] font-medium text-[#C6A47E]">
              360°
            </span>
          )}
          {/* Camera icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <p className="mt-2 font-serif text-sm text-[#111111]">{label}</p>
          <p className="text-[10px] text-[#8A8A8A]">{requiredLabel}</p>

          {/* Source buttons */}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCameraClick();
              }}
              aria-label={`Prendre une photo ${label}`}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F0EDE8] hover:bg-[#EDE5DC]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onGalleryClick();
              }}
              aria-label={`Choisir une photo ${label} depuis la galerie`}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#F0EDE8] hover:bg-[#EDE5DC]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
