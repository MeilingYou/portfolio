const CACHE_NAME = "game-atmosphere-lab-v30";

const BASE = "/portfolio/game-atmosphere-lab/";

const ASSETS = [
  BASE,
  BASE + "index.html",
  BASE + "promo.html",
  BASE + "style.css",
  BASE + "script.js",
  BASE + "data.json",
  BASE + "manifest.json",
  BASE + "icons/icon-192.png",
  BASE + "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(function (networkResponse) {
        return networkResponse;
      }).catch(function () {
        if (event.request.mode === "navigate") {
          return caches.match(BASE + "index.html");
        }
      });
    })
  );
});
