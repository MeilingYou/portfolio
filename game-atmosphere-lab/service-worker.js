const CACHE_NAME = "game-atmosphere-lab-v10";
const BASE = "/portfolio/game-atmosphere-lab/";
const CORE_ASSETS = [
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
  console.log("[Service Worker] Installing v10...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.map(function (url) {
          return fetch(url, { cache: "reload" })
            .then(function (response) {
              if (response.ok) {
                return cache.put(url, response);
              }
              console.warn("[Service Worker] Could not cache:", url, response.status);
            })
            .catch(function (error) {
              console.warn("[Service Worker] Cache failed:", url, error);
            });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating v10...");
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
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

      return fetch(event.request)
        .then(function (networkResponse) {
          if (
            networkResponse &&
            networkResponse.ok &&
            event.request.url.includes(BASE)
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          if (event.request.mode === "navigate") {
            return caches.match(BASE + "index.html");
          }
        });
    })
  );
});
