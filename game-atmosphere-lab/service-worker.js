const CACHE_NAME = "game-atmosphere-lab-v12";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./promo.html",
  "./style.css",
  "./script.js",
  "./data.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(CORE_ASSETS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(function (networkResponse) {
            if (
              networkResponse &&
              networkResponse.ok &&
              event.request.url.includes("/portfolio/game-atmosphere-lab/")
            ) {
              const responseCopy = networkResponse.clone();

              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, responseCopy);
              });
            }

            return networkResponse;
          })
          .catch(function () {
            if (event.request.mode === "navigate") {
              return caches.match("./index.html");
            }
          });
      })
  );
});
