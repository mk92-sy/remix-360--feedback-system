const CACHE_NAME = 'feedback-system-v1';
const ASSETS_TO_CACHE = [
  '/feedback/',
  '/feedback/index.html',
  '/feedback/manifest.json',
  '/feedback/image/dnd_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
