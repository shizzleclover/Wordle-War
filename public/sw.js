const CACHE_NAME = 'wordle-war-v2';
const ASSETS = [
  '/manifest.json',
  '/icon-512.png',
  '/favicon.svg',
  '/icons.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle same-origin requests
  // Skip anything going to the API or Socket.IO backend
  if (url.origin !== self.location.origin || url.pathname.includes('socket.io') || url.pathname.startsWith('/api')) {
    return;
  }

  // Best practice: HTML and other assets that aren't in the static list should be Network-First or ignored by SW
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
