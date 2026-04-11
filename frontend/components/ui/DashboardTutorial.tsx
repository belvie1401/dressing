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
    selector: '[data-tour="wardrobe-nav"]',
    position: 'right',
    title: 'Votre garde-robe digitale',
    description:
      "Photographiez vos v\u00eatements ici. L'IA les analyse automatiquement\u00a0: couleur, cat\u00e9gorie, mati\u00e8re. Jusqu'\u00e0 50 pi\u00e8ces en version gratuite.",
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="look-du-jour"]',
    position: 'bottom',
    title: 'Votre look quotidien',
    description:
      "Planifiez vos tenues \u00e0 l'avance. L'IA vous sugg\u00e8re un look en fonction de la m\u00e9t\u00e9o et de vos \u00e9v\u00e9nements du jour.",
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="cette-semaine"]',
    position: 'bottom',
    title: 'Planifiez votre semaine',
    description:
      'Assignez une tenue \u00e0 chaque jour. Plus jamais de stress le matin. Vos matins gagnent 10\u00a0minutes.',
  },
  {
    kind: 'spotlight',
    selector: '[data-tour="stylists-nav"]',
    position: 'right',
    title: 'Votre styliste personnel',
    description:
      'Connectez-vous \u00e0 un styliste pro qui acc\u00e8de \u00e0 votre dressing et cr\u00e9e des looks sur mesure avec vos propres v\u00eatements.',
  },
  { kind: 'final' },
];

const TOTAL = STEPS.length;

// ─── Component ───────────────────────────────────────────────────────────────

interface DashboardTutorialProps {
  firstName?: string;
  onClose: () => void;
}

export default function DashboardTutorial({ firstName = '', onClose }: DashboardTutorialProps) {
  const router = useRouter();
  const completeTutorial = useAuthStore((s) => s.completeTutorial);
  const [stepIdx, setStepIdx] = useState(0);

  // ── Lock body scroll on welcome / final modals (TutorialTooltip handles
  //    its own scroll lock for spotlight steps)
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
    completeTutorial('client_dashboard');
    onClose();
  }, [completeTutorial, onClose]);

  const advance = useCallback(() => {
    setStepIdx((i) => {
      if (i >= TOTAL - 1) {
        // last step → finish
        completeTutorial('client_dashboard');
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
        <div className="mx-auto w-full max-w-[360px] rounded-3xl bg-white p-8 text-center shadow-2xl">
          <p className="font-serif text-3xl tracking-[0.15em] text-[#111111]">LIEN</p>
          <div className="mx-auto mb-4 mt-2 h-px w-8 bg-[#C6A47E]" />
          <h2 className="font-serif text-xl text-[#111111]">
            {firstName ? `Bienvenue ${firstName} !` : 'Bienvenue !'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
            Votre dressing intelligent est pr&ecirc;t. D&eacute;couvrez toutes les
            fonctionnalit&eacute;s en 2&nbsp;minutes.
          </p>
          <div className="relative mt-4 h-32 w-full overflow-hidden rounded-2xl">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400"
              alt=""
              fill
              sizes="360px"
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

  // ─── Final modal with action cards ─────────────────────────────────────
  if (step.kind === 'final') {
    const goTo = (href: string) => {
      finish();
      router.push(href);
    };
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-5">
        <div className="mx-auto w-full max-w-[400px] rounded-3xl bg-white p-7 text-center shadow-2xl">
          <h2 className="mb-4 font-serif text-xl text-[#111111]">
            Tout est pr&ecirc;t&nbsp;!
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <ActionCard
              label="Ajouter un v\u00eatement"
              onClick={() => goTo('/wardrobe/add')}
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
                  <path d="M12 2C12 2 8 2 8 6H4l1 14h14l1-14h-4c0-4-4-4-4-4z" />
                  <line x1="8" y1="6" x2="8" y2="8" />
                  <line x1="16" y1="6" x2="16" y2="8" />
                </svg>
              }
            />
            <ActionCard
              label="Trouver un styliste"
              onClick={() => goTo('/stylists')}
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
                  <path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.5 7.1 18.2 8 12.7 4 8.8l5.6-.8z" />
                </svg>
              }
            />
            <ActionCard
              label="Planifier un look"
              onClick={() => goTo('/calendar')}
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
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
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

  // ─── Spotlight step (steps 2-5) ────────────────────────────────────────
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
      <span className="text-[10px] font-medium text-[#111111] leading-tight">{label}</span>
    </button>
  );
}
