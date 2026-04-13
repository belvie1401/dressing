import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_YmVjb21pbmctc2Vhc25haWwtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA',
    CLERK_SECRET_KEY: 'sk_test_pEAJoL4pZHn4MKosszwva6edqwc5RqohXgnIRZfCBN',
  },
};

export default nextConfig;
