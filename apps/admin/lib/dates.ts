/**
 * ابزار تاریخ برای پنل (کلید روز به فرمت YYYY-MM-DD، هم‌راستا با ستون day در visit_stats)
 * برچسب‌ها با تقویم فارسی نمایش داده می‌شوند.
 */

export interface DayBucket {
  /** کلید روز UTC (مطابق ستون day در پایگاه‌داده) */
  key: string;
  /** برچسب کوتاه فارسی (مثلاً «۱۹ آبان») */
  label: string;
}

/** آخرین N روز تا امروز (از قدیم به جدید) */
export function lastNDays(count: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const now = new Date();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset, 12));
    const key = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "short", timeZone: "UTC" }).format(date);
    buckets.push({ key, label });
  }
  return buckets;
}

/** نمایش زمان نسبی فارسی («۵ دقیقه پیش») */
export function relativeTimeFa(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  const formatter = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
  if (Math.abs(minutes) < 1) return "هم‌اکنون";
  if (Math.abs(minutes) < 60) return formatter.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 31) return formatter.format(-days, "day");
  const months = Math.round(days / 30);
  return formatter.format(-months, "month");
}

/** نمایش تاریخ و زمان فارسی برای Asia/Tehran */
export function formatDateTimeFa(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tehran",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** درصد با یک رقم اعشار، فارسی */
export function percentFa(part: number, total: number): string {
  if (!total) return "—";
  return `${((part / total) * 100).toFixed(1)}٪`;
}
