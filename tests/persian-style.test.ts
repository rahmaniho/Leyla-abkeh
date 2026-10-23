import { describe, expect, it } from "vitest";
import { ARTICLES } from "../src/content/articles";

/**
 * آزمون زبان و رسم‌الخط مقالات
 * ------------------------------------------------------------------
 * مقالات این سایت برای مخاطب فارسی‌زبان نوشته می‌شوند؛ نه برای «اداری‌نویسی».
 * این آزمون‌ها سه چیز را تضمین می‌کنند:
 *   ۱. نویسه‌های عربی (ي، ك، ة، ى) و ترکیب دو‌نویسه‌ای «ه + U+0654» به متن برنگردند
 *      و کسرهٔ اضافه همیشه با «ۀ» (U+06C0) نوشته شود؛
 *   ۲. عبارت‌های اداری‌عربی («می‌باشد»، «می‌گردد»، «لذا»، «بدین‌وسیله»…) وارد نشوند؛
 *   ۳. نشانه‌گذاری فارسی درست بماند: فاصلۀ اضافه، ویرگول لاتین، فاصله قبل از نشانه.
 * قاعده‌ها در `docs/PERSIAN-STYLE.md` توضیح داده شده‌اند.
 */

/** واژه‌هایی که در نثر اداری فارسی جای فارسی روان را گرفته‌اند */
const ARABIC_BUREAUCRATIC = [
  "می‌باشد",
  "می‌باشند",
  "می‌گردد",
  "می‌گردند",
  "گردید",
  "گردیده",
  "لذا",
  "لکن",
  "علی‌ایحال",
  "بدین‌وسیله",
  "بدین‌جهت",
  "مبادرت",
  "اینجانب",
  "فیمابین",
  "علیهذا",
  "متعاقباً",
  "حاصله",
  "مورخ",
  "به عمل آید",
  "به عمل آمد",
  "صورت پذیرفت",
  "اقدام به عمل",
  "در راستای",
  "در خصوص",
  "در رابطه با",
  "لازم به ذکر",
  "قابل ذکر است",
];

/** متن بدون کدهای Markdown که در قضاوت زبانی نباید دخالت کنند */
function prose(body: string): string {
  return body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // تصویر
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // پیوند
    .replace(/^#{1,6}\s+/gm, "") // سرفصل
    .replace(/^\s*\d+\.\s+/gm, "") // شمارۀ فهرست
    .replace(/^\s*[-*]\s+/gm, "") // نشانۀ فهرست
    .replace(/[>*_`]/g, "");
}

describe("رسم‌الخط فارسی در مقالات", () => {
  it("هیچ مقاله‌ای نویسۀ عربی یا همزۀ اضافه ندارد", () => {
    const forbidden = [
      { char: "\u0647\u0654", name: "ۀ (ه + همزه)" },
      { char: "\u064A", name: "ي عربی" },
      { char: "\u0643", name: "ك عربی" },
      { char: "\u0629", name: "ة" },
      { char: "\u0649", name: "ى" },
    ];

    for (const article of ARTICLES) {
      for (const item of forbidden) {
        expect(article.body.includes(item.char), `${article.slug}: ${item.name}`).toBe(false);
      }
    }
  });

  it("نثر مقالات از واژه‌های اداری‌عربی پاک است", () => {
    for (const article of ARTICLES) {
      const text = prose(article.body);
      for (const word of ARABIC_BUREAUCRATIC) {
        // تطبیق واژۀ کامل؛ وگرنه «می‌گردد» داخل «برمی‌گردد» هم پیدا می‌شود
        const pattern = new RegExp(
          `(?<![\u0600-\u06FF\u200c])${word}(?![\u0600-\u06FF\u200c])`
        );
        expect(pattern.test(text), `${article.slug} شامل «${word}» است`).toBe(false);
      }
    }
  });

  it("نشانه‌گذاری فارسی است: بدون ویرگول و نقطه‌ویرگول لاتین، بدون فاصلۀ پیش از نشانه", () => {
    for (const article of ARTICLES) {
      const text = prose(article.body);
      expect(text.includes(","), `${article.slug}: ویرگول لاتین`).toBe(false);
      expect(text.includes(";"), `${article.slug}: نقطه‌ویرگول لاتین`).toBe(false);
      expect(text.includes("?"), `${article.slug}: علامت سؤال لاتین`).toBe(false);
      expect(/ [،؛:.!؟]/.test(text), `${article.slug}: فاصله پیش از نشانه`).toBe(false);
      expect(/ {2,}/.test(text), `${article.slug}: فاصلۀ تکراری`).toBe(false);
    }
  });

  it("در متن مقاله رقم لاتین به کار نمی‌رود (فقط مسیر تصویر و شمارۀ فهرست مجاز است)", () => {
    for (const article of ARTICLES) {
      const text = prose(article.body);
      const latinDigits = text.match(/[0-9]+/g) ?? [];
      expect(latinDigits, `${article.slug}: ${latinDigits.join(", ")}`).toEqual([]);
    }
  });

  it("هر مقاله کسرۀ اضافه را با «ۀ» می‌نویسد و «هی» ندارد", () => {
    for (const article of ARTICLES) {
      expect(/[\u0600-\u06FF]ۀ/.test(article.body), `${article.slug} شکل «ۀ» ندارد`).toBe(true);

      // واژه‌هایی که خودشان به «هی» ختم می‌شوند و «ۀ» در آن‌ها غلط است
      // «هی» در واژه‌هایی مثل گواهی، گزارش‌دهی و منتهی بخشی از خودِ واژه است
      const notEzafe = [/اهی$/, /دهی$/, /تهی$/];
      const offenders = (article.body.match(/[\u0600-\u06FF\u200c]+/g) ?? []).filter(
        (word) =>
          /هی$/.test(word) &&
          !notEzafe.some((suffix) => suffix.test(word))
      );
      expect(offenders, `${article.slug}: ${offenders.join(", ")}`).toEqual([]);
    }
  });

  it("عبارت‌های کلیدی جست‌وجو در متن دیده می‌شوند، نه در جایی پنهان", () => {
    const slug = "behtarin-vakil-qazvin";
    const article = ARTICLES.find((item) => item.slug === slug);
    expect(article, "مقالۀ انتخاب وکیل یافت نشد").toBeDefined();

    const visible = prose(article!.body);
    for (const phrase of [
      "بهترین وکیل قزوین",
      "وکیل زن",
      "بهترین وکیل مهریه",
      "بهترین وکیل کیفری",
      "انواع دعاوی",
    ]) {
      expect(visible.includes(phrase), `عبارت «${phrase}» در متن دیده نمی‌شود`).toBe(true);
    }
  });
});
