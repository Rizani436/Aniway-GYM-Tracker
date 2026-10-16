const CACHE = 'aniway-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Cache-first untuk asset immutable (_next/static) + image same-origin.
// Request lain pass-through.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isStatic = url.origin === location.origin && url.pathname.startsWith('/_next/static/');
  const isImage = url.origin === location.origin && request.destination === 'image';
  if (!isStatic && !isImage) return;

  if (isStatic) {
    // Immutable: cache-first tanpa network.
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }))
    );
  } else {
    // Image: network-first, fallback cache saat offline.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
  }
});
