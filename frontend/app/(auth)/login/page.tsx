import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5 py-8"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)' }}
    >
      {/* LIEN Logo above card */}
      <div className="text-center mb-6">
        <a href="/">
          <img
            src="/logo.png"
            alt="LIEN"
            style={{ height: '36px', width: 'auto', margin: '0 auto', display: 'block' }}
          />
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
