/**
 * تعرفه‌ها — تنها منبع حقیقت برای مبالغ.
 * هیچ مبلغی نباید در کامپوننت‌ها یا متن سوالات متداول تکرار شود.
 *
 * ⚠️ مبلغ مشاورۀ تخصصی توسط مدیر سایت تأیید نشده است (`verified: false`).
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
  note: "در صورت قبول وکالت، هزینۀ مشاوره از حق‌الوکاله کسر می‌شود.",
};

/**
 * آیا رقم تعرفه قابل انتشار است؟
 * تا زمانی که دفتر مبلغ را تأیید نکرده (`verified: false`)، هیچ رقمی در صفحه‌ها،
 * کارت‌ها یا سوالات متداول نمایش داده نمی‌شود.
 */
export const feeVerified = consultationFee.verified;

/** متنی که به‌جای رقم نمایش داده می‌شود */
export const FEE_PENDING_LABEL = "اعلام پیش از جلسه";
export const FEE_PENDING_UNIT = "مبلغ با هماهنگی دفتر";

export const FEE_PENDING_MESSAGE =
  "مبلغ جلسۀ مشاوره هنوز از سوی دفتر نهایی نشده است؛ تعرفه پیش از برگزاری جلسه به‌صورت مکتوب اعلام می‌شود و هیچ هزینۀ پنهانی وجود ندارد.";

/** «۹۸۰٬۰۰۰» با ارقام فارسی و جداکنندۀ هزارگان */
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
    name: feeVerified ? "مشاورۀ اولیه" : "گفت‌وگوی مقدماتی",
    priceLabel: feeVerified ? "رایگان" : "با هماهنگی دفتر",
    unit: feeVerified ? "بدون تعهد" : "بدون تعهد · تلفنی یا آنلاین",
    description: feeVerified
      ? "یک گفت‌وگوی کوتاه تلفنی برای آشنایی با موضوع و مسیر کلی پرونده"
      : "یک گفت‌وگوی کوتاه برای آشنایی با موضوع و مسیر کلی پرونده؛ شرایط دقیق در همان گفت‌وگو روشن می‌شود",
    features: [
      "شناخت کلی موضوع پرونده",
      "راهنمایی دربارۀ مرجع صالح",
      "پاسخ به پرسش‌های مقدماتی",
      "تعیین نیاز یا نبود نیاز به مشاورۀ تخصصی",
    ],
    cta: feeVerified ? "درخواست مشاورۀ اولیه" : "درخواست گفت‌وگوی مقدماتی",
    featured: false,
  },
  {
    id: "consultation",
    name: "مشاورۀ تخصصی",
    priceLabel: feeVerified ? formatToman(consultationFee.amountToman) : FEE_PENDING_LABEL,
    unit: feeVerified ? "تومان · هر جلسه" : FEE_PENDING_UNIT,
    description: feeVerified
      ? `جلسۀ حضوری یا آنلاین ${consultationFee.sessionMinutes} با بررسی کامل مدارک`
      : "جلسۀ حضوری یا آنلاین با بررسی کامل مدارک، تعیین راهکار و برنامۀ اقدام",
    features: [
      "تحلیل مدارک و مستندات",
      "تعیین راهکار حقوقی و مرجع صالح",
      "برنامۀ اقدام مکتوب",
      "برآورد هزینۀ مراحل بعدی",
      "اولویت در رزرو نوبت وکالت",
    ],
    cta: "درخواست مشاورۀ تخصصی",
    featured: true,
    badge: "پیشنهاد بیشتر مراجعان",
  },
  {
    id: "retainer",
    name: "وکالت در پرونده",
    priceLabel: "توافقی",
    unit: "بر اساس نوع و مرحلۀ پرونده",
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

/** نمایش آمادۀ تعرفه برای متن‌های توضیحی (سوالات متداول، صفحۀ تعرفه‌ها) */
export const consultationFeeText = feeVerified
  ? `مشاورۀ تخصصی با تعرفۀ ${formatToman(consultationFee.amountToman)} تومان برای هر جلسه برگزار می‌شود`
  : "تعرفۀ جلسۀ مشاورۀ تخصصی پیش از برگزاری جلسه به‌صورت مکتوب اعلام می‌شود";
