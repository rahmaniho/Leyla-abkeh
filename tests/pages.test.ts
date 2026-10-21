import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BASE_PATH, stripBase, stripBaseFrom, withBase, withBasePath, withBaseSrcSet } from "../src/lib/base";
import { pageHref } from "../src/lib/seo";

const root = process.cwd();
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const workflow = read(".github/workflows/pages.yml");

describe("مسیر پایۀ انتشار", () => {
  it("در حالت پیش‌فرض (دامنه/Netlify) پایه خالی است و مسیرها تغییر نمی‌کنند", () => {
    expect(BASE_PATH).toBe("");
    expect(withBase("/images/lawyer.jpg")).toBe("/images/lawyer.jpg");
    expect(withBase("https://example.com/x")).toBe("https://example.com/x");
    expect(withBase("tel:+989121234567")).toBe("tel:+989121234567");
    expect(withBase("#main")).toBe("#main");
    expect(stripBase("/services/")).toBe("/services/");
    expect(pageHref("/services")).toBe("/services/");
  });

  it("با پایۀ /Leyla-abkeh/ نشانی‌ها و مسیرها درست تبدیل می‌شوند", () => {
    const base = "/Leyla-abkeh";
    expect(withBasePath("/images/lawyer.jpg", base)).toBe("/Leyla-abkeh/images/lawyer.jpg");
    expect(withBasePath("https://example.com/x", base)).toBe("https://example.com/x");
    expect(withBasePath("#main", base)).toBe("#main");
    expect(withBaseSrcSet("/a.avif 560w, /b.avif 1122w", base)).toBe(
      "/Leyla-abkeh/a.avif 560w, /Leyla-abkeh/b.avif 1122w"
    );

    expect(stripBaseFrom("/Leyla-abkeh", base)).toBe("/");
    expect(stripBaseFrom("/Leyla-abkeh/", base)).toBe("/");
    expect(stripBaseFrom("/Leyla-abkeh/services/khanevadeh/", base)).toBe("/services/khanevadeh/");
    // مسیر بیرون از پایه دست‌نخورده می‌ماند (مثلاً ۴۰۴ خارج از دامنۀ پروژه)
    expect(stripBaseFrom("/other/path", base)).toBe("/other/path");
    // پیشوند ناقص نباید بریده شود
    expect(stripBaseFrom("/Leyla-abkeh-2/x", base)).toBe("/Leyla-abkeh-2/x");
  });

  it("srcset با توصیف‌گرهای عرض درست بازسازی می‌شود", () => {
    expect(withBaseSrcSet("/a.avif 560w, /b.avif 1122w")).toBe("/a.avif 560w, /b.avif 1122w");
    expect(withBaseSrcSet("/a.jpg")).toBe("/a.jpg");
  });

  it("manifest با مسیرهای نسبی برای هر دو حالت کار می‌کند", () => {
    const manifest = JSON.parse(read("public/site.webmanifest")) as {
      start_url: string;
      icons: { src: string }[];
    };
    expect(manifest.start_url.startsWith("./")).toBe(true);
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/")).toBe(false);
    }
  });

  it("فایل .nojekyll برای انتشار در GitHub Pages وجود دارد", () => {
    expect(() => read("public/.nojekyll")).not.toThrow();
  });
});

describe("گردش‌کار GitHub Pages", () => {
  it("روی main و به‌صورت دستی اجرا می‌شود و مجوزهای لازم را دارد", () => {
    expect(workflow).toContain("branches: [main]");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("pages: write");
    expect(workflow).toContain("id-token: write");
  });

  it("بیلد با مسیر پایه و نشانی مخزن انجام می‌شود", () => {
    expect(workflow).toContain("VITE_BASE_PATH: /${{ github.event.repository.name }}/");
    expect(workflow).toContain("VITE_SITE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}");
  });

  it("خروجی dist به Pages فرستاده می‌شود و کیفیت پیش از استقرار بررسی می‌شود", () => {
    expect(workflow).toContain("actions/upload-pages-artifact");
    expect(workflow).toContain("path: dist");
    expect(workflow).toContain("actions/deploy-pages");
    expect(workflow).toContain("npm run lint");
    expect(workflow).toContain("npm run test");
  });
});
