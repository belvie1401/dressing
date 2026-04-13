'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5 py-8"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 44px) + 24px)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a
            href="/"
            className="font-serif text-3xl text-[#111111] no-underline"
          >
            LIEN
          </a>
          <div className="w-8 h-0.5 bg-[#C6A47E] mx-auto mt-2" />
        </div>

        <SignIn
          routing="hash"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full',
            },
          }}
        />
      </div>
    </div>
  );
}
