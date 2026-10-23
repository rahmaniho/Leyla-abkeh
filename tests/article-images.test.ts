import { statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ARTICLES } from "../src/content/articles";
import { renderMarkdown } from "../src/content/articles";
import { responsiveImage } from "../src/lib/images";

const root = process.cwd();
const withFigures = ARTICLES.filter((article) => article.body.includes("/images/articles/"));

describe("تصاویر داخل متن مقالات", () => {
  it("هر مقاله حداقل یک تصویر توضیحی دارد", () => {
    expect(withFigures.length).toBe(ARTICLES.length);
  });

  it("همۀ فایل‌های تصویر داخل متن در سه قالب و دو اندازه موجودند", () => {
    for (const article of withFigures) {
      const paths = Array.from(article.body.matchAll(/\]\((\/images\/articles\/[^\s")]+)/g)).map(
        (match) => match[1]
      );
      expect(paths.length).toBeGreaterThan(0);

      for (const imagePath of paths) {
        // مسیر باید به نسخۀ بزرگ ۱۲۰۰w اشاره کند
        expect(imagePath, `مسیر ${imagePath} باید -1200 داشته باشد`).toMatch(/-1200\.jpe?g$/);
        const stem = imagePath.replace(/-1200\.jpe?g$/i, "");

        for (const size of ["-1200", "-640"]) {
          for (const ext of ["jpg", "webp", "avif"]) {
            const file = path.join(root, "public", `${stem}${size}.${ext}`.replace(/^\//, ""));
            expect(() => statSync(file), `فایل ${file} یافت نشد`).not.toThrow();
            expect(statSync(file).size, `فایل ${file} خالی است`).toBeGreaterThan(1000);
          }
        }
      }
    }
  });

  it("هر تصویر متن، متن جایگزین (alt) معنادار دارد", () => {
    for (const article of withFigures) {
      const images = Array.from(article.body.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g));
      for (const [, alt, target] of images) {
        expect(alt.trim().length, `alt کوتاه در ${article.slug}`).toBeGreaterThan(20);
        expect(alt, `alt نباید نام فایل باشد: ${target}`).not.toContain(".jpg");
      }
    }
  });

  it("HTML نهایی از figure با زیرنویس استفاده می‌کند و پاراگراف نامعتبر ندارد", () => {
    for (const article of withFigures) {
      expect(article.html).toContain('<figure class="article-figure">');
      expect(article.html).toContain("<figcaption>");
      expect(article.html).toContain("<picture>");
      expect(article.html).not.toContain("<p><figure");
      expect(article.html).toContain('loading="lazy"');
      expect(article.html).toContain('width="1200"');
      expect(article.html).toContain('height="675"');
    }
  });

  it("مسیر تصویر به srcset سه‌قالبی و دو اندازه تبدیل می‌شود", () => {
    const image = responsiveImage("/images/articles/chek-pardakht-1200.jpg");
    expect(image.src).toBe("/images/articles/chek-pardakht-1200.jpg");
    expect(image.srcSet).toBe(
      "/images/articles/chek-pardakht-640.jpg 640w, /images/articles/chek-pardakht-1200.jpg 1200w"
    );
    expect(image.sources.map((source) => source.type)).toEqual(["image/avif", "image/webp"]);
    expect(image.sources[0].srcSet).toContain("chek-pardakht-1200.avif 1200w");
  });

  it("تصویر بارگذاری‌شده از پنل به img ساده تبدیل می‌شود (بدون ۴۰۴)", () => {
    const html = renderMarkdown("![تصویر آزمایشی از پنل](/uploads/photo.jpg)");
    expect(html).toContain('<img src="/uploads/photo.jpg"');
    expect(html).not.toContain("srcset");
    expect(html).not.toContain("<p><figure");
  });

  it("HTML خام در متن تصویر خنثی می‌شود (ضد XSS)", () => {
    const title = 'a "b" <b>';
    const html = renderMarkdown(`![<script>alert(1)</script>](</images/articles/x-1200.jpg> "${title}")`);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
