import type { ReactNode } from "react";
import HomePage, { meta as homeMeta } from "./pages/Home";
import ServicesPage, { meta as servicesMeta } from "./pages/ServicesPage";
import ServicePage from "./pages/ServicePage";
import AboutPage, { meta as aboutMeta } from "./pages/AboutPage";
import FaqPage, { meta as faqMeta } from "./pages/FaqPage";
import PricingPage, { meta as pricingMeta } from "./pages/PricingPage";
import ContactPage, { meta as contactMeta } from "./pages/ContactPage";
import ArticlesPage, { meta as articlesMeta } from "./pages/ArticlesPage";
import ArticlePage from "./pages/ArticlePage";
import PrivacyPage, { meta as privacyMeta } from "./pages/PrivacyPage";
import NotFoundPage, { meta as notFoundMeta } from "./pages/NotFoundPage";
import { ARTICLES, articlePath, getArticle } from "./content/articles";
import { buildLlmsTxt } from "./lib/llms";
import { SITE_LAST_UPDATED, SITE_URL } from "./config/site";
import { SERVICES, getService, servicePath } from "./content/services";
import {
  absoluteUrl,
  buildBreadcrumbSchema,
  buildFaqSchema,
  normalizePath,
  pageUrl,
  toMetaDescription,
  type JsonLd,
  type PageMeta,
} from "./lib/seo";

export interface RouteMatch {
  meta: PageMeta;
  element: ReactNode;
  notFound?: boolean;
}

interface StaticRoute {
  meta: PageMeta;
  render: () => ReactNode;
}

const STATIC_ROUTES: Record<string, StaticRoute> = {
  "/": { meta: homeMeta, render: () => <HomePage /> },
  "/services": { meta: servicesMeta, render: () => <ServicesPage /> },
  "/about": { meta: aboutMeta, render: () => <AboutPage /> },
  "/faq": { meta: faqMeta, render: () => <FaqPage /> },
  "/pricing": { meta: pricingMeta, render: () => <PricingPage /> },
  "/contact": { meta: contactMeta, render: () => <ContactPage /> },
  "/articles": { meta: articlesMeta, render: () => <ArticlesPage /> },
  "/privacy": { meta: privacyMeta, render: () => <PrivacyPage /> },
};

/** افزودن نام برند به عنوان‌های کوتاه */
function withBrand(title: string): string {
  if (title.includes("لیلا آبکه")) return title;
  const candidate = `${title} | لیلا آبکه`;
  return candidate.length <= 70 ? candidate : title;
}

function serviceMeta(slug: string): PageMeta | null {
  const service = getService(slug);
  if (!service) return null;

  const path = servicePath(service.slug);
  const breadcrumbs = [
    { name: "صفحۀ اصلی", path: "/" },
    { name: "خدمات حقوقی", path: "/services" },
    { name: service.title, path },
  ];

  const jsonLd: JsonLd[] = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.title,
      serviceType: service.title,
      description: service.metaDescription,
      url: pageUrl(path),
      areaServed: { "@type": "City", name: "قزوین" },
      provider: { "@id": `${pageUrl("/")}#attorney` },
      inLanguage: "fa-IR",
    },
    buildFaqSchema(service.faqs),
    buildBreadcrumbSchema(breadcrumbs),
  ];

  return {
    title: withBrand(service.seoTitle),
    description: service.metaDescription,
    path,
    type: "website",
    breadcrumbs,
    modifiedTime: service.updated,
    jsonLd,
  };
}

function articleMeta(slug: string): PageMeta | null {
  const article = getArticle(slug);
  if (!article) return null;

  const path = articlePath(article.slug);
  const breadcrumbs = [
    { name: "صفحۀ اصلی", path: "/" },
    { name: "مقالات", path: "/articles" },
    { name: article.title, path },
  ];

  const description = article.metaDescription ?? toMetaDescription(article.description);
  const relatedServices = SERVICES.filter((service) => article.relatedServices.includes(service.slug));

  /*
   * دادۀ ساختاریافتۀ مقاله، برای سئوی کلاسیک و برای موتورهای پاسخ‌دهنده (GEO):
   *  • `articleSection`/`keywords` به موتور کمک می‌کند مقاله را به موضوع درست
   *    نسبت دهد؛
   *  • `about` مقاله را به همان موجودیت خدمتِ سایت وصل می‌کند (نه یک متن
   *    بی‌مرجع)؛
   *  • `speakable` بخش‌های قابل خواندن را مشخص می‌کند؛
   *  • `FAQPage` از بخش «سؤالات متداول» همین متن ساخته می‌شود، بنابراین
   *    پرسش‌های مارک‌آپ دقیقاً همان چیزی است که کاربر می‌بیند.
   */
  const articleSchema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description,
    datePublished: article.publishDate,
    dateModified: article.lastReviewed ?? article.publishDate,
    inLanguage: "fa-IR",
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl(path) },
    author: { "@type": "Organization", name: article.author, url: pageUrl("/about") },
    publisher: { "@id": `${pageUrl("/")}#attorney` },
    isPartOf: { "@type": "Blog", "@id": `${pageUrl("/articles")}#blog`, name: "مقالات حقوقی" },
    articleSection: article.tags[0] ?? "حقوق",
    ...(article.tags.length > 0 ? { keywords: article.tags.join(", ") } : {}),
    wordCount: article.body.trim().split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${article.readingMinutes}M`,
    isAccessibleForFree: true,
    ...(relatedServices.length > 0
      ? {
          about: relatedServices.map((service) => ({
            "@type": "Service",
            name: service.title,
            url: pageUrl(servicePath(service.slug)),
          })),
        }
      : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".article-prose h2", ".article-prose p"],
    },
    ...(article.cover
      ? { image: { "@type": "ImageObject", url: absoluteUrl(article.cover), width: 1200, height: 630 } }
      : { image: absoluteUrl("/images/og-image.jpg") }),
  };

  return {
    title: withBrand(article.seoTitle ?? article.title),
    description,
    path,
    type: "article",
    publishedTime: article.publishDate,
    modifiedTime: article.lastReviewed ?? article.publishDate,
    breadcrumbs,
    ogImage: article.cover,
    ogImageAlt: article.coverAlt,
    jsonLd: [
      articleSchema,
      ...(article.faqs.length > 0 ? [buildFaqSchema(article.faqs)] : []),
      buildBreadcrumbSchema(breadcrumbs),
    ],
  };
}

/** تطبیق مسیر با صفحۀ مربوطه */
export function resolveRoute(rawPath: string): RouteMatch {
  const path = normalizePath(rawPath);

  const staticRoute = STATIC_ROUTES[path];
  if (staticRoute) {
    return { meta: staticRoute.meta, element: staticRoute.render() };
  }

  const serviceMatch = /^\/services\/([^/]+)$/.exec(path);
  if (serviceMatch) {
    const service = getService(decodeURIComponent(serviceMatch[1]));
    const meta = serviceMeta(decodeURIComponent(serviceMatch[1]));
    if (service && meta) {
      return { meta, element: <ServicePage service={service} /> };
    }
  }

  const articleMatch = /^\/articles\/([^/]+)$/.exec(path);
  if (articleMatch) {
    const article = getArticle(decodeURIComponent(articleMatch[1]));
    const meta = articleMeta(decodeURIComponent(articleMatch[1]));
    if (article && meta) {
      return { meta, element: <ArticlePage article={article} /> };
    }
  }

  return {
    meta: { ...notFoundMeta, path },
    element: <NotFoundPage />,
    notFound: true,
  };
}

/** مسیرهایی که باید پیش‌رندر و در sitemap ثبت شوند */
export function indexablePaths(): string[] {
  return [
    ...Object.keys(STATIC_ROUTES),
    ...SERVICES.map((service) => servicePath(service.slug)),
    ...ARTICLES.map((article) => articlePath(article.slug)),
  ];
}

export interface SitemapEntry {
  path: string;
  lastmod: string;
  priority?: string;
}

/** ورودی‌های sitemap با تاریخ آخرین تغییر محتوا */
export function sitemapEntries(): SitemapEntry[] {
  return [
    ...Object.keys(STATIC_ROUTES).map((path) => ({
      path,
      lastmod: SITE_LAST_UPDATED,
      priority: path === "/" ? "1.0" : "0.8",
    })),
    ...SERVICES.map((service) => ({
      path: servicePath(service.slug),
      lastmod: service.updated,
      priority: "0.7",
    })),
    ...ARTICLES.map((article) => ({
      path: articlePath(article.slug),
      lastmod: (article.lastReviewed ?? article.publishDate).slice(0, 10),
      priority: "0.6",
    })),
  ];
}

/**
 * متن `llms.txt` برای دستیارهای هوش مصنوعی.
 * عنوان و توضیح هر صفحه از همان متای همان صفحه گرفته می‌شود تا با تغییر
 * محتوا، این فایل هم خودکار به‌روز شود.
 */
export function buildLlmsFile(): string {
  const entries = indexablePaths().map((path) => {
    const meta = resolveRoute(path).meta;
    return { path, title: meta.title, description: meta.description };
  });
  return buildLlmsTxt(entries, SITE_URL);
}

export { STATIC_ROUTES };
