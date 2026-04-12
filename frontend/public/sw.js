// Lien — Service Worker
// Manual implementation compatible with Next.js 16 / Turbopack

const CACHE_NAME = 'lien-v1';
const OFFLINE_URL = '/offline';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => { /* ignore pre-cache failures */ })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension URLs
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // API calls — NetworkFirst, short TTL
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    if (isApiRequest(url)) {
      event.respondWith(networkFirst(request, 'api-cache', 60));
      return;
    }

    // Cloudinary images — CacheFirst, long TTL
    if (url.hostname.includes('cloudinary.com')) {
      event.respondWith(cacheFirst(request, 'cloudinary-cache'));
      return;
    }

    // Google Fonts — CacheFirst
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
      event.respondWith(cacheFirst(request, 'font-cache'));
      return;
    }

    // Other cross-origin — network only
    return;
  }

  // Next.js static assets (/_next/static/) — CacheFirst
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, 'next-static-cache'));
    return;
  }

  // Next.js image optimization (/_next/image) — CacheFirst
  if (url.pathname.startsWith('/_next/image')) {
    event.respondWith(cacheFirst(request, 'next-image-cache'));
    return;
  }

  // Public assets (icons, splash) — CacheFirst
  if (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/splash/')) {
    event.respondWith(cacheFirst(request, 'static-assets-cache'));
    return;
  }

  // HTML navigation — NetworkFirst with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request));
    return;
  }

  // Default — NetworkFirst
  event.respondWith(networkFirst(request, 'default-cache', 300));
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function isApiRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    (url.hostname !== self.location.hostname && !url.hostname.includes('cloudinary') && !url.hostname.includes('fonts.google'))
  );
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName, maxAgeSeconds = 60) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || Response.error();
  }
}

async function navigationHandler(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open('pages-cache');
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage || new Response('Offline', { status: 503 });
  }
}
