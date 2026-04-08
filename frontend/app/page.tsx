import Link from 'next/link';
import { Sparkles, Users, BarChart3, Check } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Intelligence Artificielle',
    description: 'Scan automatique de vos vêtements, suggestions de tenues personnalisées et analyse de votre style.',
  },
  {
    icon: Users,
    title: 'Styliste Personnel',
    description: 'Connectez-vous avec des stylistes professionnels qui créent des lookbooks sur mesure.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    description: 'Suivez vos habitudes vestimentaires, découvrez vos favoris et optimisez votre garde-robe.',
  },
];

const plans = [
  {
    name: 'Gratuit',
    price: '0\u20AC',
    period: '',
    features: ['50 vêtements', 'Suggestions IA basiques', 'Calendrier de tenues'],
    cta: 'Commencer',
    highlighted: false,
  },
  {
    name: 'Client Pro',
    price: '9,99\u20AC',
    period: '/mois',
    features: ['Vêtements illimités', 'IA avancée', 'Essayage virtuel', 'Connexion styliste', 'ADN de Style'],
    cta: 'Essai gratuit 14 jours',
    highlighted: true,
  },
  {
    name: 'Styliste Pro',
    price: '19,99\u20AC',
    period: '/mois',
    features: ['Clients illimités', 'Lookbooks', 'Messagerie', 'Accès dressings clients', 'Outils IA Pro'],
    cta: 'Commencer',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="px-4 py-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Mon Dressing</h1>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              S&apos;inscrire
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <section className="px-4 py-16 text-center md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
              Votre dressing{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                intelligent
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-500 md:text-xl">
              Numérisez votre garde-robe, créez des tenues avec l&apos;IA et recevez
              des conseils de style personnalisés.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="w-full rounded-full bg-black px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 sm:w-auto"
              >
                Commencer gratuitement
              </Link>
              <Link
                href="#features"
                className="w-full rounded-full border border-gray-200 px-8 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Découvrir
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h3 className="mb-12 text-center text-2xl font-bold text-gray-900">
              Tout pour votre style
            </h3>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-3">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{feature.title}</h4>
                    <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
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
                        <Check className={`h-4 w-4 shrink-0 ${plan.highlighted ? 'text-green-400' : 'text-green-600'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`mt-6 block w-full rounded-full py-3 text-center text-sm font-semibold ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8">
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Mon Dressing. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
