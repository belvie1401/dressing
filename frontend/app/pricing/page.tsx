export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)' }}>
      {/* Nav */}
      <header className="px-5 py-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-xl font-bold text-[#0D0D0D]">Mon Dressing</a>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-[#8A8A8A]">
              Connexion
            </a>
            <a
              href="/register"
              className="rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm font-medium text-white"
            >
              S&#39;inscrire
            </a>
          </div>
        </nav>
      </header>

      <main className="px-5 py-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-[#0D0D0D] md:text-4xl">
              Choisissez votre formule
            </h1>
            <p className="mt-3 text-base text-[#8A8A8A]">
              Commencez gratuitement, évoluez quand vous voulez
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {/* Card 1 — Gratuit */}
            <div
              className="flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <h2 className="text-lg font-semibold text-[#0D0D0D]">Gratuit</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#0D0D0D]">0€</span>
                <span className="text-sm text-[#8A8A8A]">/mois</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                <Feature included>50 vêtements max</Feature>
                <Feature included>5 suggestions IA/mois</Feature>
                <Feature included>Calendrier de tenues</Feature>
                <Feature included={false}>Connexion styliste</Feature>
                <Feature included={false}>Essayage virtuel</Feature>
              </ul>

              <a
                href="/register"
                className="mt-8 block w-full rounded-full bg-[#F0F0F0] py-3.5 text-center text-sm font-semibold text-[#0D0D0D]"
              >
                Commencer gratuitement
              </a>
            </div>

            {/* Card 2 — Cliente Pro (FEATURED) */}
            <div
              className="relative flex flex-col rounded-2xl border-2 border-[#0D0D0D] bg-white p-6"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0D0D0D] px-4 py-1 text-xs font-semibold text-white">
                Le plus populaire
              </span>
              <h2 className="text-lg font-semibold text-[#0D0D0D]">Cliente Pro</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#0D0D0D]">9,99€</span>
                <span className="text-sm text-[#8A8A8A]">/mois</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                <Feature included>Vêtements illimités</Feature>
                <Feature included>Suggestions IA illimitées</Feature>
                <Feature included>Essayage virtuel 10x/mois</Feature>
                <Feature included>1 styliste connecté</Feature>
                <Feature included>Statistiques avancées</Feature>
              </ul>

              <a
                href="/register?plan=client_pro"
                className="mt-8 block w-full rounded-full bg-[#0D0D0D] py-3.5 text-center text-sm font-semibold text-white"
              >
                Essai gratuit 14 jours
              </a>
            </div>

            {/* Card 3 — Styliste Pro */}
            <div
              className="flex flex-col rounded-2xl border border-[#E5E5E5] bg-white p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <h2 className="text-lg font-semibold text-[#0D0D0D]">Styliste Pro</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#0D0D0D]">19,99€</span>
                <span className="text-sm text-[#8A8A8A]">/mois</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                <Feature included>Clients illimités</Feature>
                <Feature included>Création de lookbooks</Feature>
                <Feature included>Accès garde-robe clients</Feature>
                <Feature included>Chat temps réel</Feature>
                <Feature included>Dashboard analytique</Feature>
              </ul>

              <a
                href="/register?plan=stylist_pro"
                className="mt-8 block w-full rounded-full bg-[#F0F0F0] py-3.5 text-center text-sm font-semibold text-[#0D0D0D]"
              >
                Devenir styliste
              </a>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-10 text-center text-sm text-[#8A8A8A]">
            14 jours d&#39;essai gratuit. Sans engagement.
          </p>
        </div>
      </main>

      <footer className="px-5 py-8">
        <p className="text-center text-xs text-[#8A8A8A]">
          &#169; {new Date().getFullYear()} Mon Dressing. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}

function Feature({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      {included ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      <span className={included ? 'text-[#0D0D0D]' : 'text-[#C0C0C0]'}>{children}</span>
    </li>
  );
}
