const CACHE = "alea-terrain-v2";
const BASE = self.registration.scope;
const TILES = "alea-tiles-v1";
const TILE_HOST = "wmts.geo.admin.ch";
const TILE_MAX = 3000;

async function trimTiles(cache) {
  const keys = await cache.keys();
  if (keys.length > TILE_MAX) await Promise.all(keys.slice(0, keys.length - TILE_MAX + 200).map((key) => cache.delete(key)));
}

// Fond de carte swisstopo : cache d'abord, puis réseau (les tuiles vues restent disponibles hors ligne).
async function tileResponse(request) {
  const cache = await caches.open(TILES);
  const hit = await cache.match(request.url);
  if (hit) return hit;
  try {
    const response = await fetch(request.url, { mode: "cors" });
    if (response.ok) {
      cache.put(request.url, response.clone()).then(() => trimTiles(cache)).catch(() => {});
    }
    return response;
  } catch {
    try {
      return await fetch(request);
    } catch {
      return new Response("", { status: 504 });
    }
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([BASE, BASE + "favicon.svg", BASE + "formulaire-storme.pdf"])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== TILES).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.hostname === TILE_HOST) {
    event.respondWith(tileResponse(request));
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const hit = await caches.match(request);
        if (hit) return hit;
        if (request.mode === "navigate") {
          const home = await caches.match(BASE);
          if (home) return home;
        }
        return new Response("Hors ligne", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
      }),
  );
});
