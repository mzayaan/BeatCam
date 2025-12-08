// BeatCam Service Worker

const CACHE_NAME = "beatcam-v1";

const ASSETS_TO_CACHE = [
    "index.html",
    "capture.html",
    "studio.html",
    "library.html",
    "settings.html",
    "about.html",

    "manifest.json",
    "offline.html",
    "service-worker.js",
    "pwa-init.js",

    "assets/css/main.css",
    "assets/js/app.js"
];

// Install event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching assets...");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Fetch event
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cacheRes) => {
            return (
                cacheRes ||
                fetch(event.request).catch(() => {
                    return caches.match("offline.html");
                })
            );
        })
    );
});

// Activate event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});
