/**
 * نظرات موکلان
 * ------------------------------------------------------------------
 * هیچ نظری بدون رضایت صریح و تأیید منتشر نمی‌شود. موارد قبلی سایت
 * (با نام اشخاص) تأییدنشده بودند و از انتشار خارج شدند.
 *
 * برای افزودن نظر جدید:
 *   1. رضایت کتبی/دیجیتال صاحب نظر را دریافت کنید.
 *   2. مقدار `consent` و `approved` را `true` کنید.
 *   3. نام را به شکل مورد توافق (کامل، کوتاه یا ناشناس) بنویسید.
 */

export interface Testimonial {
  id: string;
  quote: string;
  /** نام نمایشی؛ در صورت درخواست موکل می‌تواند کوتاه یا ناشناس باشد. */
  author: string;
  /** موضوع پرونده، بدون افشای جزئیات */
  matter: string;
  /** رضایت صریح موکل برای انتشار */
  consent: boolean;
  /** تأیید نهایی دفتر برای انتشار */
  approved: boolean;
  date?: string;
}

export const TESTIMONIALS: Testimonial[] = [];

/** فقط نظراتی که هم رضایت و هم تأیید دارند به خروجی می‌روند. */
export const APPROVED_TESTIMONIALS: Testimonial[] = TESTIMONIALS.filter(
  (item) => item.consent && item.approved
);

export const hasApprovedTestimonials = APPROVED_TESTIMONIALS.length > 0;
