import { clerkMiddleware } from '@clerk/nextjs/server';

// Bare clerkMiddleware — no redirect logic.
// Its only job is to attach the Clerk session to every request
// so that auth() works inside server components.
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.webmanifest$|sw\\.js$).*)',
  ],
};
