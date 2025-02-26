const CACHE_NAME = 'silvertimer-cache-v1'; // Keep this static unless automating versioning
const urlsToCache = [
    '/SilverTimer_PWA/',
    '/SilverTimer_PWA/index.html',
    '/SilverTimer_PWA/styles.css',
    '/SilverTimer_PWA/app.js',
    '/SilverTimer_PWA/manifest.json',
    '/SilverTimer_PWA/alarm.mp3',
    '/SilverTimer_PWA/locales/en.json',
    '/SilverTimer_PWA/locales/de.json',
    '/SilverTimer_PWA/devices.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // Immediately activate the new service worker
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
