'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import RoleSwitcher from '@/components/ui/RoleSwitcher';
import ShareModal from '@/components/ui/ShareModal';

const LOOK_DU_JOUR_IMAGES = [
  'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=200&h=300&fit=crop',
];

type WeekDay = {
  label: string;
  date: number;
  today: boolean;
  img: string | null;
};

const WEEK_DAYS: WeekDay[] = [
  { label: 'LUN', date: 19, today: false, img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=120&h=120&fit=crop' },
  { label: 'MAR', date: 20, today: false, img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=120&h=120&fit=crop' },
  { label: 'MER', date: 21, today: true, img: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=120&h=120&fit=crop' },
  { label: 'JEU', date: 22, today: false, img: null },
  { label: 'VEN', date: 23, today: false, img: null },
  { label: 'SAM', date: 24, today: false, img: null },
  { label: 'DIM', date: 25, today: false, img: null },
];

const LOOKS = [
  {
    name: 'Look pour le bureau',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=300&h=400&fit=crop',
  },
  {
    name: 'Look d\u00e9contract\u00e9',
    pieces: 5,
    img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
  },
  {
    name: 'Look minimaliste',
    pieces: 3,
    img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=400&fit=crop',
  },
  {
    name: 'Look soir\u00e9e',
    pieces: 4,
    img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop',
  },
];

const STYLIST_AVATARS = [
  'https://i.pravatar.cc/60?img=32',
  'https://i.pravatar.cc/60?img=44',
  'https://i.pravatar.cc/60?img=29',
];

type Activity = {
  type: 'message' | 'heart';
  text: string;
  time: string;
  avatar: string | null;
};

const ACTIVITIES: Activity[] = [
  {
    type: 'message',
    text: 'Chlo\u00e9 vous a envoy\u00e9 3 looks',
    time: 'Il y a 3 jours',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
  {
    type: 'heart',
    text: 'Look soir\u00e9e ajout\u00e9 aux favoris',
    time: 'Il y a 5 jours',
    avatar: null,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDualRole = useAuthStore((s) => s.isDualRole);
  const activateStylistMode = useAuthStore((s) => s.activateStylistMode);
  const firstName = user?.name?.split(' ')[0] || 'Camille';
  const initials = (user?.name || 'Camille').charAt(0).toUpperCase();
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activating, setActivating] = useState(false);
  const [toast, setToast] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    await activateStylistMode();
    setActivating(false);
    setShowActivateModal(false);
    setToast(true);
    setTimeout(() => {
      setToast(false);
      router.push('/stylist-dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] pb-24">
      <RoleSwitcher />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg">
          Votre espace styliste est activ&eacute;&nbsp;!
        </div>
      )}
      <div className="mx-auto max-w-md lg:max-w-6xl lg:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-x-6 lg:gap-y-5">

          {/* ===== ROW 1: HEADER ===== */}
          <header className="flex justify-between items-center px-5 pt-8 pb-4 lg:px-0 lg:col-span-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#EDE5DC] flex items-center justify-center shrink-0">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={firstName}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#C6A47E] font-serif text-lg">{initials}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#8A8A8A] leading-none">Bonjour,</span>
                <span className="font-serif text-xl text-[#111111] leading-tight">
                  {firstName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Share button */}
              <button
                type="button"
                onClick={() => setShowShare(true)}
                className="w-9 h-9 rounded-full bg-[#F0EDE8] flex items-center justify-center"
                aria-label="Partager LIEN"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
              <Link
                href="/messages"
                aria-label="Notifications"
                className="flex items-start gap-0.5 py-1"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111111"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="w-2 h-2 bg-[#D4785C] rounded-full -mt-0.5" />
              </Link>
            </div>
          </header>

          {showShare && <ShareModal onClose={() => setShowShare(false)} />}

          {/* ===== ROW 2: WEATHER ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-2">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C6A47E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span className="font-semibold text-[#111111] text-base">22&deg;</span>
                <span className="text-sm text-[#8A8A8A] truncate">Marseille</span>
              </div>
              <Link
                href="/outfits"
                className="font-serif text-sm text-[#111111] shrink-0 ml-2"
              >
                Tenue du jour &rarr;
              </Link>
            </div>
          </section>

          {/* ===== ROW 3: LOOK DU JOUR ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-2">
            <div className="flex justify-between items-baseline mb-3">
              <h2 className="font-serif text-base text-[#111111]">Look du jour</h2>
              <Link href="/outfits" className="text-xs text-[#8A8A8A]">
                Modifier &rarr;
              </Link>
            </div>
            <div className="rounded-3xl overflow-hidden h-[200px] bg-[#1a1a1a] relative">
              <div className="absolute inset-0 flex items-center justify-center gap-3 px-6 pt-4">
                {LOOK_DU_JOUR_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="w-[80px] h-[120px] rounded-xl overflow-hidden flex-shrink-0 bg-[#2a2a2a]"
                  >
                    <Image
                      src={src}
                      alt={`Pi\u00e8ce ${i + 1}`}
                      width={80}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end px-4 pb-3">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-semibold truncate">
                    Look Casual Chic
                  </p>
                  <span className="inline-block bg-white/20 text-white text-[10px] rounded-full px-2 py-0.5 mt-1 w-fit">
                    Casual
                  </span>
                </div>
                <button
                  type="button"
                  className="bg-white text-[#111111] text-[10px] font-medium rounded-full px-3 py-1.5 shrink-0 ml-2"
                >
                  Porter aujourd&apos;hui
                </button>
              </div>
            </div>
          </section>

          {/* ===== ROW 4: CETTE SEMAINE ===== */}
          <section className="mb-5 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-3">
            <div className="flex justify-between items-baseline mb-3 px-5 lg:px-0">
              <h2 className="font-serif text-base text-[#111111]">Cette semaine</h2>
              <Link href="/calendar" className="text-xs text-[#8A8A8A]">
                Agenda &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-5 lg:px-0">
                {WEEK_DAYS.map((day) => (
                  <div
                    key={`${day.label}-${day.date}`}
                    className="w-[64px] flex-shrink-0 flex flex-col items-center gap-1"
                  >
                    <span className="text-[9px] text-[#8A8A8A] uppercase tracking-wide">
                      {day.label}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        day.today
                          ? 'bg-[#111111] text-white'
                          : 'bg-transparent text-[#111111]'
                      }`}
                    >
                      {day.date}
                    </div>
                    {day.img ? (
                      <div className="w-[52px] h-[52px] rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={day.img}
                          alt=""
                          width={52}
                          height={52}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-[52px] h-[52px] rounded-xl flex-shrink-0 border border-dashed border-[#CFCFCF] flex items-center justify-center">
                        <span className="text-[#CFCFCF] text-base">+</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ===== ROW 5: LOOKS CAROUSEL ===== */}
          <section className="mb-5 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-4">
            <div className="flex justify-between items-baseline mb-3 px-5 lg:px-0">
              <h2 className="font-serif text-base text-[#111111]">Mes looks</h2>
              <Link href="/outfits" className="text-xs text-[#8A8A8A]">
                Tout voir &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-5 lg:px-0">
                {LOOKS.map((look, i) => (
                  <Link
                    key={i}
                    href="/outfits"
                    className="w-[140px] flex-shrink-0 rounded-2xl overflow-hidden shadow-sm bg-white"
                  >
                    <div className="relative w-full h-[160px] bg-[#EDE5DC]">
                      <Image
                        src={look.img}
                        alt={look.name}
                        fill
                        className="object-cover"
                        sizes="140px"
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-[#111111] truncate">
                        {look.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-[#8A8A8A]">
                          &middot; {look.pieces} pi&egrave;ces
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ===== ROW 6: TWO CARDS SIDE BY SIDE ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-span-2 lg:col-start-1 lg:row-start-5">
            <div className="grid grid-cols-2 gap-3">
              {/* Besoin d'inspiration */}
              <div className="bg-white rounded-3xl p-4 relative overflow-hidden min-h-[160px]">
                <h3 className="font-serif text-sm text-[#111111] leading-snug">
                  Besoin d&apos;inspiration ?
                </h3>
                <p className="text-[11px] text-[#8A8A8A] mt-2 leading-relaxed">
                  Parlez &agrave; un styliste et recevez des looks adapt&eacute;s &agrave; votre style.
                </p>
                <div className="flex -space-x-2 mt-3">
                  {STYLIST_AVATARS.map((src, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full ring-2 ring-white bg-[#EDE5DC] overflow-hidden"
                    >
                      <Image
                        src={src}
                        alt=""
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <Link
                  href="/stylists"
                  className="inline-block bg-[#111111] text-white text-[10px] font-medium rounded-full px-3 py-1.5 w-fit mt-3"
                >
                  Trouver un styliste
                </Link>
              </div>

              {/* D\u00e9fi du mois */}
              <div className="bg-white rounded-3xl p-4 min-h-[160px]">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif text-sm text-[#111111]">
                    D&eacute;fi du mois
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-[#C6A47E]/10 p-1.5 flex items-center justify-center shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C6A47E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15 9 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 9 12 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-[11px] text-[#8A8A8A] mt-2 leading-relaxed">
                  Cr&eacute;ez 5 looks avec vos pi&egrave;ces les moins port&eacute;es.
                </p>
                <div className="bg-[#F0EDE8] rounded-full h-1.5 w-full mt-4">
                  <div
                    className="bg-[#111111] rounded-full h-full"
                    style={{ width: '40%' }}
                  />
                </div>
                <p className="text-[10px] text-[#8A8A8A] mt-2">2 / 5 looks cr&eacute;&eacute;s</p>
              </div>
            </div>
          </section>

          {/* ===== ROW 7: STATS ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-3">
            <div className="flex justify-between items-baseline mb-3">
              <h2 className="font-serif text-base text-[#111111]">
                Statistiques dressing
              </h2>
              <span className="text-xs text-[#8A8A8A]">Ce mois-ci</span>
            </div>
            <div className="bg-white rounded-3xl p-5">
              <div className="grid grid-cols-3 gap-4 text-center">
                {/* Port\u00e9s */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#111111"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl text-[#111111] mt-2 leading-none">18</p>
                  <p className="text-[10px] text-[#8A8A8A] mt-1">port&eacute;s</p>
                </div>

                {/* Nouveaux looks */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#111111"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15 9 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 9 12 2" />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl text-[#111111] mt-2 leading-none">7</p>
                  <p className="text-[10px] text-[#8A8A8A] mt-1">nouveaux looks</p>
                </div>

                {/* Co\u00fbt par port */}
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#F0EDE8] flex items-center justify-center mx-auto">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#111111"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="font-serif text-2xl text-[#111111] mt-2 leading-none">4,2</p>
                  <p className="text-[10px] text-[#8A8A8A] mt-1">co&ucirc;t par port</p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== ROW 8: ACTIVITY FEED ===== */}
          <section className="px-5 mb-5 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-4">
            <h2 className="font-serif text-base text-[#111111] mb-3">
              Activit&eacute; r&eacute;cente
            </h2>
            <div className="bg-white rounded-3xl overflow-hidden divide-y divide-[#F7F5F2]">
              {ACTIVITIES.map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  {a.type === 'heart' ? (
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#F87171"
                        stroke="#F87171"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  ) : a.avatar ? (
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={a.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#EDE5DC] flex items-center justify-center shrink-0">
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
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111111] font-medium truncate">
                      {a.text}
                    </p>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">{a.time}</p>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#CFCFCF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </section>

          {/* ===== ROW 9: STYLISTE CTA ===== */}
          <section className="px-5 mb-6 lg:px-0 lg:mb-0 lg:col-start-3 lg:row-start-5">
            {isDualRole ? (
              /* Already dual-role: simple link card */
              <Link href="/stylist-dashboard" className="block bg-[#111111] rounded-3xl p-5">
                <p className="text-[#C6A47E] text-[9px] uppercase tracking-widest font-medium">
                  Espace styliste
                </p>
                <h3 className="font-serif text-base text-white mt-2 leading-snug">
                  Mon espace styliste
                </h3>
                <p className="text-xs text-[#CFCFCF] mt-2 leading-relaxed">
                  Voir mes clientes, lookbooks et revenus
                </p>
                <span className="inline-block text-[#C6A47E] text-sm font-medium mt-4">
                  Acc&eacute;der &rarr;
                </span>
              </Link>
            ) : (
              /* Not yet dual-role: become stylist CTA */
              <div className="bg-[#111111] rounded-3xl p-5">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-[#C6A47E] text-[#111111] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Nouveau
                    </span>
                    <h3 className="font-serif text-lg text-white mt-2 leading-snug">
                      Devenez styliste
                    </h3>
                    <p className="text-xs text-[#CFCFCF] mt-2 leading-relaxed">
                      Partagez votre expertise et aidez d&apos;autres femmes &agrave;
                      sublimer leur style.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#EDE5DC] shrink-0 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#C6A47E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowActivateModal(true)}
                  className="bg-[#C6A47E] text-[#111111] rounded-full w-full py-3 text-sm font-semibold mt-4"
                >
                  Cr&eacute;er mon espace styliste
                </button>
              </div>
            )}
          </section>

          {/* ===== ACTIVATION MODAL ===== */}
          {showActivateModal && (
            <div className="fixed inset-0 z-40 flex flex-col justify-end">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowActivateModal(false)}
                aria-label="Fermer"
              />
              <div className="relative z-10 bg-white rounded-t-3xl p-6 max-w-md mx-auto w-full">
                <h2 className="font-serif text-xl text-[#111111]">
                  Devenir styliste sur LIEN
                </h2>
                <div className="flex flex-col gap-4 mt-4">
                  {/* Benefit 1 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F0EDE8] rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        G&eacute;rez vos clientes
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                        Acc&eacute;dez au dressing de vos clientes et cr&eacute;ez des
                        looks sur mesure.
                      </p>
                    </div>
                  </div>
                  {/* Benefit 2 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F0EDE8] rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M14.31 8l.32.87A5 5 0 0 1 10 16" />
                        <line x1="8" y1="10" x2="14" y2="10" />
                        <line x1="8" y1="14" x2="12" y2="14" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        Mon&eacute;tisez votre talent
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                        Proposez vos prestations et recevez des paiements directement
                        sur LIEN.
                      </p>
                    </div>
                  </div>
                  {/* Benefit 3 */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F0EDE8] rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">
                        Gardez vos deux espaces
                      </p>
                      <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                        Passez de cliente &agrave; styliste en un clic. Vos deux
                        dashboards restent s&eacute;par&eacute;s.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={activating}
                  className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-semibold mt-6 disabled:opacity-60"
                >
                  {activating ? 'Activation...' : 'Activer mon espace styliste'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="w-full text-sm text-[#8A8A8A] text-center mt-3"
                >
                  Plus tard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
