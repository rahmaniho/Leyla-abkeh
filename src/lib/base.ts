/**
 * مسیر پایهٔ انتشار (Base path)
 * ------------------------------------------------------------------
 * - دامنهٔ اختصاصی یا Netlify → `"/"`
 * - GitHub Pages برای یک مخزن پروژه‌ای → `"/Leyla-abkeh/"`
 *
 * مقدار از `base` در vite.config.ts می‌آید (متغیر محیطی `VITE_BASE_PATH`).
 * هر نشانی مطلق داخلی (تصویر، فونت، لینک) باید از `withBase` عبور کند تا
 * در هر دو حالت کار کند. نشانی‌های خارجی، `tel:`، `mailto:` و `#hash`
 * دست‌نخورده می‌مانند.
 */

const RAW_BASE: string = import.meta.env?.BASE_URL ?? "/";

/** مسیر پایه بدون اسلش انتهایی؛ مثال: `""` یا `"/Leyla-abkeh"` */
export const BASE_PATH = RAW_BASE.replace(/\/+$/, "");

/** نسخهٔ خالص و آزمون‌پذیر: افزودن پایه به یک نشانی داخلی */
export function withBasePath(path: string, base = BASE_PATH): string {
  if (!path.startsWith("/")) return path;
  return `${base}${path}`;
}

/** نسخهٔ خالص و آزمون‌پذیر: حذف پایه از `pathname` مرورگر */
export function stripBaseFrom(pathname: string, base = BASE_PATH): string {
  if (!base) return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length);
  return pathname;
}

/** نشانی داخلی را زیر مسیر پایه قرار می‌دهد */
export function withBase(path: string): string {
  return withBasePath(path, BASE_PATH);
}

/** `srcset` را با مسیر پایه بازسازی می‌کند ("/a.avif 560w, /b.avif 1122w") */
export function withBaseSrcSet(srcSet: string, base = BASE_PATH): string {
  return srcSet
    .split(",")
    .map((entry) => {
      const [url, descriptor] = entry.trim().split(/\s+/, 2);
      return descriptor ? `${withBasePath(url, base)} ${descriptor}` : withBasePath(url, base);
    })
    .join(", ");
}

/** مسیر پایه را از `pathname` مرورگر حذف می‌کند */
export function stripBase(pathname: string): string {
  return stripBaseFrom(pathname, BASE_PATH);
}
