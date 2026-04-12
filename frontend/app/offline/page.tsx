'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-8 text-center">
      {/* Logo */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1A1A1A]">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
          <rect x="22" y="12" width="22" height="70" rx="4" fill="#C6A47E" />
          <rect x="22" y="60" width="58" height="22" rx="4" fill="#C6A47E" />
        </svg>
      </div>

      <h1 className="font-serif text-2xl text-[#1A1A1A]" style={{ fontWeight: 500 }}>
        Pas de connexion
      </h1>
      <p className="mt-2 max-w-xs text-sm text-[#9B9B9B] leading-relaxed">
        Vérifiez votre connexion internet et réessayez.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 rounded-full bg-[#1A1A1A] px-8 py-3.5 text-sm font-medium text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
