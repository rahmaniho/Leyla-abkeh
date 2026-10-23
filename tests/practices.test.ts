import { describe, expect, it } from "vitest";
import { PRACTICE_CLAIM_COUNT, PRACTICE_GROUPS, PRACTICE_IDS } from "../src/content/practices";
import { SERVICES, getService, servicePath } from "../src/content/services";
import { getArticle } from "../src/content/articles";

/**
 * آزمون نقشۀ موضوعات حقوقی
 * ------------------------------------------------------------------
 * این فهرست، ورودی صفحۀ اصلی برای «انواع دعاوی حقوقی» است. اگر اسلاگ خدمتی
 * تغییر کند یا مقاله‌ای حذف شود، لینک‌های صفحه بی‌صدا می‌شکنند؛ این آزمون
 * همان لحظه جلوی آن را می‌گیرد.
 */
describe("نقشۀ موضوعات حقوقی", () => {
  it("هر گروه به یک صفحۀ خدمت موجود وصل است", () => {
    for (const group of PRACTICE_GROUPS) {
      const service = getService(group.service);
      expect(service, `خدمت ${group.service} یافت نشد`).toBeDefined();
      expect(servicePath(group.service)).toBe(`/services/${group.service}`);
    }
  });

  it("شناسۀ گروه‌ها و عنوان دعواها تکراری نیست", () => {
    expect(new Set(PRACTICE_IDS).size).toBe(PRACTICE_IDS.length);

    for (const group of PRACTICE_GROUPS) {
      const titles = group.claims.map((claim) => claim.title);
      expect(new Set(titles).size, `دعوای تکراری در ${group.id}`).toBe(titles.length);
      expect(titles.length, `گروه ${group.id} دعوای کافی ندارد`).toBeGreaterThanOrEqual(5);
    }
  });

  it("همۀ موضوعات اصلی سایت در نقشه پوشش داده شده‌اند", () => {
    const covered = new Set(PRACTICE_GROUPS.map((group) => group.service));
    for (const service of SERVICES) {
      expect(covered.has(service.slug), `خدمت ${service.slug} در نقشه نیست`).toBe(true);
    }
  });

  it("پیوندهای مقاله در نقشه به مقاله‌های منتشرشده اشاره می‌کنند", () => {
    for (const group of PRACTICE_GROUPS) {
      for (const claim of group.claims) {
        if (!claim.article) continue;
        expect(getArticle(claim.article), `مقالۀ ${claim.article} یافت نشد`).toBeDefined();
      }
    }
  });

  it("شمار کل دعواها با محاسبه از داده‌ها می‌خواند", () => {
    const total = PRACTICE_GROUPS.reduce((sum, group) => sum + group.claims.length, 0);
    expect(PRACTICE_CLAIM_COUNT).toBe(total);
    expect(PRACTICE_CLAIM_COUNT).toBeGreaterThanOrEqual(40);
  });

  it("متن گروه‌ها کوتاه و بدون ادعای تأییدنشده است", () => {
    for (const group of PRACTICE_GROUPS) {
      expect(group.title.length).toBeGreaterThan(5);
      expect(group.summary.length).toBeGreaterThan(20);
      expect(group.summary).not.toMatch(/%|٪|تضمین/);
    }
  });
});
