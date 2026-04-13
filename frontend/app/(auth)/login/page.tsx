import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center px-5">
      <SignIn
        routing="hash"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      />
    </div>
  );
}
