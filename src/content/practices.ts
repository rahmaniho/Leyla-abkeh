/**
 * موضوعات و تخصص‌های حقوقی — نقشۀ دعاوی برای صفحۀ اصلی
 * ------------------------------------------------------------------
 * این فهرست، «انواع دعاوی حقوقی» را به زبان مخاطب دسته‌بندی می‌کند تا کسی که
 * نام دقیق دعوای خود را نمی‌داند، مسیرش را پیدا کند. هر گروه به یک صفحۀ خدمت
 * وصل است و هر دعوا می‌تواند به مقالۀ مرتبط پیوند داشته باشد.
 *
 * قواعد:
 *   - `service` باید اسلاگ یکی از `SERVICES` باشد.
 *   - `articles` باید اسلاگ مقالۀ منتشرشده باشد.
 *   - متن‌ها اطلاع‌رسانی عمومی‌اند: بدون آمار، تضمین نتیجه یا ادعای تأییدنشده.
 */
import type { ServiceIconKey } from "./services";

export interface PracticeClaim {
  /** نام دعوا یا موضوع، به زبان مخاطب */
  title: string;
  /** مقالۀ توضیحی، در صورت وجود */
  article?: string;
}

export interface PracticeGroup {
  /** شناسۀ یکتا برای لنگر و آزمون */
  id: string;
  title: string;
  /** یک جملۀ توضیح دربارۀ اینکه این گروه چه پرونده‌هایی را در بر می‌گیرد */
  summary: string;
  icon: ServiceIconKey;
  /** اسلاگ خدمت متناظر */
  service: string;
  claims: PracticeClaim[];
}

export const PRACTICE_GROUPS: PracticeGroup[] = [
  {
    id: "khanevadeh",
    title: "دعاوی خانواده",
    summary: "پرونده‌هایی که در کنار مسائل مالی، آیندۀ کودکان و آرامش خانواده هم در میان است.",
    icon: "family",
    service: "khanevadeh",
    claims: [
      { title: "طلاق توافقی", article: "talagh-tavafoghi-madarek-va-marahel" },
      { title: "طلاق یک‌طرفه", article: "talagh-yek-tarafe-masir-ghanooni" },
      { title: "مطالبۀ مهریه", article: "mehrieh-motalebe-va-ijra" },
      { title: "مطالبۀ نفقه", article: "nafaqe-motalebe-va-tark-enfaq" },
      { title: "حضانت فرزند", article: "hezanat-va-molaghat-farzand" },
      { title: "ملاقات فرزند", article: "hezanat-va-molaghat-farzand" },
      { title: "اجرت‌المثل و نحله", article: "ojratol-mesl-va-nahle" },
      { title: "نفقۀ ایام عده", article: "nafaqe-ayam-ede" },
    ],
  },
  {
    id: "motalebat",
    title: "قراردادها و دعاوی مالی",
    summary: "تعهدی که اجرا نشده یا مبلغی که پرداخت نشده؛ از اخطار تا دادخواست.",
    icon: "contract",
    service: "gharardad-va-motalebat",
    claims: [
      { title: "مطالبۀ وجه", article: "vojoh-motalebe-madarek-va-marahel" },
      { title: "الزام به ایفای تعهد", article: "elzam-be-ifaye-tahod" },
      { title: "فسخ و انفساخ قرارداد", article: "faskh-va-enfesakh-gharardad" },
      { title: "مطالبۀ خسارت", article: "motalebe-khesarat" },
      { title: "وجه التزام و جریمۀ تأخیر", article: "vajh-altazam" },
      { title: "ابطال معامله", article: "ebtal-moamele" },
      { title: "مطالبۀ طلب و بدهی", article: "motalebe-talab-va-bedehi" },
    ],
  },
  {
    id: "amlak",
    title: "دعاوی ملکی و ثبتی",
    summary: "از سند و پلاک ثبتی تا تخلیه و تصرف؛ پرونده‌هایی که به وضعیت ثبتی ملک گره خورده‌اند.",
    icon: "home",
    service: "amlak-va-sebat",
    claims: [
      { title: "الزام به تنظیم سند رسمی", article: "elzam-be-tanzim-sanad-rasmi" },
      { title: "تخلیۀ ید و تخلیۀ ملک", article: "ejare-maskan-tamdid-va-takhliye" },
      { title: "خلع ید", article: "khole-yad-va-tasarrof-odvani" },
      { title: "رفع تصرف عدوانی", article: "khole-yad-va-tasarrof-odvani" },
      { title: "ممانعت از حق و مزاحمت", article: "momanet-az-hagh-va-mozahmat" },
      { title: "تقسیم مال مشاع", article: "tagsim-va-afraz-mal-mosha" },
      { title: "الزام به تفکیک و پایان‌کار", article: "elzam-be-tafkik-payankar" },
    ],
  },
  {
    id: "ers",
    title: "ارث و امور حسبی",
    summary: "تعیین وراث، تقسیم ماترک و اختلاف‌هایی که پس از فوت در خانواده بالا می‌گیرد.",
    icon: "tree",
    service: "ers-va-varasat",
    claims: [
      { title: "گواهی انحصار وراثت", article: "enhesar-varasat-madarek-va-marahel" },
      { title: "تقسیم ترکه", article: "tarkeh-taqsim-va-motalebe-sahm-ol-ers" },
      { title: "اثبات وصیت و رد وصیت", article: "esbat-va-rad-vasiat" },
      { title: "مطالبۀ سهم‌الارث", article: "tarkeh-taqsim-va-motalebe-sahm-ol-ers" },
      { title: "فروش مال مشترک وراث", article: "forush-mal-moshtarak-varas" },
      { title: "استرداد اموال ماترک", article: "esterdad-amval-matarok" },
    ],
  },
  {
    id: "esnad",
    title: "چک، سفته و اسناد تجاری",
    summary: "وصول مطالبات اسنادی؛ انتخاب میان اجرای ثبت، دعوای حقوقی و شکایت کیفری.",
    icon: "doc",
    service: "chek-va-esnad",
    claims: [
      { title: "وصول چک برگشتی", article: "chek-bargashkhte-masir-haye-ghanooni" },
      { title: "شکایت کیفری چک", article: "shkayat-keyfari-chek" },
      { title: "مطالبۀ وجه سفته", article: "safte-motalebe-vojoh-va-vakhvast" },
      { title: "اخذ گواهی عدم پرداخت", article: "akhz-govahi-adam-pardakht" },
      { title: "دعوای علیه ظهرنویس و ضامن", article: "davaye-aliye-zaharnavis-va-zamen" },
      { title: "ابطال اجراییه", article: "ebtal-ejraiye" },
    ],
  },
  {
    id: "kar",
    title: "حقوق کار و بیمه",
    summary: "اختلاف کارگر و کارفرما؛ از مهلت اعتراض تا مطالبات پایان کار.",
    icon: "hardhat",
    service: "hoghoogh-kar",
    claims: [
      { title: "مطالبۀ حقوق و مزایا", article: "motalebe-hoquq-mozaya" },
      { title: "سنوات و عیدی", article: "sanavat-va-eidi-motalebe" },
      { title: "شکایت اخراج از کار", article: "ekhraj-az-kar-va-bime-bikari" },
      { title: "بیمۀ بیکاری", article: "ekhraj-az-kar-va-bime-bikari" },
      { title: "خسارت حادثۀ ناشی از کار", article: "khesarat-hadese-kar" },
      { title: "حق سرقفلی و حق کسب‌وپیشه", article: "hagh-sarghofli-va-kasb-opishe" },
    ],
  },
  {
    id: "sherkat",
    title: "شرکت‌ها و امور تجاری",
    summary: "اختلاف شریک، انحلال و قرارداد تجاری؛ با نگاه پیشگیرانه به اسناد شرکت.",
    icon: "briefcase",
    service: "sherkat-ha",
    claims: [
      { title: "اختلاف شرکا و سهامداران", article: "ekhtelaf-shoraka-va-sahamdaran" },
      { title: "انحلال و تصفیۀ شرکت", article: "enhelal-va-tasfiye-sherkat" },
      { title: "بازبینی و تنظیم قرارداد تجاری", article: "bazbini-va-tanzim-gharardad-tejari" },
      { title: "مطالبات تجاری شرکت", article: "motalebat-tejari-sherkat" },
      { title: "تغییرات و ثبت شرکت", article: "taghirat-va-sabt-sherkat" },
      { title: "دعاوی علیه مدیرعامل", article: "davaye-aliye-modir-amel" },
    ],
  },
  {
    id: "keyfari",
    title: "دعاوی کیفری",
    summary: "شکایت و دفاع؛ پرونده‌هایی که زمان و کیفیت مستندسازی در آن‌ها تعیین‌کننده است.",
    icon: "gavel",
    service: "keyfari",
    claims: [
      { title: "تنظیم شکواییه", article: "tanzim-shekvaiye" },
      { title: "دفاع در تحقیقات مقدماتی", article: "dafaa-dar-tahghighat-moghaddamati" },
      { title: "دفاع در دادگاه", article: "dafaa-dar-dadgah" },
      { title: "کلاهبرداری و خیانت در امانت", article: "kelahbardari-ya-khiyanat-dar-amanat" },
      { title: "ضرب و جرح و تهدید", article: "zarb-jarh-va-tahdid-shkayat" },
      { title: "اعتراض به رأی کیفری", article: "eteraz-be-ray-keyfari" },
    ],
  },
];

/** کلیدهای یکتای گروه‌ها — برای آزمون یکتایی */
export const PRACTICE_IDS = PRACTICE_GROUPS.map((group) => group.id);

/** شمار کل دعاوی معرفی‌شده در نقشه */
export const PRACTICE_CLAIM_COUNT = PRACTICE_GROUPS.reduce(
  (total, group) => total + group.claims.length,
  0
);

/**
 * نگاشت هر مقاله به گروه دعاوی خود.
 * یک مقاله ممکن است در چند عنوان نقشه تکرار شده باشد (مثلاً حضانت و ملاقات)؛
 * برای دسته‌بندی، نخستین گروه از نقشه که به آن ارجاع داده، ملاک است.
 */
export const ARTICLE_GROUP_ID: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const group of PRACTICE_GROUPS) {
    for (const claim of group.claims) {
      if (claim.article && !map.has(claim.article)) map.set(claim.article, group.id);
    }
  }
  return map;
})();

/** گروه دعاوی بر پایۀ شناسه */
export const PRACTICE_BY_ID: Map<string, PracticeGroup> = new Map(
  PRACTICE_GROUPS.map((group) => [group.id, group])
);

/** عنوان دعوایی که به این مقاله ارجاع می‌دهد (برای نمایش در فهرست مقالات) */
export const ARTICLE_CLAIM_TITLE: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const group of PRACTICE_GROUPS) {
    for (const claim of group.claims) {
      if (claim.article && !map.has(claim.article)) map.set(claim.article, claim.title);
    }
  }
  return map;
})();
