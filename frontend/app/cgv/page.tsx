import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — LIEN',
  description:
    'Conditions Générales de Vente de la plateforme LIEN : services, abonnements, commissions, remboursements et protection des données.',
};

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2]">
      {/* Header with logo */}
      <header className="px-5 py-6 border-b border-[#EFEFEF] bg-[#F7F5F2]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-serif text-xl text-[#111111] no-underline">LIEN</Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#111111] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Accueil
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-serif text-3xl md:text-4xl text-[#111111] leading-tight">
            Conditions G&eacute;n&eacute;rales de Vente
          </h1>
          <p className="text-sm text-[#8A8A8A] mt-3">
            Derni&egrave;re mise &agrave; jour : avril 2026
          </p>
        </div>

        {/* Article 1 */}
        <section className="pb-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 1 &mdash; Objet</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (CGV) r&eacute;gissent les relations contractuelles entre la soci&eacute;t&eacute; LIEN (ci-apr&egrave;s &laquo;&nbsp;la Plateforme&nbsp;&raquo;) et toute personne physique utilisant les services propos&eacute;s via le site lucent-melba-a4edb5.netlify.app (ci-apr&egrave;s &laquo;&nbsp;l&rsquo;Utilisateur&nbsp;&raquo;).
            </p>
            <p>
              Toute utilisation de la Plateforme implique l&rsquo;acceptation pleine et enti&egrave;re des pr&eacute;sentes CGV.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 2 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 2 &mdash; Services propos&eacute;s</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>LIEN est une plateforme de mise en relation entre :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Des clientes souhaitant b&eacute;n&eacute;ficier de conseils en style et en organisation de leur garde-robe</li>
              <li>Des stylistes professionnels proposant leurs services de conseil, cr&eacute;ation de lookbooks et accompagnement personnel</li>
            </ul>
            <p>Les services incluent notamment :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>La gestion d&rsquo;une garde-robe digitale</li>
              <li>La mise en relation avec des stylistes certifi&eacute;s</li>
              <li>La cr&eacute;ation et r&eacute;ception de lookbooks personnalis&eacute;s</li>
              <li>La communication via messagerie int&eacute;gr&eacute;e</li>
              <li>La r&eacute;servation de sessions de stylisme</li>
            </ul>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 3 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 3 &mdash; Inscription et compte utilisateur</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              L&rsquo;inscription sur LIEN est gratuite pour les clientes (offre Gratuit) et les stylistes (offre Gratuit).
            </p>
            <p>
              L&rsquo;Utilisateur s&rsquo;engage &agrave; fournir des informations exactes, compl&egrave;tes et &agrave; jour lors de son inscription.
            </p>
            <p>
              Tout compte peut &ecirc;tre suspendu ou supprim&eacute; en cas de violation des pr&eacute;sentes CGV ou des r&egrave;gles de la communaut&eacute; LIEN.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 4 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 4 &mdash; Abonnements et tarifs</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-6">
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">4.1 Offres Clientes</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-[#111111] font-medium">Gratuit</span> : 0&euro;/mois &mdash; 50 v&ecirc;tements, 5 suggestions IA/mois</li>
                <li><span className="text-[#111111] font-medium">Cliente Pro</span> : 9,99&euro;/mois &mdash; v&ecirc;tements illimit&eacute;s, suggestions illimit&eacute;es, 1 styliste connect&eacute;</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">4.2 Offres Stylistes</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="text-[#111111] font-medium">Gratuit</span> : 0&euro;/mois &mdash; jusqu&rsquo;&agrave; 3 clientes actives</li>
                <li><span className="text-[#111111] font-medium">Styliste Pro</span> : 19,99&euro;/mois &mdash; clientes illimit&eacute;es, dashboard analytique</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">4.3 Facturation</h3>
              <p>
                Les abonnements sont factur&eacute;s mensuellement par pr&eacute;l&egrave;vement automatique via notre prestataire de paiement s&eacute;curis&eacute; Stripe.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 5 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 5 &mdash; Commission LIEN sur les prestations</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              Pour chaque prestation de stylisme r&eacute;alis&eacute;e via la Plateforme, LIEN pr&eacute;l&egrave;ve une commission de 20% (vingt pour cent) du montant total de la prestation hors taxes.
            </p>
            <p>
              Le solde net (80%) est revers&eacute; au styliste dans un d&eacute;lai de 7 jours ouvr&eacute;s suivant la validation de la prestation par la cliente.
            </p>
            <p className="italic">
              Exemple : Pour une prestation &agrave; 100&euro;, LIEN per&ccedil;oit 20&euro; et le styliste re&ccedil;oit 80&euro;.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 6 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 6 &mdash; Politique d&rsquo;annulation et remboursement</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-6">
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">6.1 Annulation par la cliente</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Plus de 48h avant la session : remboursement int&eacute;gral</li>
                <li>Entre 24h et 48h : remboursement de 50%</li>
                <li>Moins de 24h : aucun remboursement</li>
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">6.2 Annulation par le styliste</h3>
              <p>
                En cas d&rsquo;annulation par le styliste, la cliente est rembours&eacute;e int&eacute;gralement dans un d&eacute;lai de 5 jours ouvr&eacute;s.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#111111] mb-2">6.3 Litiges</h3>
              <p>
                Tout litige doit &ecirc;tre signal&eacute; &agrave; <a href="mailto:support@lien-style.com" className="text-[#111111] underline">support@lien-style.com</a> dans les 7 jours suivant la prestation.
              </p>
            </div>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 7 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 7 &mdash; Propri&eacute;t&eacute; intellectuelle</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              Les lookbooks, contenus et cr&eacute;ations produits par les stylistes via LIEN restent la propri&eacute;t&eacute; intellectuelle du styliste cr&eacute;ateur.
            </p>
            <p>
              La cliente dispose d&rsquo;un droit d&rsquo;usage personnel et non commercial des lookbooks qui lui sont destin&eacute;s.
            </p>
            <p>
              LIEN se r&eacute;serve le droit d&rsquo;utiliser les cr&eacute;ations &agrave; des fins de promotion de la Plateforme, avec accord pr&eacute;alable du styliste.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 8 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 8 &mdash; Protection des donn&eacute;es (RGPD)</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              LIEN collecte et traite les donn&eacute;es personnelles de ses utilisateurs dans le respect du R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD).
            </p>
            <p>
              <span className="text-[#111111] font-medium">Donn&eacute;es collect&eacute;es</span> : nom, email, photos de v&ecirc;tements, pr&eacute;f&eacute;rences de style.
            </p>
            <p>
              <span className="text-[#111111] font-medium">Dur&eacute;e de conservation</span> : pendant toute la dur&eacute;e d&rsquo;activit&eacute; du compte, puis 3 ans apr&egrave;s sa suppression.
            </p>
            <p>
              <span className="text-[#111111] font-medium">Droits</span> : acc&egrave;s, rectification, suppression sur demande &agrave; <a href="mailto:privacy@lien-style.com" className="text-[#111111] underline">privacy@lien-style.com</a>
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 9 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 9 &mdash; Responsabilit&eacute;</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              LIEN agit en qualit&eacute; d&rsquo;interm&eacute;diaire technique entre clientes et stylistes.
            </p>
            <p>LIEN ne peut &ecirc;tre tenu responsable :</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>De la qualit&eacute; des conseils prodigu&eacute;s par les stylistes</li>
              <li>Des r&eacute;sultats obtenus suite aux sessions</li>
              <li>Des contenus publi&eacute;s par les utilisateurs</li>
            </ul>
            <p>
              Les stylistes sont des prestataires ind&eacute;pendants et non des salari&eacute;s de LIEN.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 10 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 10 &mdash; Modification des CGV</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              LIEN se r&eacute;serve le droit de modifier les pr&eacute;sentes CGV &agrave; tout moment.
            </p>
            <p>
              Les utilisateurs seront notifi&eacute;s par email 30 jours avant toute modification substantielle.
            </p>
            <p>
              La poursuite de l&rsquo;utilisation de la Plateforme vaut acceptation des nouvelles CGV.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Article 11 */}
        <section className="py-10">
          <h2 className="font-serif text-2xl text-[#111111] mb-4">Article 11 &mdash; Droit applicable et juridiction</h2>
          <div className="text-[#8A8A8A] text-[15px] leading-relaxed space-y-4">
            <p>
              Les pr&eacute;sentes CGV sont soumises au droit fran&ccedil;ais.
            </p>
            <p>
              En cas de litige, les parties s&rsquo;engagent &agrave; rechercher une solution amiable avant tout recours judiciaire.
            </p>
            <p>
              &Agrave; d&eacute;faut, le litige sera port&eacute; devant les tribunaux comp&eacute;tents de Paris.
            </p>
          </div>
        </section>

        <div className="border-t border-[#EFEFEF]" />

        {/* Contact footer */}
        <section className="pt-10 pb-4">
          <p className="text-sm text-[#8A8A8A]">
            Contact : <a href="mailto:legal@lien-style.com" className="text-[#111111] underline">legal@lien-style.com</a>
          </p>
          <p className="text-sm text-[#8A8A8A] mt-2">LIEN &mdash; 2026</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] border-t border-[#222] py-8 px-8 mt-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <Link href="/" className="font-serif text-white no-underline">LIEN</Link>
          <p className="text-sm text-[#8A8A8A]">
            &copy; {new Date().getFullYear()} Lien. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center gap-6">
            <a href="/pricing" className="text-sm text-[#8A8A8A] hover:text-white">Tarifs</a>
            <a href="/cgv" className="text-sm text-[#8A8A8A] hover:text-white">CGV</a>
            <a href="/confidentialite" className="text-sm text-[#8A8A8A] hover:text-white">Confidentialit&eacute;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
