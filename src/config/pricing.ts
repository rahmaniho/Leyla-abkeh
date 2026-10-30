/** تعرفۀ تأییدشدۀ مشاوره؛ تنها منبع مبلغ برای صفحه‌ها و فرم. */
import { verification } from "./site";
import { CONSULTATION_DURATIONS } from "../lib/validation";
export { CONSULTATION_DURATIONS };

export interface ConsultationFee {
  amountToman: number;
  verified: boolean;
  sessionMinutes: number;
  note: string;
}

export const consultationFee: ConsultationFee = {
  amountToman: 500_000,
  verified: true,
  sessionMinutes: 30,
  note: "زمان و شیوۀ برگزاری جلسه با دفتر هماهنگ می‌شود.",
};

/** با بازگشت تعرفه به فهرست تأیید، ارقام خودکار پنهان می‌شوند. */
export const feeVerified = consultationFee.verified && !verification.pricing;
/** رایگان‌بودن مستقل از تأیید مبلغ جلسۀ تخصصی است. */
export const freeConsultationVerified = !verification.freeConsultation;
export const FEE_PENDING_LABEL = "اعلام پیش از جلسه";
export const FEE_PENDING_UNIT = "مبلغ با هماهنگی دفتر";
export const FEE_PENDING_MESSAGE =
  "مبلغ جلسۀ مشاوره پیش از برگزاری جلسه با دفتر هماهنگ و اعلام می‌شود.";

/** مبلغ با ارقام فارسی و جداکنندۀ هزارگان */
export function formatToman(amount: number): string {
  const formatted = amount.toLocaleString("en-US").replace(/,/g, "٬");
  const map = "۰۱۲۳۴۵۶۷۸۹";
  return formatted.replace(/[0-9]/g, (digit) => map[Number(digit)]);
}

export function consultationAmount(minutes: number): number {
  return (consultationFee.amountToman * minutes) / consultationFee.sessionMinutes;
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
    name: freeConsultationVerified ? "مشاورۀ اولیه" : "هماهنگی نخستین تماس",
    priceLabel: freeConsultationVerified ? "رایگان" : "با هماهنگی دفتر",
    unit: "برای تعیین وقت",
    description: "برای انتخاب موضوع، زمان و شیوۀ برگزاری جلسه با دفتر تماس بگیرید.",
    features: ["تعیین موضوع کلی درخواست", "هماهنگی زمان جلسه", "انتخاب شیوۀ ارتباط"],
    cta: "هماهنگی با دفتر",
    featured: false,
  },
  {
    id: "consultation",
    name: "مشاورۀ حقوقی تخصصی",
    priceLabel: feeVerified ? formatToman(consultationFee.amountToman) : FEE_PENDING_LABEL,
    unit: feeVerified ? "تومان · هر ۳۰ دقیقه" : FEE_PENDING_UNIT,
    description: "بررسی موضوع و مدارک در جلسۀ مشاوره؛ زمان و شیوۀ برگزاری با دفتر هماهنگ می‌شود.",
    features: ["بررسی موضوع و مستندات", "گفت‌وگو دربارۀ مسیر حقوقی", "اعلام هزینۀ مشاوره پیش از جلسه"],
    cta: "درخواست مشاوره",
    featured: true,
  },
  {
    id: "retainer",
    name: "وکالت در پرونده",
    priceLabel: "توافقی",
    unit: "بر اساس نوع و مرحلۀ پرونده",
    description: "شرایط وکالت پس از بررسی موضوع و مدارک تعیین می‌شود.",
    features: ["بررسی شرایط وکالت", "تعیین حق‌الوکاله در قرارداد", "پیگیری بر اساس توافق"],
    cta: "استعلام شرایط وکالت",
    featured: false,
  },
];

export const consultationFeeText = feeVerified
  ? `تعرفۀ مشاورۀ حقوقی تخصصی برای هر ${consultationFee.sessionMinutes === 30 ? "۳۰" : consultationFee.sessionMinutes} دقیقه ${formatToman(consultationFee.amountToman)} تومان است`
  : "تعرفۀ جلسۀ مشاورۀ تخصصی پیش از برگزاری جلسه با دفتر هماهنگ می‌شود";
