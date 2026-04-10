import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos — LIEN',
  description:
    'Découvrez LIEN : notre vision, notre mission et l’équipe derrière la plateforme qui connecte clientes et stylistes professionnels.',
};

const values = [
  {
    title: 'Consommer moins',
    description:
      'Valoriser ce que vous possédez avant d’acheter du neuf.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 4 13c0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 4.42-3.58 8-8 8" />
        <path d="M11 20c0-3.87 3.13-7 7-7" />
        <path d="M4 13c0-4.42 3.58-8 8-8" />
      </svg>
    ),
  },
  {
    title: 'Connexion humaine',
    description:
      'L’expertise d’un vrai styliste, accessible à toutes.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Style authentique',
    description:
      'Des looks qui vous ressemblent vraiment, pas des tendances copiées.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const clientPerks = [
  'Photographier et cataloguer vos vêtements',
  'Visualiser votre garde-robe complète',
  'Planifier vos tenues semaine par semaine',
  'Échanger avec votre styliste en direct',
  'Recevoir et valider des lookbooks',
  'Suivre vos statistiques de port',
];

const stylistPerks = [
  'Consulter le dressing complet de chaque cliente',
  'Créer des lookbooks avec leurs pièces existantes',
  'Communiquer en temps réel via le chat intégré',
  'Gérer votre agenda et vos réservations',
  'Encaisser vos paiements directement',
  'Suivre vos revenus et statistiques',
];

const team = [
  {
    name: 'Belvie K.',
    role: 'Fondatrice & CEO',
    bio: 'Ancienne consultante mode, passionnée par l’alliance de la tech et du style.',
    avatar: 'https://i.pravatar.cc/200?img=47',
  },
  {
    name: 'Alex M.',
    role: 'CTO',
    bio: 'Ingénieur produit obsédé par les expériences simples et élégantes.',
    avatar: 'https://i.pravatar.cc/200?img=33',
  },
  {
    name: 'Sofia L.',
    role: 'Head of Style',
    bio: 'Styliste certifiée, elle veille à la qualité des conseils sur la plateforme.',
    avatar: 'https://i.pravatar.cc/200?img=32',
  },
];

const metrics = [
  { value: '2 000+', label: 'Utilisatrices actives' },
  { value: '150+', label: 'Stylistes certifiés' },
  { value: '12 000+', label: 'Looks créés' },
  { value: '94%', label: 'Taux de satisfaction' },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFEFEF]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="font-serif text-xl text-[#111111]">LIEN</a>
          <div className="hidden items-center gap-8 md:flex">
            <a href="/#how" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Fonctionnalit&eacute;s</a>
            <a href="/stylists-pro" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Pour les stylistes</a>
            <a href="/a-propos" className="text-sm text-[#111111] font-medium">&Agrave; propos</a>
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden sm:inline-block rounded-full border border-[#111111] px-5 py-2 text-sm text-[#111111]">
              Se connecter
            </a>
            <a href="/register" className="rounded-full bg-[#111111] px-5 py-2 text-sm text-white">
              Commencer
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-[#F7F5F2] py-24 px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="text-sm uppercase tracking-[0.2em] text-[#C6A47E]">Notre histoire</span>
            <h1 className="font-serif text-[42px] sm:text-[52px] leading-[1.05] text-[#111111] mt-6">
              LIEN est n&eacute; d&rsquo;une<br />
              <em className="italic">frustration universelle</em>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-base text-[#8A8A8A] leading-relaxed">
              Chaque matin, des millions de femmes ouvrent un placard plein et ne savent pas quoi mettre. Pas par manque de v&ecirc;tements. Par manque de vision sur ce qu&rsquo;elles poss&egrave;dent d&eacute;j&agrave;.
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-base text-[#111111] leading-relaxed font-medium">
              LIEN est la r&eacute;ponse &agrave; ce probl&egrave;me.
            </p>
          </div>
        </section>

        {/* Section 1 — Le constat */}
        <section className="bg-white py-20 px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Le constat</span>
              <h2 className="font-serif text-3xl lg:text-[32px] leading-tight text-[#111111] mt-3 mb-8">
                80% des v&ecirc;tements que vous poss&eacute;dez ne sont port&eacute;s qu&rsquo;une fois par an.
              </h2>
              <div className="flex flex-col gap-4 text-[#8A8A8A] text-base leading-relaxed">
                <p>
                  Nous achetons par impulsion, nous oublions ce que nous avons, nous manquons d&rsquo;inspiration pour combiner ce que nous poss&eacute;dons d&eacute;j&agrave;.
                </p>
                <p>
                  Le r&eacute;sultat&nbsp;: un placard plein, le sentiment de n&rsquo;avoir rien &agrave; se mettre, et des achats inutiles qui s&rsquo;accumulent.
                </p>
                <p className="text-[#111111] font-medium">
                  LIEN ne vous propose pas d&rsquo;acheter plus. Il vous aide &agrave; porter mieux ce que vous avez.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-[5/6] rounded-3xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&h=600&fit=crop"
                  alt="Dressing organis&eacute;"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — Notre vision */}
        <section className="bg-[#111111] text-white py-20 px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C6A47E]">Notre vision</span>
            <h2 className="font-serif text-[36px] sm:text-[40px] leading-tight text-white mt-3 mb-14">
              Mode durable. <em className="italic">Style personnel.</em>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {values.map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#C6A47E]/15 text-[#C6A47E] flex items-center justify-center mb-6">
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-xl text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-[#CFCFCF] leading-relaxed max-w-xs">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 — Two spaces, one platform */}
        <section className="bg-[#F7F5F2] py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Deux espaces, une plateforme</span>
              <h2 className="font-serif text-[32px] sm:text-4xl text-[#111111] mt-3">
                Con&ccedil;u pour deux univers distincts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Carte Cliente */}
              <div className="bg-white rounded-3xl p-8 border border-[#EFEFEF] flex flex-col">
                <div className="w-14 h-14 rounded-full bg-[#EDE5DC] flex items-center justify-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a2 2 0 0 0-2 2v1.5a1 1 0 0 0 .55.89L12 7l1.45-.61A1 1 0 0 0 14 5.5V4a2 2 0 0 0-2-2z" />
                    <path d="M12 7v2" />
                    <path d="M2 20l10-6 10 6H2z" />
                  </svg>
                </div>
                <div className="mb-4">
                  <span className="inline-block text-xs bg-[#F0EDE8] text-[#111111] rounded-full px-3 py-1 mb-3">
                    Pour vous habiller mieux
                  </span>
                  <h3 className="font-serif text-2xl text-[#111111]">L&rsquo;espace Cliente</h3>
                </div>
                <p className="text-sm text-[#8A8A8A] leading-relaxed mb-6">
                  Votre dressing digital, organis&eacute; et intelligent. Ajoutez vos pi&egrave;ces, planifiez vos tenues, connectez-vous avec un styliste professionnel et recevez des looks compos&eacute;s avec ce que vous poss&eacute;dez d&eacute;j&agrave;.
                </p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {clientPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-[#111111]">{perk}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/register?role=CLIENT"
                  className="block text-center rounded-full bg-[#111111] text-white px-6 py-3 text-sm font-medium hover:bg-[#000] transition-colors"
                >
                  Cr&eacute;er mon dressing
                </a>
              </div>

              {/* Carte Styliste */}
              <div className="bg-[#111111] text-white rounded-3xl p-8 flex flex-col">
                <div className="w-14 h-14 rounded-full bg-[#C6A47E]/20 flex items-center justify-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="mb-4">
                  <span className="inline-block text-xs bg-[#C6A47E] text-[#111111] rounded-full px-3 py-1 mb-3 font-medium">
                    Pour les professionnels
                  </span>
                  <h3 className="font-serif text-2xl text-white">L&rsquo;espace Styliste</h3>
                </div>
                <p className="text-sm text-[#CFCFCF] leading-relaxed mb-6">
                  Votre outil de travail professionnel. Acc&eacute;dez &agrave; la garde-robe compl&egrave;te de vos clientes, cr&eacute;ez des lookbooks sur mesure, g&eacute;rez vos r&eacute;servations et d&eacute;veloppez votre activit&eacute;.
                </p>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {stylistPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-white">{perk}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/register?role=STYLIST"
                  className="block text-center rounded-full bg-[#C6A47E] text-[#111111] px-6 py-3 text-sm font-medium hover:bg-[#b8926a] transition-colors"
                >
                  Cr&eacute;er mon profil styliste
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Team */}
        <section className="bg-white py-20 px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">L&rsquo;&eacute;quipe</span>
            <h2 className="font-serif text-[32px] sm:text-4xl text-[#111111] mt-3 mb-6">
              Derri&egrave;re LIEN
            </h2>
            <p className="text-[#8A8A8A] text-base max-w-2xl mx-auto mb-14 leading-relaxed">
              Une &eacute;quipe passionn&eacute;e de mode et de technologie, convaincue que le style ne devrait pas &ecirc;tre un privil&egrave;ge.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {team.map((member) => (
                <div key={member.name} className="flex flex-col items-center text-center">
                  <div className="relative h-[160px] w-[160px] rounded-full overflow-hidden mb-5">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover" sizes="160px" />
                  </div>
                  <h3 className="font-serif text-xl text-[#111111]">{member.name}</h3>
                  <p className="text-xs text-[#C6A47E] uppercase tracking-wider mt-1">{member.role}</p>
                  <p className="text-sm text-[#8A8A8A] mt-3 max-w-[240px] leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5 — Metrics */}
        <section className="bg-[#F7F5F2] py-16 px-8">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="font-serif text-4xl sm:text-5xl text-[#111111]">{m.value}</p>
                  <p className="text-xs sm:text-sm text-[#8A8A8A] uppercase tracking-wider mt-2">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 — Final CTA */}
        <section className="bg-[#111111] py-24 px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-[40px] sm:text-[44px] leading-[1.1] text-white">
              Rejoignez l&rsquo;aventure <em className="italic">LIEN</em>
            </h2>
            <p className="text-[#CFCFCF] mt-6 text-base">
              Cliente ou styliste, votre place est ici.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <a
                href="/register?role=CLIENT"
                className="bg-white text-[#111111] rounded-full px-8 py-4 text-base font-medium hover:bg-[#F0EDE8] transition-colors"
              >
                Je suis cliente
              </a>
              <a
                href="/register?role=STYLIST"
                className="bg-[#C6A47E] text-[#111111] rounded-full px-8 py-4 text-base font-medium hover:bg-[#b8926a] transition-colors"
              >
                Je suis styliste
              </a>
            </div>
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
            <a href="/stylists-pro" className="text-sm text-[#8A8A8A] hover:text-white">Pour les stylistes</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
