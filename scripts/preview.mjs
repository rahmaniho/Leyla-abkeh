/**
 * سرور پیش‌نمایش خروجی بیلد — رفتار نزدیک به Netlify
 * ------------------------------------------------------------------
 * - پوشه‌ها با index.html سرو می‌شوند (بدون بازنویسی SPA)
 * - مسیر ناموجود → 404.html با کد وضعیت ۴۰۴
 * - سرو فایل‌های استاتیک با MIME درست
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd(), "dist");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
};

async function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const candidate = path.join(root, safePath);

  if (!candidate.startsWith(root)) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      const indexFile = path.join(candidate, "index.html");
      await stat(indexFile);
      return indexFile;
    }
    return candidate;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? "/");

  if (!file) {
    try {
      const notFound = await stat(path.join(root, "404.html"));
      if (notFound.isFile()) {
        res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        createReadStream(path.join(root, "404.html")).pipe(res);
        return;
      }
    } catch {
      /* بدون 404.html */
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const extension = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "content-type": MIME[extension] ?? "application/octet-stream",
    "cache-control": extension === ".html" ? "no-cache" : "public, max-age=3600",
  });
  createReadStream(file).pipe(res);
});

server.listen(port, host, () => {
  console.log(`پیش‌نمایش خروجی بیلد: http://${host}:${port}`);
});
