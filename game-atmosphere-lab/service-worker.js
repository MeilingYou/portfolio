const CACHE_NAME = "game-atmosphere-lab-v6";
  "/portfolio/game-atmosphere-lab/index.html",
  "/portfolio/game-atmosphere-lab/promo.html",
  "/portfolio/game-atmosphere-lab/style.css",
  "/portfolio/game-atmosphere-lab/script.js",
  "/portfolio/game-atmosphere-lab/data.json",
  "/portfolio/game-atmosphere-lab/manifest.json",
  "/portfolio/game-atmosphere-lab/icons/icon-192.png",
  "/portfolio/game-atmosphere-lab/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("[Service Worker] Activating...");

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
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(function () {
        if (event.request.destination === "document") {
          return caches.match("/portfolio/game-atmosphere-lab/index.html");
        }
      });
    })
  );
});
