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

  /* GitHub Pages 发 cache-control: max-age=600——10 分钟内浏览器连请求都不发,
     "网络优先"会静默命中这层 HTTP 缓存,发布的修复要等 10 分钟才看得到。
     HTML 页面绕开它(no-store),音频等大文件保持默认缓存。 */
  const isPage = req.mode === "navigate" || req.destination === "document";

  event.respondWith(
    fetch(req, isPage ? { cache: "no-store" } : undefined)
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
