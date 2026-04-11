'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store';

// ─── Types ────────────────────────────────────────────────────────────────────

type Side = 'center' | 'right' | 'below';

type TourStep = {
  selector: string | null;
  side: Side;
  title: string;
  description?: string;
};

type ElemRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
  // Step 1 — Welcome modal
  { selector: null, side: 'center', title: '__welcome__' },
  // Step 2 — Mon dressing nav
  {
    selector: '[data-tour="wardrobe-nav"]',
    side: 'right',
    title: 'Votre garde-robe digitale',
    description:
      "Photographiez vos vêtements et créez votre dressing virtuel. L’IA analyse chaque pièce automatiquement.",
  },
  // Step 3 — Mes looks section
  {
    selector: '[data-tour="mes-looks"]',
    side: 'below',
    title: 'Composez vos looks',
    description:
      "Assemblez vos pièces pour créer des tenues complètes. Planifiez votre semaine en avance.",
  },
  // Step 4 — Stylistes nav
  {
    selector: '[data-tour="stylists-nav"]',
    side: 'right',
    title: 'Votre styliste personnel',
    description:
      "Connectez-vous à un styliste pro qui accède à votre dressing et compose des looks sur mesure pour vous.",
  },
  // Step 5 — Calendrier nav
  {
    selector: '[data-tour="calendar-nav"]',
    side: 'right',
    title: 'Planifiez votre semaine',
    description:
      "Assignez une tenue à chaque jour. Ne perdez plus de temps le matin à choisir quoi porter.",
  },
  // Step 6 — Done modal
  { selector: null, side: 'center', title: '__done__' },
];

const TOOLTIP_W = 280;
const SPOTLIGHT_PAD = 10;
const TOOLTIP_GAP = 18;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const completeTour = useAuthStore((s) => s.completeTour);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<ElemRect | null>(null);

  const step = STEPS[stepIdx];
  const total = STEPS.length;
  const isLast = stepIdx === total - 1;

  // ── Prevent body scroll ──
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Measure target element ──
  useEffect(() => {
    if (!step.selector) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(step.selector!);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stepIdx, step.selector]);

  const finish = useCallback(() => {
    completeTour();
    onComplete();
  }, [completeTour, onComplete]);

  const advance = () => {
    if (isLast) {
      finish();
    } else {
      setStepIdx((i) => i + 1);
    }
  };

  // ── Step 1 — Welcome modal ──
  if (stepIdx === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <p className="font-serif text-2xl tracking-[0.15em] text-[#111111]">LIEN</p>
          <div className="relative mt-4 h-40 w-full overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300"
              alt=""
              fill
              sizes="360px"
              className="object-cover"
            />
          </div>
          <h2 className="mt-4 font-serif text-2xl text-[#111111]">
            Bienvenue sur LIEN&nbsp;!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
            Votre dressing intelligent vous attend. Laissez-nous vous guider en
            quelques &eacute;tapes.
          </p>
          <button
            type="button"
            onClick={advance}
            className="mt-6 w-full cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
          >
            D&eacute;couvrir LIEN &rarr;
          </button>
        </div>
      </div>
    );
  }

  // ── Step 6 — Done modal ──
  if (stepIdx === total - 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="font-serif text-2xl text-[#111111]">
            Vous &ecirc;tes pr&ecirc;t&middot;e&nbsp;!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A8A8A]">
            Voici quelques actions pour bien commencer&nbsp;:
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link
              href="/wardrobe/add"
              onClick={finish}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#F0EDE8] px-4 py-2.5 text-sm text-[#111111]"
            >
              &#10133; Ajouter un v&ecirc;tement
            </Link>
            <Link
              href="/stylists"
              onClick={finish}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#F0EDE8] px-4 py-2.5 text-sm text-[#111111]"
            >
              &#128269; Trouver un styliste
            </Link>
            <Link
              href="/outfits/create"
              onClick={finish}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#F0EDE8] px-4 py-2.5 text-sm text-[#111111]"
            >
              &#128247; Cr&eacute;er un look
            </Link>
          </div>
          <button
            type="button"
            onClick={finish}
            className="mt-5 w-full cursor-pointer rounded-full bg-[#111111] py-3 text-sm font-semibold text-white"
          >
            C&rsquo;est parti&nbsp;!
          </button>
        </div>
      </div>
    );
  }

  // ── Steps 2-5 — Spotlight + Tooltip ──
  const hasTarget = rect !== null;

  // Spotlight box dimensions
  const spotTop = hasTarget ? rect!.top - SPOTLIGHT_PAD : 0;
  const spotLeft = hasTarget ? rect!.left - SPOTLIGHT_PAD : 0;
  const spotW = hasTarget ? rect!.width + SPOTLIGHT_PAD * 2 : 0;
  const spotH = hasTarget ? rect!.height + SPOTLIGHT_PAD * 2 : 0;

  // Safe window dimensions (client-only)
  const wh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const ww = typeof window !== 'undefined' ? window.innerWidth : 1200;

  // Compute tooltip position
  let tooltipTop = 0;
  let tooltipLeft = 0;
  let arrowSide: 'left' | 'top' | null = null;

  if (hasTarget && rect) {
    if (step.side === 'right') {
      tooltipTop = Math.max(8, Math.min(
        rect.top + rect.height / 2 - 90,
        wh - 240
      ));
      tooltipLeft = rect.left + rect.width + SPOTLIGHT_PAD + TOOLTIP_GAP;
      // If tooltip goes off-screen right, flip to left
      if (tooltipLeft + TOOLTIP_W > ww - 8) {
        tooltipLeft = rect.left - TOOLTIP_W - TOOLTIP_GAP;
        arrowSide = null; // right arrow, but keep null for simplicity
      } else {
        arrowSide = 'left';
      }
    } else if (step.side === 'below') {
      tooltipTop = rect.top + rect.height + SPOTLIGHT_PAD + TOOLTIP_GAP;
      tooltipLeft = Math.max(8, Math.min(
        rect.left + rect.width / 2 - TOOLTIP_W / 2,
        ww - TOOLTIP_W - 8
      ));
      arrowSide = 'top';
    }
  } else {
    // Fallback: center of screen
    tooltipTop = wh / 2 - 100;
    tooltipLeft = ww / 2 - TOOLTIP_W / 2;
  }

  return (
    <>
      {/* Dark backdrop — only when no spotlight (fallback) */}
      {!hasTarget && (
        <div className="fixed inset-0 z-40 bg-black/55" />
      )}

      {/* Spotlight highlight box */}
      {hasTarget && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 14,
            // Box-shadow creates dark overlay around the spotlight
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            outline: '3px solid #C6A47E',
            outlineOffset: 3,
            pointerEvents: 'none',
            zIndex: 50,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          width: TOOLTIP_W,
          zIndex: 51,
        }}
        className="rounded-2xl bg-white p-5 shadow-xl"
      >
        {/* Arrow — left (tooltip is to the right of element) */}
        {arrowSide === 'left' && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: -9,
              top: '50%',
              marginTop: -9,
              width: 0,
              height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderRight: '9px solid white',
            }}
          />
        )}
        {/* Arrow — top (tooltip is below element) */}
        {arrowSide === 'top' && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -9,
              left: '50%',
              marginLeft: -9,
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '9px solid white',
            }}
          />
        )}

        {/* Step indicator */}
        <p className="text-xs text-[#8A8A8A]">
          {stepIdx + 1} / {total}
        </p>

        {/* Title */}
        <h3 className="mt-2 font-serif text-base text-[#111111]">
          {step.title}
        </h3>

        {/* Description */}
        {step.description && (
          <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">
            {step.description}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="cursor-pointer text-xs text-[#8A8A8A] hover:text-[#111111]"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={advance}
            className="cursor-pointer rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white"
          >
            {isLast ? 'Commencer !' : 'Suivant →'}
          </button>
        </div>
      </div>
    </>
  );
}
