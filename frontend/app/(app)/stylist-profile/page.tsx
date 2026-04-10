'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_min: number;
  price: number;
}

interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  comment: string;
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'svc-1',
    name: 'Session Dressing',
    description: 'Analyse compl\u00e8te de votre garde-robe',
    duration_min: 90,
    price: 99,
  },
  {
    id: 'svc-2',
    name: 'Lookbook Personnalis\u00e9',
    description: '5 looks compos\u00e9s avec vos pi\u00e8ces',
    duration_min: 60,
    price: 79,
  },
  {
    id: 'svc-3',
    name: 'Conseil Style',
    description: 'S\u00e9ance de conseil et orientation',
    duration_min: 30,
    price: 49,
  },
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'r-1',
    author: 'Sophie M.',
    avatar: 'https://i.pravatar.cc/80?img=47',
    date: 'il y a 2 sem.',
    rating: 5,
    comment:
      'Une s\u00e9ance bluffante ! J\u2019ai red\u00e9couvert ma garde-robe et retrouv\u00e9 le plaisir de m\u2019habiller le matin.',
  },
  {
    id: 'r-2',
    author: 'Marie L.',
    avatar: 'https://i.pravatar.cc/80?img=32',
    date: 'il y a 1 mois',
    rating: 5,
    comment:
      'Un vrai \u0153il et beaucoup de bienveillance. Le lookbook est parfait pour mon quotidien.',
  },
  {
    id: 'r-3',
    author: 'Julie R.',
    avatar: 'https://i.pravatar.cc/80?img=44',
    date: 'il y a 2 mois',
    rating: 4,
    comment:
      'Tr\u00e8s \u00e0 l\u2019\u00e9coute, pile ce qu\u2019il me fallait pour oser changer de style.',
  },
];

const DEFAULT_TAGS = ['Minimal', 'Chic', '\u00c9pur\u00e9'];

export default function StylistProfilePage() {
  const { user } = useAuthStore();

  const initialProfile = useMemo(
    () => (user?.style_profile as Record<string, unknown> | undefined) || {},
    [user?.style_profile]
  );

  const [bio, setBio] = useState<string>(
    (initialProfile.bio as string) || ''
  );
  const [editingBio, setEditingBio] = useState(false);
  const [tags, setTags] = useState<string[]>(
    (initialProfile.style_tags as string[]) || DEFAULT_TAGS
  );
  const [editingTags, setEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [services, setServices] = useState<Service[]>(
    (initialProfile.services as Service[]) || DEFAULT_SERVICES
  );
  const [serviceModal, setServiceModal] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Styliste';
  const location = user?.location || 'Paris';
  const averageRating = useMemo(() => {
    const sum = DEFAULT_REVIEWS.reduce((acc, r) => acc + r.rating, 0);
    return (sum / DEFAULT_REVIEWS.length).toFixed(1);
  }, []);

  useEffect(() => {
    setBio((initialProfile.bio as string) || '');
    setTags((initialProfile.style_tags as string[]) || DEFAULT_TAGS);
    setServices((initialProfile.services as Service[]) || DEFAULT_SERVICES);
  }, [initialProfile]);

  const persistProfile = async (patch: Record<string, unknown>) => {
    if (!user) return;
    setSaving(true);
    try {
      const next = { ...initialProfile, ...patch };
      const res = await api.put<{ style_profile: Record<string, unknown> }>(
        '/auth/profile',
        { style_profile: next }
      );
      if (res.success) {
        useAuthStore.setState({
          user: { ...user, style_profile: next },
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const saveBio = async () => {
    setEditingBio(false);
    await persistProfile({ bio });
  };

  const addTag = async () => {
    const val = newTag.trim();
    if (!val) return;
    const next = [...tags, val];
    setTags(next);
    setNewTag('');
    await persistProfile({ style_tags: next });
  };

  const removeTag = async (t: string) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    await persistProfile({ style_tags: next });
  };

  const openNewService = () => {
    setServiceModal({
      id: `svc-${Date.now()}`,
      name: '',
      description: '',
      duration_min: 60,
      price: 49,
    });
  };

  const saveService = async (svc: Service) => {
    const exists = services.some((s) => s.id === svc.id);
    const next = exists
      ? services.map((s) => (s.id === svc.id ? svc : s))
      : [...services, svc];
    setServices(next);
    setServiceModal(null);
    setSaving(true);
    try {
      await api.put('/stylists/services', { services: next });
      await persistProfile({ services: next });
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: string) => {
    const next = services.filter((s) => s.id !== id);
    setServices(next);
    setServiceModal(null);
    await api.put('/stylists/services', { services: next });
    await persistProfile({ services: next });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      {/* ============== HERO ============== */}
      <section className="bg-[#111111] rounded-b-3xl pb-6 relative">
        <div
          className="h-48 w-full rounded-b-none relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #1a1a1a 0%, #2d2424 40%, #C6A47E 100%)',
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(circle at 20% 80%, #C6A47E 0%, transparent 50%)',
            }}
          />
          {/* Edit button top-right */}
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="rounded-full bg-white/90 text-[#111111] px-4 py-1.5 text-xs font-medium backdrop-blur"
            >
              Modifier mon profil
            </button>
          </div>
        </div>

        {/* Avatar overlaps cover */}
        <div className="px-5 -mt-12 relative">
          <div className="w-24 h-24 rounded-full ring-4 ring-white overflow-hidden bg-[#EDE5DC] relative">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-3xl text-[#C6A47E]">
                  {firstName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-white">{user?.name || firstName}</h1>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#C6A47E" stroke="none">
                <path d="M12 1.5l2.6 4.6 5.2 1-3.7 3.7.8 5.2L12 13.8l-4.9 2.2.8-5.2L4.2 7.1l5.2-1z" />
              </svg>
            </div>
            <p className="text-sm text-[#CFCFCF] mt-0.5">
              Styliste &middot; {location}
            </p>
          </div>
        </div>
      </section>

      {/* ============== STATS BAR ============== */}
      <section className="mx-5 mt-4">
        <div className="bg-white rounded-2xl p-4 flex justify-around shadow-sm">
          <div className="text-center">
            <p className="font-serif text-2xl text-[#111111]">320</p>
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wide mt-0.5">
              Looks cr&eacute;&eacute;s
            </p>
          </div>
          <div className="w-px bg-[#EFEFEF]" />
          <div className="text-center">
            <p className="font-serif text-2xl text-[#C6A47E]">98%</p>
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wide mt-0.5">
              Satisfaction
            </p>
          </div>
          <div className="w-px bg-[#EFEFEF]" />
          <div className="text-center">
            <p className="font-serif text-2xl text-[#111111]">3 ans</p>
            <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wide mt-0.5">
              Exp&eacute;rience
            </p>
          </div>
        </div>
      </section>

      {/* ============== STYLE TAGS ============== */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-lg text-[#111111]">Mon style</h2>
          <button
            type="button"
            onClick={() => setEditingTags((e) => !e)}
            className="text-xs text-[#C6A47E] font-medium"
          >
            {editingTags ? 'Terminer' : 'Modifier'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => editingTags && removeTag(t)}
              className={`rounded-full px-4 py-2 text-sm ${
                editingTags
                  ? 'bg-[#F0EDE8] text-[#111111] pr-3 flex items-center gap-1'
                  : 'bg-[#F0EDE8] text-[#111111]'
              }`}
            >
              {t}
              {editingTags && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </button>
          ))}
          {editingTags && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Ajouter un tag"
                className="rounded-full bg-white border border-[#EFEFEF] px-3 py-1.5 text-sm text-[#111111] focus:outline-none focus:border-[#111111] w-32"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-full bg-[#111111] text-white w-8 h-8 flex items-center justify-center"
                aria-label="Ajouter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============== BIO ============== */}
      <section className="px-5 mt-6">
        <h2 className="font-serif text-lg text-[#111111] mb-2">&Agrave; propos</h2>
        {editingBio ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={4}
              placeholder="Passionn\u00e9e par les coupes intemporelles..."
              className="w-full text-sm text-[#111111] placeholder:text-[#CFCFCF] focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-[#8A8A8A]">{bio.length}/300</span>
              <button
                type="button"
                onClick={saveBio}
                className="bg-[#111111] text-white rounded-full px-4 py-1.5 text-xs font-medium"
                disabled={saving}
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingBio(true)}
            className="w-full text-left bg-white rounded-2xl p-4 shadow-sm"
          >
            <p
              className={`text-sm leading-relaxed ${
                bio ? 'text-[#111111]' : 'text-[#CFCFCF]'
              }`}
            >
              {bio || 'Passionn\u00e9e par les coupes intemporelles... Appuyez pour \u00e9crire votre bio.'}
            </p>
            <p className="text-[10px] text-[#C6A47E] mt-2">Modifier</p>
          </button>
        )}
      </section>

      {/* ============== PRESTATIONS ============== */}
      <section className="px-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-lg text-[#111111]">Mes prestations</h2>
          <button
            type="button"
            onClick={openNewService}
            className="text-sm text-[#C6A47E] font-medium"
          >
            + Ajouter
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {services.map((svc) => (
            <button
              type="button"
              key={svc.id}
              onClick={() => setServiceModal(svc)}
              className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-start text-left"
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-sm font-semibold text-[#111111]">{svc.name}</p>
                <p className="text-xs text-[#8A8A8A] mt-1 leading-relaxed">
                  {svc.description}
                </p>
                <p className="text-xs text-[#8A8A8A] mt-1">{svc.duration_min} min</p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <p className="font-serif text-lg text-[#111111] leading-none">
                  {svc.price} euros
                </p>
                <svg
                  className="mt-2"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8A8A8A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ============== AVIS ============== */}
      <section className="px-5 mt-6">
        <h2 className="font-serif text-lg text-[#111111] mb-3">Avis</h2>

        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 mb-4">
          <div>
            <p className="font-serif text-4xl text-[#111111] leading-none">
              {averageRating}
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              ({DEFAULT_REVIEWS.length} avis)
            </p>
          </div>
          <div className="flex-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#C6A47E"
                  stroke="#C6A47E"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-[#8A8A8A] mt-1">Not&eacute; par vos clientes</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {DEFAULT_REVIEWS.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#EDE5DC]">
                  <Image src={r.avatar} alt={r.author} fill className="object-cover" sizes="36px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111111]">{r.author}</p>
                  <p className="text-xs text-[#8A8A8A]">{r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={i <= r.rating ? '#C6A47E' : 'none'}
                    stroke="#C6A47E"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-[#8A8A8A] mt-2 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 bg-[#F0EDE8] text-[#111111] rounded-full px-5 py-2 text-sm"
        >
          Demander un avis
        </button>
      </section>

      {/* ============== SERVICE MODAL ============== */}
      {serviceModal && (
        <ServiceModal
          service={serviceModal}
          onClose={() => setServiceModal(null)}
          onSave={saveService}
          onDelete={deleteService}
          isNew={!services.some((s) => s.id === serviceModal.id)}
        />
      )}
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
  onSave,
  onDelete,
  isNew,
}: {
  service: Service;
  onClose: () => void;
  onSave: (s: Service) => void;
  onDelete: (id: string) => void;
  isNew: boolean;
}) {
  const [draft, setDraft] = useState<Service>(service);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-[#111111]">
            {isNew ? 'Nouvelle prestation' : 'Modifier la prestation'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0EDE8] flex items-center justify-center"
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
              Nom
            </label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
              placeholder="Session Dressing"
            />
          </div>
          <div>
            <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={2}
              className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] resize-none"
              placeholder="Description courte"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                Dur&eacute;e (min)
              </label>
              <input
                type="number"
                value={draft.duration_min}
                onChange={(e) =>
                  setDraft({ ...draft, duration_min: Number(e.target.value) || 0 })
                }
                className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
              />
            </div>
            <div>
              <label className="text-xs text-[#8A8A8A] uppercase tracking-wide block mb-1">
                Prix (euros)
              </label>
              <input
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
                className="w-full bg-[#F7F5F2] rounded-2xl px-4 py-3 text-sm text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {!isNew && (
            <button
              type="button"
              onClick={() => onDelete(draft.id)}
              className="text-sm text-[#D4785C] font-medium px-2"
            >
              Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="ml-auto bg-[#111111] text-white rounded-full px-6 py-3 text-sm font-medium disabled:opacity-50"
            disabled={!draft.name || !draft.description}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
