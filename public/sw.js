// DevSystem Service Worker v2 - Sem interceptação de scripts e HTML para evitar descompasso de chunks
const CACHE_NAME = 'devsystem-pwa-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Navegação e scripts JS/CSS SEMPRE vão direto para a rede (Network Only)
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.url.includes('/assets/')
  ) {
    return;
  }

  // Ignora chamadas para APIs e Supabase
  if (
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }
});
