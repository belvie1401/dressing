'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9F8F6] px-8 text-center">
      {/* Logo */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1A1A1A]">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
          <path d="M 60,78 C 38,90 8,72 12,45 C 16,18 48,8 66,28 C 78,42 68,62 50,58 C 34,54 38,36 52,34 C 62,32 60,20 54,12 C 48,4 62,4 68,16" stroke="#C6A47E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
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
