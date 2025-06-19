const CACHE_NAME = 'cashbudget-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/detailed.html',
  '/settings.html',
  '/debts.html',
  '/budget_tools.html',
  '/common.css',
  '/detailed.css',
  '/dashboard.css',
  '/style.css',
  '/settings.css',
  '/debts.css',
  '/budget-tools.css',
  '/index.js',
  '/detailed.js',
  '/settings.js',
  '/debts.js',
  '/budget_tools.js',
  '/common.js',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 