/**
 * تصاویر چندقالبی (شاخص و داخل متن)
 * ------------------------------------------------------------------
 * هر تصویر در سه قالب (AVIF/WebP/JPEG) و دو اندازه تولید می‌شود تا مرورگر
 * سبک‌ترین نسخۀ مناسب را انتخاب کند:
 *
 *   تصویر شاخص → public/images/covers/<نام>-cover.jpg  (۱۲۰۰×۶۳۰)
 *                public/images/covers/<نام>-cover-640.jpg (۶۴۰×۳۳۶)
 *
 *   تصویر داخل متن → public/images/articles/<نام>-1200.jpg (۱۲۰۰×۶۷۵)
 *                    public/images/articles/<نام>-640.jpg  (۶۴۰×۳۶۰)
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

/** نسبت تصویر شاخص و تصاویر داخل متن (برای جلوگیری از پرش چیدمان) */
export const COVER_RATIO = `${COVER_WIDTH} / ${COVER_HEIGHT}`;
export const FIGURE_WIDTH = 1200;
export const FIGURE_HEIGHT = 675;
export const FIGURE_RATIO = `${FIGURE_WIDTH} / ${FIGURE_HEIGHT}`;

export interface ResponsiveSource {
  type: string;
  srcSet: string;
}

export interface ResponsiveImage {
  /** فایل اصلی (JPEG) */
  src: string;
  /** نسخه‌های چندگانه برای `img` */
  srcSet?: string;
  /** منابع AVIF/WebP برای `<picture>` */
  sources: ResponsiveSource[];
}

/** `srcset` سه‌قالبی برای یک «ریشه» بدون پسوند */
function variants(stem: string, large: string, largeWidth: number, small: string, smallWidth: number) {
  const pair = (extension: string) =>
    `${small}.${extension} ${smallWidth}w, ${large}.${extension} ${largeWidth}w`;

  return {
    src: `${stem}${large.replace(stem, "")}.jpg`,
    srcSet: withBaseSrcSet(pair("jpg")),
    sources: [
      { type: "image/avif", srcSet: withBaseSrcSet(pair("avif")) },
      { type: "image/webp", srcSet: withBaseSrcSet(pair("webp")) },
    ],
  } satisfies ResponsiveImage;
}

/** تبدیل مسیر یک تصویر به ساختار `<picture>` (یا `img` ساده اگر نسخه ندارد) */
export function responsiveImage(path: string): ResponsiveImage {
  const src = withBase(path);

  // تصویر شاخص: /images/covers/<نام>.jpg + /images/covers/<نام>-640.jpg
  const cover = /^(\/images\/covers\/[a-z0-9-]+)\.jpe?g$/i.exec(path);
  if (cover) {
    const result = variants(cover[1], cover[1], COVER_WIDTH, `${cover[1]}-640`, COVER_SMALL_WIDTH);
    return { ...result, src };
  }

  // تصویر داخل متن: /images/articles/<نام>-1200.jpg + /images/articles/<نام>-640.jpg
  const figure = /^(\/images\/articles\/[a-z0-9-]+?)-1200\.jpe?g$/i.exec(path);
  if (figure) {
    const result = variants(
      `${figure[1]}-1200`,
      `${figure[1]}-1200`,
      FIGURE_WIDTH,
      `${figure[1]}-640`,
      640
    );
    return { ...result, src };
  }

  // مسیر ناشناخته یا فایل بارگذاری‌شده از پنل
  return { src, sources: [] };
}

/** مانند `coverImage` (سازگاری با کد قبلی) */
export function coverImage(cover: string): ResponsiveImage {
  return responsiveImage(cover);
}

/** `sizes` مناسب برای تصویر شاخص در صفحۀ مقاله */
export const COVER_SIZES = "(min-width: 1280px) 880px, (min-width: 1024px) 70vw, 100vw";
/** `sizes` مناسب برای بندانگشتی در فهرست مقالات */
export const CARD_SIZES = "(min-width: 1024px) 380px, (min-width: 768px) 45vw, 92vw";
/** `sizes` مناسب برای تصویر تمام‌عرض داخل متن مقاله */
export const FIGURE_SIZES = "(min-width: 1024px) 820px, 100vw";
