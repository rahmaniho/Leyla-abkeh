import { withBase } from "../lib/base";
import { siteConfig } from "../config/site";

interface BrandLogoProps {
  /** ارتفاع نمایش لوگو در پیکسل (عرض به‌نسبت محاسبه می‌شود) */
  height?: number;
  className?: string;
  /** بارگذاری فوری (برای هدر) یا تنبل (برای پاورقی) */
  priority?: boolean;
}

/**
 * لوگوی کامل رسمی دفتر (طلایی، بدون زمینه)
 * ------------------------------------------------------------------
 * لوگوی ارسالی وکیل به‌صورت کامل نمایش داده می‌شود: نشان، خطاطی «لیلا» و
 * نام لاتین. فایل‌ها پیش از تولید با حاشیۀ امن ۶٪ ذخیره شده‌اند تا هیچ
 * لبه‌ای (قوس طلایی سمت راست یا خط پایین نام) بریده نشود.
 *
 * `object-contain` + `w-auto` تضمین می‌کند نسبت تصویر حفظ شود و لوگو هرگز
 * کشیده یا برش نخورد.
 */
export default function BrandLogo({
  height = 48,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const { lockup, alt } = siteConfig.brand;
  const width = Math.round((height * lockup.width) / lockup.height);

  return (
    <picture className={className}>
      <source
        type="image/webp"
        srcSet={`${withBase(lockup.webp)} ${lockup.width}w, ${withBase(lockup.webpLarge)} 700w`}
        sizes={`${height}px`}
      />
      <img
        src={withBase(lockup.png)}
        srcSet={`${withBase(lockup.png)} ${lockup.width}w, ${withBase(lockup.pngLarge)} 700w`}
        sizes={`${height}px`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-auto w-auto max-w-full object-contain"
        style={{ height }}
      />
    </picture>
  );
}
