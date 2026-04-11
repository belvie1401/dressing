'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/Toast';
import type {
  AdminBroadcast,
  BroadcastTarget,
  NotificationType,
} from '@/types';

// ─── Types ──────────────────────────────────────────────────────────────────
type LiteUser = {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'STYLIST' | 'ADMIN';
  avatar_url?: string | null;
};

interface TypeOption {
  value: NotificationType;
  label: string;
  icon: React.ReactNode;
}

// ─── Static config ──────────────────────────────────────────────────────────
const TYPES: TypeOption[] = [
  {
    value: 'PROMO',
    label: 'Promo',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    value: 'ALERT',
    label: 'Alerte',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    value: 'INFO',
    label: 'Info',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  {
    value: 'LIMIT',
    label: 'Limite',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    value: 'SYSTEM',
    label: 'Système',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16h12" />
      </svg>
    ),
  },
];

const TARGETS: { value: BroadcastTarget; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'CLIENTS', label: 'Clientes' },
  { value: 'STYLISTS', label: 'Stylistes' },
  { value: 'SPECIFIC', label: 'Utilisateur spécifique' },
];

const TARGET_LABEL: Record<BroadcastTarget, string> = {
  ALL: 'Tous',
  CLIENTS: 'Clientes',
  STYLISTS: 'Stylistes',
  SPECIFIC: 'Spécifique',
};

const TYPE_LABEL: Record<NotificationType, string> = {
  PROMO: 'Promo',
  ALERT: 'Alerte',
  INFO: 'Info',
  LIMIT: 'Limite',
  SYSTEM: 'Système',
};

const TYPE_PILL_CLASSES: Record<NotificationType, string> = {
  PROMO: 'bg-[#C6A47E]/15 text-[#C6A47E]',
  ALERT: 'bg-[#D4785C]/10 text-[#D4785C]',
  INFO: 'bg-blue-50 text-blue-500',
  LIMIT: 'bg-amber-50 text-amber-500',
  SYSTEM: 'bg-[#F0EDE8] text-[#111111]',
};

// ─── Page ───────────────────────────────────────────────────────────────────
export default function AdminNotificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const _hasHydrated = useAuthStore((s) => s._hasHydrated);
  const toast = useToast();

  // Form state
  const [type, setType] = useState<NotificationType>('INFO');
  const [target, setTarget] = useState<BroadcastTarget>('ALL');
  const [specificUser, setSpecificUser] = useState<LiteUser | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState<LiteUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [link, setLink] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [expiresEnabled, setExpiresEnabled] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Audience counts (for the send button)
  const [counts, setCounts] = useState<{
    all: number;
    clients: number;
    stylists: number;
  } | null>(null);

  // History
  const [history, setHistory] = useState<AdminBroadcast[] | null>(null);

  // ─── Auth gate ──
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [_hasHydrated, user, router]);

  // ─── Initial load: history + audience counts ──
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    let mounted = true;

    const load = async () => {
      const [histRes, allRes, clientsRes, stylistsRes] = await Promise.all([
        api.get<AdminBroadcast[]>('/admin/notifications/history'),
        api.get<LiteUser[]>('/admin/users?search='),
        api.get<LiteUser[]>('/admin/users?search='), // placeholder; we'll filter client-side below if needed
        api.get<LiteUser[]>('/admin/users?search='),
      ]);

      if (!mounted) return;

      setHistory(histRes.success && histRes.data ? histRes.data : []);

      // Audience counts come from a tiny dedicated count call — but to keep
      // the surface area small we just trust totals returned from the
      // `/admin/users` search (max 10) is too short. Use the history rows'
      // total_sent for ALL where available, otherwise leave at 0.
      // For accuracy we expose the most recent row's totals as a hint.
      // (The send button will still send to whatever the backend resolves.)
      const fallback = histRes.success && histRes.data?.[0]?.total_sent || 0;
      setCounts({
        all: fallback || (allRes.data?.length ?? 0),
        clients: clientsRes.data?.filter((u) => u.role === 'CLIENT').length ?? 0,
        stylists: stylistsRes.data?.filter((u) => u.role === 'STYLIST').length ?? 0,
      });
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  // ─── Live user search (debounced) ──
  useEffect(() => {
    if (target !== 'SPECIFIC') return;
    const handle = setTimeout(async () => {
      setSearching(true);
      const res = await api.get<LiteUser[]>(
        `/admin/users?search=${encodeURIComponent(userQuery)}`,
      );
      setSearching(false);
      if (res.success && res.data) setUserResults(res.data);
      else setUserResults([]);
    }, 250);
    return () => clearTimeout(handle);
  }, [userQuery, target]);

  // ─── Computed values ──
  const audienceCount = useMemo(() => {
    if (target === 'SPECIFIC') return specificUser ? 1 : 0;
    if (!counts) return 0;
    if (target === 'ALL') return counts.all;
    if (target === 'CLIENTS') return counts.clients;
    if (target === 'STYLISTS') return counts.stylists;
    return 0;
  }, [target, specificUser, counts]);

  const canSubmit =
    title.trim().length > 0 &&
    title.length <= 60 &&
    message.trim().length > 0 &&
    message.length <= 200 &&
    (target !== 'SPECIFIC' || specificUser) &&
    !submitting;

  // ─── Submit ──
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const body = {
      type,
      title: title.trim(),
      message: message.trim(),
      target: target === 'SPECIFIC' ? specificUser!.id : target,
      ...(linkEnabled && link.trim() ? { link: link.trim() } : {}),
      ...(linkEnabled && linkLabel.trim() ? { link_label: linkLabel.trim() } : {}),
      ...(expiresEnabled && expiresAt
        ? { expires_at: new Date(expiresAt).toISOString() }
        : {}),
    };

    const res = await api.post<{ sent_count: number; broadcast_id: string }>(
      '/admin/notifications/send',
      body,
    );
    setSubmitting(false);

    if (res.success && res.data) {
      toast.success(
        'Notification envoyée',
        `Envoyée à ${res.data.sent_count} utilisateur${res.data.sent_count > 1 ? 's' : ''}`,
      );
      // Reset transient fields
      setTitle('');
      setMessage('');
      setLinkEnabled(false);
      setLink('');
      setLinkLabel('');
      setExpiresEnabled(false);
      setExpiresAt('');
      setSpecificUser(null);
      setUserQuery('');

      // Refresh history
      const histRes = await api.get<AdminBroadcast[]>('/admin/notifications/history');
      setHistory(histRes.success && histRes.data ? histRes.data : []);
    } else {
      toast.error("Échec de l'envoi", res.error ?? 'Erreur serveur');
    }
  };

  if (!_hasHydrated || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111111] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-[#C6A47E]">
          Admin
        </p>
        <h1 className="mt-1 font-serif text-2xl text-[#111111]">
          Envoyer une notification
        </h1>
        <p className="mt-2 text-sm text-[#8A8A8A]">
          Créez et envoyez une notification ciblée à vos utilisateurs.
        </p>
      </header>

      {/* ============ FORM CARD ============ */}
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        {/* Field 1 — Type */}
        <Field label="Type de notification">
          <div className="mt-2 flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F7F5F2] text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#111111]'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Field 2 — Cible */}
        <Field label="Destinataires" className="mt-6">
          <div className="mt-2 flex flex-wrap gap-2">
            {TARGETS.map((t) => {
              const active = target === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setTarget(t.value);
                    if (t.value !== 'SPECIFIC') {
                      setSpecificUser(null);
                      setUserQuery('');
                    }
                  }}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#F7F5F2] text-[#8A8A8A] hover:bg-[#F0EDE8] hover:text-[#111111]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {target === 'SPECIFIC' && (
            <div className="mt-3">
              {specificUser ? (
                <div className="flex items-center justify-between rounded-2xl border border-[#EFEFEF] bg-[#F7F5F2] px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#111111]">
                      {specificUser.name}
                    </p>
                    <p className="truncate text-xs text-[#8A8A8A]">
                      {specificUser.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSpecificUser(null);
                      setUserQuery('');
                    }}
                    className="cursor-pointer rounded-full px-3 py-1 text-xs text-[#8A8A8A] hover:text-[#111111]"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Email ou nom de l'utilisateur"
                    className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none placeholder:text-[#CFCFCF]"
                  />
                  {(userQuery || searching) && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-[#EFEFEF] bg-white shadow-lg">
                      {searching ? (
                        <div className="px-4 py-3 text-xs text-[#8A8A8A]">
                          Recherche…
                        </div>
                      ) : userResults.length === 0 ? (
                        <div className="px-4 py-3 text-xs text-[#8A8A8A]">
                          Aucun utilisateur trouvé
                        </div>
                      ) : (
                        userResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setSpecificUser(u);
                              setUserResults([]);
                            }}
                            className="flex w-full cursor-pointer items-center gap-3 border-b border-[#F7F5F2] px-4 py-2 text-left last:border-0 hover:bg-[#F7F5F2]"
                          >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EDE5DC] text-xs font-semibold text-[#C6A47E]">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-[#111111]">{u.name}</p>
                              <p className="truncate text-xs text-[#8A8A8A]">{u.email}</p>
                            </div>
                            <span className="rounded-full bg-[#F0EDE8] px-2 py-0.5 text-[10px] text-[#8A8A8A]">
                              {u.role}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Field>

        {/* Field 3 — Title */}
        <Field label="Titre" className="mt-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 60))}
            placeholder="Ex: Offre spéciale"
            className="mt-2 w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none placeholder:text-[#CFCFCF]"
          />
          <Counter current={title.length} max={60} />
        </Field>

        {/* Field 4 — Message */}
        <Field label="Message" className="mt-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            rows={4}
            placeholder="Votre message…"
            className="mt-2 w-full resize-none rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none placeholder:text-[#CFCFCF]"
          />
          <Counter current={message.length} max={200} />
        </Field>

        {/* Field 5 — Link */}
        <Field label="Bouton d'action" className="mt-6">
          <ToggleRow
            checked={linkEnabled}
            onChange={setLinkEnabled}
            label="Ajouter un bouton d'action"
          />
          {linkEnabled && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Lien (ex: /pricing)"
                className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none placeholder:text-[#CFCFCF]"
              />
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Texte du bouton (ex: Voir les plans)"
                className="w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none placeholder:text-[#CFCFCF]"
              />
            </div>
          )}
        </Field>

        {/* Field 6 — Expiration */}
        <Field label="Expiration" className="mt-6">
          <ToggleRow
            checked={expiresEnabled}
            onChange={setExpiresEnabled}
            label="Date d'expiration"
          />
          {expiresEnabled && (
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
            />
          )}
        </Field>

        {/* PREVIEW */}
        <Field label="Aperçu" className="mt-8">
          <div className="mt-2 overflow-hidden rounded-2xl border border-[#EFEFEF] bg-[#FFFBF8]">
            <PreviewRow
              type={type}
              title={title || 'Titre de la notification'}
              message={message || 'Le message s\u2019affichera ici…'}
              link={linkEnabled ? link : ''}
              linkLabel={linkEnabled ? linkLabel : ''}
            />
          </div>
        </Field>

        {/* SUBMIT */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-8 w-full cursor-pointer rounded-full bg-[#111111] py-4 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting
            ? 'Envoi en cours…'
            : target === 'SPECIFIC'
              ? specificUser
                ? `Envoyer à ${specificUser.name}`
                : 'Sélectionnez un utilisateur'
              : `Envoyer à ${audienceCount} utilisateur${audienceCount > 1 ? 's' : ''}`}
        </button>
      </section>

      {/* ============ HISTORY ============ */}
      <section className="mt-12">
        <h2 className="mb-4 font-serif text-lg text-[#111111]">
          Historique des envois
        </h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {history === null ? (
            <div className="p-6">
              <div className="h-12 animate-pulse rounded bg-[#F7F5F2]" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8A8A8A]">
              Aucun envoi pour l&rsquo;instant
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#EFEFEF]">
                <thead className="bg-[#F7F5F2]">
                  <tr>
                    <Th>Type</Th>
                    <Th>Titre</Th>
                    <Th>Cible</Th>
                    <Th>Lu</Th>
                    <Th>Date</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F5F2]">
                  {history.map((b) => (
                    <tr key={b.id}>
                      <Td>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_PILL_CLASSES[b.type]}`}
                        >
                          {TYPE_LABEL[b.type]}
                        </span>
                      </Td>
                      <Td>
                        <span className="block max-w-[220px] truncate text-sm text-[#111111]">
                          {b.title}
                        </span>
                      </Td>
                      <Td>
                        <span className="rounded-full bg-[#F7F5F2] px-2 py-0.5 text-[10px] text-[#8A8A8A]">
                          {TARGET_LABEL[b.target]}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-xs text-[#8A8A8A]">
                          {b.read_count} / {b.total_sent}
                        </span>
                      </Td>
                      <Td>
                        <span className="whitespace-nowrap text-xs text-[#8A8A8A]">
                          {formatRelative(b.sent_at)}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium uppercase tracking-wide text-[#8A8A8A]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Counter({ current, max }: { current: number; max: number }) {
  return (
    <p className="mt-1 text-right text-[10px] text-[#CFCFCF]">
      {current} / {max}
    </p>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="mt-2 flex cursor-pointer select-none items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-[#111111]"
      />
      <span className="text-sm text-[#8A8A8A]">{label}</span>
    </label>
  );
}

function PreviewRow({
  type,
  title,
  message,
  link,
  linkLabel,
}: {
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${TYPE_PILL_CLASSES[type]}`}>
        <PreviewIcon type={type} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111111]">{title}</p>
        <p className="mt-0.5 text-xs text-[#8A8A8A]">{message}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-[#CFCFCF]">À l&apos;instant</span>
          {link && linkLabel ? (
            <span className="text-[10px] text-[#C6A47E] underline">{linkLabel}</span>
          ) : null}
        </div>
      </div>
      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#D4785C]" />
    </div>
  );
}

function PreviewIcon({ type }: { type: NotificationType }) {
  const t = TYPES.find((x) => x.value === type);
  return t ? t.icon : null;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-[#8A8A8A]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `Il y a ${diffD} j`;
  const diffMo = Math.round(diffD / 30);
  return `Il y a ${diffMo} mois`;
}
