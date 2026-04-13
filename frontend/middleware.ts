import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/pricing(.*)',
  '/a-propos(.*)',
  '/pour-les-stylistes(.*)',
  '/cgv(.*)',
  '/auth/(.*)',
  '/onboarding(.*)',
  '/offline(.*)',
  '/parrainage(.*)',
  '/stylists-pro(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // Authenticated users trying to access login/register → send to dashboard
  if (userId && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Unauthenticated users trying to access protected routes → send to login
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.webmanifest$).*)',
  ],
};
