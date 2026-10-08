// Retire the short-lived separate merchant/free installations without touching data.
const base = new URL("./", self.location.href);
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("wasel-vue-" + base.pathname + "-"))
          .map((key) => caches.delete(key)),
      );
      await self.registration.unregister();
    })(),
  );
});
