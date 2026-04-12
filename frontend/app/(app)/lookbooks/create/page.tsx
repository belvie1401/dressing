'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { StylistClient, User, LookbookType } from '@/types';
import { api } from '@/lib/api';

interface TypeOption {
  value: LookbookType;
  label: string;
  icon: React.ReactNode;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'BEFORE_AFTER',
    label: 'Avant / Après',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="9" height="16" rx="1" />
        <rect x="13" y="4" width="9" height="16" rx="1" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    value: 'COMPLETE_LOOK',
    label: 'Look Complet',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" />
        <line x1="16" y1="6" x2="16" y2="8" />
      </svg>
    ),
  },
  {
    value: 'THEME',
    label: 'Thématique',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    value: 'STYLE_ADVICE',
    label: 'Conseil Style',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.5.6 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
      </svg>
    ),
  },
];

const PRESET_TAGS = [
  'Minimaliste',
  'Chic',
  'Casual',
  'Street',
  'Soirée',
  'Travail',
  'Capsule',
  'Printemps',
  'Été',
  'Automne',
  'Hiver',
];

export default function CreateLookbookPage() {
  return <Suspense><CreateLookbookInner /></Suspense>;
}

function CreateLookbookInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetClientId = searchParams.get('client') || '';

  const [type, setType] = useState<LookbookType>('COMPLETE_LOOK');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('79');
  const [photos, setPhotos] = useState<string[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [clients, setClients] = useState<User[]>([]);
  const [clientId, setClientId] = useState<string>(presetClientId);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      const res = await api.get<StylistClient[]>('/stylists/connections');
      if (res.success && Array.isArray(res.data)) {
        setClients(
          res.data
            .filter((c) => c.status === 'ACTIVE' && c.client)
            .map((c) => c.client as User)
        );
      }
    };
    loadClients();
  }, []);

  const uploadFiles = async (
    files: FileList,
    target: 'photos' | 'before' | 'after'
  ) => {
    setUploading(true);
    setError('');
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`${file.name} dépasse 10 Mo`);
          continue;
        }
        const form = new FormData();
        form.append('photo', file);
        const res = await api.post<{ url: string; public_id: string }>(
          '/lookbooks/upload-photo',
          form
        );
        if (res.success && res.data?.url) {
          urls.push(res.data.url);
        }
      }
      if (target === 'photos') setPhotos((p) => [...p, ...urls]);
      if (target === 'before') setBeforePhotos((p) => [...p, ...urls]);
      if (target === 'after') setAfterPhotos((p) => [...p, ...urls]);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (target: 'photos' | 'before' | 'after', idx: number) => {
    if (target === 'photos') setPhotos((p) => p.filter((_, i) => i !== idx));
    if (target === 'before') setBeforePhotos((p) => p.filter((_, i) => i !== idx));
    if (target === 'after') setAfterPhotos((p) => p.filter((_, i) => i !== idx));
  };

  const toggleTag = (tag: string) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  };

  const addCustomTag = () => {
    const val = customTag.trim();
    if (!val) return;
    if (!tags.includes(val)) setTags((t) => [...t, val]);
    setCustomTag('');
  };

  const submit = async () => {
    setError('');
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    const totalPhotos =
      type === 'BEFORE_AFTER'
        ? beforePhotos.length + afterPhotos.length
        : photos.length;
    if (totalPhotos === 0) {
      setError('Ajoutez au moins une photo');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ id: string }>('/lookbooks', {
        title,
        description,
        type,
        price: price ? Number(price) : null,
        photos,
        before_photos: beforePhotos,
        after_photos: afterPhotos,
        tags,
        client_id: clientId || null,
        is_public: isPublic || !clientId,
      });
      if (res.success) {
        router.push('/lookbooks');
      } else {
        setError(res.error || 'Erreur lors de la création');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const descCount = description.length;

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
        <h1 className="font-serif text-xl text-[#111111]">Nouveau portfolio</h1>
      </header>

      <div className="px-5 flex flex-col gap-8">
        {/* 1. TYPE */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">
            Quel type de travail ?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TYPE_OPTIONS.map((opt) => {
              const active = type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`rounded-2xl bg-white p-4 text-left transition-all ${
                    active
                      ? 'border-2 border-[#111111] shadow-md'
                      : 'border-2 border-transparent shadow-sm'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                      active ? 'bg-[#111111] text-white' : 'bg-[#F0EDE8] text-[#111111]'
                    }`}
                  >
                    {opt.icon}
                  </div>
                  <p className="text-sm font-semibold text-[#111111]">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. TITRE ET DESCRIPTION */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">
            Titre et description
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la prestation"
              className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-sm text-[#111111] placeholder:text-[#CFCFCF] focus:outline-none focus:border-[#111111]"
            />
            <div className="bg-white border border-[#EFEFEF] rounded-2xl">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Description (objectif, contexte, résultat)"
                className="w-full min-h-[120px] bg-transparent px-4 py-3 text-sm text-[#111111] placeholder:text-[#CFCFCF] focus:outline-none resize-none"
              />
              <div className="px-4 pb-2 text-right">
                <span className="text-[10px] text-[#8A8A8A]">{descCount}/500</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. PRIX */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">
            Tarif de cette prestation
          </h2>
          <div className="bg-white border border-[#EFEFEF] rounded-2xl flex items-center px-4 py-3">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 text-sm text-[#111111] focus:outline-none bg-transparent"
              placeholder="79"
              min={0}
            />
            <span className="text-sm text-[#8A8A8A]">euros</span>
          </div>
        </section>

        {/* 4. PHOTOS */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">Photos</h2>

          {type === 'BEFORE_AFTER' ? (
            <div className="grid grid-cols-2 gap-3">
              <BeforeAfterZone
                label="Avant"
                photos={beforePhotos}
                onUpload={(files) => uploadFiles(files, 'before')}
                onRemove={(idx) => removePhoto('before', idx)}
                uploading={uploading}
              />
              <BeforeAfterZone
                label="Après"
                photos={afterPhotos}
                onUpload={(files) => uploadFiles(files, 'after')}
                onRemove={(idx) => removePhoto('after', idx)}
                uploading={uploading}
              />
            </div>
          ) : (
            <UploadZone
              photos={photos}
              onUpload={(files) => uploadFiles(files, 'photos')}
              onRemove={(idx) => removePhoto('photos', idx)}
              uploading={uploading}
            />
          )}
        </section>

        {/* 5. TAGS */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-xs font-medium ${
                    active
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F0EDE8] text-[#111111]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {tags
              .filter((t) => !PRESET_TAGS.includes(t))
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full px-4 py-2 text-xs font-medium bg-[#111111] text-white flex items-center gap-1"
                >
                  {tag}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
              placeholder="Ajouter un tag"
              className="flex-1 bg-white border border-[#EFEFEF] rounded-full px-4 py-2 text-sm text-[#111111] placeholder:text-[#CFCFCF] focus:outline-none focus:border-[#111111]"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="bg-[#111111] text-white rounded-full w-9 h-9 flex items-center justify-center shrink-0"
              aria-label="Ajouter"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </section>

        {/* 6. CLIENT */}
        <section>
          <h2 className="font-serif text-lg text-[#111111] mb-3">
            Cliente concern&eacute;e
          </h2>
          <p className="text-sm text-[#8A8A8A] mb-2">
            Associez cette prestation à une cliente (optionnel)
          </p>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-white border border-[#EFEFEF] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
          >
            <option value="">Aucune cliente spécifique</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="mt-3 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 accent-[#111111]"
            />
            <span className="text-sm text-[#8A8A8A]">
              Portfolio public (visible par tous)
            </span>
          </label>
        </section>

        {error && (
          <div className="rounded-2xl border border-[#D4785C]/20 bg-[#FFF8F6] px-4 py-3 text-sm text-[#D4785C]">
            {error}
          </div>
        )}
      </div>

      {/* Fixed submit bar */}
      <div className="fixed bottom-24 left-0 right-0 px-5 lg:bottom-8">
        <button
          type="button"
          onClick={submit}
          disabled={submitting || uploading}
          className="block w-full bg-[#111111] text-white rounded-full py-4 text-sm font-medium shadow-xl disabled:opacity-60"
        >
          {submitting
            ? 'Publication...'
            : uploading
            ? 'Upload en cours...'
            : 'Publier au portfolio'}
        </button>
      </div>
    </div>
  );
}

function UploadZone({
  photos,
  onUpload,
  onRemove,
  uploading,
}: {
  photos: string[];
  onUpload: (files: FileList) => void;
  onRemove: (idx: number) => void;
  uploading: boolean;
}) {
  return (
    <div>
      <label
        className={`block border-2 border-dashed border-[#CFCFCF] rounded-3xl p-8 text-center cursor-pointer ${
          uploading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
        <svg
          className="mx-auto text-[#CFCFCF]"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="font-semibold text-[#111111] mt-3">Ajouter des photos</p>
        <p className="text-xs text-[#8A8A8A] mt-1">JPG, PNG &middot; Max 10 Mo par photo</p>
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {photos.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#EDE5DC]"
            >
              <img src={url} alt={`photo-${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label="Supprimer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BeforeAfterZone({
  label,
  photos,
  onUpload,
  onRemove,
  uploading,
}: {
  label: string;
  photos: string[];
  onUpload: (files: FileList) => void;
  onRemove: (idx: number) => void;
  uploading: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-[#8A8A8A] uppercase tracking-wide font-medium mb-2">
        {label}
      </p>
      <label
        className={`block border-2 border-dashed border-[#CFCFCF] rounded-3xl p-5 text-center cursor-pointer ${
          uploading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
        <svg
          className="mx-auto text-[#CFCFCF]"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        <p className="text-xs font-semibold text-[#111111] mt-2">Ajouter</p>
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {photos.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#EDE5DC]"
            >
              <img src={url} alt={`${label}-${idx}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label="Supprimer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
