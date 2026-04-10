import Image from 'next/image';

const steps = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L8 6H3v14h18V6h-5l-4-4z" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    title: 'Ajoutez votre dressing',
    description: 'Importez vos v\u00eatements en quelques photos.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <path d="M8 11h6" /><path d="M11 8v6" />
      </svg>
    ),
    title: 'Trouvez un styliste',
    description: 'D\u00e9couvrez des profils et choisissez celui qui vous correspond.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Recevez vos looks',
    description: '\u00c9changez, affinez, adoptez le style qui vous sublime.',
  },
];

const inspirationImages = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=400&fit=crop',
  'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=300&h=400&fit=crop',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)' }}>
      {/* Header */}
      <header className="px-5 py-5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="font-serif text-2xl font-semibold tracking-wide text-[#0D0D0D]">LIEN</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Fonctionnalit\u00e9s</a>
            <a href="#stylists" className="text-sm text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">Pour les stylistes</a>
            <a href="#about" className="text-sm text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors">\u00c0 propos</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-[#0D0D0D] hover:underline">
              Se connecter
            </a>
            <a
              href="/register"
              className="rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Commencer
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="px-5 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-serif text-4xl font-semibold leading-tight text-[#0D0D0D] md:text-[56px] md:leading-[1.1]">
                Votre dressing,<br />
                <em className="font-serif italic">connect\u00e9 aux stylistes</em>
              </h1>
              <p className="mt-5 max-w-md text-base text-[#8A8A8A] md:text-lg mx-auto md:mx-0">
                Ajoutez vos v\u00eatements, \u00e9changez avec des stylistes et recevez des looks qui vous ressemblent.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
                <a
                  href="/register"
                  className="w-full rounded-full bg-[#0D0D0D] px-7 py-3.5 text-center text-sm font-semibold text-white sm:w-auto transition-opacity hover:opacity-90"
                >
                  Commencer
                </a>
                <a
                  href="#how"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E0DCD5] bg-white px-7 py-3.5 text-center text-sm font-medium text-[#0D0D0D] sm:w-auto transition-colors hover:bg-[#F0EDE8]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0D0D0D" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Voir comment \u00e7a marche
                </a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
                <div className="flex -space-x-2">
                  {[47, 32, 44, 29].map((i) => (
                    <div key={i} className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white">
                      <Image src={`https://i.pravatar.cc/60?img=${i}`} alt="" fill className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[#8A8A8A]">+2 000 utilisateurs conquis</span>
              </div>
            </div>
            <div className="relative w-full max-w-sm flex-shrink-0 md:max-w-md">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop"
                  alt="Dressing organis\u00e9"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Comment \u00e7a marche ? */}
        <section id="how" className="px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-serif text-2xl font-semibold text-[#0D0D0D] md:text-3xl">
              Comment \u00e7a marche ?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--color-accent-light)' }}>
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-[#0D0D0D]">{step.title}</h3>
                  <p className="mt-2 max-w-[240px] text-sm text-[#8A8A8A]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* De l'inspiration, chaque jour */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#0D0D0D] md:text-3xl">
                De l&apos;inspiration, chaque jour
              </h2>
              <a href="/register" className="text-sm font-medium text-[#8A8A8A] hover:text-[#0D0D0D] transition-colors whitespace-nowrap">
                Voir plus de looks &rarr;
              </a>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 scrollbar-hide">
            {inspirationImages.map((img, i) => (
              <div
                key={i}
                className="relative h-[200px] w-[150px] shrink-0 overflow-hidden rounded-2xl md:h-[260px] md:w-[190px]"
              >
                <Image
                  src={img}
                  alt={`Inspiration ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="190px"
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA section */}
        <section className="px-5 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold text-[#0D0D0D] md:text-4xl">
              Pr\u00eat\u00b7e \u00e0 r\u00e9inventer votre style ?
            </h2>
            <p className="mt-4 text-base text-[#8A8A8A]">
              Rejoignez une communaut\u00e9 de passionn\u00e9s de mode et de stylistes professionnels.
            </p>
            <a
              href="/register"
              className="mt-8 inline-block rounded-full bg-[#0D0D0D] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Cr\u00e9er mon compte gratuitement
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E0DCD5] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <span className="font-serif text-lg font-semibold text-[#0D0D0D]">LIEN</span>
          <p className="text-xs text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r\u00e9serv\u00e9s.
          </p>
          <div className="flex items-center gap-6">
            <a href="/pricing" className="text-xs text-[#8A8A8A] hover:text-[#0D0D0D]">Tarifs</a>
            <a href="#" className="text-xs text-[#8A8A8A] hover:text-[#0D0D0D]">CGU</a>
            <a href="#" className="text-xs text-[#8A8A8A] hover:text-[#0D0D0D]">Confidentialit\u00e9</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
