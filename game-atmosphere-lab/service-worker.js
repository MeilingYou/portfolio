const CACHE_NAME = "game-atmosphere-lab-v20";
const BASE_PATH = "/portfolio/game-atmosphere-lab/";

const CORE_ASSETS = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "promo.html",
  BASE_PATH + "style.css",
  BASE_PATH + "script.js",
  BASE_PATH + "data.json",
  BASE_PATH + "manifest.json",
  BASE_PATH + "icons/icon-192.png",
  BASE_PATH + "icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
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
              console.log("[Service Worker] Deleting old cache:", cacheName);
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
              event.request.url.includes(BASE_PATH)
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
              return caches.match(BASE_PATH + "index.html");
            }
          });
      })
  );
});
