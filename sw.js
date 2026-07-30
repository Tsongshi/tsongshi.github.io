/* Service Worker: 网络优先,失败回退缓存(离线可用)。
   无预缓存清单,访问过的页面自动进缓存,发布新版本无需改本文件。 */
const RUNTIME = "runtime-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== RUNTIME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => {
          if (hit) return hit;
          return new Response("离线状态,且此页尚未缓存。请联网后重试。", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
      )
  );
});
