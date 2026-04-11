'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import TutorialTooltip, { type TooltipPosition } from './TutorialTooltip';

// ─── Step definitions ────────────────────────────────────────────────────────

type SpotlightStep = {
  kind: 'spotlight';
  selector: string;
  position: TooltipPosition;
  title: string;
  description: string;
};

type WelcomeStep = { kind: 'welcome' };
type FinalStep = { kind: 'final' };

type Step = WelcomeStep | SpotlightStep | FinalStep;

const STEPS: Step[] = [
  { kind: 'welcome' },
  {
    kind: 'spotlight',
    selector: '[data-tour="stylist-stats"]',
    position: 'bottom',
    title: 'Vos statistiques en temps r\u00e9el',
    description:
      'Suivez vos clientes actives, looks cr\u00e9\u00e9s, taux de satisfaction et revenus. Tout est mis \u00e0 jour en direct.',
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="clients-nav"]',
    position: 'right',
    title: 'G\u00e9rez vos clientes',
    description:
      'Acc\u00e9dez au dressing complet de chaque cliente. Voyez leurs pi\u00e8ces, leurs pr\u00e9f\u00e9rences, et composez des looks sur mesure.',
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="clients-grid"]',
    position: 'top',
    title: 'Le dressing de vos clientes',
    description:
      "Chaque cliente partage sa garde-robe avec vous. Vous voyez chaque pi\u00e8ce et pouvez cr\u00e9er des tenues avec ce qu'elles poss\u00e8dent d\u00e9j\u00e0.",
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="agenda-nav"]',
    position: 'right',
    title: 'G\u00e9rez votre agenda',
    description:
      'Acceptez des r\u00e9servations, envoyez des liens Zoom, g\u00e9rez vos cr\u00e9neaux. Votre agenda professionnel centralis\u00e9.',
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="messages-nav"]',
    position: 'right',
    title: 'Communiquez en direct',
    description:
      "\u00c9changez avec vos clientes, partagez des lookbooks, recevez des retours instantan\u00e9ment. Le chat est au c\u0153ur du service.",
  },
  { kind: 'final' },
];

const TOTAL = STEPS.length;

// ─── Component ───────────────────────────────────────────────────────────────

interface StylistTutorialProps {
  firstName?: string;
  onClose: () => void;
}

export default function StylistTutorial({ firstName = '', onClose }: StylistTutorialProps) {
  const router = useRouter();
  const completeTutorial = useAuthStore((s) => s.completeTutorial);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const step = STEPS[stepIdx];
    if (step.kind === 'spotlight') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [stepIdx]);

  const finish = useCallback(() => {
    completeTutorial('stylist_dashboard');
    onClose();
  }, [completeTutorial, onClose]);

  const advance = useCallback(() => {
    setStepIdx((i) => {
      if (i >= TOTAL - 1) {
        completeTutorial('stylist_dashboard');
        onClose();
        return i;
      }
      return i + 1;
    });
  }, [completeTutorial, onClose]);

  const step = STEPS[stepIdx];

  // ─── Welcome modal ─────────────────────────────────────────────────────
  if (step.kind === 'welcome') {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-5">
        <div className="mx-auto w-full max-w-[400px] rounded-3xl bg-white p-8 text-center shadow-2xl">
          <p className="font-serif text-3xl tracking-[0.15em] text-[#111111]">LIEN</p>
          <div className="mx-auto mb-4 mt-2 h-px w-8 bg-[#C6A47E]" />
          <h2 className="font-serif text-xl text-[#111111]">
            {firstName
              ? `Bienvenue ${firstName} sur votre espace professionnel`
              : 'Bienvenue sur votre espace professionnel'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
            LIEN vous connecte &agrave; des clientes qui recherchent votre expertise.
            Voici comment d&eacute;velopper votre activit&eacute;.
          </p>
          <div className="relative mt-4 h-32 w-full overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400"
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={advance}
            className="mt-5 w-full cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
          >
            Commencer la visite
          </button>
          <button
            type="button"
            onClick={finish}
            className="mt-3 cursor-pointer text-xs text-[#CFCFCF] hover:text-[#8A8A8A]"
          >
            Passer
          </button>
        </div>
      </div>
    );
  }

  // ─── Final modal ───────────────────────────────────────────────────────
  if (step.kind === 'final') {
    const goTo = (href: string) => {
      finish();
      router.push(href);
    };
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-5">
        <div className="mx-auto w-full max-w-[440px] rounded-3xl bg-white p-7 text-center shadow-2xl">
          <h2 className="mb-4 font-serif text-xl text-[#111111]">
            Vous &ecirc;tes pr&ecirc;t&middot;e &agrave; d&eacute;velopper votre
            client&egrave;le&nbsp;!
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <ActionCard
              label="Compl\u00e9ter mon profil"
              onClick={() => goTo('/stylist-profile')}
              icon={
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C6A47E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
                </svg>
              }
            />
            <ActionCard
              label="Inviter une cliente"
              onClick={() => goTo('/my-clients')}
              icon={
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C6A47E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="17" y1="11" x2="23" y2="11" />
                </svg>
              }
            />
            <ActionCard
              label="Cr\u00e9er un lookbook"
              onClick={() => goTo('/lookbooks/create')}
              icon={
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C6A47E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              }
            />
          </div>

          <button
            type="button"
            onClick={finish}
            className="mt-6 w-full cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
          >
            C&rsquo;est parti&nbsp;!
          </button>
        </div>
      </div>
    );
  }

  // ─── Spotlight steps (steps 2-6) ───────────────────────────────────────
  return (
    <TutorialTooltip
      step={stepIdx + 1}
      totalSteps={TOTAL}
      title={step.title}
      description={step.description}
      position={step.position}
      targetSelector={step.selector}
      onNext={advance}
      onSkip={finish}
      isLast={false}
    />
  );
}

// ─── Action card ─────────────────────────────────────────────────────────────

interface ActionCardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function ActionCard({ label, icon, onClick }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl bg-[#F0EDE8] p-4 text-center transition-colors hover:bg-[#EDE5DC]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
        {icon}
      </span>
      <span className="text-[10px] font-medium leading-tight text-[#111111]">
        {label}
      </span>
    </button>
  );
}
