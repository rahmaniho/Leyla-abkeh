/**
 * تعرفه‌ها — تنها منبع حقیقت برای مبالغ.
 * هیچ مبلغی نباید در کامپوننت‌ها یا متن سوالات متداول تکرار شود.
 *
 * ⚠️ مبلغ مشاورهٔ تخصصی توسط مدیر سایت تأیید نشده است (`verified: false`).
 */

export interface ConsultationFee {
  amountToman: number;
  verified: boolean;
  sessionMinutes: string;
  note: string;
}

export const consultationFee: ConsultationFee = {
  amountToman: 980_000,
  verified: false,
  sessionMinutes: "۴۵ تا ۶۰ دقیقه",
  note: "در صورت قبول وکالت، هزینهٔ مشاوره از حق‌الوکاله کسر می‌شود.",
};

/** «۹۸۰٬۰۰۰» با ارقام فارسی و جداکنندهٔ هزارگان */
export function formatToman(amount: number): string {
  const formatted = amount.toLocaleString("en-US").replace(/,/g, "٬");
  const map = "۰۱۲۳۴۵۶۷۸۹";
  return formatted.replace(/[0-9]/g, (digit) => map[Number(digit)]);
}

export interface PricingPlan {
  id: "free" | "consultation" | "retainer";
  name: string;
  priceLabel: string;
  unit: string;
  description: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "مشاورهٔ اولیه",
    priceLabel: "رایگان",
    unit: "بدون تعهد",
    description: "یک گفت‌وگوی کوتاه تلفنی برای آشنایی با موضوع و مسیر کلی پرونده",
    features: [
      "شناخت کلی موضوع پرونده",
      "راهنمایی دربارهٔ مرجع صالح",
      "پاسخ به پرسش‌های مقدماتی",
      "تعیین نیاز یا نبود نیاز به مشاورهٔ تخصصی",
    ],
    cta: "درخواست مشاورهٔ اولیه",
    featured: false,
  },
  {
    id: "consultation",
    name: "مشاورهٔ تخصصی",
    priceLabel: formatToman(consultationFee.amountToman),
    unit: "تومان · هر جلسه",
    description: `جلسهٔ حضوری یا آنلاین ${consultationFee.sessionMinutes} با بررسی کامل مدارک`,
    features: [
      "تحلیل مدارک و مستندات",
      "تعیین راهکار حقوقی و مرجع صالح",
      "برنامهٔ اقدام مکتوب",
      "برآورد هزینهٔ مراحل بعدی",
      "اولویت در رزرو نوبت وکالت",
    ],
    cta: "درخواست مشاورهٔ تخصصی",
    featured: true,
    badge: "پیشنهاد اکثر موکلان",
  },
  {
    id: "retainer",
    name: "وکالت در پرونده",
    priceLabel: "توافقی",
    unit: "بر اساس نوع و مرحلهٔ پرونده",
    description: "از تنظیم دادخواست تا پیگیری اجرای رأی",
    features: [
      "وکالت در مراحل دادرسی",
      "حضور در جلسات و مراجع قضایی",
      "گزارش مستمر روند پرونده",
      "پیگیری اجرای رأی صادره",
    ],
    cta: "استعلام شرایط وکالت",
    featured: false,
  },
];

/** نمایش آمادهٔ تعرفه برای متن‌های توضیحی (سوالات متداول، صفحهٔ تعرفه‌ها) */
export const consultationFeeText = `مشاورهٔ تخصصی با تعرفهٔ ${formatToman(
  consultationFee.amountToman
)} تومان برای هر جلسه برگزار می‌شود`;
