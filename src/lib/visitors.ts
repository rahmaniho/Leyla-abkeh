/**
 * بیکن شمارش بازدید — حریم‌خصوصی‌محور و اختیاری
 * ------------------------------------------------------------------
 * - فقط مسیر صفحه (pathname) ارسال می‌شود؛ کوئری، هشتگ، کوکی و شناسه کاربر هرگز ارسال نمی‌شود.
 * - هیچ کوکی، fingerprint یا localStorage روی دستگاه کاربر نگه‌داری نمی‌شود.
 * - اگر هدر Do Not Track فعال باشد، هیچ درخواستی فرستاده نمی‌شود.
 * - مسیرهای زیر شمارش نمی‌شوند: /admin* (پنل مدیریت) و /api* (توابع).
 * - خطای شبکه یا سرور هرگز تجربه کاربر را مختل نمی‌کند؛ پیام خطا نمایش داده نمی‌شود.
 * - payload با sendBeacon ارسال می‌شود؛ اگر مرورگر از آن پشتیبانی نکند، شمارش بی‌صدا رد می‌شود (هرگز خطا یا درخواست دیگر تولید نمی‌کند).
 */

const ENDPOINT = "/api/visit";
const PATH_MAX = 128;
const PATH_RE = /^\/[A-Za-z0-9._~/%-]*$/;

/** مسیر را از کوئری/هشتگ جدا می‌کند، کوتاه و بی‌خطر می‌سازد؛ اگر مجاز نباشد null. */
export function sanitizeVisitPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.split("?")[0].split("#")[0].slice(0, PATH_MAX);
  if (!clean.startsWith("/")) return null;
  if (!PATH_RE.test(clean)) return null;
  if (clean === "/admin" || clean.startsWith("/admin/") || clean.startsWith("/api/")) return null;
  return clean;
}

function doNotTrackEnabled(): boolean {
  try {
    const nav = navigator as Navigator & { doNotTrack?: string; msDoNotTrack?: string };
    const value = nav.doNotTrack ?? nav.msDoNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack;
    return value === "1" || value === "yes";
  } catch {
    return false;
  }
}

export const visitorTrackingEnabled = true;

export function trackPageView(pathname: string): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (!visitorTrackingEnabled) return;
  if (doNotTrackEnabled()) return;

  const path = sanitizeVisitPath(pathname);
  if (!path) return;

  const body = JSON.stringify({ path });
  try {
    // sendBeacon تنها روش ارسال است تا هیچ درخواست fetch ناخواسته‌ای در مسیر کاربر یا تست‌ها ننشیند
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(ENDPOINT, blob);
    }
  } catch {
    /* شمارش بازدید هرگز مسیر کاربر را متوقف نمی‌کند */
  }
}
