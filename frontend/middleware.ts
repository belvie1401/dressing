import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publishableKey: 'pk_test_YmVjb21pbmctc2Vhc25haWwtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA',
  secretKey: 'sk_test_pEAJoL4pZHn4MKosszwva6edqwc5RqohXgnIRZfCBN',
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
