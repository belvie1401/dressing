import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col">
      {/* Header with logo */}
      <div className="px-5 py-6 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="font-serif text-xl text-[#111111] no-underline">LIEN</Link>
        <a href="/" className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#111111]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Accueil
        </a>
      </div>

      {/* Header */}
      <div className="text-center py-16 px-5">
        <h1 className="font-serif text-4xl text-[#111111]">Choisissez votre formule</h1>
        <p className="text-[#8A8A8A] mt-3">Commencez gratuitement, &eacute;voluez quand vous voulez</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 pb-16 max-w-4xl mx-auto">

        {/* Card 1 — Gratuit */}
        <div className="bg-white rounded-3xl p-8">
          <p className="text-sm font-medium text-[#8A8A8A] uppercase tracking-wide">Gratuit</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-5xl text-[#111111]">0</span>
            <span className="text-sm text-[#8A8A8A]">&euro;/mois</span>
          </div>
          <div className="border-t border-[#EFEFEF] my-6" />
          <div className="flex flex-col gap-3">
            <Feature included>50 v&ecirc;tements max</Feature>
            <Feature included>5 suggestions IA/mois</Feature>
            <Feature included>Calendrier de tenues</Feature>
            <Feature included={false}>Connexion styliste</Feature>
            <Feature included={false}>Essayage virtuel</Feature>
          </div>
          <a href="/register" className="mt-8 block w-full rounded-full border border-[#111111] py-3 text-center text-sm text-[#111111]">
            Commencer gratuitement
          </a>
        </div>

        {/* Card 2 — Cliente Pro (FEATURED) */}
        <div className="bg-[#111111] rounded-3xl p-8">
          <span className="bg-[#C6A47E] text-[#111111] text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-4">
            Le plus populaire
          </span>
          <p className="text-sm font-medium text-[#CFCFCF] uppercase tracking-wide">Cliente Pro</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-5xl text-white">9,99</span>
            <span className="text-sm text-[#CFCFCF]">&euro;/mois</span>
          </div>
          <div className="border-t border-[#333] my-6" />
          <div className="flex flex-col gap-3">
            <FeatureDark>V&ecirc;tements illimit&eacute;s</FeatureDark>
            <FeatureDark>Suggestions IA illimit&eacute;es</FeatureDark>
            <FeatureDark>Essayage virtuel 10x/mois</FeatureDark>
            <FeatureDark>1 styliste connect&eacute;</FeatureDark>
            <FeatureDark>Statistiques avanc&eacute;es</FeatureDark>
          </div>
          <a href="/register?plan=client_pro" className="mt-8 block w-full rounded-full bg-[#D4785C] py-3 text-center text-sm font-medium text-white">
            Essai gratuit 14 jours
          </a>
        </div>

        {/* Card 3 — Styliste Pro */}
        <div className="bg-white rounded-3xl p-8">
          <p className="text-sm font-medium text-[#8A8A8A] uppercase tracking-wide">Styliste Pro</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-5xl text-[#111111]">19,99</span>
            <span className="text-sm text-[#8A8A8A]">&euro;/mois</span>
          </div>
          <div className="border-t border-[#EFEFEF] my-6" />
          <div className="flex flex-col gap-3">
            <Feature included>Clients illimit&eacute;s</Feature>
            <Feature included>Cr&eacute;ation de lookbooks</Feature>
            <Feature included>Acc&egrave;s garde-robe clients</Feature>
            <Feature included>Chat temps r&eacute;el</Feature>
            <Feature included>Dashboard analytique</Feature>
          </div>
          <a href="/register?plan=stylist_pro" className="mt-8 block w-full rounded-full bg-[#111111] py-3 text-center text-sm font-medium text-white">
            Devenir styliste
          </a>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-sm text-[#8A8A8A] mt-8 pb-16 flex-1">
        14 jours d&apos;essai gratuit. Sans engagement. R&eacute;siliable &agrave; tout moment.
      </p>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="font-serif text-white no-underline">LIEN</Link>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6">
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-white">Tarifs</a>
            <a href="/cgv" className="text-sm text-[#8A8A8A] hover:text-white">CGV</a>
            <a href="/confidentialite" className="text-sm text-[#8A8A8A] hover:text-white">Confidentialit&eacute;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      {included ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CFCFCF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      <span className={included ? 'text-[#111111]' : 'text-[#CFCFCF]'}>{children}</span>
    </div>
  );
}

function FeatureDark({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="text-white">{children}</span>
    </div>
  );
}
