import type { ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// ── Clerk token bridge ──────────────────────────────────────────────────────
// ClerkTokenSync sets this getter so all API calls use Clerk session tokens.
let _clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(fn: () => Promise<string | null>) {
  _clerkTokenGetter = fn;
}

export async function getClerkToken(): Promise<string | null> {
  if (_clerkTokenGetter) {
    return _clerkTokenGetter();
  }
  return null;
}

// ── Core request helper ─────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getClerkToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 — session expired or invalid
    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return { success: false, error: 'Session expirée' };
    }

    const data = await res.json();

    if (!res.ok) {
      return {
        ...data,
        success: false,
        error: data.error || 'Erreur serveur',
        status: res.status,
      };
    }

    return data;
  } catch (error) {
    return { success: false, error: 'Erreur de connexion au serveur' };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
