import { SITE_URL, activeSocials, siteConfig } from "../config/site";
import { withBase } from "./base";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface PageMeta {
  /** عنوان کامل صفحه (شامل نام برند در انتها) */
  title: string;
  /** توضیح متا، ترجیحاً ۱۲۰ تا ۱۵۵ نویسه */
  description: string;
  /** مسیر بدون دامنه، شروع با اسلش */
  path: string;
  noindex?: boolean;
  type?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** دادهٔ ساختاریافتهٔ اختصاصی صفحه (بدون امتیاز یا آمار تأییدنشده) */
  jsonLd?: JsonLd[];
}

export type JsonLd = Record<string, unknown> & { "@context": string; "@type": string | string[] };

export const DEFAULT_OG_IMAGE = "/images/og-image.jpg";

/** مسیر نسبی را به نشانی مطلق تبدیل می‌کند (برای canonical و OG) */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized === "/" ? "/" : normalized.replace(/\/$/, "")}`;
}

/** مسیر را یکدست می‌کند: بدون اسلش انتهایی و بدون هش/کوئری */
export function normalizePath(rawPath: string): string {
  const withoutQuery = rawPath.split("#")[0].split("?")[0];
  if (!withoutQuery || withoutQuery === "/") return "/";
  const withLeading = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

/**
 * نشانی مطلق صفحه با اسلش انتهایی.
 * Netlify مسیر پوشه‌ای را از `/x` به `/x/` با کد ۳۰۱ هدایت می‌کند؛ برای اینکه
 * canonical و لینک‌های داخلی به نشانی نهایی اشاره کنند، اسلش انتهایی حفظ می‌شود.
 */
export function pageUrl(path: string): string {
  const normalized = normalizePath(path);
  return `${SITE_URL}${normalized === "/" ? "/" : `${normalized}/`}`;
}

/** مسیر داخلی را به شکل نهایی (با اسلش انتهایی) برمی‌گرداند؛ برای href لینک‌ها */
export function pageHref(to: string): string {
  if (!to.startsWith("/")) return to;
  const [pathPart, rawHash] = to.split("#");
  if (!pathPart) return to;
  // فایل ایستا (تصویر، فونت، manifest): فقط مسیر پایه اضافه می‌شود
  if (/\.[a-z0-9]{1,6}$/i.test(pathPart)) return withBase(to);
  const normalized = normalizePath(pathPart);
  const suffix = normalized === "/" ? "/" : `${normalized}/`;
  return withBase(rawHash ? `${suffix}#${rawHash}` : suffix);
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

/** سازمان/دفتر وکالت — بدون aggregateRating و بدون ادعای تأییدنشده */
export function buildAttorneySchema(): JsonLd {
  const { contact, lawyer, site } = siteConfig;
  const sameAs = activeSocials
    .filter((social) => social.key !== "whatsapp")
    .map((social) => social.href);

  return {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "@id": `${SITE_URL}/#attorney`,
    name: site.name,
    alternateName: lawyer.name,
    url: SITE_URL,
    image: absoluteUrl(lawyer.photo.basePath + ".jpg"),
    telephone: contact.phoneE164,
    founder: {
      "@type": "Person",
      name: lawyer.name,
      jobTitle: lawyer.jobTitle,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      addressCountry: contact.address.country,
      ...(contact.postalCode ? { postalCode: contact.postalCode } : {}),
    },
    areaServed: {
      "@type": "City",
      name: "قزوین",
    },
    openingHoursSpecification: contact.hours.days.map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${day.schemaDay}`,
      opens: day.opens,
      closes: day.closes,
    })),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    knowsLanguage: ["fa-IR"],
  };
}

export function buildWebsiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: siteConfig.site.name,
    inLanguage: "fa-IR",
    publisher: { "@id": `${SITE_URL}/#attorney` },
  };
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Markdown ساده را به متن یک‌خطی تبدیل می‌کند (برای توضیح متا) */
export function toMetaDescription(text: string, maxLength = 155): string {
  const plain = text
    .replace(/[#>*_`[\]()|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trimEnd()}…`;
}

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * ساخت تگ‌های <head> برای پیش‌رندر.
 * خروجی مستقیماً داخل HTML قالب تزریق می‌شود.
 */
export function renderHeadTags(meta: PageMeta): string {
  const canonical = pageUrl(meta.path);
  const image = absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE);
  const robots = meta.noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1";

  const tags: string[] = [
    `<title>${escapeAttribute(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(meta.description)}" />`,
    `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta property="og:type" content="${meta.type ?? "website"}" />`,
    `<meta property="og:site_name" content="${escapeAttribute(siteConfig.site.name)}" />`,
    `<meta property="og:locale" content="${siteConfig.site.locale}" />`,
    `<meta property="og:title" content="${escapeAttribute(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`,
    `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttribute(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeAttribute(meta.ogImageAlt ?? siteConfig.lawyer.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttribute(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}" />`,
  ];

  if (meta.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${meta.publishedTime}" />`);
  }
  if (meta.modifiedTime) {
    tags.push(`<meta property="article:modified_time" content="${meta.modifiedTime}" />`);
  }

  return tags.join("\n    ");
}

/** به‌روزرسانی تگ‌های head در مرورگر هنگام جابه‌جایی بین صفحات */
export function applyMetaInBrowser(meta: PageMeta): void {
  if (typeof document === "undefined") return;

  const canonical = pageUrl(meta.path);
  document.title = meta.title;

  const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  setMeta('meta[name="description"]', "name", "description", meta.description);
  setMeta('meta[name="robots"]', "name", "robots", meta.noindex ? "noindex, nofollow" : "index, follow");
  setMeta('meta[property="og:title"]', "property", "og:title", meta.title);
  setMeta('meta[property="og:description"]', "property", "og:description", meta.description);
  setMeta('meta[property="og:url"]', "property", "og:url", canonical);
  setMeta('meta[property="og:type"]', "property", "og:type", meta.type ?? "website");
  setMeta(
    'meta[property="og:image"]',
    "property",
    "og:image",
    absoluteUrl(meta.ogImage ?? DEFAULT_OG_IMAGE)
  );
  setMeta('meta[name="twitter:title"]', "name", "twitter:title", meta.title);
  setMeta('meta[name="twitter:description"]', "name", "twitter:description", meta.description);

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical;
}
