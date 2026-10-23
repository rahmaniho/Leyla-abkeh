import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ARTICLES } from "../src/content/articles";
import { siteConfig } from "../src/config/site";

const root = process.cwd();
const publicFile = (urlPath: string) => path.join(root, "public", urlPath.replace(/^\//, ""));

/** ابعاد تصویر را از سربرگ فایل می‌خواند (JPEG/WebP/PNG/AVIF) */
function imageSize(file: string): { width: number; height: number } | null {
  const buffer = readFileSync(file);

  if (buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

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

  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const format = buffer.toString("ascii", 12, 16);
    if (format === "VP8X") {
      return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
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

  const text = buffer.toString("latin1");
  const ispe = text.indexOf("ispe");
  if (ispe !== -1) {
    return { width: buffer.readUInt32BE(ispe + 8), height: buffer.readUInt32BE(ispe + 12) };
  }

  return null;
}

describe("پرترهی رسمی وکیل", () => {
  it("تصویر دیگر placeholder نیست و مسیرش در فایل‌های public موجود است", () => {
    expect(siteConfig.lawyer.photo.isPlaceholder).toBe(false);

    for (const file of ["/images/lawyer.jpg", "/images/lawyer-560.jpg"]) {
      const target = publicFile(file);
      expect(() => statSync(target), `فایل ${file} یافت نشد`).not.toThrow();
      expect(statSync(target).size, `فایل ${file} خالی است`).toBeGreaterThan(10_000);
    }
  });

  it("هر سه قالب (jpg/webp/avif) در دو اندازه موجود است", () => {
    for (const ext of ["jpg", "webp", "avif"]) {
      for (const suffix of ["", "-560"]) {
        const target = publicFile(`/images/lawyer${suffix}.${ext}`);
        expect(() => statSync(target), `فایل lawyer${suffix}.${ext} یافت نشد`).not.toThrow();
        expect(statSync(target).size).toBeGreaterThan(2_000);
      }
    }
  });

  it("ابعاد اعلام‌شده در تنظیمات با فایل واقعی می‌خواند و نسبت ۳:۴ دارد", () => {
    const { photo } = siteConfig.lawyer;
    const size = imageSize(publicFile("/images/lawyer.jpg"));

    expect(size).toEqual({ width: photo.width, height: photo.height });
    expect(photo.width / photo.height).toBeCloseTo(0.75, 2);

    const small = imageSize(publicFile("/images/lawyer-560.jpg"));
    expect(small?.width).toBe(560);
  });

  it("alt پرتره، نام و عنوان وکیل را دارد", () => {
    const { alt } = siteConfig.lawyer.photo;
    expect(alt).toContain(siteConfig.lawyer.name);
    expect(alt).toContain("وکیل");
  });
});

describe("لوگوی دفتر", () => {
  const { mark, lockup, alt } = siteConfig.brand;

  it("فایل‌های مارک و لوگوی کامل (PNG و WebP) موجودند", () => {
    for (const file of [mark.png, mark.webp, lockup.png, lockup.webp]) {
      const target = publicFile(file);
      expect(() => statSync(target), `فایل ${file} یافت نشد`).not.toThrow();
      expect(statSync(target).size, `فایل ${file} خالی است`).toBeGreaterThan(5_000);
    }
  });

  it("مارک شفاف است تا روی زمینهی سرمه‌ای بدون قاب مربعی دیده شود", () => {
    const png = readFileSync(publicFile(mark.png));
    // سربرگ IHDR: رنگ‌نوع ۶ = RGBA (یا ۳ = پالت با tRNS)
    expect(png.toString("ascii", 12, 16)).toBe("IHDR");
    expect([3, 6]).toContain(png[25]);
    if (png[25] === 6) {
      // گوشهی تصویر باید کاملاً شفاف باشد (زمینهی سیاه حذف شده)
      expect(png.some((byte) => byte === 0)).toBe(true);
    }
  });

  it("ابعاد اعلام‌شده با فایل واقعی می‌خواند", () => {
    expect(imageSize(publicFile(mark.png))).toEqual({ width: mark.width, height: mark.height });
    expect(imageSize(publicFile(lockup.png))).toEqual({ width: lockup.width, height: lockup.height });
    expect(imageSize(publicFile(lockup.pngLarge))).toEqual({ width: 700, height: 990 });
  });

  it("لوگو حاشیهی امن دارد تا هیچ لبه‌ای بریده نشود", () => {
    const png = readFileSync(publicFile(lockup.png));
    // گوشه‌های تصویر باید شفاف باشند (حاشیهی امن)، نه پیکسل طلایی
    expect(png.toString("ascii", 12, 16)).toBe("IHDR");
    expect([3, 6]).toContain(png[25]);
  });

  it("ویدیوی لوگوموشن با پوستر و ابعاد درست در دسترس است", () => {
    const video = statSync(publicFile(siteConfig.media.logoMotion.mp4));
    const poster = statSync(publicFile(siteConfig.media.logoMotion.poster));

    expect(video.size).toBeGreaterThan(50_000);
    expect(video.size).toBeLessThan(1_500_000);
    expect(poster.size).toBeGreaterThan(5_000);
    expect(siteConfig.media.logoMotion.width).toBe(416);
    expect(siteConfig.media.logoMotion.height).toBe(752);
  });

  it("alt لوگو معنادار است", () => {
    expect(alt).toContain("لیلا آبکه");
  });
});

describe("آیکون‌ها و تصویر اشتراک‌گذاری", () => {
  it("آیکون‌های اپلیکیشن در ابعاد استاندارد موجودند", () => {
    const icons: [string, number][] = [
      ["/icon-192.png", 192],
      ["/icon-512.png", 512],
      ["/apple-touch-icon.png", 180],
    ];
    for (const [file, size] of icons) {
      const dimensions = imageSize(publicFile(file));
      expect(dimensions, `آیکون ${file} خوانده نشد`).toEqual({ width: size, height: size });
    }
  });

  it("manifest همهی آیکون‌ها را با مسیر نسبی معرفی می‌کند", () => {
    const manifest = JSON.parse(readFileSync(path.join(root, "public/site.webmanifest"), "utf8")) as {
      icons: { src: string; sizes: string }[];
      start_url: string;
    };

    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    for (const icon of manifest.icons) {
      expect(icon.src.startsWith("/")).toBe(false);
    }
    expect(manifest.start_url.startsWith("./")).toBe(true);
  });

  it("og-image ابعاد استاندارد ۱۲۰۰×۶۳۰ دارد", () => {
    expect(imageSize(publicFile("/images/og-image.jpg"))).toEqual({ width: 1200, height: 630 });
  });
});

describe("تصاویر مقالات پس از افزودن هویت بصری", () => {
  it("همهی تصاویر شاخص و داخل متن هنوز موجودند", () => {
    for (const article of ARTICLES) {
      if (!article.cover) continue;
      const stem = article.cover.replace(/\.jpe?g$/i, "");
      for (const file of [`${stem}.jpg`, `${stem}-640.jpg`]) {
        expect(() => statSync(publicFile(file)), `فایل ${file} یافت نشد`).not.toThrow();
      }
    }
  });
});
