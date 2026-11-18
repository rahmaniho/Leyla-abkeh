import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

const manifestRaw = read("public/admin/manifest.webmanifest");
const adminHtml = read("public/admin/index.html");
const sw = read("public/admin/sw.js");
const netlifyToml = read("netlify.toml");
const manifest = JSON.parse(manifestRaw) as Record<string, unknown>;

describe("وب‌اپ مدیریت (PWA) — manifest", () => {
  it("فیلدهای اصلی یک وب‌اپ نصب‌پذیر را دارد", () => {
    expect(manifest.name).toBeTruthy();
    expect(String(manifest.name)).toContain("مدیریت");
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/admin/");
    expect(manifest.scope).toBe("/admin/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.lang).toBe("fa-IR");
    expect(manifest.dir).toBe("rtl");
    expect(manifest.theme_color).toBe("#0f1c28");
    expect(manifest.background_color).toBe("#0f1c28");
  });

  it("آیکن‌های ۱۹۲ و ۵۱۲ تعریف شده‌اند و موجودند", () => {
    const icons = manifest.icons as { src: string; sizes: string }[];
    expect(Array.isArray(icons)).toBe(true);
    const sizes = icons.flatMap((icon) => icon.sizes.split(" "));
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    for (const icon of icons) {
      expect(existsSync(path.join(root, "public", icon.src)), `آیکن ${icon.src} یافت نشد`).toBe(true);
    }
  });

  it("میان‌بُرهای مقالهٔ جدید و فهرست مقالات تعریف شده‌اند", () => {
    const shortcuts = manifest.shortcuts as { url: string }[];
    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.map((s) => s.url)).toContain("/admin/#/collections/blog/entries/new");
  });
});

describe("وب‌اپ مدیریت (PWA) — پوسته و سرویس‌ورکر", () => {
  it("صفحهٔ پنل RTL و فارسی است، عنوان درست دارد و ایندکس نمی‌شود", () => {
    expect(adminHtml).toContain('<html lang="fa" dir="rtl">');
    expect(adminHtml).toContain("<title>پنل مدیریت سایت");
    expect(adminHtml).toContain('name="robots" content="noindex, nofollow"');
  });

  it("manifest، آیکن اپل و metaهای PWA لینک شده‌اند", () => {
    expect(adminHtml).toContain('rel="manifest" href="/admin/manifest.webmanifest"');
    expect(adminHtml).toContain('rel="apple-touch-icon"');
    expect(adminHtml).toContain('name="apple-mobile-web-app-capable"');
    expect(adminHtml).toContain('name="theme-color" content="#0f1c28"');
    expect(adminHtml).toContain('name="mobile-web-app-capable"');
  });

  it("سرویس‌ورکر با scope پنل ثبت می‌شود و فقط پوسته را کش می‌کند", () => {
    expect(adminHtml).toContain('navigator.serviceWorker.register("/admin/sw.js"');
    expect(sw).toContain('"/admin/"');
    expect(sw).toContain('SHELL_CACHE');
    expect(sw).toContain('request.mode === "navigate"');
    /* فراخوان‌های مدیریتی و CDN نباید کش شوند */
    expect(sw).toContain('url.origin !== self.location.origin');
  });

  it("Decap CMS با نسخهٔ قفل‌شده و ویجت Identity بارگذاری می‌شوند", () => {
    expect(adminHtml).toContain("decap-cms@3.17.1");
    expect(adminHtml).toContain("identity.netlify.com/v1/netlify-identity-widget.js");
    expect(adminHtml).not.toMatch(/src="http:\/\//);
  });

  it("هدرهای /admin همچنان noindex و no-store هستند و CSP، CDNهای هره را مجاز می‌کند", () => {
    const adminBlock = netlifyToml.match(/for = "\/admin\/\*"[\s\S]*?(?=\n\[|$)/)?.[0] ?? "";
    expect(adminBlock).toContain('X-Robots-Tag = "noindex, nofollow"');
    expect(adminBlock).toContain('Cache-Control = "no-store"');
    expect(adminBlock).toContain("unpkg.com");
    expect(adminBlock).toContain("identity.netlify.com");
  });
});
