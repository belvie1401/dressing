'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface TutorialHelpButtonProps {
  /** Called when the user clicks "Revoir la visite guidee". */
  onRestart: () => void;
}

export default function TutorialHelpButton({ onRestart }: TutorialHelpButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Click outside / Esc to close ────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleRestart = () => {
    setOpen(false);
    onRestart();
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-3 lg:bottom-6"
    >
      {/* Menu */}
      {open ? (
        <div className="w-[220px] rounded-2xl border border-[#EFEFEF] bg-white p-4 shadow-xl">
          <p className="mb-3 font-serif text-base text-[#111111]">Aide</p>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleRestart}
              className="cursor-pointer rounded-lg px-2 py-2 text-left text-xs text-[#111111] transition-colors hover:bg-[#F0EDE8]"
            >
              Revoir la visite guid&eacute;e
            </button>
            <Link
              href="/a-propos"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg px-2 py-2 text-left text-xs text-[#111111] no-underline transition-colors hover:bg-[#F0EDE8]"
            >
              Guide de d&eacute;marrage rapide
            </Link>
            <a
              href="mailto:support@lien-style.com"
              className="cursor-pointer rounded-lg px-2 py-2 text-left text-xs text-[#111111] no-underline transition-colors hover:bg-[#F0EDE8]"
            >
              Contacter le support
            </a>
            <Link
              href="/cgv"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg px-2 py-2 text-left text-xs text-[#111111] no-underline transition-colors hover:bg-[#F0EDE8]"
            >
              CGV
            </Link>
          </div>
        </div>
      ) : null}

      {/* Floating "?" button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={'Aide et visite guid\u00e9e'}
        aria-expanded={open}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#EFEFEF] bg-white font-serif text-base text-[#111111] shadow-md transition-colors hover:bg-[#F0EDE8]"
      >
        ?
      </button>
    </div>
  );
}
