/**
 * آمار و ادعاهای عددی
 * ------------------------------------------------------------------
 * هیچ عددی بدون منبع معتبر منتشر نمی‌شود. اعداد قبلی سایت
 * (۸۵۰ پرونده، ۹۵٪ نرخ موفقیت، ۱۲ سال سابقه، امتیاز ۴٫۹) بدون
 * مستند بودند و از انتشار خارج شدند.
 *
 * برای فعال‌سازی: مقدار `verified` را فقط پس از تأیید مستند `true` کنید.
 * بخش آمار در صفحهٔ اصلی تنها زمانی رندر می‌شود که حداقل یک مورد تأییدشده باشد.
 */

export interface StatItem {
  id: string;
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
  description: string;
  /** منبع/مستند تأیید (شمارهٔ پرونده، گزارش رسمی، …) */
  source?: string;
  verified: boolean;
}

export const STATS: StatItem[] = [
  {
    id: "cases",
    value: 850,
    suffix: "+",
    label: "پروندهٔ موفق",
    description: "در دعاوی گوناگون قضایی",
    verified: false,
  },
  {
    id: "success-rate",
    value: 95,
    suffix: "٪",
    label: "نرخ موفقیت",
    description: "در پرونده‌های پذیرفته‌شده",
    verified: false,
  },
  {
    id: "experience",
    value: 12,
    suffix: "+",
    label: "سال تجربه",
    description: "وکالت و مشاورهٔ حقوقی",
    verified: false,
  },
  {
    id: "rating",
    value: 4.9,
    decimals: 1,
    label: "امتیاز رضایت",
    description: "از مجموع ۵ امتیاز موکلان",
    verified: false,
  },
];

export const VERIFIED_STATS: StatItem[] = STATS.filter((stat) => stat.verified);

export const hasVerifiedStats = VERIFIED_STATS.length > 0;
