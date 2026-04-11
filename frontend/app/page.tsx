import Image from 'next/image';
import Link from 'next/link';

const inspirationImages = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop',
];

const metrics = [
  { value: '2 000+', label: 'Utilisatrices actives' },
  { value: '150+', label: 'Stylistes certifiés' },
  { value: '12 000+', label: 'Looks créés' },
  { value: '94%', label: 'Taux de satisfaction' },
];

const steps = [
  {
    title: 'Ajoutez votre dressing',
    description: 'Photographiez vos vêtements et créez votre garde-robe digitale en quelques minutes.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
        <line x1="8" y1="6" x2="8" y2="8" /><line x1="16" y1="6" x2="16" y2="8" />
      </svg>
    ),
  },
  {
    title: 'Choisissez un styliste',
    description: 'Parcourez les profils, consultez les portfolios et réservez une session.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: 'Recevez vos looks',
    description: 'Votre styliste compose des tenues avec ce que vous possédez déjà. Vous validez, portez, rayonnez.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" />
      </svg>
    ),
  },
];

const values = [
  {
    title: 'Consommer moins',
    description: "Valoriser ce que vous possédez avant d’acheter du neuf.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 4 13c0-3.87 3.13-7 7-7 3.87 0 7 3.13 7 7 0 4.42-3.58 8-8 8" />
        <path d="M11 20c0-3.87 3.13-7 7-7" /><path d="M4 13c0-4.42 3.58-8 8-8" />
      </svg>
    ),
  },
  {
    title: 'Connexion humaine',
    description: "L’expertise d’un vrai styliste, accessible à toutes.",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Style authentique',
    description: 'Des looks qui vous ressemblent vraiment, pas des tendances copiées.',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    quote: "J’avais un placard plein et rien à me mettre. Avec LIEN, ma styliste a composé 12 looks avec ce que j’avais déjà. Je n’ai pas acheté une seule pièce.",
    name: 'Sophie M.',
    role: 'Cliente, Paris',
    avatar: 'https://i.pravatar.cc/120?img=47',
  },
  {
    quote: 'Avant LIEN, je perdais un temps fou à demander des photos à mes clientes. Maintenant leur garde-robe est là, organisée. Je crée des looks deux fois plus vite.',
    name: 'Camille D.',
    role: 'Styliste Minimal & Chic, Paris',
    avatar: 'https://i.pravatar.cc/120?img=32',
  },
  {
    quote: "J’ai doublé mon nombre de clients en 3 mois. Le format digital me permet de travailler avec des clientes partout en France.",
    name: 'Hugo B.',
    role: 'Styliste Street & Casual, Lyon',
    avatar: 'https://i.pravatar.cc/120?img=12',
  },
];

const clientPerks = [
  'Dressing digital organisé',
  'Lookbooks personnalisés',
  'Chat avec votre styliste',
  'Planification de tenues',
];

const stylistPerks = [
  'Accès au dressing complet',
  'Création de lookbooks',
  'Gestion des réservations',
  'Revenus centralisés',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFEFEF]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-serif text-xl text-[#111111] no-underline">LIEN</Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Fonctionnalit&eacute;s</a>
            <a href="/pour-les-stylistes" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Pour les stylistes</a>
            <a href="/a-propos" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">&Agrave; propos</a>
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="rounded-full border border-[#111111] px-5 py-2 text-sm text-[#111111]">
              Se connecter
            </a>
            <a href="/register" className="rounded-full bg-[#111111] px-5 py-2 text-sm text-white">
              Commencer
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* ===== HERO ===== */}
        <section className="min-h-screen flex items-center bg-[#F7F5F2]">
          <div className="mx-auto flex max-w-6xl w-full flex-col lg:flex-row">
            {/* Left */}
            <div className="flex flex-1 flex-col justify-center px-8 lg:px-16 py-16">
              <span className="text-xs uppercase tracking-[0.2em] text-[#C6A47E] mb-5">La mode autrement</span>
              <h1 className="font-serif text-[46px] sm:text-[52px] leading-[1.05] text-[#111111]">
                Votre dressing,<br />
                <em className="italic">connect&eacute; &agrave; un styliste</em>
              </h1>
              <p className="mt-5 max-w-sm text-base text-[#8A8A8A] leading-relaxed">
                Ajoutez vos v&ecirc;tements, &eacute;changez avec un styliste professionnel et recevez des looks compos&eacute;s avec ce que vous poss&eacute;dez d&eacute;j&agrave;.
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <a href="/register" className="rounded-full bg-[#111111] px-8 py-3.5 text-base text-white font-medium">
                  Commencer gratuitement
                </a>
                <a href="#how" className="rounded-full border border-[#111111] px-8 py-3.5 text-base text-[#111111]">
                  Comment &ccedil;a marche
                </a>
              </div>
              {/* Social proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex">
                  {[47, 32, 44, 29].map((i, idx) => (
                    <div key={i} className={`relative h-10 w-10 overflow-hidden rounded-full border-2 border-white ${idx > 0 ? '-ml-3' : ''}`}>
                      <Image src={`https://i.pravatar.cc/80?img=${i}`} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#C6A47E] text-sm">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                    <span className="text-sm font-medium text-[#111111]">4,9/5</span>
                  </div>
                  <span className="text-xs text-[#8A8A8A]">+2 000 utilisatrices conquises</span>
                </div>
              </div>
            </div>

            {/* Right — image */}
            <div className="hidden lg:block flex-1 relative overflow-hidden">
              <div className="relative h-full min-h-[640px] rounded-3xl overflow-hidden m-8">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=700&h=900&fit=crop"
                  alt="Style"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
                {/* Floating stat */}
                <div className="absolute bottom-8 left-8 bg-white rounded-2xl px-5 py-4 shadow-xl max-w-[200px]">
                  <p className="font-serif text-3xl text-[#111111] font-bold">80%</p>
                  <p className="text-xs text-[#8A8A8A] mt-1 leading-snug">des v&ecirc;tements ne sont port&eacute;s qu&rsquo;une fois par an</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== METRICS BAR ===== */}
        <section className="bg-[#111111] py-10 px-8">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="font-serif text-3xl sm:text-4xl text-white">{m.value}</p>
                <p className="text-xs text-[#8A8A8A] uppercase tracking-wider mt-2">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== LE CONSTAT ===== */}
        <section className="bg-white py-20 px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Le constat</span>
              <h2 className="font-serif text-[30px] sm:text-[36px] leading-tight text-[#111111] mt-3 mb-6">
                80% des v&ecirc;tements ne sont port&eacute;s qu&rsquo;une fois par an.
              </h2>
              <div className="flex flex-col gap-4 text-[#8A8A8A] text-base leading-relaxed">
                <p>
                  Nous achetons par impulsion, nous oublions ce que nous avons, nous manquons d&rsquo;inspiration pour combiner ce que nous poss&eacute;dons d&eacute;j&agrave;.
                </p>
                <p>
                  Le r&eacute;sultat&nbsp;: un placard plein, le sentiment de n&rsquo;avoir rien &agrave; se mettre, et des achats inutiles qui s&rsquo;accumulent.
                </p>
                <p className="text-[#111111] font-medium">
                  LIEN ne vous propose pas d&rsquo;acheter plus.&nbsp; Il vous aide &agrave; porter mieux ce que vous avez.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMMENT ÇA MARCHE ===== */}
        <section id="how" className="bg-[#F7F5F2] py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Le parcours</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Comment &ccedil;a marche&nbsp;?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.title} className="bg-white rounded-3xl p-8 border border-[#EFEFEF]">
                  <div className="w-12 h-12 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <p className="font-serif text-4xl text-[#C6A47E] mb-3">0{i + 1}</p>
                  <h3 className="font-serif text-lg text-[#111111] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#8A8A8A] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DEUX ESPACES ===== */}
        <section className="bg-white py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Deux espaces, une plateforme</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Con&ccedil;u pour deux univers distincts
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div className="bg-[#F7F5F2] rounded-3xl p-8 border border-[#EFEFEF] flex flex-col">
                <div className="w-14 h-14 rounded-full bg-[#EDE5DC] flex items-center justify-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                    <line x1="8" y1="6" x2="8" y2="8" /><line x1="16" y1="6" x2="16" y2="8" />
                  </svg>
                </div>
                <span className="inline-block text-xs bg-white text-[#111111] rounded-full px-3 py-1 mb-4 w-fit border border-[#EFEFEF]">
                  Pour vous habiller mieux
                </span>
                <h3 className="font-serif text-2xl text-[#111111] mb-3">L&rsquo;espace Cliente</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed mb-6">
                  Votre dressing digital, organis&eacute; et intelligent. Connectez-vous &agrave; un styliste professionnel et recevez des looks avec ce que vous poss&eacute;dez d&eacute;j&agrave;.
                </p>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {clientPerks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
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

              {/* Styliste */}
              <div className="bg-[#111111] rounded-3xl p-8 flex flex-col">
                <div className="w-14 h-14 rounded-full bg-[#C6A47E]/20 flex items-center justify-center mb-6">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <span className="inline-block text-xs bg-[#C6A47E] text-[#111111] rounded-full px-3 py-1 mb-4 w-fit font-medium">
                  Pour les professionnels
                </span>
                <h3 className="font-serif text-2xl text-white mb-3">L&rsquo;espace Styliste</h3>
                <p className="text-sm text-[#CFCFCF] leading-relaxed mb-6">
                  Votre outil de travail professionnel. Acc&eacute;dez &agrave; la garde-robe de vos clientes, cr&eacute;ez des lookbooks sur mesure et d&eacute;veloppez votre activit&eacute;.
                </p>
                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {stylistPerks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C6A47E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-sm text-white">{perk}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/pour-les-stylistes"
                  className="block text-center rounded-full bg-[#C6A47E] text-[#111111] px-6 py-3 text-sm font-medium hover:bg-[#b8926a] transition-colors"
                >
                  D&eacute;couvrir l&rsquo;espace styliste
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== VALEURS ===== */}
        <section className="bg-[#111111] py-20 px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C6A47E]">Notre vision</span>
            <h2 className="font-serif text-4xl text-white mt-3 mb-14">
              Mode durable. <em className="italic">Style personnel.</em>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {values.map((v) => (
                <div key={v.title} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-[#C6A47E]/15 flex items-center justify-center mb-5">
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-xl text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-[#CFCFCF] leading-relaxed max-w-xs">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TÉMOIGNAGES ===== */}
        <section className="bg-[#F7F5F2] py-16 px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">T&eacute;moignages</span>
              <h2 className="font-serif text-4xl text-[#111111] mt-3">
                Ils ont adopt&eacute; LIEN
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-3xl p-8 border border-[#EFEFEF] flex flex-col">
                  <div className="text-[#C6A47E] text-base mb-5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                  <p className="text-sm text-[#111111] leading-relaxed flex-1 italic">
                    &laquo;&nbsp;{t.quote}&nbsp;&raquo;
                  </p>
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

        {/* ===== INSPIRATION ===== */}
        <section className="py-16 bg-white">
          <div className="flex items-center justify-between px-8 mb-8 max-w-6xl mx-auto">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#8A8A8A]">Inspiration</span>
              <h2 className="font-serif text-3xl text-[#111111] mt-1">De l&apos;inspiration, chaque jour</h2>
            </div>
            <a href="/register" className="text-sm text-[#8A8A8A] underline whitespace-nowrap hidden sm:block">
              Voir plus de looks
            </a>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8">
            {inspirationImages.map((img, i) => (
              <div key={i} className="relative w-[200px] h-[280px] flex-shrink-0 rounded-2xl overflow-hidden">
                <Image src={img} alt={`Inspiration ${i + 1}`} fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="bg-[#111111] py-24 px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-[40px] sm:text-[44px] leading-[1.1] text-white">
              Pr&ecirc;t&middot;e &agrave; r&eacute;inventer votre style&nbsp;?
            </h2>
            <p className="text-[#CFCFCF] mt-5 text-base max-w-xl mx-auto leading-relaxed">
              Rejoignez une communaut&eacute; de passionn&eacute;es de mode et de stylistes professionnels.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <a href="/register?role=CLIENT" className="bg-white text-[#111111] rounded-full px-8 py-4 text-base font-medium hover:bg-[#F0EDE8] transition-colors">
                Je suis cliente
              </a>
              <a href="/register?role=STYLIST" className="bg-[#C6A47E] text-[#111111] rounded-full px-8 py-4 text-base font-medium hover:bg-[#b8926a] transition-colors">
                Je suis styliste
              </a>
            </div>
            <p className="text-xs text-[#8A8A8A] mt-6">Gratuit &middot; Sans engagement &middot; Configuration en 5 minutes</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="font-serif text-white no-underline">LIEN</Link>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <a href="/parrainage" className="text-sm text-[#C6A47E] hover:text-[#b8926a]">Parrainez vos amis</a>
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-white">Tarifs</a>
            <a href="/cgv" className="text-sm text-[#8A8A8A] hover:text-white">CGV</a>
            <a href="/confidentialite" className="text-sm text-[#8A8A8A] hover:text-white">Confidentialit&eacute;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
