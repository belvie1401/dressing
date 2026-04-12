'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'lien_pwa_dismissed';

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Don't show if already dismissed
    if (localStorage.getItem(STORAGE_KEY)) return;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window);
    setIsIOS(ios);

    if (ios) {
      // Show iOS install instructions after brief delay
      const t = setTimeout(() => setShow(true), 3500);
      return () => clearTimeout(t);
    }

    // Android / Chrome — wait for browser install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
  };

  if (!show) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-[100] rounded-2xl bg-[#1A1A1A] p-4 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-white/50 hover:text-white/80"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6A47E]">
            <span className="font-serif text-lg font-bold text-white">L</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Installer Lien</p>
            <p className="mt-1 text-xs leading-relaxed text-white/65">
              Appuyez sur{' '}
              <svg className="relative -top-px inline-block" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {' '}puis <strong className="text-white/90">«&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;»</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] rounded-2xl bg-[#1A1A1A] p-4 shadow-2xl">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-white/50 hover:text-white/80"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="flex items-center gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C6A47E]">
          <span className="font-serif text-lg font-bold text-white">L</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Installer Lien</p>
          <p className="text-xs text-white/65">Accès rapide depuis l&apos;écran d&apos;accueil</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-full bg-[#C6A47E] px-4 py-2 text-xs font-semibold text-white"
        >
          Installer
        </button>
      </div>
    </div>
  );
}
