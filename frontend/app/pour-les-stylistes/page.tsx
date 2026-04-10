import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Devenir styliste — LIEN',
  description:
    'Rejoignez LIEN, la plateforme qui connecte les stylistes professionnels à des clientes passionnées. Votre expertise enfin valorisée.',
};

const steps = [
  {
    number: '01',
    title: 'Créez votre profil',
    description:
      'Présentez votre univers, votre style, vos tarifs. Votre profil est votre vitrine.',
  },
  {
    number: '02',
    title: 'Accédez au dressing de vos clientes',
    description:
      'Consultez chaque pièce, composez des looks cohérents avec ce qu’elles possèdent déjà.',
  },
  {
    number: '03',
    title: 'Proposez, affinez, fidélisez',
    description:
      'Envoyez vos lookbooks, recevez les retours en temps réel et construisez une relation durable.',
  },
];

const features = [
  'La garde-robe complète de chaque cliente',
  'Un outil de création de lookbooks intuitif',
  'Un chat intégré pour échanger en direct',
  'Vos réservations et paiements centralisés',
  'Vos statistiques : looks créés, satisfaction clients, revenus générés',
];

const testimonials = [
  {
    quote:
      'Avant LIEN, je perdais un temps fou à demander des photos à mes clientes. Maintenant leur garde-robe est là, organisée, accessible. Je crée des looks deux fois plus vite.',
    name: 'Camille D.',
    role: 'Styliste Minimal & Chic, Paris',
    avatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    quote:
      'J’ai doublé mon nombre de clients en 3 mois. Le format digital me permet de travailler avec des clientes partout en France.',
    name: 'Hugo B.',
    role: 'Styliste Street & Casual, Lyon',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
  {
    quote:
      'Le lookbook intégré change tout. Mes clientes voient exactement le rendu avant de valider. Moins de retours, plus de satisfaction.',
    name: 'Léa P.',
    role: 'Styliste Chic & Audacieux, Bordeaux',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
];

const freePerks = [
  '3 clients maximum',
  'Création de lookbooks',
  'Chat intégré',
  'Profil listé dans l’annuaire',
];

const proPerks = [
  'Clients illimités',
  'Dashboard analytique complet',
  'Mise en avant dans l’annuaire',
  'Notifications prioritaires',
  'Support dédié',
];

export default function PourLesStylesPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFEFEF]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="font-serif text-xl text-[#111111]">LIEN</a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="/#how" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Fonctionnalit&eacute;s</a>
            <a href="/pour-les-stylistes" className="text-sm text-[#111111] font-medium">Pour les stylistes</a>
            <a href="/a-propos" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">&Agrave; propos</a>
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden sm:inline-block rounded-full border border-[#111111] px-5 py-2 text-sm text-[#111111]">
              Se connecter
            </a>
            <a
              href="/register?role=STYLIST"
              className="rounded-full bg-[#C6A47E] px-5 py-2 text-sm text-[#111111] font-medium hover:bg-[#b8926a] transition-colors"
            >
              Devenir styliste
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-[#111111] text-white">
          <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col lg:flex-row items-center gap-12 px-8 py-16 lg:py-0">
            {/* Left column */}
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C6A47E] mb-6">Pour les stylistes</span>
              <h1 className="font-serif text-[42px] sm:text-[52px] leading-[1.05] text-white">
                Votre expertise,<br />
                <em className="italic">enfin valoris&eacute;e</em>
              </h1>
              <p className="mt-6 max-w-lg text-base text-[#CFCFCF] leading-relaxed">
                LIEN connecte les stylistes professionnels &agrave; des clientes qui cherchent exactement ce que vous savez cr&eacute;er.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href="/register?role=STYLIST"
                  className="rounded-full bg-[#C6A47E] px-8 py-4 text-base text-[#111111] font-medium hover:bg-[#b8926a] transition-colors"
                >
                  Rejoindre LIEN
                </a>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-white/30 px-8 py-4 text-base text-white hover:bg-white/5 transition-colors"
                >
                  En savoir plus
                </a>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-[#8A8A8A]">
                <div className="flex items-center gap-2">
                  <span className="text-[#C6A47E] text-lg">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                  <span>4,9 / 5</span>
                </div>
                <div className="h-4 w-px bg-white/20" />
                <span>+120 stylistes actifs</span>
              </div>
            </div>

            {/* Right column */}
            <div className="hidden lg:block flex-1 relative">
              <div className="relative h-[600px] w-full rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop"
                  alt="Styliste au travail"
                  fill
                  className="object-cover"
                  sizes="600px"
                  priority
                />
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-6 -left-6 bg-[#C6A47E] text-[#111111] rounded-2xl px-6 py-4 shadow-2xl max-w-[240px]">
                <p className="text-2xl font-serif font-bold">x2</p>
                <p className="text-xs mt-1">Plus de looks cr&eacute;&eacute;s en moyenne sur LIEN</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1 — How it works */}
        <section id="how-it-works" className="bg-[#F7F5F2] py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Le parcours</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Comment &ccedil;a marche pour vous&nbsp;?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-white rounded-3xl p-8 border border-[#EFEFEF]"
                >
                  <p className="font-serif text-5xl text-[#C6A47E] mb-6">{step.number}</p>
                  <h3 className="font-serif text-xl text-[#111111] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#8A8A8A] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 — Dashboard */}
        <section className="bg-white py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Votre espace styliste</span>
                <h2 className="font-serif text-4xl text-[#111111] mt-3 mb-6">
                  Un dashboard pens&eacute; pour vous
                </h2>
                <p className="text-[#8A8A8A] text-base leading-relaxed mb-8">
                  Votre espace professionnel LIEN regroupe tout ce dont vous avez besoin&nbsp;:
                </p>
                <ul className="flex flex-col gap-4">
                  {features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#C6A47E] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className="text-sm text-[#111111] leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="relative aspect-[8/5] rounded-3xl overflow-hidden border border-[#EFEFEF] shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop"
                    alt="Dashboard styliste"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — Testimonials */}
        <section className="bg-[#F7F5F2] py-16 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">T&eacute;moignages</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Ce que disent nos stylistes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-3xl p-8 border border-[#EFEFEF] flex flex-col">
                  <div className="text-[#C6A47E] text-lg mb-4">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                  <p className="text-sm text-[#111111] leading-relaxed flex-1 italic">&laquo;&nbsp;{t.quote}&nbsp;&raquo;</p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#EFEFEF]">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111111]">{t.name}</p>
                      <p className="text-xs text-[#8A8A8A]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4 — Pricing */}
        <section className="bg-white py-16 px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Tarifs styliste</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Commencez gratuitement
              </h2>
              <p className="text-[#8A8A8A] mt-3 text-sm">
                Choisissez la formule qui correspond &agrave; votre activit&eacute;. Sans engagement.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="bg-[#F7F5F2] border border-[#EFEFEF] rounded-3xl p-8 flex flex-col">
                <p className="text-xs uppercase tracking-[0.15em] text-[#8A8A8A] mb-3">Pour d&eacute;buter</p>
                <h3 className="font-serif text-2xl text-[#111111] mb-2">Gratuit</h3>
                <p className="text-sm text-[#8A8A8A] mb-6">Tout le n&eacute;cessaire pour lancer votre activit&eacute;.</p>
                <p className="font-serif text-4xl text-[#111111] mb-8">
                  0&nbsp;&euro;<span className="text-sm text-[#8A8A8A] font-sans">/mois</span>
                </p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {freePerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-[#111111]">{perk}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/register?role=STYLIST"
                  className="block text-center rounded-full border border-[#111111] px-6 py-3 text-sm text-[#111111] font-medium hover:bg-[#111111] hover:text-white transition-colors"
                >
                  Cr&eacute;er mon profil gratuit
                </a>
              </div>

              {/* Pro */}
              <div className="bg-[#111111] text-white rounded-3xl p-8 flex flex-col relative">
                <div className="absolute -top-3 right-6 bg-[#C6A47E] text-[#111111] text-xs uppercase tracking-wider font-medium px-3 py-1 rounded-full">
                  Populaire
                </div>
                <p className="text-xs uppercase tracking-[0.15em] text-[#C6A47E] mb-3">Pour grandir</p>
                <h3 className="font-serif text-2xl mb-2">Styliste Pro</h3>
                <p className="text-sm text-[#CFCFCF] mb-6">D&eacute;veloppez votre clientele sans limite.</p>
                <p className="font-serif text-4xl mb-8">
                  19,99&nbsp;&euro;<span className="text-sm text-[#8A8A8A] font-sans">/mois</span>
                </p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {proPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-white">{perk}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/register?role=STYLIST&plan=pro"
                  className="block text-center rounded-full bg-[#C6A47E] px-6 py-3 text-sm text-[#111111] font-medium hover:bg-[#b8926a] transition-colors"
                >
                  Passer Pro
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Final CTA */}
        <section className="bg-[#111111] py-24 px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-[40px] sm:text-[44px] leading-[1.1] text-white">
              Pr&ecirc;t&middot;e &agrave; d&eacute;velopper<br />
              <em className="italic">votre client&egrave;le&nbsp;?</em>
            </h2>
            <p className="text-[#CFCFCF] mt-6 text-base max-w-xl mx-auto">
              Rejoignez les stylistes qui transforment leur passion en activit&eacute; florissante.
            </p>
            <a
              href="/register?role=STYLIST"
              className="mt-10 inline-block bg-[#C6A47E] text-[#111111] rounded-full px-10 py-4 text-base font-medium hover:bg-[#b8926a] transition-colors"
            >
              Cr&eacute;er mon profil styliste
            </a>
            <p className="text-xs text-[#8A8A8A] mt-6">
              Gratuit &middot; Sans engagement &middot; Configuration en 5 minutes
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <a href="/" className="font-serif text-white">LIEN</a>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6">
            <a href="/a-propos" className="text-sm text-[#8A8A8A] hover:text-white">&Agrave; propos</a>
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-white">Tarifs</a>
            <a href="/pour-les-stylistes" className="text-sm text-[#8A8A8A] hover:text-white">Pour les stylistes</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
