import { marked } from "marked";
import {
  FIGURE_HEIGHT,
  FIGURE_RATIO,
  FIGURE_SIZES,
  FIGURE_WIDTH,
  responsiveImage,
} from "../lib/images";

/**
 * سیستم مقالات
 * ------------------------------------------------------------------
 * مقالات از فایل‌های Markdown در `src/content/blog` خوانده می‌شوند؛ همان
 * پوشه‌ای که Decap CMS در آن می‌نویسد. فایل‌ها با `import.meta.glob` در
 * زمان بیلد خوانده می‌شوند، بنابراین هم در مرورگر و هم در پیش‌رندر
 * (build-time) بدون دسترسی به فایل‌سیستم کار می‌کنند.
 */

export interface Article {
  /** نشانی یکتا (از نام فایل یا فیلد `slug`) */
  slug: string;
  title: string;
  description: string;
  /** متن Markdown خام */
  body: string;
  /** HTML امن‌شده برای نمایش */
  html: string;
  author: string;
  publishDate: string;
  lastReviewed?: string;
  cover?: string;
  coverAlt?: string;
  seoTitle?: string;
  metaDescription?: string;
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  /** خدمات مرتبط برای لینک‌سازی داخلی */
  relatedServices: string[];
}

type FrontMatterValue = string | boolean | number | string[];

/** حذف کوتیشن‌های ابتدایی/انتهایی */
function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1).replace(/\\"/g, '"');
  }
  return value;
}

const FRONT_MATTER_BOUNDARY = /^---\s*$/;

/**
 * پارسر سادهٔ Front Matter (زیرمجموعهٔ YAML مورد استفادهٔ Decap CMS).
 * پشتیبانی: `key: value`، رشته‌های داخل کوتیشن، بولین و عدد.
 * (به‌جای وابستگی به js-yaml با نسخهٔ آسیب‌پذیر)
 */
export function parseFrontMatter(raw: string): {
  data: Record<string, FrontMatterValue>;
  body: string;
} {
  const normalized = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (!lines.length || !FRONT_MATTER_BOUNDARY.test(lines[0])) {
    return { data: {}, body: normalized.trim() };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (FRONT_MATTER_BOUNDARY.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { data: {}, body: normalized.trim() };
  }

  const bodyLines = lines.slice(1, end);
  const data: Record<string, FrontMatterValue> = {};
  let listKey: string | null = null;

  for (const line of bodyLines) {
    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && listKey) {
      const list = (data[listKey] as string[]) ?? [];
      list.push(unquote(listItem[1].trim()));
      data[listKey] = list;
      continue;
    }

    const match = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
    if (!match) {
      listKey = null;
      continue;
    }

    const [, key, rawValue] = match;
    const value = rawValue.trim();

    if (value === "") {
      // احتمالاً ابتدای یک فهرست بلوکی
      data[key] = [];
      listKey = key;
      continue;
    }

    listKey = null;

    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    data[key] = unquote(value);
  }

  return { data, body: lines.slice(end + 1).join("\n").trim() };
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** ساخت HTML یک تصویر داخل متن (استفاده در renderer تصویر و پاراگراف) */
function renderArticleImage(href: string, alt: string, title: string | null): string {
  const image = responsiveImage(href);
  const hasVariants = image.sources.length > 0;
  const caption = title ? `<figcaption>${escapeHtml(title)}</figcaption>` : "";

  const sources = image.sources
    .map((source) => `<source type="${source.type}" srcset="${source.srcSet}" sizes="${FIGURE_SIZES}">`)
    .join("");

  const img = `<img src="${image.src}"${
    hasVariants ? ` srcset="${image.srcSet}" sizes="${FIGURE_SIZES}"` : ""
  } alt="${escapeHtml(alt)}" width="${FIGURE_WIDTH}" height="${FIGURE_HEIGHT}" loading="lazy" decoding="async" style="aspect-ratio:${FIGURE_RATIO}">`;

  return `<figure class="article-figure"><picture>${sources}${img}</picture>${caption}</figure>`;
}

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    // HTML خام موجود در Markdown خنثی می‌شود (ضد XSS در محتوای CMS)
    html(token) {
      const text = typeof token === "string" ? token : String(token?.text ?? "");
      return escapeHtml(text);
    },

    /**
     * تصویر داخل متن با `<picture>` و نسخه‌های AVIF/WebP و دو اندازه.
     * اگر مسیر تصویر نسخهٔ چندگانه نداشته باشد (مثلاً بارگذاری از پنل)، یک
     * `img` ساده تولید می‌شود. `title` به‌عنوان زیرنویس (figcaption) نمایش داده می‌شود.
     */
    image({ href, title, text }: { href: string; title?: string | null; text: string }) {
      return renderArticleImage(href, text ?? "", title ?? null);
    },

    /**
     * پاراگرافی که فقط از یک تصویر تشکیل شده است باید به `<figure>` تبدیل شود،
     * نه `<p><figure>…</figure></p>` (درج عنصر بلوکی داخل پاراگراف نامعتبر است).
     */
    paragraph({ tokens }: { tokens: { type: string }[] }) {
      if (tokens.length === 1 && tokens[0].type === "image") {
        const image = tokens[0] as unknown as { href: string; title?: string | null; text: string };
        return renderArticleImage(image.href, image.text ?? "", image.title ?? null);
      }
      return false;
    },
  },
});

/**
 * Markdown → HTML امن.
 * گزینه‌ها اختیاری‌اند تا خروجی برای محتوای بدون تصویر یکسان بماند.
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toIsoDate(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function toStringArray(value: FrontMatterValue | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugFromPath(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file
    .replace(/\.md$/i, "")
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .trim();
}

/** فایل‌های Markdown موجود در پوشهٔ محتوا (زمان بیلد) */
const rawModules = import.meta.glob("./blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function buildArticle(path: string, raw: string): Article {
  const { data, body } = parseFrontMatter(raw);
  const fallbackDate = "1970-01-01T00:00:00.000Z";
  const slug =
    typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : slugFromPath(path);

  const title = typeof data.title === "string" ? data.title : "";
  const description = typeof data.description === "string" ? data.description : "";
  const publishDate = toIsoDate(
    typeof data.publishDate === "string" ? data.publishDate : undefined,
    typeof data.date === "string" ? toIsoDate(data.date, fallbackDate) : fallbackDate
  );
  const lastReviewedRaw = typeof data.lastReviewed === "string" ? data.lastReviewed : undefined;

  return {
    slug,
    title,
    description,
    body,
    html: renderMarkdown(body),
    author: typeof data.author === "string" && data.author.trim() ? data.author : "دفتر وکالت",
    publishDate,
    lastReviewed: lastReviewedRaw ? toIsoDate(lastReviewedRaw, publishDate) : undefined,
    cover: typeof data.cover === "string" && data.cover.trim() ? data.cover : undefined,
    coverAlt: typeof data.coverAlt === "string" ? data.coverAlt : title,
    seoTitle: typeof data.seoTitle === "string" ? data.seoTitle : undefined,
    metaDescription: typeof data.metaDescription === "string" ? data.metaDescription : undefined,
    tags: toStringArray(data.tags),
    draft: data.draft === true || data.draft === "true",
    readingMinutes: estimateReadingMinutes(body),
    relatedServices: toStringArray(data.relatedServices),
  };
}

/** همهٔ مقالات (شامل پیش‌نویس‌ها) — برای آزمون‌ها و پنل مدیریت */
export const ALL_ARTICLES: Article[] = Object.entries(rawModules)
  .map(([path, raw]) => buildArticle(path, raw))
  .filter((article) => article.slug && article.title)
  .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));

/** مقالات قابل انتشار */
export const ARTICLES: Article[] = ALL_ARTICLES.filter((article) => !article.draft);

export const ARTICLE_BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export function getArticle(slug: string): Article | undefined {
  return ARTICLE_BY_SLUG.get(slug);
}

export const hasArticles = ARTICLES.length > 0;

export const articlePath = (slug: string) => `/articles/${slug}`;
