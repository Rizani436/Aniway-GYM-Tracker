// Service worker Aniway — shell offline + antrean sinkronisasi.
// Naikkan VERSION setiap kali strategi/precache berubah (cache lama dihapus di activate).
const VERSION = 'aniway-v3';
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;

// Aset publik yang AMAN di-precache (tidak ter-gate auth).
//
// PENTING — jangan precache halaman ber-auth seperti '/workout' atau '/login':
// keduanya di-redirect middleware ke /login (307) saat tanpa sesi, dan `addAll`
// MENGIKUTI redirect itu sehingga body halaman login tersimpan di bawah kunci
// '/workout'. Akibatnya fallback offline menyajikan halaman login — menyesatkan.
// Halaman ber-auth di-cache saat benar-benar dibuka (strategi navigate di bawah).
const PRECACHE = ['/workout', '/offline.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) =>
        // Masukkan satu per satu + TOLAK respons hasil redirect, supaya cache
        // tidak pernah terisi body halaman lain (penyebab bug di atas).
        Promise.all(
          PRECACHE.map((url) =>
            fetch(url, { redirect: 'error' })
              .then((res) => (res.ok && !res.redirected ? c.put(url, res) : null))
              .catch(() => null)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Minta halaman memicu flush antrean (dipakai saat 'online' & app dibuka).
function tellClientsToSync() {
  self.clients.matchAll({ includeUncontrolled: true }).then((cs) =>
    cs.forEach((c) => c.postMessage({ type: 'FLUSH_QUEUE' }))
  );
}
self.addEventListener('message', (e) => {
  if (e.data?.type === 'FLUSH_NOW') tellClientsToSync();
});

// Background Sync (Chrome Android): kurasi antrean walau app sudah ditutup.
self.addEventListener('sync', (e) => {
  if (e.tag === 'aniway-flush') tellClientsToSync();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === location.origin;

  // Jangan pernah campur tangan permintaan Supabase (auth/DB/storage) —
  // data harus selalu segar atau gagal dengan jujur, bukan disajikan dari cache.
  if (url.hostname.endsWith('supabase.co')) return;

  // 1) Aset immutable Next: cache-first.
  if (sameOrigin && url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // 2) Navigasi halaman: network-first, fallback cache, terakhir halaman offline.
  //
  //    PENTING: hanya respons 200 non-redirect yang masuk cache. Respons 307 ->
  //    /login (yang terjadi tanpa sesi) TIDAK boleh disimpan di bawah kunci
  //    '/workout', karena fallback offline akan menyajikan halaman login.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(async () => {
          // Offline: coba halaman yang diminta, lalu shell /workout, lalu offline.html
          const hit = await caches.match(request);
          if (hit && hit.ok) return hit;
          const shell = await caches.match('/workout');
          if (shell && shell.ok) return shell;
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // 3) Gambar same-origin: network-first, fallback cache.
  if (sameOrigin && request.destination === 'image') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
  }
  // Sisanya (termasuk gambar CDN free-exercise-db): biarkan lewat.
});
