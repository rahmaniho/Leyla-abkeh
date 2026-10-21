import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const netlifyToml = read("netlify.toml");
const adminConfig = read("public/admin/config.yml");
const verification = JSON.parse(read("src/config/verification.json")) as {
  label?: string;
  key?: string;
  detail?: string;
}[];

describe("پیکربندی استقرار Netlify", () => {
  it("دستور بیلد، پوشهٔ انتشار و نسخهٔ Node درست است", () => {
    expect(netlifyToml).toContain('command = "npm run build"');
    expect(netlifyToml).toContain('publish = "dist"');
    expect(netlifyToml).toMatch(/NODE_VERSION\s*=\s*"22"/);
  });

  it("مسیر عمومی تابع مشاوره به تابع Netlify بازنویسی می‌شود", () => {
    const redirect = netlifyToml.match(/\[\[redirects\]\][\s\S]*?(?=\n\[|$)/)?.[0] ?? "";
    expect(redirect).toContain('from = "/api/consultation"');
    expect(redirect).toContain('to = "/.netlify/functions/consultation"');
    expect(redirect).toContain("status = 200");
  });

  it("هدرهای امنیتی اصلی وجود دارند", () => {
    for (const header of [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]) {
      expect(netlifyToml, `هدر ${header} یافت نشد`).toContain(header);
    }
  });

  it("CSP اسکریپت درون‌خطی را مجاز نمی‌کند و فرم‌ها فقط به خود سایت می‌روند", () => {
    const csp = netlifyToml.match(/Content-Security-Policy = "([^"]+)"/)?.[1] ?? "";
    expect(csp).toBeTruthy();
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("دارایی‌های هش‌دار کش طولانی و پنل مدیریت noindex دارند", () => {
    expect(netlifyToml).toContain('for = "/assets/*"');
    expect(netlifyToml).toContain('Cache-Control = "public, max-age=31536000, immutable"');
    expect(netlifyToml).toContain('X-Robots-Tag = "noindex, nofollow"');
  });
});

describe("پیکربندی Decap CMS", () => {
  it("بک‌اند و مسیر محتوا با ساختار پروژه هم‌راستا هستند", () => {
    expect(adminConfig).toMatch(/backend:\s*\n\s*name:\s*git-gateway/);
    expect(adminConfig).toContain("folder: src/content/blog");
    expect(adminConfig).toMatch(/media_folder:\s*"?public\/uploads"?/);
    expect(adminConfig).toMatch(/public_folder:\s*"\/uploads"/);
    expect(adminConfig).toContain("publish_mode: editorial_workflow");
  });

  it("فیلدهای لازم مقاله در پنل تعریف شده‌اند", () => {
    for (const field of [
      "title",
      "description",
      "publishDate",
      "lastReviewed",
      "author",
      "seoTitle",
      "metaDescription",
      "draft",
    ]) {
      expect(adminConfig, `فیلد ${field} در config.yml نیست`).toContain(`name: ${field}`);
    }
  });
});

describe("بی‌خطر بودن تنظیمات برای مخزن", () => {
  it("هیچ کلید محرمانه‌ای در کد فرانت‌اند استفاده نشده است", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx|js|mjs)$/.test(entry)) files.push(full);
      }
    };
    walk(path.join(root, "src"));

    const forbidden = /(TELEGRAM_BOT_TOKEN|RESEND_API_KEY|TURNSTILE_SECRET_KEY|CONSULTATION_WEBHOOK_SECRET)\s*[:=]\s*["'][^"']+/;
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(forbidden.test(content), `کلید محرمانه در ${path.relative(root, file)}`).toBe(false);
    }
  });

  it("فهرست موارد تأییدنشده ساختار درست دارد", () => {
    expect(Array.isArray(verification)).toBe(true);
    expect(verification.length).toBeGreaterThan(0);
    for (const item of verification) {
      expect(typeof item.label).toBe("string");
      expect(typeof item.detail).toBe("string");
      expect(String(item.label).length).toBeGreaterThan(2);
    }
  });
});
