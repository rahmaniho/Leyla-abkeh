import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ANALYTICS_EVENTS, sanitizeAnalyticsProps, track } from "../src/lib/analytics";

/**
 * سنجش باید کاملاً بی‌نام بماند: هیچ فیلد آزاد کاربر عبور نمی‌کند و
 * بدون تنظیم نشانی، هیچ درخواستی فرستاده نمی‌شود.
 */
describe("سنجش حریم‌خصوصی‌محور", () => {
  const original = globalThis.fetch;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn().mockResolvedValue(new Response("{}"));
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = original;
  });

  it("فهرست رویدادها ثابت و محدود است", () => {
    expect(ANALYTICS_EVENTS).toContain("form_success");
    expect(ANALYTICS_EVENTS.length).toBeLessThanOrEqual(12);
  });

  it("بدون تنظیم VITE_ANALYTICS_ENDPOINT هیچ درخواستی ارسال نمی‌شود", () => {
    track("page_view", { path: "/" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("ویژگی‌های غیرمجاز (نام، تلفن، متن پیام) حذف می‌شوند", () => {
    const clean = sanitizeAnalyticsProps({
      path: "/contact",
      location: "hero",
      phone: "09121234567",
      name: "سارا",
      message: "جزئیات پرونده",
    } as unknown as Parameters<typeof sanitizeAnalyticsProps>[0]);

    expect(clean).toEqual({ path: "/contact", location: "hero" });
    expect(JSON.stringify(clean)).not.toContain("0912");
    expect(JSON.stringify(clean)).not.toContain("سارا");
  });

  it("مقدارهای بلند بریده می‌شوند تا متن آزاد جایی برای عبور نداشته باشد", () => {
    const clean = sanitizeAnalyticsProps({ path: `/${"x".repeat(200)}` });
    expect(clean.path.length).toBe(64);
  });
});
