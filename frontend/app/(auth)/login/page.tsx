import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5 py-8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)' }}
    >
      {/* LIEN Logo above card */}
      <div className="text-center mb-6">
        <a href="/" className="flex items-center justify-center gap-2" style={{ flexDirection: 'row' }}>
          <img src="/logo.png" alt="LIEN" style={{ height: '32px', width: 'auto', maxWidth: '32px', display: 'block', flexShrink: 0 }} />
          <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '18px', color: '#111111', fontWeight: '400', letterSpacing: '0.05em', whiteSpace: 'nowrap', lineHeight: '1' }}>Lien</span>
        </a>
        <div
          style={{
            width: '32px',
            height: '2px',
            backgroundColor: '#C6A47E',
            margin: '10px auto 0',
          }}
        />
      </div>

      {/* Clerk SignIn — keeps auth logic intact */}
      <div className="w-full" style={{ maxWidth: '400px' }}>
        <SignIn
          routing="hash"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/onboarding"
          signUpFallbackRedirectUrl="/onboarding"
        />
      </div>

      {/* CGV link below */}
      <p className="text-xs text-[#CFCFCF] mt-6 text-center">
        En vous connectant, vous acceptez nos{' '}
        <a href="/cgv" className="underline text-[#8A8A8A]">
          CGV
        </a>
      </p>
    </div>
  );
}
