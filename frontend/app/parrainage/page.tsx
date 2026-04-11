'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [
  {
    num: '1',
    title: 'Partagez votre code',
    desc: 'Envoyez votre code de parrainage unique à vos amis via WhatsApp, SMS ou tout autre canal.',
  },
  {
    num: '2',
    title: 'Ils s’inscrivent',
    desc: 'Vos amis créent leur compte LIEN en utilisant votre code. C’est gratuit et sans engagement.',
  },
  {
    num: '3',
    title: 'Vous gagnez 1 mois',
    desc: 'Dès que votre ami valide son inscription, vous recevez automatiquement 1 mois gratuit sur votre abonnement.',
  },
];

export default function ParrainagePage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) {
      router.push(`/register?ref=${encodeURIComponent(clean)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFEFEF]">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="font-serif text-xl text-[#111111] no-underline">
            LIEN
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#8A8A8A] hover:text-[#111111]">
              Se connecter
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#111111] px-4 py-2 text-sm text-white"
            >
              S&rsquo;inscrire
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-[#C6A47E]">
            Programme de parrainage
          </span>
          <h1 className="font-serif text-[42px] sm:text-[52px] leading-[1.05] text-[#111111] mt-4">
            Parrainez,<br />
            <em className="italic">profitez</em>
          </h1>
          <p className="mt-5 text-base text-[#8A8A8A] leading-relaxed max-w-md mx-auto">
            Invitez vos amis sur LIEN et gagnez un mois gratuit pour chaque
            personne qui s&rsquo;inscrit avec votre code.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl text-[#111111] text-center mb-10">
            Comment &ccedil;a marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center mb-4">
                  <span className="font-serif text-xl text-white">{s.num}</span>
                </div>
                <h3 className="font-semibold text-[#111111] mb-2">{s.title}</h3>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Referral code input */}
        <section className="bg-white rounded-3xl p-8 shadow-sm max-w-lg mx-auto">
          <h2 className="font-serif text-xl text-[#111111] text-center mb-2">
            Vous avez un code de parrainage&nbsp;?
          </h2>
          <p className="text-sm text-[#8A8A8A] text-center mb-6">
            Entrez le code de votre ami pour profiter de l&rsquo;offre de bienvenue.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LIEN-XXXXXX"
              className="w-full bg-[#F0EDE8] rounded-2xl px-5 py-4 font-serif text-xl text-[#111111] text-center tracking-widest placeholder:text-[#CFCFCF] placeholder:font-sans placeholder:text-base placeholder:tracking-normal outline-none"
              style={{ letterSpacing: '3px' }}
              maxLength={12}
            />
            <button
              type="submit"
              disabled={!code.trim()}
              className="bg-[#111111] text-white rounded-full w-full py-4 text-sm font-semibold disabled:opacity-40 transition-opacity"
            >
              S&rsquo;inscrire avec ce code
            </button>
          </form>
          <p className="text-xs text-[#8A8A8A] text-center mt-4">
            Pas de code&nbsp;?{' '}
            <Link href="/register" className="text-[#111111] underline">
              Inscrivez-vous ici
            </Link>
          </p>
        </section>

        {/* Reward banner */}
        <div className="mt-10 bg-[#111111] rounded-3xl p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#C6A47E]/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C6A47E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-white">1 mois offert</h3>
          <p className="text-sm text-[#CFCFCF] mt-2 leading-relaxed">
            Pour chaque ami qui s&rsquo;inscrit avec votre code, vous gagnez un mois
            d&rsquo;abonnement gratuit, sans limite.
          </p>
          <Link
            href="/register"
            className="inline-block bg-[#C6A47E] text-[#111111] rounded-full px-8 py-3 text-sm font-semibold mt-6"
          >
            Cr&eacute;er mon compte
          </Link>
        </div>
      </main>

      <footer className="bg-[#111111] border-t border-[#222] py-8 px-5 mt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="font-serif text-white no-underline">LIEN</Link>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r&eacute;serv&eacute;s.
          </p>
          <Link href="/parrainage" className="text-sm text-[#C6A47E]">
            Programme de parrainage
          </Link>
        </div>
      </footer>
    </div>
  );
}
