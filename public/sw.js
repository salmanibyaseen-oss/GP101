const CACHE_NAME = "gp101-v2";
const CONTENT_CACHE = "gp101-content-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/login"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== CONTENT_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Cache all content pages
self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_ALL_CONTENT") {
    const slugs = event.data.slugs || [];
    event.waitUntil(
      caches.open(CONTENT_CACHE).then(async (cache) => {
        for (const slug of slugs) {
          try {
            const res = await fetch(`/content/${slug}`);
            if (res.ok) await cache.put(`/content/${slug}`, res);
          } catch {}
        }
        // Notify client that caching is done
        const clients = await self.clients.matchAll();
        clients.forEach((c) => c.postMessage({ type: "CACHE_DONE" }));
      })
    );
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Network first for navigation
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CONTENT_CACHE).then((cache) =>
            cache.put(event.request, clone)
          );
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((r) => r || caches.match("/login"))
        )
    );
    return;
  }

  // Cache first for static assets
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((res) => {
            caches
              .open(CACHE_NAME)
              .then((c) => c.put(event.request, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  // Network first for everything else
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          caches
            .open(CONTENT_CACHE)
            .then((c) => c.put(event.request, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
