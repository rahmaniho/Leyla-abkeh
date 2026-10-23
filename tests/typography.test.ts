import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * آزمون تایپوگرافی — فونت‌های B Nazanin و B Titr
 * ------------------------------------------------------------------
 * این آزمون‌ها از سه چیز محافظت می‌کنند:
 * ۱. فایل‌های فونت واقعاً در مخزن و قابل سرو باشند (self-host، بدون CDN).
 * ۲. پشتۀ فونت درست تعریف شده باشد: متن با نازنین، تیتر با تیتر،
 *    و ارقام (فارسی/عربی/لاتین) با فونت تیتر.
 * ۳. همزۀ اضافه (ه + U+0654) دوباره به متن‌ها برنگردد؛ فونت‌های B این
 *    نویسه را ندارند و مرورگر مجبور می‌شود آن را از فونت دیگری بردارد که
 *    نتیجه‌اش همزۀ جدا‌افتاده و ناهم‌خوان است. شکل درستِ ذخیره‌شده «ۀ» است.
 */

const root = process.cwd();
const publicFile = (urlPath: string) => path.join(root, "public", urlPath.replace(/^\/+/, ""));
const css = readFileSync(path.join(root, "src", "index.css"), "utf8");
const html = readFileSync(path.join(root, "index.html"), "utf8");

/** طول دادۀ فونت را از سربرگ WOFF/WOFF2 می‌خواند */
function woffSignature(file: string): string {
  const buffer = readFileSync(file);
  return buffer.toString("ascii", 0, 4);
}

describe("فونت‌های محلی", () => {
  it.each(["BNazanin", "BTitrBold"])("%s در دو قالب woff و woff2 موجود است", (name) => {
    const woff = publicFile(`/fonts/${name}.woff`);
    const woff2 = publicFile(`/fonts/${name}.woff2`);

    expect(woffSignature(woff)).toBe("wOFF");
    expect(woffSignature(woff2)).toBe("wOF2");
    expect(statSync(woff).size).toBeGreaterThan(5_000);
    // فونت‌ها باید سبک بمانند تا بارگذاری اولیه کند نشود
    expect(statSync(woff2).size).toBeLessThan(80_000);
  });

  it("هر دو فونت در HTML پیش‌بارگذاری می‌شوند", () => {
    for (const name of ["BNazanin", "BTitrBold"]) {
      const pattern = new RegExp(
        `<link[^>]+as="font"[^>]+href="/fonts/${name}\\.woff2"|<link[^>]+href="/fonts/${name}\\.woff2"[^>]+as="font"`,
        "s"
      );
      expect(html).toMatch(pattern);
    }
  });
});

describe("پشتۀ فونت", () => {
  it("B Nazanin برای متن و B Titr برای تیترها تعریف شده است", () => {
    expect(css).toMatch(/font-family:\s*"B Nazanin"/);
    expect(css).toMatch(/font-family:\s*"B Titr"/);
    expect(css).toMatch(/--font-sans:\s*"B Titr Digits",\s*"B Nazanin"/);
    expect(css).toMatch(/--font-display:\s*"B Titr",\s*"B Nazanin"/);
  });

  it("ارقام فارسی، عربی و لاتین با فونت تیتر رندر می‌شوند", () => {
    const digitsFace = css.slice(css.indexOf('"B Titr Digits"'));
    expect(digitsFace).toMatch(/unicode-range:\s*U\+0030-0039,\s*U\+0660-0669,\s*U\+06F0-06F9/);
  });

  it("تیترها همیشه فونت نمایشی می‌گیرند", () => {
    expect(css).toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*\{[^}]*font-family:\s*var\(--font-display\)/s);
  });

  it("فونت پشتیبان برای حروف لاتین و نشانه‌های غایب باقی می‌ماند", () => {
    expect(css).toMatch(/--font-sans:[^;]*"Vazirmatn"/);
  });

  /**
   * B Nazanin در یک em یکسان کوچک‌تر از بقیۀ فونت‌ها کشیده می‌شود
   * (ارتفاع بدنۀ حروف ≈ ۰٫۵۸۶em در برابر ۰٫۶۷۴em وازیرمتن).
   * جبران آن با size-adjust انجام می‌شود، نه با تغییر ۱۵۰ کلاس اندازه.
   */
  it("B Nazanin با ضریب ۱۱۶٪ (دو پله بزرگ‌تر) رندر می‌شود", () => {
    const nazanin = css.slice(css.indexOf('font-family: "B Nazanin"'), css.indexOf('font-family: "B Titr"'));
    expect(nazanin).toMatch(/size-adjust:\s*116%/);
  });

  it("تیترها و ارقام اندازۀ خودشان را نگه می‌دارند", () => {
    const titr = css.slice(css.indexOf('font-family: "B Titr"'), css.indexOf('font-family: "Vazirmatn"'));
    expect(titr).not.toMatch(/size-adjust/);
  });

  it("فونت پشتیبان همان ضریب را دارد تا هنگام تعویض فونت پرش اندازه نباشد", () => {
    const vazir = css.slice(css.indexOf('font-family: "Vazirmatn"'));
    expect(vazir).toMatch(/size-adjust:\s*116%/);
  });
});

describe("سازگاری نویسه‌ها با فونت", () => {
  /** همۀ فایل‌های متنی پروژه (بدون اسناد تاریخی) */
  const textFiles = (() => {
    const out: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) {
        const rel = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(rel);
        else if (/\.(tsx?|mjs|html)$/.test(entry.name)) out.push(rel);
      }
    };
    for (const dir of ["src", "netlify"]) walk(dir);
    out.push("index.html");
    return out;
  })();

  it(`هیچ‌کدام از ${textFiles.length} فایل متنی همزۀ اضافۀ ترکیبی (U+0654) ندارد`, () => {
    const offenders = textFiles.filter((file) => {
      const content = readFileSync(path.join(root, file), "utf8");
      return content.includes("\u0647\u0654") || content.includes("\u06d5\u0654");
    });

    expect(offenders, `فایل‌های دارای ه + U+0654: ${offenders.join(", ")}`).toEqual([]);
  });

  it("شکل درست «ۀ» در متن‌های سایت به کار رفته است", () => {
    expect(readFileSync(path.join(root, "src", "config", "site.ts"), "utf8")).toContain("شمارۀ");
  });
});
