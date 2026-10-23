/**
 * سنجش رفتار کاربر — حریم‌خصوصی‌محور و پیش‌فرض خاموش
 * ------------------------------------------------------------------
 * اهداف:
 *  - فهمیدن این‌که کدام صفحه/CTA به ثبت درخواست مشاوره می‌رسد
 *  - شمارش خطاهای اعتبارسنجی و ارسال‌های ناموفق
 *  - بدون هیچ ابزار تحلیلی خارجی و بدون کوکی
 *
 * قواعد سخت:
 *  - هیچ نام، شمارهی تماس، متن پیام یا شناسهی کاربر ارسال نمی‌شود.
 *  - فقط رویدادهای فهرست‌شده و ویژگی‌های مجاز عبور می‌کنند.
 *  - اگر `VITE_ANALYTICS_ENDPOINT` تنظیم نشده باشد، هیچ درخواستی فرستاده نمی‌شود.
 *    (پس تا تصمیم مالک، هزینه و اثر حریم خصوصی صفر است.)
 */

export const ANALYTICS_EVENTS = [
  "page_view",
  "cta_click",
  "form_start",
  "form_submit",
  "form_success",
  "form_validation_error",
  "form_rate_limited",
  "form_unavailable",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** فقط این کلیدها مجازند؛ بقیه حذف می‌شوند (ضد نشت داده). */
const ALLOWED_PROPS = new Set([
  "path",
  "location",
  "target",
  "topic",
  "field",
  "status",
  "reason",
  "channel",
]);

export type AnalyticsProps = Partial<
  Record<"path" | "location" | "target" | "topic" | "field" | "status" | "reason" | "channel", string>
>;

const ENDPOINT = import.meta.env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
const DEBUG = import.meta.env?.VITE_ANALYTICS_DEBUG === "1";

/** مقادیر کوتاه و بی‌خطر؛ متن آزاد کاربر هرگز از این‌جا عبور نمی‌کند. */
export function sanitizeAnalyticsProps(props: AnalyticsProps): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(key)) continue;
    if (typeof value !== "string" || !value) continue;
    clean[key] = value.slice(0, 64);
  }
  return clean;
}

/**
 * ارسال یک رویداد. هرگز خطا پرتاب نمی‌کند و مسیر کاربر را متوقف نمی‌کند.
 * `keepalive` باعث می‌شود رویداد پیش از باز شدن لینک هم از دست نرود.
 */
export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  const payload = { event, ...sanitizeAnalyticsProps(props) };

  if (DEBUG) {
    console.info("[analytics]", payload);
  }

  if (!ENDPOINT || typeof navigator === "undefined") return;

  try {
    const body = JSON.stringify(payload);
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    });
  } catch {
    /* سنجش هرگز نباید تجربهی کاربر را خراب کند */
  }
}

/** آیا سنجش در این استقرار فعال است؟ (برای نمایش توضیح در سیاست حریم خصوصی) */
export const analyticsEnabled = Boolean(ENDPOINT);

/** فهرست رویدادهای تعریف‌شده — برای مستندسازی و آزمون */
export const ANALYTICS_DOCS: Record<AnalyticsEvent, string> = {
  page_view: "بازدید صفحه (فقط مسیر، بدون شناسه)",
  cta_click: "کلیک روی دکمهی اصلی؛ location = جای دکمه، target = مقصد",
  form_start: "شروع پر کردن فرم مشاوره (اولین تغییر در هر فیلد)",
  form_submit: "تلاش برای ارسال فرم",
  form_success: "ثبت موفق درخواست",
  form_validation_error: "خطای اعتبارسنجی؛ field = نام فیلد (بدون مقدار)",
  form_rate_limited: "محدودیت نرخ درخواست",
  form_unavailable: "نبود سرور دریافت درخواست یا خطای پیکربندی",
};
