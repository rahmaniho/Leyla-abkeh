import { describe, expect, it } from "vitest";
import {
  LIMITS,
  normalizeDigits,
  normalizeIranPhone,
  phoneKind,
  toE164,
  validateSubmission,
} from "../src/lib/validation";

const validInput = {
  name: "سارا محمدی",
  phone: "09121234567",
  topic: "دعاوی خانواده",
  message: "دربارهٔ مهریه سوال دارم.",
  website: "",
  startedAt: 0,
};

describe("نرمال‌سازی ارقام", () => {
  it("ارقام فارسی و عربی را به لاتین تبدیل می‌کند", () => {
    expect(normalizeDigits("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
    expect(normalizeDigits("٠٩١٢١٢٣٤٥٦٧")).toBe("09121234567");
  });
});

describe("اعتبارسنجی شمارهٔ ایران", () => {
  it("موبایل با ارقام لاتین را می‌پذیرد", () => {
    expect(normalizeIranPhone("09121234567")).toBe("09121234567");
  });

  it("موبایل با ارقام فارسی و فاصله را می‌پذیرد", () => {
    expect(normalizeIranPhone("۰۹۱۲ ۱۲۳ ۴۵۶۷")).toBe("09121234567");
  });

  it("پیش‌شمارهٔ بین‌المللی را به فرم ملی تبدیل می‌کند", () => {
    expect(normalizeIranPhone("+98 912 123 4567")).toBe("09121234567");
    expect(normalizeIranPhone("00989121234567")).toBe("09121234567");
  });

  it("تلفن ثابت ۱۱ رقمی را می‌پذیرد", () => {
    expect(normalizeIranPhone("02833660000")).toBe("02833660000");
  });

  it("شماره‌های نامعتبر را رد می‌کند", () => {
    expect(normalizeIranPhone("12345")).toBeNull();
    expect(normalizeIranPhone("0912123456")).toBeNull();
    expect(normalizeIranPhone("abcdefghijk")).toBeNull();
    expect(normalizeIranPhone("")).toBeNull();
  });

  it("نوع شماره را تشخیص می‌دهد و E164 می‌سازد", () => {
    expect(phoneKind("09121234567")).toBe("mobile");
    expect(phoneKind("02833660000")).toBe("landline");
    expect(toE164("09121234567")).toBe("+989121234567");
  });
});

describe("اعتبارسنجی درخواست مشاوره", () => {
  it("درخواست معتبر را می‌پذیرد و شماره را نرمال می‌کند", () => {
    const result = validateSubmission({ ...validInput, phone: "۰۹۱۲ ۱۲۳ ۴۵۶۷" }, { now: 10_000 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.phone).toBe("09121234567");
      expect(result.data.phoneE164).toBe("+989121234567");
      expect(result.data.name).toBe("سارا محمدی");
    }
  });

  it("نام خالی یا کوتاه را رد می‌کند", () => {
    const result = validateSubmission({ ...validInput, name: "ا" }, { now: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.name).toBeTruthy();
  });

  it("تگ‌های HTML را از نام حذف می‌کند", () => {
    const result = validateSubmission({ ...validInput, name: "<b>سارا محمدی</b>" }, { now: 10_000 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe("سارا محمدی");
  });

  it("محتوای اسکریپت را از نام حذف می‌کند", () => {
    const result = validateSubmission(
      { ...validInput, name: "<script>alert(1)</script>سارا" },
      { now: 10_000 }
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).not.toContain("<");
  });

  it("شمارهٔ تلفن نامعتبر را با پیام فارسی رد می‌کند", () => {
    const result = validateSubmission({ ...validInput, phone: "123" }, { now: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.phone).toContain("شمارهٔ تماس معتبر نیست");
  });

  it("موضوع خارج از فهرست را رد می‌کند", () => {
    const result = validateSubmission({ ...validInput, topic: "موضوع ساختگی" }, { now: 10_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.topic).toBeTruthy();
  });

  it("شرح بیش از حد طولانی را رد می‌کند", () => {
    const result = validateSubmission(
      { ...validInput, message: "ا".repeat(LIMITS.maxMessageLength + 1) },
      { now: 10_000 }
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.message).toBeTruthy();
  });

  it("تلهٔ هرزنامه (فیلد website) را تشخیص می‌دهد", () => {
    const result = validateSubmission({ ...validInput, website: "http://spam.example" }, { now: 10_000 });
    expect(result.ok).toBe(false);
  });

  it("ارسال سریع‌تر از حد مجاز را رد می‌کند", () => {
    const result = validateSubmission({ ...validInput, startedAt: 10_000 }, { now: 11_000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.form).toContain("سریع");
  });

  it("فرم منقضی‌شده را رد می‌کند", () => {
    const now = 100 * 60 * 60 * 1000;
    const result = validateSubmission({ ...validInput, startedAt: 1 }, { now });
    expect(result.ok).toBe(false);
  });

  it("فقط فاصله به‌جای نام را رد می‌کند", () => {
    const result = validateSubmission({ ...validInput, name: "   " }, { now: 10_000 });
    expect(result.ok).toBe(false);
  });
});
