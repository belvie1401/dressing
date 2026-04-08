const features = [
  {
    icon: '\u2728',
    title: 'Intelligence Artificielle',
    description: 'Scan automatique de vos v\u00EAtements, suggestions de tenues personnalis\u00E9es et analyse de votre style.',
  },
  {
    icon: '\uD83D\uDC65',
    title: 'Styliste Personnel',
    description: 'Connectez-vous avec des stylistes professionnels qui cr\u00E9ent des lookbooks sur mesure.',
  },
  {
    icon: '\uD83D\uDCCA',
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
    <div className="min-h-screen bg-white">
      <header className="px-4 py-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mon Dressing</h1>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Connexion
            </a>
            <a
              href="/register"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              S&#39;inscrire
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="px-4 py-16 text-center md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Votre dressing{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                intelligent
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 md:text-xl">
              Num&#233;risez votre garde-robe, cr&#233;ez des tenues avec l&#39;IA et recevez
              des conseils de style personnalis&#233;s.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="/register"
                className="block w-full rounded-full bg-black px-8 py-3 text-center text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
              >
                Commencer gratuitement
              </a>
              <a
                href="#features"
                className="block w-full rounded-full border border-gray-200 px-8 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                D&#233;couvrir
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h3 className="mb-12 text-center text-2xl font-bold text-gray-900">
              Tout pour votre style
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-3 text-2xl">
                    {feature.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                  <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h3 className="mb-12 text-center text-2xl font-bold text-gray-900">
              Tarifs
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 ${
                    plan.highlighted
                      ? 'bg-black text-white shadow-xl'
                      : 'border border-gray-200 bg-white'
                  }`}
                >
                  <h4 className={`text-lg font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <span className={`text-xs ${plan.highlighted ? 'text-green-400' : 'text-green-600'}`}>&#10003;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/register"
                    className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
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

      <footer className="border-t border-gray-100 px-4 py-8">
        <p className="text-center text-xs text-gray-400">
          &#169; {new Date().getFullYear()} Mon Dressing. Tous droits r&#233;serv&#233;s.
        </p>
      </footer>
    </div>
  );
}
