'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { setClerkTokenGetter } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

/**
 * Bridges the Clerk session token into the api.ts module so that
 * every `api.get()` / `api.post()` call automatically uses the
 * Clerk Bearer token. Also triggers the initial DB user load.
 *
 * Render this component once inside the authenticated layout.
 */
export default function ClerkTokenSync() {
  const { getToken, isSignedIn } = useAuth();
  const synced = useRef(false);

  // Set the token getter as early as possible
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  // Once signed in, load the DB user profile (only once)
  useEffect(() => {
    if (isSignedIn && !synced.current) {
      synced.current = true;
      useAuthStore.getState().loadUser();
    }
  }, [isSignedIn]);

  return null;
}
