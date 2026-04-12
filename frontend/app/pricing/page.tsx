'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';

// ─── Plan definitions ────────────────────────────────────────────────────────

type Feature = { text: string; included: boolean };
type AddOn = { label: string; price: string };

interface PlanDef {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: Feature[];
  addOns?: AddOn[];
  cta: string;
  featured?: boolean;
  badge?: string;
  goldBorder?: boolean;
}

const CLIENT_PLANS: PlanDef[] = [
  {
    id: 'FREE',
    name: 'Gratuit',
    price: 0,
    tagline: 'Découvrez sans engagement',
    features: [
      { text: '1 dressing personnel (50 pièces max)', included: true },
      { text: '5 suggestions IA par mois', included: true },
      { text: 'Calendrier de tenues', included: true },
      { text: 'Recherche et filtres basiques', included: true },
      { text: 'Dressings supplémentaires', included: false },
      { text: 'Connexion styliste', included: false },
      { text: 'Essayage virtuel', included: false },
      { text: 'Suggestions IA illimitées', included: false },
    ],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'ESSENTIAL',
    name: 'Essentiel',
    price: 7.99,
    tagline: 'Pour un usage quotidien',
    features: [
      { text: '1 dressing personnel illimité', included: true },
      { text: 'Suggestions IA illimitées', included: true },
      { text: 'Calendrier + historique complet', included: true },
      { text: 'Filtres avancés', included: true },
      { text: 'Essayage virtuel (5/mois)', included: true },
      { text: 'Vue 360° des vêtements', included: true },
      { text: 'Dressings supplémentaires', included: false },
      { text: 'Connexion styliste', included: false },
    ],
    addOns: [
      { label: '+ Dressing supplémentaire', price: '+2,99€/mois' },
    ],
    cta: 'Essai gratuit 14 jours',
  },
  {
    id: 'FAMILY',
    name: 'Famille',
    price: 14.99,
    tagline: 'Pour toute la famille',
    featured: true,
    badge: 'Le plus populaire',
    features: [
      { text: 'Jusqu\'à 4 dressings inclus', included: true },
      { text: 'Suggestions IA illimitées pour tous', included: true },
      { text: 'Essayage virtuel (20/mois partagés)', included: true },
      { text: 'Calendrier partagé famille', included: true },
      { text: 'Vue 360° sur tous les dressings', included: true },
      { text: '1 connexion styliste', included: true },
      { text: 'Filtres avancés', included: true },
    ],
    addOns: [
      { label: '+ Dressing supplémentaire', price: '+1,99€/mois' },
    ],
    cta: 'Essai gratuit 14 jours',
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 24.99,
    tagline: 'Pour les passionnées de mode',
    goldBorder: true,
    features: [
      { text: 'Dressings illimités', included: true },
      { text: 'Suggestions IA illimitées', included: true },
      { text: 'Essayage virtuel illimité', included: true },
      { text: 'Jusqu\'à 3 connexions stylistes', included: true },
      { text: 'Accès prioritaire stylistes premium', included: true },
      { text: 'Analyse de style DNA complète', included: true },
      { text: 'Conseils personnalisés hebdomadaires', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: 'Passer Premium',
  },
];

const STYLIST_PLANS: PlanDef[] = [
  {
    id: 'STYLIST_FREE',
    name: 'Styliste Gratuit',
    price: 0,
    tagline: 'Pour débuter votre activité',
    features: [
      { text: 'Jusqu\'à 3 clientes actives', included: true },
      { text: 'Création de lookbooks (5/mois)', included: true },
      { text: 'Chat intégré', included: true },
      { text: 'Profil listé dans l\'annuaire', included: true },
      { text: 'Clientes illimitées', included: false },
      { text: 'Dashboard analytique', included: false },
      { text: 'Paiements intégrés', included: false },
    ],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'STYLIST_PRO',
    name: 'Styliste Pro',
    price: 19.99,
    tagline: 'Pour les professionnels',
    features: [
      { text: 'Clientes illimitées', included: true },
      { text: 'Lookbooks illimités', included: true },
      { text: 'Dashboard analytique complet', included: true },
      { text: 'Agenda et réservations', included: true },
      { text: 'Paiements intégrés (commission 20%)', included: true },
      { text: 'Mise en avant dans l\'annuaire', included: true },
      { text: 'Accès aux dressings clients', included: true },
      { text: 'Lien Zoom intégré', included: true },
      { text: 'Support dédié', included: true },
    ],
    addOns: [
      { label: 'Pack visibilité', price: '+4,99€/mois' },
    ],
    cta: 'Devenir Styliste Pro',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const roleParam = searchParams.get('role');
  const [audience, setAudience] = useState<'client' | 'stylist'>(
    roleParam === 'STYLIST' ? 'stylist' : 'client',
  );

  // Determine smart back href
  const [backHref, setBackHref] = useState('/');
  useEffect(() => {
    const token = localStorage.getItem('lien_token');
    if (token) {
      setBackHref(user?.role === 'STYLIST' ? '/stylist-dashboard' : '/dashboard');
    } else {
      setBackHref('/');
    }
  }, [user]);

  const handleCTAClick = async (planId: string) => {
    const token = localStorage.getItem('lien_token');

    if (!token) {
      router.push(`/register?plan=${planId}`);
      return;
    }

    if (planId === 'FREE' || planId === 'STYLIST_FREE') {
      router.push(user?.role === 'STYLIST' ? '/stylist-dashboard' : '/dashboard');
      return;
    }

    // Paid plan → attempt Stripe checkout
    try {
      const res = await api.post<{ url: string }>('/subscriptions/checkout', { plan: planId });
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      // fallback to dashboard
      router.push('/dashboard');
    }
  };

  const plans = audience === 'client' ? CLIENT_PLANS : STYLIST_PLANS;

  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col">
      {/* ══ Header ══ */}
      <div className="px-5 py-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href={backHref} className="font-serif text-xl text-[#111111] no-underline">
          LIEN
        </Link>
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#111111] no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>
      </div>

      {/* ══ Title ══ */}
      <div className="text-center mt-8 px-5">
        <h1 className="font-serif text-4xl text-[#111111]">Choisissez votre formule</h1>
        <p className="text-sm text-[#8A8A8A] mt-2">
          Commencez gratuitement. Évoluez à votre rythme.
        </p>
      </div>

      {/* ══ Audience toggle ══ */}
      <div className="flex justify-center mt-6">
        <div className="flex bg-[#F0EDE8] rounded-full p-1">
          <button
            type="button"
            onClick={() => setAudience('client')}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm transition-colors ${
              audience === 'client'
                ? 'bg-[#111111] text-white'
                : 'text-[#8A8A8A]'
            }`}
          >
            Pour les clientes
          </button>
          <button
            type="button"
            onClick={() => setAudience('stylist')}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm transition-colors ${
              audience === 'stylist'
                ? 'bg-[#111111] text-white'
                : 'text-[#8A8A8A]'
            }`}
          >
            Pour les stylistes
          </button>
        </div>
      </div>

      {/* ══ Plan cards ══ */}
      <div
        className={`px-5 pb-16 mt-10 max-w-6xl mx-auto w-full ${
          audience === 'client'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl'
        }`}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onCTA={() => handleCTAClick(plan.id)} />
        ))}
      </div>

      {/* ══ Footer note ══ */}
      <p className="text-center text-sm text-[#8A8A8A] mt-auto pb-8 px-5">
        14 jours d&apos;essai gratuit sur les plans payants. Sans engagement. Résiliable à tout moment.
      </p>

      {/* ══ Footer ══ */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href={backHref} className="font-serif text-white no-underline">
            LIEN
          </Link>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-[#8A8A8A] hover:text-white no-underline">
              Tarifs
            </Link>
            <Link href="/cgv" className="text-sm text-[#8A8A8A] hover:text-white no-underline">
              CGV
            </Link>
            <Link href="/confidentialite" className="text-sm text-[#8A8A8A] hover:text-white no-underline">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Plan card component ─────────────────────────────────────────────────────

function PlanCard({ plan, onCTA }: { plan: PlanDef; onCTA: () => void }) {
  const dark = plan.featured;

  return (
    <div
      className={`rounded-3xl p-6 flex flex-col ${
        dark
          ? 'bg-[#111111]'
          : plan.goldBorder
            ? 'bg-white border-2 border-[#C6A47E]'
            : 'bg-white border border-[#EFEFEF]'
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <span className="bg-[#C6A47E] text-[#111111] text-[9px] font-bold rounded-full px-3 py-1 w-fit mb-3">
          {plan.badge}
        </span>
      )}

      {/* Plan name */}
      <p
        className={`text-xs uppercase tracking-widest font-medium ${
          dark ? 'text-[#CFCFCF]' : 'text-[#8A8A8A]'
        }`}
      >
        {plan.name}
      </p>

      {/* Price */}
      <div className="mt-2">
        {plan.price === 0 ? (
          <span className={`font-serif text-3xl ${dark ? 'text-white' : 'text-[#111111]'}`}>
            Gratuit
          </span>
        ) : (
          <div className="flex items-baseline gap-0.5">
            <span className={`font-serif text-4xl ${dark ? 'text-white' : 'text-[#111111]'}`}>
              {plan.price.toFixed(2).replace('.', ',')}
            </span>
            <span className={`text-xl ${dark ? 'text-white' : 'text-[#111111]'}`}>€</span>
            <span className={`text-sm ml-0.5 ${dark ? 'text-[#CFCFCF]' : 'text-[#8A8A8A]'}`}>
              /mois
            </span>
          </div>
        )}
      </div>

      {/* Tagline */}
      <p className={`text-xs mt-1 italic ${dark ? 'text-[#CFCFCF]' : 'text-[#8A8A8A]'}`}>
        {plan.tagline}
      </p>

      {/* Divider */}
      <div className={`border-t my-5 ${dark ? 'border-[#333]' : 'border-[#EFEFEF]'}`} />

      {/* Features */}
      <div className="flex flex-col gap-2.5 flex-1">
        {plan.features.map((f) => (
          <div key={f.text} className="flex items-start gap-2">
            {f.included ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={dark ? '#C6A47E' : '#111111'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={dark ? '#555555' : '#CFCFCF'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-0.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <span
              className={`text-sm ${
                f.included
                  ? dark
                    ? 'text-white'
                    : 'text-[#111111]'
                  : dark
                    ? 'text-[#555555] line-through'
                    : 'text-[#CFCFCF]'
              }`}
            >
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* Add-ons */}
      {plan.addOns && plan.addOns.length > 0 && (
        <>
          <div className={`border-t mt-4 ${dark ? 'border-[#333]' : 'border-[#EFEFEF]'}`} />
          <p
            className={`text-xs uppercase tracking-wide mt-3 mb-2 ${
              dark ? 'text-[#CFCFCF]' : 'text-[#8A8A8A]'
            }`}
          >
            Options disponibles
          </p>
          {plan.addOns.map((a) => (
            <div key={a.label} className="flex items-center justify-between">
              <span className={`text-xs ${dark ? 'text-white' : 'text-[#111111]'}`}>
                {a.label}
              </span>
              <span className="text-xs text-[#C6A47E] font-medium">{a.price}</span>
            </div>
          ))}
        </>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onCTA}
        className={`mt-6 w-full rounded-full py-3 text-sm font-medium cursor-pointer transition-colors ${
          dark
            ? 'bg-[#C6A47E] text-[#111111]'
            : 'border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white'
        }`}
      >
        {plan.cta}
      </button>
    </div>
  );
}
