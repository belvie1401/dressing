'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore, useWardrobeStore } from '@/lib/store';

const lookCards = [
  { title: 'Look pour le bureau', pieces: 4, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=560&fit=crop' },
  { title: 'Look d\u00e9contract\u00e9', pieces: 5, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=560&fit=crop' },
  { title: 'Look minimaliste', pieces: 3, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=560&fit=crop' },
  { title: 'Look soir\u00e9e', pieces: 4, image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=560&fit=crop' },
];

const activities = [
  { type: 'item', text: 'Veste en laine ajout\u00e9e', time: 'Il y a 2 jours', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=80&h=80&fit=crop' },
  { type: 'stylist', text: 'Chlo\u00e9 vous a envoy\u00e9 3 looks', time: 'Il y a 3 jours', image: 'https://i.pravatar.cc/80?img=32' },
  { type: 'fav', text: 'Look soir\u00e9e ajout\u00e9 aux favoris', time: 'Il y a 5 jours', image: null },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { items, loadItems } = useWardrobeStore();

  useEffect(() => { loadItems(); }, []);

  const firstName = user?.name?.split(' ')[0] || 'Camille';

  return (
    <div className="pb-24">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center gap-3 px-5 pt-5 mb-8">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white border border-[#EFEFEF] px-4 py-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-sm text-[#8A8A8A]">Rechercher (v&ecirc;tements, looks, stylistes...)</span>
        </div>
        {/* Bell */}
        <a href="/messages" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-[#EFEFEF]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </a>
        {/* Add button */}
        <a href="/wardrobe/add" className="hidden sm:flex shrink-0 items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter un v&ecirc;tement
        </a>
      </div>

      {/* ===== GREETING ===== */}
      <div className="px-5 mb-8">
        <h1 className="font-serif text-[32px] text-[#111111] leading-tight">
          Bonjour {firstName} <span className="inline-block">&#128075;</span>
        </h1>
        <p className="mt-1 text-sm text-[#8A8A8A]">
          Votre dressing, vos stylistes, votre style. Tout est connect&eacute;.
        </p>
      </div>

      {/* ===== MAIN GRID (2 columns on desktop) ===== */}
      <div className="px-5 flex flex-col lg:flex-row gap-6">

        {/* LEFT COLUMN */}
        <div className="flex-1 min-w-0">

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {/* Mon dressing */}
            <a href="/wardrobe" className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#EFEFEF]">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5"><path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" /></svg>
                  <span className="text-xs text-[#8A8A8A]">Mon dressing</span>
                </div>
                <p className="text-3xl font-bold text-[#111111]">{items.length || 82}</p>
                <p className="text-xs text-[#8A8A8A]">v&ecirc;tements</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#8A8A8A]">Voir tout <span>&rarr;</span></span>
              </div>
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=260&fit=crop" alt="" fill className="object-cover" sizes="64px" />
              </div>
            </a>

            {/* Mes looks */}
            <a href="/outfits" className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#EFEFEF]">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                  <span className="text-xs text-[#8A8A8A]">Mes looks</span>
                </div>
                <p className="text-3xl font-bold text-[#111111]">24</p>
                <p className="text-xs text-[#8A8A8A]">cr&eacute;&eacute;s</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#8A8A8A]">Voir tout <span>&rarr;</span></span>
              </div>
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&h=260&fit=crop" alt="" fill className="object-cover" sizes="64px" />
              </div>
            </a>

            {/* Sessions */}
            <a href="/stylists" className="flex items-center justify-between rounded-2xl bg-white p-4 border border-[#EFEFEF] col-span-2 sm:col-span-1">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span className="text-xs text-[#8A8A8A]">Sessions</span>
                </div>
                <p className="text-3xl font-bold text-[#111111]">3</p>
                <p className="text-xs text-[#8A8A8A]">en cours</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#8A8A8A]">Voir mes sessions <span>&rarr;</span></span>
              </div>
              <div className="flex -space-x-2 shrink-0">
                {[32, 44, 29].map((i) => (
                  <div key={i} className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white">
                    <Image src={`https://i.pravatar.cc/80?img=${i}`} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                ))}
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#F0EDE8] text-[10px] font-medium text-[#8A8A8A]">+1</div>
              </div>
            </a>
          </div>

          {/* Recommandations pour vous */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-xl text-[#111111]">Recommandations pour vous</h2>
              <a href="/outfits" className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#EFEFEF] bg-white px-4 py-2 text-xs text-[#111111]">
                Voir tous les looks
              </a>
            </div>
            <p className="text-xs text-[#8A8A8A] mb-4">Des inspirations s&eacute;lectionn&eacute;es par votre styliste</p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {lookCards.map((look, i) => (
                <a key={i} href="/outfits" className="group w-[180px] shrink-0">
                  <div className="relative h-[240px] w-full overflow-hidden rounded-2xl">
                    <Image src={look.image} alt={look.title} fill className="object-cover" sizes="180px" />
                    {/* Heart */}
                    <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                    {/* Gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-semibold text-white">{look.title}</p>
                      <p className="text-xs text-white/70">{look.pieces} pi&egrave;ces</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom row: Inspiration + Défi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Besoin d'inspiration */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-[#EFEFEF]">
              <div className="flex-1">
                <h3 className="font-serif text-base text-[#111111] mb-2">Besoin d&apos;inspiration ?</h3>
                <p className="text-xs text-[#8A8A8A] mb-3 leading-relaxed">
                  Parlez &agrave; un styliste et recevez des looks adapt&eacute;s &agrave; votre style et &agrave; vos envies.
                </p>
                <div className="flex -space-x-2 mb-3">
                  {[32, 44, 29].map((i) => (
                    <div key={i} className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white">
                      <Image src={`https://i.pravatar.cc/60?img=${i}`} alt="" fill className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>
                <a href="/stylists" className="inline-block rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white">
                  Trouver un styliste
                </a>
              </div>
              <div className="relative h-24 w-20 shrink-0 ml-3 overflow-hidden rounded-xl">
                <Image src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=200&h=260&fit=crop" alt="" fill className="object-cover" sizes="80px" />
              </div>
            </div>

            {/* Défi du mois */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-5 border border-[#EFEFEF]">
              <div className="flex-1">
                <h3 className="font-serif text-base text-[#111111] mb-2">D&eacute;fi du mois</h3>
                <p className="text-xs text-[#8A8A8A] mb-3 leading-relaxed">
                  Cr&eacute;ez 5 looks avec vos pi&egrave;ces les moins port&eacute;es.
                </p>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-[#F0EDE8] mb-1">
                  <div className="h-1.5 rounded-full bg-[#111111]" style={{ width: '40%' }} />
                </div>
                <p className="text-xs text-[#8A8A8A]"><span className="font-semibold text-[#111111]">2 / 5</span> looks cr&eacute;&eacute;s</p>
              </div>
              <div className="flex h-16 w-16 shrink-0 ml-3 items-center justify-center rounded-2xl bg-[#F0EDE8]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <div className="hidden lg:flex flex-col gap-6 w-[320px] shrink-0">

          {/* Prochaine session */}
          <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-5">
            <p className="text-xs text-[#8A8A8A] mb-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Prochaine session
            </p>
            <h3 className="font-serif text-2xl text-white leading-tight">Vendredi 24 mai</h3>
            <p className="text-sm text-[#CFCFCF] mt-1">16:00 avec Chlo&eacute;</p>
            <a href="/stylists" className="mt-4 inline-block rounded-full border border-white/30 px-4 py-2 text-xs font-medium text-white">
              Voir les d&eacute;tails
            </a>
            <div className="absolute -right-2 -bottom-2 h-24 w-24 overflow-hidden rounded-full">
              <Image src="https://i.pravatar.cc/150?img=32" alt="Chlo\u00e9" fill className="object-cover" sizes="96px" />
            </div>
          </div>

          {/* Activité récente */}
          <div className="rounded-2xl bg-white p-5 border border-[#EFEFEF]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-[#111111]">Activit&eacute; r&eacute;cente</h3>
              <a href="/wardrobe" className="text-xs text-[#8A8A8A]">Voir tout</a>
            </div>
            <div className="flex flex-col gap-4">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  {a.type === 'fav' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0EDE8]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4785C" stroke="#D4785C" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    </div>
                  ) : (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      <Image src={a.image!} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#111111] truncate">{a.text}</p>
                    <p className="text-xs text-[#8A8A8A]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistiques dressing */}
          <div className="rounded-2xl bg-white p-5 border border-[#EFEFEF]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-[#111111]">Statistiques dressing</h3>
              <span className="text-xs text-[#8A8A8A]">Ce mois-ci</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE8]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <p className="text-xl font-bold text-[#111111]">18</p>
                <p className="text-[10px] text-[#8A8A8A]">port&eacute;s</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE8]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" /></svg>
                </div>
                <p className="text-xl font-bold text-[#111111]">7</p>
                <p className="text-[10px] text-[#8A8A8A]">nouveaux looks</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDE8]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <p className="text-xl font-bold text-[#111111]">4,2</p>
                <p className="text-[10px] text-[#8A8A8A]">co&ucirc;t par port</p>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div className="rounded-2xl bg-[#111111] p-5">
            <h3 className="font-serif text-base text-white mb-2">Upgradez votre exp&eacute;rience</h3>
            <p className="text-xs text-[#CFCFCF] leading-relaxed mb-3">
              Acc&eacute;dez &agrave; des fonctionnalit&eacute;s exclusives et collaborez avec des stylistes experts.
            </p>
            <a href="/pricing" className="inline-flex items-center gap-1 text-sm text-[#C6A47E]">
              D&eacute;couvrir <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
