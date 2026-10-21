import { withBase } from "../lib/base";
import { siteConfig } from "../config/site";

interface BrandLogoProps {
  /** اندازهٔ مارک در نوار بالا/پاورقی (پیکسل) */
  size?: number;
  className?: string;
}

/**
 * مارک رسمی دفتر (طلایی، بدون زمینه)
 * ------------------------------------------------------------------
 * لوگوی ارسالی وکیل روی زمینهٔ مشکی است؛ نسخهٔ PNG/WebP آن با آلفای
 * استخراج‌شده در `public/images/brand/logo-mark.*` نگه‌داری می‌شود تا روی
 * پس‌زمینهٔ سرمه‌ای سایت بدون قاب مربعی دیده شود.
 */
export default function BrandLogo({ size = 44, className = "" }: BrandLogoProps) {
  const { mark, alt } = siteConfig.brand;

  return (
    <picture className={className}>
      <source type="image/webp" srcSet={withBase(mark.webp)} />
      <img
        src={withBase(mark.png)}
        alt={alt}
        width={size}
        height={Math.round((size * mark.height) / mark.width)}
        loading="eager"
        decoding="async"
        className="h-auto w-auto object-contain"
        style={{ width: size }}
      />
    </picture>
  );
}
