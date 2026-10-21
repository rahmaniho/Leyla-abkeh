/**
 * تنظیمات مرکزی سایت
 * ------------------------------------------------------------------
 * تنها منبع حقیقت برای نام، تماس، نشانی، ساعات کاری، شبکه‌های اجتماعی و
 * اطلاعات ساختاریافته. هیچ کامپوننتی نباید شماره، نشانی یا لینک را
 * به‌صورت ثابت در خود داشته باشد.
 *
 * مقادیری که با `pending: true` علامت خورده‌اند توسط مدیر سایت تأیید نشده‌اند
 * و باید پیش از انتشار نهایی بازبینی شوند (فهرست کامل: PENDING_VERIFICATION).
 */

import verificationData from "./verification.json";

const FALLBACK_SITE_URL = "https://leyla-abkeh.netlify.app";

/** تاریخ آخرین بازبینی محتوای صفحات ثابت (برای sitemap و نمایش) */
export const SITE_LAST_UPDATED = "2026-10-21";

function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return FALLBACK_SITE_URL;
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** نشانی عمومی سایت؛ در Netlify با متغیر محیطی VITE_SITE_URL قابل تغییر است. */
export const SITE_URL = normalizeSiteUrl(import.meta.env?.VITE_SITE_URL);

/** شمارهٔ تماس اصلی — تأییدنشده (الگوی نمونه؛ پیش از انتشار نهایی جایگزین شود). */
const PRIMARY_PHONE_E164 = "+989121234567";
/** شمارهٔ ثابت دفتر — تأییدنشده؛ اگر وجود ندارد `null` بگذارید. */
const OFFICE_PHONE_E164: string | null = null;

export interface PendingVerification {
  key: string;
  label: string;
  detail: string;
}

/**
 * فهرست اطلاعاتی که تا تأیید مدیر سایت منتشر نمی‌شوند یا نیاز به بازبینی دارند.
 * منبع داده: `src/config/verification.json` (قابل خواندن با `npm run verify:config`)
 */

export const PENDING_VERIFICATION: PendingVerification[] = verificationData as PendingVerification[];

export interface OpeningDay {
  /** نام روز به انگلیسی برای Schema.org */
  schemaDay: string;
  /** نام روز برای نمایش فارسی */
  label: string;
  opens: string;
  closes: string;
}

const OPENING_DAYS: OpeningDay[] = [
  { schemaDay: "Saturday", label: "شنبه", opens: "09:00", closes: "18:00" },
  { schemaDay: "Sunday", label: "یکشنبه", opens: "09:00", closes: "18:00" },
  { schemaDay: "Monday", label: "دوشنبه", opens: "09:00", closes: "18:00" },
  { schemaDay: "Tuesday", label: "سه‌شنبه", opens: "09:00", closes: "18:00" },
  { schemaDay: "Wednesday", label: "چهارشنبه", opens: "09:00", closes: "18:00" },
  { schemaDay: "Thursday", label: "پنجشنبه", opens: "09:00", closes: "13:00" },
];

/** «۹» را به «۰۹» تبدیل می‌کند تا ساعت‌ها یکدست نمایش داده شوند. */
function toFaHour(time: string): string {
  return time
    .split(":")
    .map((part, index) => (index === 0 ? String(Number(part)) : part.padStart(2, "0")))
    .join(":");
}

function faDigits(value: string): string {
  const map = "۰۱۲۳۴۵۶۷۸۹";
  return value.replace(/[0-9]/g, (digit) => map[Number(digit)]);
}

/** خلاصهٔ ساعات کاری برای نمایش در یک خط */
export const HOURS_SUMMARY = "شنبه تا چهارشنبه ۹ تا ۱۸ · پنجشنبه‌ها ۹ تا ۱۳";

/** ساعات کاری گروه‌بندی‌شده برای نمایش در فوتر و صفحهٔ تماس */
export const HOURS_LINES: string[] = [
  "شنبه تا چهارشنبه: ۹ تا ۱۸",
  "پنجشنبه‌ها: ۹ تا ۱۳",
  "جمعه‌ها: تعطیل",
];

export const siteConfig = {
  site: {
    url: SITE_URL,
    name: "دفتر وکالت لیلا آبکه",
    shortName: "لیلا آبکه",
    locale: "fa_IR",
    lang: "fa-IR",
    dir: "rtl" as const,
    themeColor: "#0f1c28",
    city: "قزوین",
    region: "قزوین",
    country: "IR",
    defaultTitle: "وکیل پایه یک دادگستری در قزوین | لیلا آبکه",
    defaultDescription:
      "دفتر وکالت لیلا آبکه، وکیل پایه یک دادگستری در قزوین؛ مشاورهٔ حقوقی در دعاوی خانواده، کیفری، ملکی، چک و اسناد تجاری، حقوق کار و شرکت‌ها.",
  },

  lawyer: {
    name: "لیلا آبکه",
    nameLatin: "Leyla Abkeh",
    jobTitle: "وکیل پایه یک دادگستری",
    /** pending: true → نیازمند تأیید (شمارهٔ پروانه منتشر نمی‌شود) */
    licenseNumber: null as string | null,
    barAssociation: "کانون وکلای دادگستری استان قزوین",
    barAssociationPending: true,
    photo: {
      /** تصویر رسمی و ارسالی خود وکیل (نه تصویر نمونه). */
      isPlaceholder: false,
      basePath: "/images/lawyer",
      width: 762,
      height: 1016,
      alt: "پرترهٔ لیلا آبکه، وکیل پایه یک دادگستری در قزوین",
    },
  },

  /** هویت بصری: لوگوی رسمی دفتر (طلایی روی زمینهٔ شفاف) */
  brand: {
    /** مارک تنها (بدون خطاطی و نام لاتین) — برای نوار بالا، پاورقی و آیکون‌ها */
    mark: { png: "/images/brand/logo-mark.png", webp: "/images/brand/logo-mark.webp", width: 300, height: 311 },
    /** لوگوی کامل: مارک + خطاطی «لیلا» + نام لاتین */
    lockup: {
      png: "/images/brand/logo-lockup.png",
      webp: "/images/brand/logo-lockup.webp",
      width: 420,
      height: 630,
    },
    alt: "لوگوی دفتر وکالت لیلا آبکه",
  },

  contact: {
    /** شمارهٔ اصلی (pending: true) */
    phoneE164: PRIMARY_PHONE_E164,
    officePhoneE164: OFFICE_PHONE_E164,
    /** خالی‌گذاری‌شده: کد پستی و مختصات تا تأیید */
    postalCode: null as string | null,
    geo: null as { latitude: number; longitude: number } | null,
    address: {
      street: "خیابان خیام شمالی، برج آرین، طبقهٔ چهارم، واحد ۱۲",
      city: "قزوین",
      region: "قزوین",
      country: "IR",
      /** نمایش یک‌خطی */
      full: `قزوین، خیابان خیام شمالی، برج آرین، طبقهٔ چهارم، واحد ۱۲`,
    },
    hours: {
      days: OPENING_DAYS,
      summary: HOURS_SUMMARY,
      lines: HOURS_LINES,
      /** نمایش فشرده */
      compact: HOURS_SUMMARY,
    },
    /** لینک‌های اجتماعی؛ مقدار `null` به‌معنی «منتشر نشود» است. */
    socials: {
      instagram: null as string | null,
      telegram: null as string | null,
      linkedin: null as string | null,
    },
  },

  forms: {
    endpoint: "/api/consultation",
    maxMessageLength: 1000,
    minNameLength: 2,
    maxNameLength: 80,
  },

  /** مسیر پنل مدیریت (فقط برای لینک داخلی/مستندسازی) */
  adminPath: "/admin/",
};

/* ------------------------------------------------------------------ */
/* مشتقات و کمک‌تابع‌ها                                                */
/* ------------------------------------------------------------------ */

/** تبدیل ارقام لاتین به فارسی */
export function fa(value: string | number): string {
  return faDigits(String(value));
}

/** «+989121234567» → «+98 912 123 4567» (نمایش با ارقام فارسی) */
export function formatPhoneFa(e164: string): string {
  const national = e164.replace(/^\+98/, "0");
  const digits = fa(national);
  if (national.startsWith("09") && national.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return digits;
}

/** «+989121234567» → «۰۲۸ ۳۳۶۶ ۰۰۰۰» برای شمارهٔ ثابت */
export function formatLandlineFa(e164: string): string {
  const national = e164.replace(/^\+98/, "0");
  return fa(national);
}

/** لینک تماس قابل استفاده در `href` */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}

export const primaryPhone = {
  e164: siteConfig.contact.phoneE164,
  display: formatPhoneFa(siteConfig.contact.phoneE164),
  href: telHref(siteConfig.contact.phoneE164),
  /** بدون فاصله و با ارقام لاتین، برای aria-label */
  ariaLabel: `تماس با دفتر وکالت — ${formatPhoneFa(siteConfig.contact.phoneE164)}`,
};

export const officePhone = siteConfig.contact.officePhoneE164
  ? {
      e164: siteConfig.contact.officePhoneE164,
      display: formatLandlineFa(siteConfig.contact.officePhoneE164),
      href: telHref(siteConfig.contact.officePhoneE164),
    }
  : null;

/** لینک واتساپ فقط اگر شمارهٔ تأییدشده وجود داشته باشد؛ از همان شمارهٔ اصلی ساخته می‌شود. */
export const whatsappUrl = `https://wa.me/${siteConfig.contact.phoneE164.replace(/^\+/, "")}`;

/** ساعت‌ها با ارقام فارسی برای نمایش */
export const openingHoursFa = siteConfig.contact.hours.days.map((day) => ({
  ...day,
  display: `${day.label}: ${fa(toFaHour(day.opens))} تا ${fa(toFaHour(day.closes))}`,
}));

export type SocialKey = "instagram" | "telegram" | "linkedin" | "whatsapp";
export interface SocialLink {
  key: SocialKey;
  label: string;
  href: string;
}

/** فهرست شبکه‌های اجتماعی موجود (لینک‌های خالی حذف می‌شوند) */
export const activeSocials: SocialLink[] = (
  [
    { key: "instagram", label: "اینستاگرام", href: siteConfig.contact.socials.instagram },
    { key: "telegram", label: "تلگرام", href: siteConfig.contact.socials.telegram },
    { key: "linkedin", label: "لینکدین", href: siteConfig.contact.socials.linkedin },
    { key: "whatsapp", label: "واتساپ", href: whatsappUrl },
  ] satisfies { key: SocialKey; label: string; href: string | null }[]
).filter((item): item is SocialLink => Boolean(item.href));

export type SiteConfig = typeof siteConfig;
