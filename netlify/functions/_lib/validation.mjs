/**
 * اعتبارسنجی مشترک فرم مشاوره — همین منطق در مرورگر و در تابع Netlify
 * استفاده می‌شود تا اعتبارسنجی سمت کاربر و سمت سرور یکسان باشد.
 *
 * @typedef {Object} SubmissionInput
 * @property {string} [name]
 * @property {string} [phone]
 * @property {string} [topic]
 * @property {string} [message]
 * @property {string} [website]        فیلد تلۀ هرزنامه (باید خالی باشد)
 * @property {number|string} [startedAt] زمان شروع پر کردن فرم (میلی‌ثانیه)
 *
 * @typedef {{ ok: true, data: SubmissionData } | { ok: false, errors: Record<string,string> }} ValidationResult
 * @typedef {{ name: string, phone: string, phoneE164: string, topic: string, message: string }} SubmissionData
 */

export const TOPICS = [
  "دعاوی خانواده",
  "دعاوی کیفری",
  "اموال غیرمنقول و امور ثبتی",
  "چک و اسناد تجاری",
  "حقوق کار و بیمه",
  "حقوق شرکت‌ها و امور تجاری",
  "سایر موضوعات",
];

export const LIMITS = {
  minNameLength: 2,
  maxNameLength: 80,
  maxMessageLength: 1000,
  minFillSeconds: 2,
  maxFormAgeSeconds: 2 * 60 * 60,
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * ارقام فارسی/عربی را به لاتین تبدیل و فاصله و جداکننده‌ها را حذف می‌کند.
 * @param {string} input
 * @returns {string}
 */
export function normalizeDigits(input) {
  if (typeof input !== "string") return "";
  let output = "";
  for (const char of input) {
    const persianIndex = PERSIAN_DIGITS.indexOf(char);
    const arabicIndex = ARABIC_DIGITS.indexOf(char);
    if (persianIndex > -1) output += String(persianIndex);
    else if (arabicIndex > -1) output += String(arabicIndex);
    else output += char;
  }
  return output;
}

/**
 * نرمال‌سازی شمارۀ تلفن ایران به شکل ملی (۰۹… یا ۰۲۸…).
 * @param {string} input
 * @returns {string|null} شمارۀ نرمال‌شده یا null در صورت نامعتبر بودن
 */
export function normalizeIranPhone(input) {
  if (typeof input !== "string") return null;
  let digits = normalizeDigits(input)
    .replace(/[\s\u200c\u200f\u200e().-]/g, "")
    .replace(/\u066c|\u060c/g, "");

  if (digits.startsWith("+98")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("0098")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("98") && digits.length === 12) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith("9") && digits.length === 10) digits = `0${digits}`;

  if (!/^\d+$/.test(digits)) return null;

  // موبایل: 09XXXXXXXXX
  if (/^09\d{9}$/.test(digits)) return digits;
  // تلفن ثابت: 0 + کد شهر + ۸ رقم (در مجموع ۱۱ رقم)
  if (/^0[1-8]\d{9}$/.test(digits)) return digits;

  return null;
}

/**
 * تبدیل به فرم بین‌المللی برای لینک tel: و پیام‌رسان‌ها.
 * @param {string} normalizedPhone
 * @returns {string}
 */
export function toE164(normalizedPhone) {
  if (!normalizedPhone) return "";
  return `+98${normalizedPhone.replace(/^0/, "")}`;
}

/**
 * نوع شماره برای نمایش (موبایل/ثابت) — فقط برای پیام‌های راهنما.
 * @param {string} normalizedPhone
 * @returns {"mobile"|"landline"|"unknown"}
 */
export function phoneKind(normalizedPhone) {
  if (!normalizedPhone) return "unknown";
  if (/^09\d{9}$/.test(normalizedPhone)) return "mobile";
  if (/^0[1-8]\d{9}$/.test(normalizedPhone)) return "landline";
  return "unknown";
}

/**
 * بررسی نام: طول معتبر، بدون کاراکترهای کنترلی و بدون تگ.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeSingleLine(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex -- حذف کاراکترهای کنترلی ورودی کاربر
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * اعتبارسنجی کامل درخواست مشاوره.
 * @param {SubmissionInput} input
 * @param {{ now?: number }} [options]
 * @returns {ValidationResult}
 */
export function validateSubmission(input, options = {}) {
  const now = typeof options.now === "number" ? options.now : Date.now();
  /** @type {Record<string,string>} */
  const errors = {};

  const name = sanitizeSingleLine(input?.name);
  const message = String(input?.message ?? "").trim();
  const topic = String(input?.topic ?? "").trim();
  const honeypot = String(input?.website ?? "").trim();
  const normalizedPhone = normalizeIranPhone(String(input?.phone ?? ""));

  if (honeypot) {
    // تلۀ هرزنامه؛ پیام خطا عمداً عمومی است.
    errors.form = "ارسال درخواست ممکن نشد. لطفاً دوباره تلاش کنید.";
  }

  if (name.length < LIMITS.minNameLength) {
    errors.name = "نام و نام خانوادگی را کامل وارد کنید.";
  } else if (name.length > LIMITS.maxNameLength) {
    errors.name = "نام وارد‌شده بیش از حد طولانی است.";
  } else if (!/[\p{L}]/u.test(name)) {
    errors.name = "نام باید شامل حروف باشد.";
  }

  if (!normalizedPhone) {
    errors.phone =
      "شمارۀ تماس معتبر نیست؛ شمارۀ موبایل ۱۱ رقمی (۰۹…) یا تلفن ثابت با کد شهر را وارد کنید.";
  }

  if (!TOPICS.includes(topic)) {
    errors.topic = "موضوع پرونده را از فهرست انتخاب کنید.";
  }

  if (message.length > LIMITS.maxMessageLength) {
    errors.message = `شرح موضوع باید کمتر از ${LIMITS.maxMessageLength} نویسه باشد.`;
  }

  const startedAt = Number(input?.startedAt);
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsedSeconds = (now - startedAt) / 1000;
    if (elapsedSeconds >= 0 && elapsedSeconds < LIMITS.minFillSeconds) {
      errors.form = "فرم بسیار سریع ارسال شد. لطفاً دوباره تلاش کنید.";
    }
    if (elapsedSeconds > LIMITS.maxFormAgeSeconds) {
      errors.form = "مدت اعتبار فرم به پایان رسیده است؛ صفحه را دوباره بارگذاری کنید.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      phone: normalizedPhone,
      phoneE164: toE164(normalizedPhone),
      topic,
      message,
    },
  };
}
