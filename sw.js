const CACHE_NAME = 'cyber-todo-v4'; // Версия 4, чтобы сбросить старый мусор
const ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json',
    '/icons/icon-192.png', // Добавили сюда
    '/icons/icon-512.png'  // И сюда
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).catch(() => {
                return Response.error();
            });
        })
    );
});
