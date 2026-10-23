import { describe, expect, it } from "vitest";
import { ARTICLES, ALL_ARTICLES, articlePath } from "../src/content/articles";
import { ARTICLE_GROUP_ID, PRACTICE_GROUPS } from "../src/content/practices";
import { buildRssFeed } from "../src/lib/feed";
import { relatedArticles } from "../src/lib/related";
import { matchesAll, normalizeFa, searchTerms } from "../src/lib/text";
import { resolveRoute, sitemapEntries } from "../src/routes";
import { renderHeadTags } from "../src/lib/seo";

const SITE = "https://leyla-abkeh.netlify.app";

describe("تاریخ‌های انتشار", () => {
  it("هیچ مقاله‌ای تاریخ انتشار یا بازبینی در آینده ندارد", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const future = ARTICLES.filter(
      (article) => article.publishDate > tomorrow || (article.lastReviewed ?? "") > tomorrow
    ).map((article) => article.slug);

    expect(future).toEqual([]);
  });

  it("تاریخ بازبینی از تاریخ انتشار عقب‌تر نیست", () => {
    const broken = ARTICLES.filter(
      (article) => article.lastReviewed && article.lastReviewed < article.publishDate
    ).map((article) => article.slug);

    expect(broken).toEqual([]);
  });
});

describe("ساختار مقاله برای سئو و خوانایی", () => {
  it("هر مقاله دست‌کم سه سرتیتر سطح دو دارد", () => {
    const thin = ARTICLES.filter((article) => article.headings.length < 3).map(
      (article) => article.slug
    );
    expect(thin).toEqual([]);
  });

  it("همۀ سرتیترها شناسۀ لنگر یکتا دارند و در HTML هم نشسته‌اند", () => {
    for (const article of ARTICLES) {
      const ids = article.headings.map((heading) => heading.id);
      expect(new Set(ids).size, article.slug).toBe(ids.length);
      const htmlIds = [...article.html.matchAll(/<h2 id="([^"]+)"/g)].map((match) => match[1]);
      expect(htmlIds, article.slug).toEqual(ids);
    }
  });

  it("عنوان و توضیح متای مقاله‌ها یکتا و در محدودۀ طول هستند", () => {
    const titles = new Map<string, string>();
    for (const article of ARTICLES) {
      const meta = resolveRoute(articlePath(article.slug)).meta;
      expect(meta.description.length, `${article.slug} description`).toBeLessThanOrEqual(165);
      expect(meta.title.length, `${article.slug} title`).toBeLessThanOrEqual(75);

      const previous = titles.get(meta.title);
      expect(previous, `عنوان تکراری: ${article.slug} و ${previous}`).toBeUndefined();
      titles.set(meta.title, article.slug);
    }
  });

  it("تصویر شاخص هر مقاله پیش‌بارگذاری می‌شود", () => {
    for (const article of ARTICLES) {
      const meta = resolveRoute(articlePath(article.slug)).meta;
      if (!article.cover) continue;
      expect(meta.preloadImage, article.slug).toBeTruthy();
      expect(meta.preloadImage?.href, article.slug).toMatch(/\.avif$/);

      const head = renderHeadTags(meta);
      expect(head, article.slug).toContain('rel="preload" as="image"');
    }
  });
});

describe("پیوندهای داخلی مقاله‌ها", () => {
  const slugs = new Set(ARTICLES.map((article) => article.slug));

  it("هیچ پیوند مرده‌ای در متن مقاله‌ها نیست", () => {
    const dead: string[] = [];
    for (const article of ARTICLES) {
      for (const match of article.body.matchAll(/\]\(\/articles\/([a-z0-9-]+)\)/g)) {
        if (!slugs.has(match[1])) dead.push(`${article.slug} → ${match[1]}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it("هر مقاله دست‌کم یک پیوند ورودی دارد، جز صفحۀ راهنمای وکیل", () => {
    const inbound = new Map<string, number>();
    for (const article of ARTICLES) {
      for (const match of article.body.matchAll(/\]\(\/articles\/([a-z0-9-]+)\)/g)) {
        if (match[1] === article.slug) continue;
        inbound.set(match[1], (inbound.get(match[1]) ?? 0) + 1);
      }
    }

    const orphans = ARTICLES.filter(
      (article) => article.slug !== "behtarin-vakil-qazvin" && !inbound.get(article.slug)
    ).map((article) => article.slug);

    expect(orphans).toEqual([]);
  });

  it("مقالۀ مرتبط هرگز خودش نیست و ترجیحاً از همان گروه است", () => {
    for (const article of ARTICLES) {
      const related = relatedArticles(article, ARTICLES, 3);
      expect(related.map((item) => item.slug), article.slug).not.toContain(article.slug);

      const group = ARTICLE_GROUP_ID.get(article.slug);
      if (!group) continue;
      const sameGroup = ARTICLES.filter(
        (item) => item.slug !== article.slug && ARTICLE_GROUP_ID.get(item.slug) === group
      );
      if (sameGroup.length > 0) {
        const firstGroup = ARTICLE_GROUP_ID.get(related[0].slug);
        expect(firstGroup, article.slug).toBe(group);
      }
    }
  });
});

describe("فید RSS", () => {
  const feed = buildRssFeed(SITE, {
    name: "دفتر وکالت لیلا آبکه",
    description: "توضیح آزمایشی",
  });

  it("RSS معتبر با همۀ مقاله‌ها می‌سازد", () => {
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(feed).toContain("<rss version=\"2.0\"");
    expect(feed).toContain("<language>fa-IR</language>");
    expect((feed.match(/<item>/g) ?? []).length).toBe(ARTICLES.length);
  });

  it("نشانی هر مقاله با اسلش انتهایی و مطلق است", () => {
    for (const article of ARTICLES) {
      expect(feed).toContain(`<link>${SITE}/articles/${article.slug}/</link>`);
    }
  });

  it("کاراکترهای ویژه در XML فرار داده می‌شوند", () => {
    const escaped = buildRssFeed(SITE, {
      name: "دفتر & شرکا",
      description: "<تست>",
    });
    expect(escaped).toContain("دفتر &amp; شرکا");
    expect(escaped).toContain("&lt;تست&gt;");
    expect(escaped).not.toContain("<تست>");
  });
});

describe("نقشۀ سایت", () => {
  it("تصویر شاخص مقاله‌ها در نقشۀ سایت ثبت می‌شود", () => {
    const entries = sitemapEntries();
    const withCover = ARTICLES.filter((article) => article.cover);
    expect(withCover.length).toBeGreaterThan(0);

    for (const article of withCover) {
      const entry = entries.find((item) => item.path === articlePath(article.slug));
      expect(entry?.image, article.slug).toBe(article.cover);
    }
  });
});

describe("جست‌وجوی فارسی", () => {
  it("«ي» و «ك» عربی، نیم‌فاصله و ارقام فارسی را یکدست می‌کند", () => {
    expect(normalizeFa("مهريه")).toBe("مهریه");
    expect(normalizeFa("پروندۀ كوچك")).toBe("پرونده کوچک");
    expect(normalizeFa("نیم‌فاصله")).toBe(normalizeFa("نیم فاصله"));
    expect(normalizeFa("مادۀ ۳")).toBe("ماده 3");
  });

  it("همۀ واژه‌ها باید در متن باشند", () => {
    const haystack = normalizeFa("مطالبۀ مهریه در دادگاه خانواده");
    expect(matchesAll(haystack, searchTerms("مهريه"))).toBe(true);
    expect(matchesAll(haystack, searchTerms("مهریه خانواده"))).toBe(true);
    expect(matchesAll(haystack, searchTerms("مهریه چک"))).toBe(false);
  });

  it("جست‌وجوی خالی همه را برمی‌گرداند", () => {
    expect(searchTerms("   ")).toEqual([]);
    expect(matchesAll("هر متنی", [])).toBe(true);
  });
});

describe("دسته‌بندی مقالات", () => {
  it("هر گروه دعاوی دست‌کم یک مقاله دارد", () => {
    const empty = PRACTICE_GROUPS.filter(
      (group) => !ARTICLES.some((article) => ARTICLE_GROUP_ID.get(article.slug) === group.id)
    ).map((group) => group.id);

    expect(empty).toEqual([]);
  });

  it("همۀ مقالات، از جمله پیش‌نویس‌ها، اسلاگ یکتا دارند", () => {
    const slugs = ALL_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
