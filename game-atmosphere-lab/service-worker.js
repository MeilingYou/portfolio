// Game Atmosphere Lab - Service Worker
const CACHE_NAME = "game-atmosphere-lab-v1";

// All files to cache for offline use
const ASSETS_TO_CACHE = [
  "/portfolio/game-atmosphere-lab/index.html",
  "/portfolio/game-atmosphere-lab/style.css",
  "/portfolio/game-atmosphere-lab/script.js",
  "/portfolio/game-atmosphere-lab/data.json",
  "/portfolio/game-atmosphere-lab/manifest.json",
  "/portfolio/game-atmosphere-lab/images/cozy-pixel-farming.png",
  "/portfolio/game-atmosphere-lab/images/neon-cyberpunk-city.png",
  "/portfolio/game-atmosphere-lab/images/low-poly-horror.png",
  "/portfolio/game-atmosphere-lab/images/dark-cute-cartoon.png",
  "/portfolio/game-atmosphere-lab/images/retro-arcade.png",
  "/portfolio/game-atmosphere-lab/images/dark-fantasy.png",
  "/portfolio/game-atmosphere-lab/images/open-world-fantasy.png",
  "/portfolio/game-atmosphere-lab/images/voxel-sandbox.png",
  "/portfolio/game-atmosphere-lab/audio/cozy-pixel-farming.mp3",
  "/portfolio/game-atmosphere-lab/audio/neon-cyberpunk-city.mp3",
  "/portfolio/game-atmosphere-lab/audio/low-poly-horror.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-cute-cartoon.mp3",
  "/portfolio/game-atmosphere-lab/audio/retro-arcade.mp3",
  "/portfolio/game-atmosphere-lab/audio/dark-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/open-world-fantasy.mp3",
  "/portfolio/game-atmosphere-lab/audio/voxel-sandbox.mp3",
  "/portfolio/game-atmosphere-lab/icons/icon-192.png",
  "/portfolio/game-atmosphere-lab/icons/icon-512.png"
];

// Install: cache all assets
self.addEventListener("install", event => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Caching all assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", event => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(response => {
        // Cache any new valid responses dynamically
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => {
        // If both cache and network fail, return a fallback for HTML pages
        if (event.request.destination === "document") {
          return caches.match("/portfolio/game-atmosphere-lab/index.html");
        }
      });
    })
  );
});
