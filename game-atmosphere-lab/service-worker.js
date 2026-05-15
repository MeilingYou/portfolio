// Game Atmosphere Lab - Service Worker

const CACHE_NAME = "game-atmosphere-lab-v4";

// Main files needed for the PWA to work
const CORE_ASSETS = [
  "/portfolio/game-atmosphere-lab/",
  "/portfolio/game-atmosphere-lab/index.html",
  "/portfolio/game-atmosphere-lab/promo.html",
  "/portfolio/game-atmosphere-lab/style.css",
  "/portfolio/game-atmosphere-lab/script.js",
  "/portfolio/game-atmosphere-lab/data.json",
  "/portfolio/game-atmosphere-lab/manifest.json",
  "/portfolio/game-atmosphere-lab/icons/icon-192.png",
  "/portfolio/game-atmosphere-lab/icons/icon-512.png"
];

// Optional files for screenshots and audio
const OPTIONAL_ASSETS = [
  // Screenshots
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

  // Audio
  "/portfolio/game-atmosphere-lab/audio/cozy-pixel-farming.mp3",
  "/portfolio/game-atmosphere-lab/audio/neon-cyberpunk-city.mp3",
  "/portfolio/game-atmosphere-lab/audio/low-poly-horror.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-cute-cartoon.mp3",
  "/portfolio/game-atmosphere-lab/audio/retro-arcade.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/open-world-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/voxel-sandbox.mp3"
];

// Install: cache core files first
self.addEventListener("install", function (event) {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS).then(function () {
        // Optional assets are cached one by one.
        // If one is missing, it will not break the whole PWA install.
        return Promise.all(
          OPTIONAL_ASSETS.map(function (asset) {
            return cache.add(asset).catch(function () {
              console.log("[SW] Optional file not cached:", asset);
            });
          })
        );
      });
    })
  );

  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", function (event) {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch: use cache first, then network
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(function (networkResponse) {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(function () {
          if (event.request.destination === "document") {
            return caches.match("/portfolio/game-atmosphere-lab/index.html");
          }
        });
    })
  );
});
