"use strict";
const BASE = new URL("./", self.location.href);
const PREFIX = "wasel-vue-" + BASE.pathname + "-";
const CACHE = PREFIX + "965654528452";
const FILES = ["./","assets/apple-touch-icon.png","assets/bal3d.css","assets/bal3d.js","assets/brand-transparent-VUtseKAh.svg","assets/brand-transparent.svg","assets/cairo-variable-gF84A2Tc.ttf","assets/cairo-variable.ttf","assets/favicon-32.png","assets/favicon-48.png","assets/font-0-0.ttf","assets/font-0-1.ttf","assets/font-0-2.ttf","assets/font-0-3.ttf","assets/font-1-3-B6X0AcE6.ttf","assets/font-1-3.ttf","assets/fonts.css","assets/icon-192.png","assets/icon-512.png","assets/icon-maskable-192.png","assets/icon-maskable-512.png","assets/index-BDLQ5ZeM.js","assets/index-BFd6Gvhv.css","assets/leaflet-src-BrgEbe30.js","assets/LICENSE-Material-Symbols.txt","assets/logo-mark.svg","assets/OFL-Cairo.txt","assets/OFL-IBM-Plex.txt","assets/profile-0.png","assets/wasel-brand-B1pZ3qtI.jpeg","assets/wasel-brand.jpeg","index.html","manifest.webmanifest"].map((file) => new URL(file, BASE).href);
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== CACHE &&
                (key.startsWith(PREFIX) ||
                  key.startsWith("wasel-pages-" + BASE.pathname + "-") ||
                  (BASE.pathname === "/" &&
                    (key.startsWith("wasel-platform-") ||
                      key.startsWith("wasel-shell-")))),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url),
    relative = url.pathname.slice(BASE.pathname.length);
  if (
    event.request.method !== "GET" ||
    url.origin !== BASE.origin ||
    !url.pathname.startsWith(BASE.pathname) ||
    relative.startsWith("api/") ||
    // The parent application must never cache or serve the courier app's entry.
    relative.startsWith("courier/") ||
    relative === "courier"
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response.ok)
          await cache.put(event.request, response.clone()).catch(() => {});
        return response;
      } catch {
        // Static public assets do not vary by Origin. Ignore preview-server Vary
        // headers, and match precached files when the page adds a cache-busting query.
        const saved =
          (await cache.match(event.request, { ignoreVary: true })) ||
          (await cache.match(url.origin + url.pathname, { ignoreVary: true }));
        if (saved) return saved;
        if (
          event.request.mode === "navigate" &&
          ["", "index.html", "merchant/", "merchant"].includes(relative)
        )
          return (
            (await cache.match(new URL("index.html", BASE).href)) ||
            new Response("Offline", { status: 503 })
          );
        return new Response("Offline", { status: 503 });
      }
    })(),
  );
});
