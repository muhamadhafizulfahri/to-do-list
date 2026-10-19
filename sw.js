// ============================================================
// TaskFlow Service Worker v1.0
// Caching strategy: App Shell (Cache First) + API (Network Only)
// ============================================================

const CACHE_NAME = 'taskflow-v1';
const STATIC_CACHE = 'taskflow-static-v1';
const CDN_CACHE = 'taskflow-cdn-v1';

// App shell files to pre-cache on install
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg'
];

// CDN resources to cache on first fetch
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net'
];

// Supabase API — always go to network, never cache
const API_HOSTS = [
  'supabase.co',
  'supabase.com'
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing TaskFlow Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old versioned caches
              return (name.startsWith('taskflow-') &&
                      name !== STATIC_CACHE &&
                      name !== CDN_CACHE);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) return;

  // Strategy 1: Supabase API — Network Only
  if (API_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(networkOnly(request));
    return;
  }

  // Strategy 2: CDN Resources — Stale While Revalidate
  if (CDN_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
    return;
  }

  // Strategy 3: App Shell & Local Assets — Cache First, Network Fallback
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Default: Network first with cache fallback
  event.respondWith(networkFirst(request, STATIC_CACHE));
});

// ===== CACHING STRATEGIES =====

// Network Only — for API requests
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.log('[SW] Network request failed:', request.url);
    // Return a simple error response for API failures
    return new Response(
      JSON.stringify({ error: 'offline', message: 'Tidak ada koneksi internet' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache First — for app shell and local assets
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    // Update cache in background (silent update)
    fetchAndCache(request, cacheName);
    return cached;
  }
  return fetchAndCache(request, cacheName);
}

// Network First — default strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // For navigation requests, return the cached index.html
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate — for CDN resources
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache_open = caches.open(cacheName);
        cache_open.then((cache) => cache.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// Helper: Fetch and put in cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // If fetch fails and no cache, return offline page
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// ===== BACKGROUND SYNC (future enhancement) =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
});
