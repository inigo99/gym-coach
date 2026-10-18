// Funcionar sin conexión: páginas, de la red primero (y si no hay, la última guardada);
// el resto (JS, fuentes, imágenes con nombre versionado), de la caché y se refresca por detrás.
const CACHE = 'gym-coach-v1';
const INICIO = new URL('./', self.location).href;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(INICIO)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(INICIO, copia));
          return res;
        })
        .catch(() => caches.match(INICIO)),
    );
    return;
  }
  e.respondWith(
    caches.match(r).then((guardada) => {
      const red = fetch(r).then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(r, copia));
        }
        return res;
      });
      return guardada || red;
    }),
  );
});
