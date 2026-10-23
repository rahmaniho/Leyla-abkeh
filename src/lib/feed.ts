/**
 * فید RSS مقالات
 * ------------------------------------------------------------------
 * خوراک تازه‌های بخش مقالات، برای خبرخوان‌ها و سرویس‌هایی که تازه‌ها را
 * دنبال می‌کنند. محتوا از همان فهرست مقاله‌ها ساخته می‌شود؛ بنابراین با
 * انتشار مقاله تازه، فید هم خودکار به‌روز می‌شود و نسخۀ دستی لازم نیست.
 *
 * قواعد:
 *  • خلاصه در فید همان توضیح متای مقاله است، نه متن کامل؛ متن کامل در
 *    صفحۀ مقاله و با چیدمان درست خوانده می‌شود.
 *  • تاریخ‌ها به وقت گرینویچ و در قالب RFC 822 نوشته می‌شوند.
 */
import { ARTICLES, articlePath } from "../content/articles";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** تاریخ به قالب RFC 822 که RSS می‌خواهد */
function toRfc822(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return new Date(0).toUTCString();
  return date.toUTCString();
}

function absolute(siteUrl: string, path: string): string {
  return path === "/" ? `${siteUrl}/` : `${siteUrl}${path}/`;
}

export function buildRssFeed(
  siteUrl: string,
  site: { name: string; description: string },
  limit = 50
): string {
  const articles = ARTICLES.slice(0, limit);
  const lastDate = articles[0]?.publishDate ?? new Date(0).toISOString();

  const items = articles
    .map((article) => {
      const link = absolute(siteUrl, articlePath(article.slug));
      const category = article.tags[0];
      return [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${toRfc822(article.publishDate)}</pubDate>`,
        `      <description>${escapeXml(article.description)}</description>`,
        category ? `      <category>${escapeXml(category)}</category>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(`${site.name} — مقالات حقوقی`)}</title>`,
    `    <link>${escapeXml(absolute(siteUrl, "/articles"))}</link>`,
    `    <description>${escapeXml(site.description)}</description>`,
    "    <language>fa-IR</language>",
    `    <lastBuildDate>${toRfc822(lastDate)}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
