'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import type { ClothingItem, Category, Season, Occasion } from '@/types';

// ─── Palette + enum options (same as add page) ──────────────────────────────
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

export default function WardrobeEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Load item and prefill form ──
  useEffect(() => {
    api.get<ClothingItem>(`/wardrobe/${id}`).then((res) => {
      if (res.success && res.data) {
        const d = res.data;
        setItem(d);
        setName(d.name || '');
        setCategory(d.category);
        setSelectedColors(d.colors || []);
        setMaterial(d.material || '');
        setSeason(d.season);
        setOccasion(d.occasion);
        setBrand(d.brand || '');
        setPrice(d.purchase_price != null ? String(d.purchase_price) : '');
        setPurchaseDate(
          d.purchase_date ? new Date(d.purchase_date).toISOString().slice(0, 10) : '',
        );
      }
      setLoading(false);
    });
  }, [id]);

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    setError('');

    const body: Record<string, unknown> = {
      name: name.trim() || null,
      category,
      colors: selectedColors,
      material: material.trim() || null,
      season,
      occasion,
      brand: brand.trim() || null,
    };
    // Only include price/date if they have a value, or explicitly null to clear
    body.purchase_price = price ? price : null;
    body.purchase_date = purchaseDate || null;

    const res = await api.put<ClothingItem>(`/wardrobe/${id}`, body);

    if (res.success) {
      router.push(`/wardrobe/${id}`);
      return;
    }

    const errBody = res as unknown as { message?: string; error?: string };
    setError(errBody.message || errBody.error || 'Erreur lors de la mise à jour.');
    setSaving(false);
  };

  // ── Loading / not found ──
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="py-16 text-center text-sm text-[#8A8A8A]">Vêtement non trouvé</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-32">
      {/* ══ Header ══ */}
      <div className="flex items-center justify-between border-b border-[#EFEFEF] bg-white px-5 py-4">
        <Link
          href={`/wardrobe/${id}`}
          aria-label="Retour"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] hover:bg-[#F0EDE8]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="font-serif text-lg text-[#111111]">Modifier</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer text-sm font-semibold text-[#C6A47E] disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Sauvegarder'}
        </button>
      </div>

      {/* ══ Item photo (read-only) ══ */}
      <div className="mx-5 mt-4 overflow-hidden rounded-2xl bg-white">
        <div className="relative h-[200px]" style={{ background: '#F0EDE8' }}>
          <Image
            src={item.bg_removed_url || item.photo_url}
            alt={item.name || item.category}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 500px"
          />
        </div>
      </div>

      {/* ══ Error banner ══ */}
      {error && (
        <div className="mx-5 mt-3 rounded-xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3">
          <p className="text-xs text-[#D4785C]">{error}</p>
        </div>
      )}

      {/* ══ Form fields ══ */}
      <div className="mx-5 mt-4 space-y-6">
        {/* Name */}
        <Field label="Nom du vêtement">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Chemise blanche oversize"
            className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none focus:border-[#111111]"
          />
        </Field>

        {/* Category */}
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
                      : 'border-[#EFEFEF] bg-white text-[#111111]'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Colors */}
        <Field
          label="Couleurs"
          hint={
            selectedColors.length > 0
              ? `${selectedColors.length} sélectionnée${selectedColors.length > 1 ? 's' : ''}`
              : 'Choisissez une ou plusieurs'
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
                  className={`relative h-9 w-9 cursor-pointer rounded-full transition-transform ${
                    selected
                      ? 'scale-110 ring-2 ring-[#111111] ring-offset-2'
                      : 'ring-1 ring-[#EFEFEF]'
                  }`}
                  style={{ background: c.hex }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={c.ring ? '#111111' : '#FFFFFF'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedColors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedColors.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 rounded-full bg-[#F0EDE8] py-1 pl-3 pr-2 text-[10px] text-[#111111]"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => toggleColor(c)}
                    className="cursor-pointer text-[#8A8A8A] hover:text-[#111111]"
                    aria-label={`Retirer ${c}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        {/* Season */}
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
                      : 'border-[#EFEFEF] bg-white text-[#111111]'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Occasion */}
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
                      : 'border-[#EFEFEF] bg-white text-[#111111]'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Material */}
        <Field label="Matière">
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Ex. Coton, Laine, Jean…"
            className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none focus:border-[#111111]"
          />
        </Field>

        {/* Brand */}
        <Field label="Marque">
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex. Zara, Uniqlo…"
            className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none focus:border-[#111111]"
          />
        </Field>

        {/* Price + Date */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Prix d'achat">
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                className="flex-1 rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3.5 text-sm text-[#111111] placeholder-[#8A8A8A] outline-none focus:border-[#111111]"
              />
              <span className="text-sm text-[#8A8A8A]">€</span>
            </div>
          </Field>
          <Field label="Date d'achat">
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none focus:border-[#111111]"
            />
          </Field>
        </div>
      </div>

      {/* ══ Fixed bottom save bar ══ */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#EFEFEF] bg-white/95 px-5 py-4 backdrop-blur-sm lg:left-64">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full cursor-pointer rounded-full bg-[#111111] py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}

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
