'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TutorialTooltipProps {
  /** 1-indexed step number */
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  position: TooltipPosition;
  /**
   * CSS selector for the element to highlight. The component measures it on
   * mount + window resize. Cross-component refs are awkward in this codebase
   * (sidebar items live in a different layout file), so we use selectors.
   */
  targetSelector: string;
  onNext: () => void;
  onSkip: () => void;
  isLast: boolean;
}

type Rect = { top: number; left: number; width: number; height: number };

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_W = 280;
const SPOTLIGHT_PAD = 10;
const TOOLTIP_GAP = 18;

// ─── Component ────────────────────────────────────────────────────────────────

export default function TutorialTooltip({
  step,
  totalSteps,
  title,
  description,
  position,
  targetSelector,
  onNext,
  onSkip,
  isLast,
}: TutorialTooltipProps) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [winSize, setWinSize] = useState<{ w: number; h: number }>({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // ── Measure target ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const measure = () => {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        // Make sure target is on screen so the spotlight has something to wrap.
        if (r.top < 0 || r.bottom > window.innerHeight) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      } else {
        setRect(null);
      }
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [targetSelector]);

  // ── Lock scroll while active ──────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Compute layout ────────────────────────────────────────────────────────
  const hasTarget = rect !== null;

  const spotTop = hasTarget ? rect!.top - SPOTLIGHT_PAD : 0;
  const spotLeft = hasTarget ? rect!.left - SPOTLIGHT_PAD : 0;
  const spotW = hasTarget ? rect!.width + SPOTLIGHT_PAD * 2 : 0;
  const spotH = hasTarget ? rect!.height + SPOTLIGHT_PAD * 2 : 0;

  let tooltipTop = winSize.h / 2 - 100;
  let tooltipLeft = winSize.w / 2 - TOOLTIP_W / 2;
  let arrow: 'left' | 'right' | 'top' | 'bottom' | null = null;

  if (hasTarget && rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const placements: Record<TooltipPosition, () => void> = {
      right: () => {
        tooltipLeft = rect.left + rect.width + SPOTLIGHT_PAD + TOOLTIP_GAP;
        tooltipTop = clamp(cy - 70, 12, winSize.h - 220);
        arrow = 'left';
      },
      left: () => {
        tooltipLeft = rect.left - SPOTLIGHT_PAD - TOOLTIP_GAP - TOOLTIP_W;
        tooltipTop = clamp(cy - 70, 12, winSize.h - 220);
        arrow = 'right';
      },
      bottom: () => {
        tooltipTop = rect.top + rect.height + SPOTLIGHT_PAD + TOOLTIP_GAP;
        tooltipLeft = clamp(cx - TOOLTIP_W / 2, 12, winSize.w - TOOLTIP_W - 12);
        arrow = 'top';
      },
      top: () => {
        tooltipTop = rect.top - SPOTLIGHT_PAD - TOOLTIP_GAP - 200;
        tooltipLeft = clamp(cx - TOOLTIP_W / 2, 12, winSize.w - TOOLTIP_W - 12);
        arrow = 'bottom';
      },
    };

    placements[position]();

    // ── Overflow flip / clamp ─────────────────────────────────────────────
    if (tooltipLeft + TOOLTIP_W > winSize.w - 12) {
      // Flip right→left when tooltip would clip the right edge
      if (position === 'right') {
        tooltipLeft = rect.left - SPOTLIGHT_PAD - TOOLTIP_GAP - TOOLTIP_W;
        arrow = 'right';
      } else {
        tooltipLeft = winSize.w - TOOLTIP_W - 12;
      }
    }
    if (tooltipLeft < 12) {
      if (position === 'left') {
        tooltipLeft = rect.left + rect.width + SPOTLIGHT_PAD + TOOLTIP_GAP;
        arrow = 'left';
      } else {
        tooltipLeft = 12;
      }
    }
    if (tooltipTop < 12) {
      if (position === 'top') {
        tooltipTop = rect.top + rect.height + SPOTLIGHT_PAD + TOOLTIP_GAP;
        arrow = 'top';
      } else {
        tooltipTop = 12;
      }
    }
    if (tooltipTop + 200 > winSize.h - 12) {
      tooltipTop = Math.max(12, winSize.h - 220);
    }
  }

  return (
    <>
      {/* ─── Spotlight (fallback dim if no target) ────────────────────── */}
      {hasTarget ? (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            top: spotTop,
            left: spotLeft,
            width: spotW,
            height: spotH,
            borderRadius: 14,
            // box-shadow trick = dark overlay everywhere except the spotlight
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            outline: '2px solid #C6A47E',
            outlineOffset: 3,
            pointerEvents: 'none',
            zIndex: 999,
          }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{ background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
        />
      )}

      {/* ─── Tooltip card ─────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label={title}
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          width: TOOLTIP_W,
          maxWidth: TOOLTIP_W,
          zIndex: 1001,
          pointerEvents: 'auto',
        }}
        className="rounded-2xl border border-[#EFEFEF] bg-white p-5 shadow-xl"
      >
        {/* Arrow ─ pointing toward the highlighted element */}
        {arrow ? <Arrow side={arrow} /> : null}

        {/* Step indicator dots */}
        <div className="mb-3 flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const idx = i + 1;
            return (
              <span
                key={idx}
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  idx <= step ? 'bg-[#111111]' : 'bg-[#CFCFCF]'
                }`}
              />
            );
          })}
        </div>

        <h3 className="font-serif text-base text-[#111111]">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-[#8A8A8A]">{description}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="cursor-pointer text-xs text-[#CFCFCF] hover:text-[#8A8A8A]"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={onNext}
            className="cursor-pointer rounded-full bg-[#111111] px-4 py-2 text-xs font-medium text-white"
          >
            {isLast ? "C'est parti !" : 'Suivant \u2192'}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function Arrow({ side }: { side: 'left' | 'right' | 'top' | 'bottom' }) {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 12,
    height: 12,
    background: 'white',
    transform: 'rotate(45deg)',
  };
  const styles: Record<typeof side, React.CSSProperties> = {
    left: {
      ...base,
      left: -6,
      top: '50%',
      marginTop: -6,
      borderLeft: '1px solid #EFEFEF',
      borderBottom: '1px solid #EFEFEF',
    },
    right: {
      ...base,
      right: -6,
      top: '50%',
      marginTop: -6,
      borderRight: '1px solid #EFEFEF',
      borderTop: '1px solid #EFEFEF',
    },
    top: {
      ...base,
      top: -6,
      left: '50%',
      marginLeft: -6,
      borderLeft: '1px solid #EFEFEF',
      borderTop: '1px solid #EFEFEF',
    },
    bottom: {
      ...base,
      bottom: -6,
      left: '50%',
      marginLeft: -6,
      borderRight: '1px solid #EFEFEF',
      borderBottom: '1px solid #EFEFEF',
    },
  };
  return <div aria-hidden style={styles[side]} />;
}
