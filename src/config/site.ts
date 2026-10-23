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

/**
 * شمارۀ تماس اصلی.
 * ⚠️ مقدار فعلی نمونه است و در هیچ صفحه‌ای نمایش داده نمی‌شود؛ چون مورد
 * `contact.phone` در `verification.json` باقی است. پس از دریافت شمارۀ واقعی،
 * همین مقدار را عوض کنید و آن مورد را از فهرست حذف کنید.
 */
const PRIMARY_PHONE_E164 = "+989900925811";

/**
 * مقدار نمونۀ کارخانه‌ای. اگر این مقدار در سایت بماند، حتی پس از حذف مورد از
 * فهرست تأیید هم منتشر نمی‌شود؛ تا شمارۀ واقعی جایگزین نشود.
 */
const SAMPLE_PHONE_E164 = "+989121234567";
/** شمارۀ ثابت دفتر — تأییدنشده؛ اگر وجود ندارد `null` بگذارید. */
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

const PENDING_KEYS = new Set(PENDING_VERIFICATION.map((item) => item.key));

/**
 * آیا این مورد هنوز تأیید نشده است؟
 * منبع حقیقت، همان `src/config/verification.json` است: هر موردی که در آن فهرست
 * باشد «تأییدنشده» شمرده می‌شود و از سایت/دادۀ ساختاریافته حذف می‌ماند.
 * برای انتشار یک مقدار: مقدار واقعی را در همین فایل بگذارید و مورد مربوط را
 * از `verification.json` بردارید.
 */
export function isPending(key: string): boolean {
  return PENDING_KEYS.has(key);
}

/** وضعیت تأیید اطلاعات حساس — هیچ‌کدام به‌صورت پیش‌فرض تأییدشده نیست. */
export const verification = {
  /** شمارۀ تلفن (و پیوند واتساپ ساخته‌شده از آن) */
  phone: isPending("contact.phone"),
  /** شمارۀ ثابت دفتر */
  officePhone: isPending("contact.officePhone"),
  /** نشانی دفتر */
  address: isPending("contact.address"),
  /** ساعات کاری */
  hours: isPending("contact.hours"),
  /** عضویت در کانون وکلا */
  barAssociation: isPending("lawyer.barAssociation"),
  /** شمارۀ پروانه */
  licenseNumber: isPending("lawyer.licenseNumber"),
  /** تعرفۀ مشاوره */
  pricing: isPending("pricing.consultation"),
  /** ادعای مشاورۀ اولیۀ رایگان */
  freeConsultation: isPending("pricing.freeConsultation"),
} as const;

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

/** خلاصۀ ساعات کاری برای نمایش در یک خط */
export const HOURS_SUMMARY = "شنبه تا چهارشنبه ۹ تا ۱۸ · پنجشنبه‌ها ۹ تا ۱۳";

/** ساعات کاری گروه‌بندی‌شده برای نمایش در فوتر و صفحۀ تماس */
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
      "دفتر وکالت لیلا آبکه، وکیل پایه یک دادگستری در قزوین؛ مشاورۀ حقوقی در دعاوی خانواده، ملکی، ارث، قراردادها و مطالبات، چک و اسناد تجاری، حقوق کار و شرکت‌ها.",
  },

  lawyer: {
    name: "لیلا آبکه",
    nameLatin: "Leyla Abkeh",
    jobTitle: "وکیل پایه یک دادگستری",
    /**
     * شمارۀ پروانۀ وکالت — تأییدشده توسط مالک (۳۰ مهر ۱۴۰۴).
     * مثل بقیۀ داده‌های حساس، اگر این مورد دوباره به `verification.json`
     * برگردد به‌صورت خودکار از سایت و دادۀ ساختاریافته حذف می‌شود.
     */
    licenseNumber: (verification.licenseNumber ? null : "۲۳۷۰") as string | null,
    /** همان شماره با ارقام لاتین برای Schema.org — هم‌زمان با فیلد بالا فعال/غیرفعال می‌شود */
    licenseNumberLatin: (verification.licenseNumber ? null : "2370") as string | null,
    /** عضویت حرفه‌ای؛ تا تأیید، `null` است و در هیچ صفحه/دادۀ ساختاریافته‌ای نمی‌آید. */
    barAssociation: (verification.barAssociation
      ? null
      : "کانون وکلای دادگستری استان قزوین") as string | null,
    barAssociationPending: verification.barAssociation,
    photo: {
      /** تصویر رسمی و ارسالی خود وکیل (نه تصویر نمونه). */
      isPlaceholder: false,
      basePath: "/images/lawyer",
      width: 762,
      height: 1016,
      alt: "پرترۀ لیلا آبکه، وکیل پایه یک دادگستری در قزوین",
    },
  },

  /** هویت بصری: لوگوی رسمی دفتر (طلایی روی زمینۀ شفاف) */
  brand: {
    /** مارک تنها (بدون خطاطی و نام لاتین) — برای نوار بالا، پاورقی و آیکون‌ها */
    mark: { png: "/images/brand/logo-mark.png", webp: "/images/brand/logo-mark.webp", width: 300, height: 274 },
    /** لوگوی کامل: مارک + خطاطی «لیلا» + نام لاتین (با حاشیۀ امن، بدون بریدگی) */
    lockup: {
      png: "/images/brand/logo-lockup.png",
      webp: "/images/brand/logo-lockup.webp",
      width: 460,
      height: 651,
      /** نسخۀ بزرگ‌تر برای نمایشگرهای پرتراکم و بخش‌های بزرگ‌تر */
      pngLarge: "/images/brand/logo-lockup-700.png",
      webpLarge: "/images/brand/logo-lockup-700.webp",
    },
    alt: "لوگوی دفتر وکالت لیلا آبکه",
  },

  contact: {
    /** شمارۀ اصلی — تأییدشده توسط دفتر */
    phoneE164: PRIMARY_PHONE_E164,
    officePhoneE164: OFFICE_PHONE_E164,
    /** ایمیل رسمی دفتر */
    email: "info@leyla-abkeh.ir" as string | null,
    /** خالی‌گذاری‌شده: کد پستی تا تأیید */
    postalCode: null as string | null,
    /** مختصات تأییدشدۀ دفتر (برای نقشه و دادۀ ساختاریافته) */
    geo: { latitude: 36.2665941, longitude: 50.0236544 } as {
      latitude: number;
      longitude: number;
    } | null,
    address: {
      street: "جنب بیمارستان پاستور، مجتمع تجاری نیایش",
      city: "قزوین",
      region: "قزوین",
      country: "IR",
      /** نمایش یک‌خطی */
      full: `قزوین، جنب بیمارستان پاستور، مجتمع تجاری نیایش`,
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
    /**
     * آیا این استقرار سرور دریافت درخواست دارد؟
     * Netlify (با تابع `netlify/functions/consultation.mjs`) → true
     * GitHub Pages (فقط فایل ایستا) → با `VITE_FORM_MODE=static` در زمان بیلد false می‌شود
     * تا فرم به‌جای وعدۀ بی‌عمل، وضعیت واقعی را نشان دهد.
     */
    deliveryAvailable: (import.meta.env?.VITE_FORM_MODE ?? "live") !== "static",
  },

  media: {
    /** لوگوموشن رسمی (بدون صدا، بهینه‌شده برای وب) */
    logoMotion: {
      mp4: "/media/logo-motion.mp4",
      /** فریم شروع (۰ ثانیه) — پوستر ویدئو، برای شروع بدون پرش */
      poster: "/media/logo-motion-poster.jpg",
      /** فریم پایان (۶ ثانیه) — لوگوی کامل و روشن؛ برای کاهش حرکت و جایگزین ثابت */
      endFrame: "/media/logo-motion-end.jpg",
      width: 416,
      height: 752,
      /** توضیح متنی جایگزین برای فناوری‌های کمکی */
      alt: "لوگوموشن دفتر وکالت لیلا آبکه: نشان طلایی دفتر روی زمینۀ تیره",
      /** ردیف متن توصیفی (ویدیو صدا ندارد) */
      captions: "/media/logo-motion.vtt",
    },
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

/** «+989121234567» → «۰۲۸ ۳۳۶۶ ۰۰۰۰» برای شمارۀ ثابت */
export function formatLandlineFa(e164: string): string {
  const national = e164.replace(/^\+98/, "0");
  return fa(national);
}

/** لینک تماس قابل استفاده در `href` */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}

export interface PhoneLink {
  e164: string;
  display: string;
  href: string;
  /** برای aria-label صفحه‌خوان */
  ariaLabel: string;
}

/**
 * شمارۀ اصلی فقط زمانی وجود دارد که تأیید شده باشد.
 * همۀ کامپوننت‌ها باید حالت `null` را مدیریت کنند؛ در این حالت به‌جای
 * پیوند تلفنی، «درخواست تماس» از طریق فرم نمایش داده می‌شود.
 */
export const primaryPhone: PhoneLink | null =
  verification.phone || siteConfig.contact.phoneE164 === SAMPLE_PHONE_E164
  ? null
  : {
      e164: siteConfig.contact.phoneE164,
      display: formatPhoneFa(siteConfig.contact.phoneE164),
      href: telHref(siteConfig.contact.phoneE164),
      ariaLabel: `تماس با دفتر وکالت — ${formatPhoneFa(siteConfig.contact.phoneE164)}`,
    };

/** متن شفاف برای زمانی که شمارۀ تلفن تأیید نشده است. */
export const PHONE_PENDING_MESSAGE =
  "شمارۀ تلفن دفتر پس از تأیید نهایی در همین صفحه منتشر می‌شود؛ تا آن زمان از فرم درخواست مشاوره استفاده کنید تا با شما تماس گرفته شود.";

/** متن کوتاه برای دکمه‌ها و نوارها */
export const PHONE_PENDING_SHORT = "شمارۀ تلفن در حال تأیید است";

/** پیام تأییدنشدن ساعات کاری (نمایش داده می‌شوند اما صحتشان تأیید نشده) */
export const CONTACT_DETAILS_PENDING_MESSAGE =
  "ساعات کاری این صفحه هنوز تأیید نهایی نشده است؛ پیش از مراجعۀ حضوری، از طریق فرم یا تلفن هماهنگ کنید.";

export const officePhone: PhoneLink | null =
  !verification.officePhone && siteConfig.contact.officePhoneE164
    ? {
        e164: siteConfig.contact.officePhoneE164,
        display: formatLandlineFa(siteConfig.contact.officePhoneE164),
        href: telHref(siteConfig.contact.officePhoneE164),
        ariaLabel: `تماس با دفتر — ${formatLandlineFa(siteConfig.contact.officePhoneE164)}`,
      }
    : null;

/**
 * لینک واتساپ فقط با شمارۀ تأییدشده ساخته می‌شود؛ شمارۀ نمونه نباید به یک
 * حساب واقعی در واتساپ وصل شود.
 */
/** پیوند ایمیل (تنها وقتی ایمیل تنظیم شده باشد) */
export const emailLink =
  siteConfig.contact.email && !isPending("contact.email")
    ? {
        address: siteConfig.contact.email,
        href: `mailto:${siteConfig.contact.email}`,
      }
    : siteConfig.contact.email
      ? { address: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` }
      : null;

/** پیوند نقشه بر پایۀ مختصات تأییدشده (در نبود مختصات، جست‌وجوی نشانی) */
export const mapUrl: string | null = siteConfig.contact.geo
  ? `https://www.google.com/maps/search/?api=1&query=${siteConfig.contact.geo.latitude},${siteConfig.contact.geo.longitude}`
  : siteConfig.contact.address.full
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.address.full)}`
    : null;

export const whatsappUrl: string | null =
  verification.phone || siteConfig.contact.phoneE164 === SAMPLE_PHONE_E164
  ? null
  : `https://wa.me/${siteConfig.contact.phoneE164.replace(/^\+/, "")}`;

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
