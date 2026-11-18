/* ------------------------------------------------------------------
 * پنل مدیریت سایت — Service Worker
 * پوستهٔ آفلاین + کش دارایی‌های استاتیک.
 * APIهای مدیریتی (Identity / Git Gateway / api.netlify.com) دست‌نخورده می‌مانند.
 * ------------------------------------------------------------------ */

const VERSION = "v1";
const SHELL_CACHE = `admin-shell-${VERSION}`;
const STATIC_CACHE = `admin-static-${VERSION}`;

/** پوستهٔ اصلی پنل — همیشه با آخرین نسخهٔ آنلاین همگام می‌شود (network-first) */
const SHELL_URLS = [
  "/admin/",
  "/admin/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/images/brand/logo-mark.webp",
  "/images/brand/logo-lockup.webp",
];

const STATIC_PREFIXES = ["/admin", "/icon", "/apple-touch-icon", "/images/brand"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, STATIC_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

function offlinePage() {
  const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>اتصال برقرار نیست</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1c28;color:#d4b483;font-family:Tahoma,Vazirmatn,sans-serif;text-align:center;padding:24px}h1{font-size:1.3rem;margin-bottom:.5rem}p{color:#ead9bd;opacity:.85;font-size:.9rem;line-height:2}</style></head><body><main><h1>اتصال اینترنت برقرار نیست</h1><p>پنل مدیریت برای خواندن و انتشار محتوا به اینترنت نیاز دارد.<br>اتصال را بررسی کنید و دوباره تلاش کنید.</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // CDN/Identity/Gateway دست‌نخورده

  // پیمایش‌ها: network-first با fallback به پوسته/صفحهٔ آفلاین
  if (request.mode === "navigate" && url.pathname.startsWith("/admin")) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put("/admin/", fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match("/admin/");
          return cached ?? offlinePage();
        }
      })()
    );
    return;
  }

  // دارایی‌های استاتیک: cache-first با به‌روزرسانی در پس‌زمینه
  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const network = fetch(request)
          .then(async (fresh) => {
            if (fresh.ok) {
              const cache = await caches.open(STATIC_CACHE);
              cache.put(request, fresh.clone());
            }
            return fresh;
          })
          .catch(() => null);
        return cached ?? (await network) ?? Response.error();
      })()
    );
  }
});
