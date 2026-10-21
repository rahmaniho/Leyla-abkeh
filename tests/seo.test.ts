import { describe, expect, it } from "vitest";
import { indexablePaths, resolveRoute, sitemapEntries } from "../src/routes";
import { absoluteUrl, pageHref, pageUrl, renderHeadTags, normalizePath } from "../src/lib/seo";
import { SITE_URL } from "../src/config/site";

const paths = indexablePaths();

describe("مسیرها", () => {
  it("همهٔ مسیرهای قابل ایندکس صفحهٔ واقعی دارند (۴۰۴ نمی‌شوند)", () => {
    for (const path of paths) {
      const route = resolveRoute(path);
      expect(route.notFound, `مسیر ${path} به ۴۰۴ رسید`).toBeFalsy();
      expect(route.meta.path).toBe(path);
    }
  });

  it("مسیر ناشناخته به صفحهٔ ۴۰۴ با noindex می‌رسد", () => {
    const route = resolveRoute("/this-does-not-exist");
    expect(route.notFound).toBe(true);
    expect(route.meta.noindex).toBe(true);
  });

  it("مسیر با اسلش انتهایی یکدست می‌شود", () => {
    expect(normalizePath("/services/")).toBe("/services");
    expect(normalizePath("services")).toBe("/services");
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/articles/x?utm=1#print")).toBe("/articles/x");
  });

  it("نشانی صفحه با اسلش انتهایی ساخته می‌شود (هم‌راستا با مسیر سرو‌شده در Netlify)", () => {
    expect(absoluteUrl("/")).toBe(`${SITE_URL}/`);
    expect(absoluteUrl("/services")).toBe(`${SITE_URL}/services`);
    expect(pageUrl("/")).toBe(`${SITE_URL}/`);
    expect(pageUrl("/services")).toBe(`${SITE_URL}/services/`);
    expect(pageUrl("/services/")).toBe(`${SITE_URL}/services/`);
    expect(pageUrl("/articles/x")).toBe(`${SITE_URL}/articles/x/`);
  });

  it("لینک‌های داخلی به نشانی نهایی اشاره می‌کنند و فایل‌ها و هش‌ها دست‌نخورده می‌مانند", () => {
    expect(pageHref("/contact")).toBe("/contact/");
    expect(pageHref("/")).toBe("/");
    expect(pageHref("/contact#form")).toBe("/contact/#form");
    expect(pageHref("/images/og-image.jpg")).toBe("/images/og-image.jpg");
    expect(pageHref("https://example.com/x")).toBe("https://example.com/x");
    expect(pageHref("#main")).toBe("#main");
    expect(pageHref("tel:+989121234567")).toBe("tel:+989121234567");
  });

  it("همهٔ آدرس‌های sitemap اسلش انتهایی دارند", () => {
    for (const entry of sitemapEntries()) {
      const url = pageUrl(entry.path);
      expect(url.endsWith("/"), `آدرس ${entry.path} بدون اسلش است`).toBe(true);
    }
  });
});

describe("متادیتای صفحات", () => {
  it("عنوان هر صفحه یکتاست", () => {
    const titles = paths.map((path) => resolveRoute(path).meta.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("توضیح متای هر صفحه یکتاست", () => {
    const descriptions = paths.map((path) => resolveRoute(path).meta.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("طول عنوان و توضیح متا در محدودهٔ منطقی است", () => {
    for (const path of paths) {
      const { meta } = resolveRoute(path);
      expect(meta.title.length, `عنوان ${path}`).toBeLessThanOrEqual(90);
      expect(meta.description.length, `توضیح ${path}`).toBeGreaterThan(50);
      expect(meta.description.length, `توضیح ${path}`).toBeLessThanOrEqual(170);
    }
  });

  it("تگ‌های head شامل canonical، OG و robots هستند", () => {
    const head = renderHeadTags(resolveRoute("/services/khanevadeh").meta);
    expect(head).toContain("<title>");
    expect(head).toContain('rel="canonical"');
    expect(head).toContain('property="og:title"');
    expect(head).toContain('property="og:image"');
    expect(head).toContain('name="twitter:card"');
    expect(head).toContain("index, follow");
  });

  it("صفحهٔ ۴۰۴ در head با noindex علامت می‌خورد", () => {
    const head = renderHeadTags(resolveRoute("/missing").meta);
    expect(head).toContain("noindex");
  });
});

describe("دادهٔ ساختاریافته", () => {
  const allJsonLd = paths.flatMap((path) => resolveRoute(path).meta.jsonLd ?? []);

  it("همهٔ JSON-LDها @context و @type دارند", () => {
    expect(allJsonLd.length).toBeGreaterThan(5);
    for (const item of allJsonLd) {
      expect(item["@context"]).toBe("https://schema.org");
      expect(item["@type"]).toBeTruthy();
    }
  });

  it("هیچ امتیاز یا آمار ساختگی در Schema نیست", () => {
    const serialized = JSON.stringify(allJsonLd);
    expect(serialized).not.toContain("aggregateRating");
    expect(serialized).not.toContain("reviewCount");
    expect(serialized).not.toContain("ratingValue");
  });

  it("صفحهٔ خدمات، Service و FAQPage دارد", () => {
    const types = (resolveRoute("/services/keyfari").meta.jsonLd ?? []).map((item) => item["@type"]);
    expect(types).toContain("Service");
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");
  });

  it("صفحهٔ مقاله، Article با تاریخ انتشار و بازبینی دارد", () => {
    const article = resolveRoute("/articles/chek-bargashkhte-masir-haye-ghanooni").meta.jsonLd ?? [];
    const articleSchema = article.find((item) => item["@type"] === "Article");
    expect(articleSchema).toBeDefined();
    expect(articleSchema?.datePublished).toBeTruthy();
    expect(articleSchema?.dateModified).toBeTruthy();
  });
});

describe("نقشهٔ سایت", () => {
  it("sitemap همهٔ مسیرهای قابل ایندکس را دارد", () => {
    const sitemapPaths = sitemapEntries().map((entry) => entry.path);
    for (const path of paths) {
      expect(sitemapPaths).toContain(path);
    }
  });

  it("مسیرهای حساس در sitemap نیستند", () => {
    const sitemapPaths = sitemapEntries().map((entry) => entry.path);
    expect(sitemapPaths).not.toContain("/admin");
    expect(sitemapPaths).not.toContain("/404");
  });
});
