/**
 * تصاویر شاخص مقالات
 * ------------------------------------------------------------------
 * تصاویری که در `public/images/covers` نگه‌داری می‌شوند، در دو اندازه و سه
 * قالب (AVIF/WebP/JPEG) تولید شده‌اند:
 *
 *   <نام>-cover.jpg       ۱۲۰۰×۶۳۰
 *   <نام>-cover-640.jpg    ۶۴۰×۳۳۶
 *   و همان‌ها با پسوند .webp و .avif
 *
 * اگر تصویری از پنل مدیریت در `/uploads` بارگذاری شود (بدون نسخه‌های
 * چندگانه)، همان فایل اصلی با یک `img` ساده نمایش داده می‌شود؛ بنابراین
 * افزودن تصویر از CMS هرگز باعث شکستن صفحه نمی‌شود.
 */
import { withBase, withBaseSrcSet } from "./base";

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;
export const COVER_SMALL_WIDTH = 640;
export const COVER_SMALL_HEIGHT = 336;

/** نسبت تصویر شاخص (برای جلوگیری از پرش چیدمان) */
export const COVER_RATIO = `${COVER_WIDTH} / ${COVER_HEIGHT}`;

const VARIANT_PATTERN = /^\/images\/covers\/[a-z0-9-]+\.jpe?g$/i;

export interface CoverImage {
  /** فایل اصلی (JPEG) */
  src: string;
  /** نسخه‌های چندگانه برای `img` */
  srcSet?: string;
  /** منابع AVIF/WebP برای `<picture>` */
  sources: { type: string; srcSet: string }[];
}

export function coverImage(cover: string): CoverImage {
  const src = withBase(cover);
  if (!VARIANT_PATTERN.test(cover)) return { src, sources: [] };

  const stem = cover.replace(/\.jpe?g$/i, "");
  return {
    src,
    sources: [
      { type: "image/avif", srcSet: withBaseSrcSet(`${stem}-640.avif 640w, ${stem}.avif 1200w`) },
      { type: "image/webp", srcSet: withBaseSrcSet(`${stem}-640.webp 640w, ${stem}.webp 1200w`) },
    ],
    srcSet: withBaseSrcSet(`${stem}-640.jpg 640w, ${stem}.jpg 1200w`),
  };
}

/** `sizes` مناسب برای تصویر شاخص در صفحهٔ مقاله */
export const COVER_SIZES = "(min-width: 1280px) 880px, (min-width: 1024px) 70vw, 100vw";
/** `sizes` مناسب برای بندانگشتی در فهرست مقالات */
export const CARD_SIZES = "(min-width: 1024px) 380px, (min-width: 768px) 45vw, 92vw";
