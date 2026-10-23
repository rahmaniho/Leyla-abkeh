/**
 * پیش‌رندر صفحات در زمان بیلد
 * ------------------------------------------------------------------
 * ۱. قالب `dist/index.html` را می‌خواند.
 * ۲. هر مسیر را با React رندر می‌کند و HTML و تگ‌های head را تزریق می‌کند.
 * ۳. sitemap.xml و robots.txt را می‌سازد.
 *
 * پیش‌نیاز: `vite build` و سپس `vite build --ssr src/entry-server.tsx --outDir .ssr`
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const distDir = path.join(root, "dist");
const templatePath = path.join(distDir, "index.html");
const ssrEntry = path.join(root, ".ssr", "entry-server.js");

const HEAD_START = "<!--app-head-start-->";
const HEAD_END = "<!--app-head-end-->";
const HTML_MARKER = "<!--app-html-->";

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function readTemplate() {
  const template = await readFile(templatePath, "utf8");
  if (!template.includes(HEAD_START) || !template.includes(HEAD_END)) {
    throw new Error("نشانگرهای head در index.html یافت نشد.");
  }
  return template;
}

function buildPage(template, { html, head }) {
  const headStart = template.indexOf(HEAD_START);
  const headEnd = template.indexOf(HEAD_END) + HEAD_END.length;
  const withHead = `${template.slice(0, headStart)}${head}\n    ${template.slice(headEnd)}`;
  return withHead.replace(HTML_MARKER, html);
}

async function writeRoute(template, routePath, rendered) {
  const page = buildPage(template, rendered);
  const relative = routePath === "/" ? "index.html" : path.join(routePath.replace(/^\//, ""), "index.html");
  const target = path.join(distDir, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, page, "utf8");
  return relative;
}

function buildSitemap(entries, siteUrl) {
  const urls = entries
    .map((entry) => {
      const loc = entry.path === "/" ? `${siteUrl}/` : `${siteUrl}${entry.path}/`;
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      const priority = entry.path === "/" ? "1.0" : entry.priority ?? "0.8";
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod}\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function buildRobots(siteUrl) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

async function main() {
  const { render, indexablePaths, sitemapEntries, buildLlmsFile, SITE_URL } = await import(ssrEntry);
  const template = await readTemplate();

  const siteUrl = (process.env.VITE_SITE_URL || process.env.URL || SITE_URL).replace(/\/+$/, "");
  const paths = indexablePaths();
  const failures = [];

  for (const routePath of paths) {
    try {
      const rendered = render(routePath);
      const file = await writeRoute(template, routePath, rendered);
      console.log(`  ✓ ${routePath.padEnd(38)} → ${file}`);
    } catch (error) {
      failures.push({ routePath, error });
      console.error(`  ✗ ${routePath}: ${error?.message ?? error}`);
    }
  }

  // صفحهی ۴۰۴ (Netlify برای مسیرهای ناموجود، dist/404.html را با کد ۴۰۴ سرو می‌کند)
  const notFound = render("/404");
  const notFoundPage = buildPage(template, notFound);
  await writeFile(path.join(distDir, "404.html"), notFoundPage, "utf8");
  console.log("  ✓ /404                                  → 404.html");

  const entries = sitemapEntries();
  await writeFile(path.join(distDir, "sitemap.xml"), buildSitemap(entries, siteUrl), "utf8");
  await writeFile(path.join(distDir, "robots.txt"), buildRobots(siteUrl), "utf8");
  console.log(`  ✓ sitemap.xml (${entries.length} آدرس) و robots.txt`);

  // llms.txt: معرفی سایت و فهرست صفحه‌ها برای دستیارهای هوش مصنوعی (GEO)
  const llms = buildLlmsFile().replaceAll(SITE_URL, siteUrl);
  await writeFile(path.join(distDir, "llms.txt"), llms, "utf8");
  console.log("  ✓ llms.txt (معرفی سایت برای موتورهای پاسخ‌دهنده)");

  if (failures.length > 0) {
    console.error(`\n${failures.length} مسیر پیش‌رندر نشد.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nپیش‌رندر کامل شد: ${paths.length + 1} صفحه · دامنه: ${siteUrl}`);
}

main().catch((error) => {
  console.error("خطا در پیش‌رندر:", error);
  process.exitCode = 1;
});
