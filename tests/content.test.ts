import { describe, expect, it } from "vitest";
import { parseFrontMatter, ALL_ARTICLES, ARTICLES, getArticle } from "../src/content/articles";
import { SERVICES, getService } from "../src/content/services";
import { SITE_FAQS } from "../src/content/faqs";
import { APPROVED_TESTIMONIALS, TESTIMONIALS } from "../src/content/testimonials";
import { STATS, VERIFIED_STATS } from "../src/content/stats";
import { consultationFee, feeVerified, pricingPlans } from "../src/config/pricing";
import { PENDING_VERIFICATION } from "../src/config/site";

describe("پارسر Front Matter", () => {
  it("مقادیر ساده، کوتیشن‌دار و بولین را می‌خواند", () => {
    const { data, body } = parseFrontMatter(
      ['---', 'title: "عنوان نمونه"', "draft: false", "count: 3", "---", "متن اصلی"].join("\n")
    );
    expect(data.title).toBe("عنوان نمونه");
    expect(data.draft).toBe(false);
    expect(data.count).toBe("3");
    expect(body).toBe("متن اصلی");
  });

  it("فهرست بلوکی را می‌خواند", () => {
    const { data } = parseFrontMatter(
      ["---", "tags:", "  - چک", "  - ملکی", "relatedServices:", "  - chek-va-esnad", "---", ""].join("\n")
    );
    expect(data.tags).toEqual(["چک", "ملکی"]);
    expect(data.relatedServices).toEqual(["chek-va-esnad"]);
  });

  it("فایل بدون Front Matter را کامل به‌عنوان متن برمی‌گرداند", () => {
    const { data, body } = parseFrontMatter("# عنوان\nمتن");
    expect(data).toEqual({});
    expect(body).toBe("# عنوان\nمتن");
  });
});

describe("مقالات", () => {
  it("همهٔ مقالات منتشرشده فیلدهای ضروری دارند", () => {
    for (const article of ARTICLES) {
      expect(article.title.length).toBeGreaterThan(5);
      expect(article.description.length).toBeGreaterThan(20);
      expect(article.slug).toMatch(/^[a-z0-9-]+$/);
      expect(article.html.length).toBeGreaterThan(100);
      expect(article.readingMinutes).toBeGreaterThan(0);
      expect(Number.isNaN(new Date(article.publishDate).getTime())).toBe(false);
    }
  });

  it("نشانی مقالات یکتاست", () => {
    const slugs = ALL_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("پیش‌نویس‌ها در فهرست منتشرشده نیستند", () => {
    for (const article of ARTICLES) {
      expect(article.draft).toBe(false);
    }
  });

  it("محتوای HTML خام را خنثی می‌کند", () => {
    const article = ALL_ARTICLES[0];
    expect(article.html).not.toContain("<script");
    expect(getArticle("chek-bargashkhte-masir-haye-ghanooni")?.html).toContain("<h2");
  });

  it("خدمات مرتبط با اسلاگ معتبر اشاره می‌کنند", () => {
    for (const article of ALL_ARTICLES) {
      for (const slug of article.relatedServices) {
        expect(SERVICES.some((service) => service.slug === slug)).toBe(true);
      }
    }
  });
});

describe("خدمات", () => {
  it("اسلاگ‌ها یکتا و لاتین هستند", () => {
    const slugs = SERVICES.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("هر خدمت محتوای کافی برای صفحهٔ مستقل دارد", () => {
    for (const service of SERVICES) {
      expect(service.intro.length).toBeGreaterThanOrEqual(2);
      expect(service.sections.length).toBeGreaterThanOrEqual(3);
      expect(service.faqs.length).toBeGreaterThanOrEqual(2);
      const words = [
        ...service.intro,
        ...service.sections.flatMap((section) => [...section.paragraphs, ...(section.bullets ?? [])]),
      ]
        .join(" ")
        .split(/\s+/).length;
      expect(words).toBeGreaterThan(150);
    }
  });

  it("خدمات مرتبط وجود دارند و به خود ارجاع نمی‌دهند", () => {
    for (const service of SERVICES) {
      for (const slug of service.related) {
        expect(getService(slug)).toBeDefined();
        expect(slug).not.toBe(service.slug);
      }
    }
  });

  it("عنوان سئو و توضیح متا در محدودهٔ منطقی هستند", () => {
    for (const service of SERVICES) {
      expect(service.seoTitle.length).toBeLessThanOrEqual(80);
      expect(service.metaDescription.length).toBeGreaterThan(80);
      expect(service.metaDescription.length).toBeLessThanOrEqual(165);
    }
  });
});

describe("محتوای حساس و تأییدنشده", () => {
  it("هیچ نظر تأییدنشده‌ای بدون رضایت منتشر نمی‌شود", () => {
    for (const testimonial of APPROVED_TESTIMONIALS) {
      expect(testimonial.consent).toBe(true);
      expect(testimonial.approved).toBe(true);
    }
    expect(TESTIMONIALS.every((item) => item.consent)).toBe(true);
  });

  it("آمار تأییدنشده منتشر نمی‌شود", () => {
    expect(VERIFIED_STATS.length).toBe(0);
    expect(STATS.every((stat) => stat.verified === false)).toBe(true);
  });

  it("تعرفهٔ تأییدنشده به‌عنوان تأییدشده علامت نخورده است", () => {
    expect(consultationFee.verified).toBe(false);
  });

  it("مبلغ تأییدنشدهٔ مشاوره در هیچ متن عمومی منتشر نمی‌شود", () => {
    const feeInPlans = pricingPlans.find((plan) => plan.id === "consultation");
    expect(feeVerified).toBe(false);
    expect(feeInPlans?.priceLabel).not.toContain("۹۸۰");
    expect(SITE_FAQS.some((faq) => faq.answer.includes("۹۸۰"))).toBe(false);
    // اگر دفتر مبلغ را تأیید کند، فقط با یک تغییر در `consultationFee.verified` برمی‌گردد
    expect(consultationFee.amountToman).toBeGreaterThan(0);
  });

  it("فهرست موارد نیازمند تأیید خالی نیست و کلید یکتا دارد", () => {
    const keys = PENDING_VERIFICATION.map((item) => item.key);
    expect(keys.length).toBeGreaterThan(5);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
