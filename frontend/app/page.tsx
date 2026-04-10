import Image from 'next/image';

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
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EFEFEF]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-serif text-xl text-[#111111]">LIEN</span>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Fonctionnalit&eacute;s</a>
            <a href="/stylists-pro" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">Pour les stylistes</a>
            <a href="/a-propos" className="text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">&Agrave; propos</a>
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
        {/* Hero */}
        <section className="min-h-screen flex items-center">
          <div className="mx-auto flex max-w-6xl w-full flex-col lg:flex-row">
            {/* Left column */}
            <div className="flex flex-1 flex-col justify-center px-8 lg:px-16 py-16">
              <p className="font-serif text-5xl text-[#111111] mb-4">LIEN</p>
              <h1 className="font-serif text-[48px] leading-[1.1] text-[#111111]">
                Votre dressing,<br />
                <em className="italic">connect&eacute; aux stylistes</em>
              </h1>
              <p className="mt-4 max-w-sm text-base text-[#8A8A8A]">
                Ajoutez vos v&ecirc;tements, &eacute;changez avec des stylistes et recevez des looks qui vous ressemblent.
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <a href="/register" className="rounded-full bg-[#111111] px-8 py-3 text-base text-white">
                  Commencer
                </a>
                <a href="#how" className="rounded-full border border-[#111111] px-8 py-3 text-base text-[#111111]">
                  Voir comment &ccedil;a marche
                </a>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex">
                  {[47, 32, 44, 29].map((i, idx) => (
                    <div key={i} className={`relative h-10 w-10 overflow-hidden rounded-full border-2 border-white ${idx > 0 ? '-ml-3' : ''}`}>
                      <Image src={`https://i.pravatar.cc/80?img=${i}`} alt="" fill className="object-cover" sizes="40px" />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-[#8A8A8A]">+2 000 utilisateurs conquis</span>
              </div>
            </div>

            {/* Right column */}
            <div className="hidden lg:block flex-1 relative overflow-hidden">
              <div className="relative h-full min-h-[600px] rounded-3xl overflow-hidden m-8">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=800&fit=crop"
                  alt="Mode"
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-white py-20 px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-serif text-4xl text-center mb-16 text-[#111111]">
              Comment &ccedil;a marche ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F0EDE8] mx-auto mb-6 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L8 6H3v14h18V6h-5l-4-4z" />
                    <path d="M9 14l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#111111]">Ajoutez votre dressing</h3>
                <p className="text-[#8A8A8A] text-sm leading-relaxed">Importez vos v&ecirc;tements en quelques photos.</p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F0EDE8] mx-auto mb-6 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#111111]">Trouvez un styliste</h3>
                <p className="text-[#8A8A8A] text-sm leading-relaxed">D&eacute;couvrez des profils et choisissez celui qui vous correspond.</p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#F0EDE8] mx-auto mb-6 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 11.5 8 14.5l1.5-4.5L6 7.5h4.5z" />
                    <path d="M5 19l2-3" /><path d="M19 19l-2-3" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl mb-3 text-[#111111]">Recevez vos looks</h3>
                <p className="text-[#8A8A8A] text-sm leading-relaxed">&Eacute;changez, affinez, adoptez le style qui vous sublime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Inspiration */}
        <section className="py-20">
          <div className="flex items-center justify-between px-8 mb-8 max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl text-[#111111]">De l&apos;inspiration, chaque jour</h2>
            <a href="/register" className="text-sm text-[#8A8A8A] underline whitespace-nowrap">Voir plus de looks</a>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide px-8">
            {inspirationImages.map((img, i) => (
              <div key={i} className="relative w-[200px] h-[280px] flex-shrink-0 rounded-2xl overflow-hidden">
                <Image src={img} alt={`Inspiration ${i + 1}`} fill className="object-cover" sizes="200px" />
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#111111] py-24 px-8 text-center">
          <h2 className="font-serif text-4xl text-white">
            Pr&ecirc;t&middot;e &agrave; r&eacute;inventer votre style ?
          </h2>
          <p className="text-[#CFCFCF] mt-4 text-lg">
            Rejoignez une communaut&eacute; de passionn&eacute;s de mode et de stylistes professionnels.
          </p>
          <a href="/register" className="mt-8 inline-block bg-white text-[#111111] rounded-full px-10 py-4 text-base font-medium">
            Cr&eacute;er mon compte gratuitement
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <span className="font-serif text-white">LIEN</span>
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
