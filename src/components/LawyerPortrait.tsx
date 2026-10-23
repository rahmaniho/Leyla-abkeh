import { withBase, withBaseSrcSet } from "../lib/base";
import { siteConfig } from "../config/site";

interface LawyerPortraitProps {
  /** `sizes` مناسب محل استفاده */
  sizes: string;
  /** تصویر بالای صفحه: بارگذاری با اولویت بالا */
  priority?: boolean;
  className?: string;
}

/**
 * پرترۀ رسمی وکیل
 * ------------------------------------------------------------------
 * تصویر ارسالی وکیل (۷۶۲×۱۰۱۶) در سه قالب AVIF/WebP/JPEG و دو اندازه
 * (۷۶۲w و ۵۶۰w) در `public/images/lawyer.*` نگه‌داری می‌شود. ابعاد ثابت و
 * نسبت ۳:۴ از پرش چیدمان (CLS) جلوگیری می‌کند.
 */
export default function LawyerPortrait({ sizes, priority = false, className = "" }: LawyerPortraitProps) {
  const { photo } = siteConfig.lawyer;
  const base = photo.basePath;

  return (
    <picture>
      <source
        type="image/avif"
        srcSet={withBaseSrcSet(`${base}-560.avif 560w, ${base}.avif ${photo.width}w`)}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={withBaseSrcSet(`${base}-560.webp 560w, ${base}.webp ${photo.width}w`)}
        sizes={sizes}
      />
      <img
        src={withBase(`${base}.jpg`)}
        srcSet={withBaseSrcSet(`${base}-560.jpg 560w, ${base}.jpg ${photo.width}w`)}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={`aspect-[3/4] w-full bg-ink-soft object-cover object-top ${className}`.trim()}
      />
    </picture>
  );
}
