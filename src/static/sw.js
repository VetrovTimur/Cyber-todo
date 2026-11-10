const CACHE_NAME = 'cyber-todo-v6';
const ASSETS = [
    './',
    './index.html',
    './login.html',
    './css/style.css',
    './js/main.js',
    './manifest.json',
    './icon.svg'
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
    self.clients.claim(); // <-- ВОТ ОНА, МАГИЯ МГНОВЕННОГО ОБНОВЛЕНИЯ
});

self.addEventListener('fetch', (e) => {
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(e.request))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                return cachedResponse || fetch(e.request);
            })
        );
    }
});
