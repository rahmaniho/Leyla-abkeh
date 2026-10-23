import { describe, expect, it } from "vitest";
import { ARTICLES, extractFaqs, getArticle } from "../src/content/articles";
import { buildLlmsFile, resolveRoute } from "../src/routes";
import { SITE_URL } from "../src/config/site";

/**
 * آزمون‌های سئو و جئوی مقالات
 * ------------------------------------------------------------------
 * «جئو» (GEO) یعنی بهینه‌سازی برای موتورهای پاسخ‌دهنده و دستیارهای هوش
 * مصنوعی. سه چیز در این پروژه آن را پوشش می‌دهد:
 *   ۱. بخش پرسش‌های متداول در خود متن + FAQPage دقیقاً هم‌خوان با آن؛
 *   ۲. دادۀ ساختاریافتۀ کامل‌تر مقاله (موضوع، کلیدواژه، موجودیت خدمت)؛
 *   ۳. فایل `llms.txt` با معرفی نهاد و فهرست صفحه‌ها.
 * این آزمون‌ها از هم‌خوانی این سه لایه با محتوای واقعی محافظت می‌کنند.
 */

const articles = ARTICLES;

describe("پرسش‌های متداول مقالات", () => {
  it("هر مقالۀ منتشرشده دست‌کم سه پرسش متداول دارد", () => {
    for (const article of articles) {
      expect(article.faqs.length, `مقالۀ ${article.slug} پرسش متداول ندارد`).toBeGreaterThanOrEqual(3);
    }
  });

  it("پرسش و پاسخ‌ها خالی نیستند و پاسخ‌ها به‌اندازۀ کافی توضیح دارند", () => {
    for (const article of articles) {
      for (const faq of article.faqs) {
        expect(faq.question.length, `پرسش کوتاه در ${article.slug}`).toBeGreaterThan(10);
        expect(faq.answer.length, `پاسخ کوتاه در ${article.slug}`).toBeGreaterThan(40);
        expect(faq.question).not.toContain("#");
        expect(faq.answer).not.toContain("**");
      }
    }
  });

  it("پرسش‌های استخراج‌شده در متن دیده می‌شوند", () => {
    for (const article of articles) {
      expect(article.html).toContain("سؤالات متداول");
      for (const faq of article.faqs) {
        expect(article.html).toContain(faq.question.slice(0, 20));
      }
    }
  });

  it("پارسر در متن بدون بخش پرسش‌ها آرایۀ خالی برمی‌گرداند", () => {
    expect(extractFaqs("## یک بخش\nمتن")).toEqual([]);
    expect(extractFaqs("## سؤالات متداول\n\n### پرسش نمونۀ کافی بلند\nپاسخ نمونه که به‌قدر کافی بلند است و بررسی می‌شود.")).toEqual([
      {
        question: "پرسش نمونۀ کافی بلند",
        answer: "پاسخ نمونه که به‌قدر کافی بلند است و بررسی می‌شود.",
      },
    ]);
  });
});

describe("دادۀ ساختاریافتۀ مقاله برای سئو و جئو", () => {
  const schemaFor = (slug: string) => {
    const jsonLd = resolveRoute(`/articles/${slug}`).meta.jsonLd ?? [];
    const articleSchema = jsonLd.find((item) => item["@type"] === "Article");
    const faqSchema = jsonLd.find((item) => item["@type"] === "FAQPage");
    return { jsonLd, articleSchema, faqSchema };
  };

  it("Article شامل موضوع، کلیدواژه، شمار واژه و زمان مطالعه است", () => {
    for (const article of articles) {
      const { articleSchema } = schemaFor(article.slug);
      expect(articleSchema, `شما برای ${article.slug} ساخته نشد`).toBeDefined();
      expect(articleSchema?.articleSection).toBe(article.tags[0]);
      expect(String(articleSchema?.keywords)).toContain(article.tags[0]);
      expect(Number(articleSchema?.wordCount)).toBeGreaterThan(300);
      expect(String(articleSchema?.timeRequired)).toMatch(/^PT\d+M$/);
      expect(articleSchema?.isAccessibleForFree).toBe(true);
    }
  });

  it("Article به موجودیت خدمت مرتبط و وبلاگ وصل است", () => {
    const { articleSchema } = schemaFor("mehrieh-motalebe-va-ijra");
    const about = articleSchema?.about as { name: string; url: string }[];
    expect(Array.isArray(about)).toBe(true);
    expect(about[0].url).toContain("/services/khanevadeh");
    expect((articleSchema?.isPartOf as { "@id": string })["@id"]).toContain("/articles/#blog");
  });

  it("FAQPage دقیقاً همان پرسش‌های متن را دارد", () => {
    for (const article of articles) {
      const { faqSchema } = schemaFor(article.slug);
      expect(faqSchema, `FAQPage برای ${article.slug} ساخته نشد`).toBeDefined();

      const questions = (faqSchema?.mainEntity as { name: string }[]).map((item) => item.name);
      expect(questions).toEqual(article.faqs.map((faq) => faq.question));
    }
  });

  it("توضیح متای مقالات در محدودۀ نمایش نتایج جست‌وجو است", () => {
    for (const article of articles) {
      const meta = resolveRoute(`/articles/${article.slug}`).meta;
      expect(meta.description.length, `متای بلند در ${article.slug}`).toBeLessThanOrEqual(165);
      expect(meta.title.length, `عنوان بلند در ${article.slug}`).toBeLessThanOrEqual(75);
    }
  });

  it("صفحۀ فهرست مقالات، Blog و ItemList با همۀ مقالات دارد", () => {
    const jsonLd = resolveRoute("/articles").meta.jsonLd ?? [];
    const types = jsonLd.map((item) => item["@type"]);
    expect(types).toContain("Blog");
    expect(types).toContain("ItemList");

    const list = jsonLd.find((item) => item["@type"] === "ItemList");
    const items = list?.itemListElement as { position: number; url: string }[];
    expect(items.length).toBe(articles.length);
    expect(items[0].position).toBe(1);
    expect(items[0].url).toContain("/articles/");

    // هر مقاله به همان گره Blog ارجاع می‌دهد
    const articleSchema = (resolveRoute(`/articles/${articles[0].slug}`).meta.jsonLd ?? []).find(
      (item) => item["@type"] === "Article"
    );
    expect((articleSchema?.isPartOf as { "@id": string })["@id"]).toContain("/articles/#blog");
  });

  it("تصویر شاخص مقاله در دادۀ ساختاریافته با ابعاد درست می‌آید", () => {
    const { articleSchema } = schemaFor("ejare-maskan-tamdid-va-takhliye");
    const image = articleSchema?.image as { url: string; width: number; height: number };
    expect(image.url).toContain("/images/covers/ejare-cover.jpg");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });
});

describe("فایل llms.txt", () => {
  const llms = buildLlmsFile();

  it("نهاد، تلفن، ایمیل و نشانی را معرفی می‌کند", () => {
    expect(llms).toContain("# دفتر وکالت لیلا آبکه");
    expect(llms).toContain("شماره پروانه وکالت: 2370");
    expect(llms).toContain("info@leyla-abkeh.ir");
    expect(llms).toContain("مجتمع تجاری نیایش");
  });

  it("همۀ مقالات و صفحه‌های اصلی را فهرست می‌کند", () => {
    for (const article of articles) {
      expect(llms).toContain(`${SITE_URL}/articles/${article.slug}/`);
    }
    expect(llms).toContain(`${SITE_URL}/services/`);
    expect(llms).toContain(`${SITE_URL}/contact/`);
  });

  it("به مدل‌ها هشدار می‌دهد عدد و آمار نسازند", () => {
    expect(llms).toContain("هیچ آمار، امتیاز، نظر موکل یا وعدۀ نتیجه");
    expect(llms).not.toContain("aggregateRating");
  });
});

describe("پیوندهای درونی مقالات", () => {
  it("هر مقاله دست‌کم یک پیوند به خدمت مرتبط و فرم مشاوره دارد", () => {
    for (const article of articles) {
      expect(article.html).toContain('href="/contact"');
      expect(article.relatedServices.length).toBeGreaterThan(0);
    }
  });

  it("همۀ خدمات ارجاع‌شده در مقالات وجود دارند", () => {
    for (const article of articles) {
      for (const slug of article.relatedServices) {
        expect(getArticle(article.slug)?.relatedServices).toContain(slug);
        expect(resolveRoute(`/services/${slug}`).notFound, `خدمت ${slug} یافت نشد`).toBeFalsy();
      }
    }
  });
});
