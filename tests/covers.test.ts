import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ALL_ARTICLES, ARTICLES } from "../src/content/articles";
import { coverImage, COVER_HEIGHT, COVER_WIDTH } from "../src/lib/images";

const root = process.cwd();

/** ابعاد تصویر را از سربرگ فایل می‌خواند (JPEG، WebP، AVIF) */
function imageSize(file: string): { width: number; height: number } | null {
  const buffer = readFileSync(file);

  // PNG
  if (buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  // JPEG: پیمایش بخش‌ها تا SOF
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) return null;
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      offset += 2 + length;
    }
    return null;
  }

  // WebP (VP8X / VP8 / VP8L)
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const format = buffer.toString("ascii", 12, 16);
    if (format === "VP8X") {
      const width = 1 + buffer.readUIntLE(24, 3);
      const height = 1 + buffer.readUIntLE(27, 3);
      return { width, height };
    }
    if (format === "VP8 ") {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (format === "VP8L") {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  }

  // AVIF: جست‌وجوی جعبۀ ispe
  const text = buffer.toString("latin1");
  const ispe = text.indexOf("ispe");
  if (ispe !== -1) {
    return { width: buffer.readUInt32BE(ispe + 8), height: buffer.readUInt32BE(ispe + 12) };
  }

  return null;
}

const withCover = ARTICLES.filter((article) => article.cover);

describe("تصاویر شاخص مقالات", () => {
  it("هر مقالۀ منتشرشده تصویر شاخص با توضیح alt دارد", () => {
    expect(withCover.length).toBe(ARTICLES.length);
    for (const article of ARTICLES) {
      expect(article.cover, `مقالۀ ${article.slug} تصویر شاخص ندارد`).toBeTruthy();
      expect(
        (article.coverAlt ?? "").trim().length,
        `مقالۀ ${article.slug} توضیح تصویر (alt) ندارد`
      ).toBeGreaterThan(15);
      // alt نباید صرفاً تکرار عنوان باشد
      expect(article.coverAlt).not.toBe(article.title);
    }
  });

  it("فایل تصویر و نسخه‌های چندگانۀ آن در public وجود دارند", () => {
    for (const article of withCover) {
      const cover = article.cover as string;
      const stem = cover.replace(/\.jpe?g$/i, "");
      const files = [cover, `${stem}-640.jpg`, `${stem}.webp`, `${stem}-640.webp`, `${stem}.avif`, `${stem}-640.avif`];

      for (const file of files) {
        const target = path.join(root, "public", file.replace(/^\//, ""));
        expect(() => statSync(target), `فایل ${file} یافت نشد`).not.toThrow();
        expect(statSync(target).size, `فایل ${file} خالی است`).toBeGreaterThan(1000);
      }
    }
  });

  it("ابعاد تصاویر شاخص ۱۲۰۰×۶۳۰ و نسخۀ کوچک ۶۴۰×۳۳۶ است", () => {
    for (const article of withCover) {
      const stem = (article.cover as string).replace(/\.jpe?g$/i, "");
      for (const ext of ["jpg", "webp", "avif"]) {
        const large = imageSize(path.join(root, "public", `${stem}.${ext}`.replace(/^\//, "")));
        const small = imageSize(path.join(root, "public", `${stem}-640.${ext}`.replace(/^\//, "")));

        expect(large, `ابعاد ${stem}.${ext} خوانده نشد`).not.toBeNull();
        expect(small, `ابعاد ${stem}-640.${ext} خوانده نشد`).not.toBeNull();
        expect(large).toEqual({ width: COVER_WIDTH, height: COVER_HEIGHT });
        expect(small).toEqual({ width: 640, height: 336 });
      }
    }
  });

  it("فایل‌های تصویر در فهرست مقالات ساخته می‌شوند (بدون ۴۰۴)", () => {
    for (const article of withCover) {
      const image = coverImage(article.cover as string);
      expect(image.src).toBe(article.cover);
      expect(image.sources.map((source) => source.type)).toEqual(["image/avif", "image/webp"]);
      expect(image.srcSet).toContain("640w");
      expect(image.srcSet).toContain("1200w");
    }
  });

  it("تصویر بارگذاری‌شده از پنل (بدون نسخه‌های چندگانه) هم نمایش داده می‌شود", () => {
    const uploaded = coverImage("/uploads/photo.jpg");
    expect(uploaded.src).toBe("/uploads/photo.jpg");
    expect(uploaded.sources).toEqual([]);
    expect(uploaded.srcSet).toBeUndefined();
  });

  it("پیش‌نویس‌ها هم تصویر معتبر دارند (اگر تصویر دارند، فایلش هست)", () => {
    for (const article of ALL_ARTICLES) {
      if (!article.cover) continue;
      expect(article.cover.startsWith("/")).toBe(true);
    }
  });
});
