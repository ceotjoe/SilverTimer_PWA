const CACHE_NAME = 'silvertimer-cache-v1';
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
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
