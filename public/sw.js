// Minimal service worker: the fetch handler makes the app installable.
// It is intentionally network-only — no caching, so recipe/localStorage
// behaviour and deploys are never stale.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No respondWith: requests fall through to the network as usual.
});
