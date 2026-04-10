const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Intelligence Artificielle',
    description: 'Scan automatique de vos v\u00EAtements, suggestions de tenues personnalis\u00E9es et analyse de votre style.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Styliste Personnel',
    description: 'Connectez-vous avec des stylistes professionnels qui cr\u00E9ent des lookbooks sur mesure.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Statistiques',
    description: 'Suivez vos habitudes vestimentaires, d\u00E9couvrez vos favoris et optimisez votre garde-robe.',
  },
];

const plans = [
  {
    name: 'Gratuit',
    price: '0\u20AC',
    period: '',
    features: ['50 v\u00EAtements', 'Suggestions IA basiques', 'Calendrier de tenues'],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Client Pro',
    price: '9,99\u20AC',
    period: '/mois',
    features: ['V\u00EAtements illimit\u00E9s', 'IA avanc\u00E9e', 'Essayage virtuel', 'Connexion styliste', 'ADN de Style'],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Styliste Pro',
    price: '19,99\u20AC',
    period: '/mois',
    features: ['Clients illimit\u00E9s', 'Lookbooks', 'Messagerie', 'Acc\u00E8s dressings clients', 'Outils IA Pro'],
    cta: 'Commencer',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-app-bg)' }}>
      <header className="px-5 py-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-[#0D0D0D]">Mon Dressing</h1>
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

      <main>
        <section className="px-5 py-16 text-center md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#0D0D0D] md:text-6xl">
              Votre dressing{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                intelligent
              </span>
            </h2>
            <p className="mt-4 text-lg text-[#8A8A8A] md:text-xl">
              Num&#233;risez votre garde-robe, cr&#233;ez des tenues avec l&#39;IA et recevez
              des conseils de style personnalis&#233;s.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/register"
                className="block w-full rounded-full bg-[#0D0D0D] px-8 py-3.5 text-center text-sm font-semibold text-white sm:w-auto"
              >
                Commencer gratuitement
              </a>
              <a
                href="#features"
                className="block w-full rounded-full border border-[#E5E5E5] bg-white px-8 py-3.5 text-center text-sm font-semibold text-[#0D0D0D] sm:w-auto"
              >
                D&#233;couvrir
              </a>
            </div>
            <a
              href="/pricing"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#8A8A8A] transition-colors hover:text-[#0D0D0D]"
            >
              Voir les formules
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>
        </section>

        <section id="features" className="px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <h3 className="mb-12 text-center text-2xl font-bold text-[#0D0D0D]">
              Tout pour votre style
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0F0F0]">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-[#0D0D0D]">{feature.title}</h4>
                  <p className="mt-2 text-sm text-[#8A8A8A]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16">
          <div className="mx-auto max-w-6xl">
            <h3 className="mb-12 text-center text-2xl font-bold text-[#0D0D0D]">
              Tarifs
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 ${
                    plan.highlighted
                      ? 'bg-[#0D0D0D] text-white'
                      : 'border border-[#E5E5E5] bg-white'
                  }`}
                  style={plan.highlighted ? { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } : { boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <h4 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-[#0D0D0D]'}`}>
                    {plan.name}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-white/50' : 'text-[#8A8A8A]'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.highlighted ? '#4ade80' : '#22c55e'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/register"
                    className={`mt-6 block w-full rounded-full py-3.5 text-center text-sm font-semibold ${
                      plan.highlighted
                        ? 'bg-white text-[#0D0D0D]'
                        : 'bg-[#0D0D0D] text-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-8">
        <p className="text-center text-xs text-[#8A8A8A]">
          &#169; {new Date().getFullYear()} Mon Dressing. Tous droits r&#233;serv&#233;s.
        </p>
      </footer>
    </div>
  );
}
