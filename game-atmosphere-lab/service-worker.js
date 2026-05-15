const CACHE_NAME = "game-atmosphere-lab-v7";

const CORE_ASSETS = [
  "/portfolio/game-atmosphere-lab/",
  "/portfolio/game-atmosphere-lab/index.html",
  "/portfolio/game-atmosphere-lab/promo.html",
  "/portfolio/game-atmosphere-lab/style.css",
  "/portfolio/game-atmosphere-lab/script.js",
  "/portfolio/game-atmosphere-lab/data.json",
  "/portfolio/game-atmosphere-lab/manifest.json",

  "/portfolio/game-atmosphere-lab/docs/user-guide.html",
  "/portfolio/game-atmosphere-lab/docs/programmer-guide.html",

  "/portfolio/game-atmosphere-lab/icons/icon-192.png",
  "/portfolio/game-atmosphere-lab/icons/icon-512.png",

  "/portfolio/game-atmosphere-lab/screenshots/cozy-pixel-farming-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/cozy-pixel-farming-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/cozy-pixel-farming-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/neon-cyberpunk-city-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/neon-cyberpunk-city-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/neon-cyberpunk-city-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/low-poly-horror-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/low-poly-horror-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/low-poly-horror-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/dark-cute-cartoon-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/dark-cute-cartoon-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/dark-cute-cartoon-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/retro-arcade-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/retro-arcade-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/retro-arcade-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/dark-fantasy-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/dark-fantasy-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/dark-fantasy-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/open-world-fantasy-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/open-world-fantasy-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/open-world-fantasy-3.jpg",

  "/portfolio/game-atmosphere-lab/screenshots/voxel-sandbox-1.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/voxel-sandbox-2.jpg",
  "/portfolio/game-atmosphere-lab/screenshots/voxel-sandbox-3.jpg",

  "/portfolio/game-atmosphere-lab/audio/cozy-pixel-farming.mp3",
  "/portfolio/game-atmosphere-lab/audio/neon-cyberpunk-city.mp3",
  "/portfolio/game-atmosphere-lab/audio/low-poly-horror.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-cute-cartoon.mp3",
  "/portfolio/game-atmosphere-lab/audio/retro-arcade.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/open-world-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/voxel-sandbox.mp3"
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
    caches.match(event.request, { ignoreSearch: true }).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(function (networkResponse) {
          return caches.open(CACHE_NAME).then(function (cache) {
            if (event.request.method === "GET") {
              cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
          });
        })
        .catch(function () {
          if (event.request.destination === "document") {
            return caches.match("/portfolio/game-atmosphere-lab/index.html");
          }
        });
    })
  );
});
