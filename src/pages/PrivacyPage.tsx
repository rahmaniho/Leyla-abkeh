import PageHero from "../components/PageHero";
import { primaryPhone, siteConfig } from "../config/site";
import { Link } from "../lib/router";
import type { PageMeta } from "../lib/seo";

const breadcrumbs = [
  { name: "صفحۀ اصلی", path: "/" },
  { name: "سیاست حریم خصوصی", path: "/privacy" },
];

export const meta: PageMeta = {
  title: "سیاست حریم خصوصی | دفتر وکالت لیلا آبکه",
  description:
    "توضیح شفاف دربارۀ اطلاعاتی که از طریق فرم مشاوره دریافت می‌شود، هدف استفاده، مدت نگهداری، نحوۀ محافظت و حقوق شما برای اصلاح یا حذف اطلاعات.",
  path: "/privacy",
  type: "website",
  breadcrumbs,
};

const SECTIONS = [
  {
    heading: "چه اطلاعاتی دریافت می‌شود؟",
    paragraphs: [
      "اطلاعاتی که خودتان در فرم درخواست مشاوره وارد می‌کنید: نام و نام خانوادگی، شمارۀ تماس، موضوع پرونده، مدت و روش ترجیحی مشاوره و شرح اختیاری موضوع.",
      "این وب‌سایت از ابزار تحلیل رفتار کاربران (Analytics)، پیکسل تبلیغاتی یا کوکی ردیابی استفاده نمی‌کند. برای جلوگیری از ارسال تکراری، یک مقدار زمانی کوتاه‌مدت در حافظۀ مرورگر شما ذخیره می‌شود که پس از چند ثانیه بی‌اثر است.",
      "اگر در آینده سنجش بازدید فعال شود، فقط رویدادهای فنی و بی‌نام ثبت می‌شود (مثل «کلیک روی دکمۀ درخواست مشاوره» یا «خطای اعتبارسنجی در فیلد شماره تماس»). نام، شمارۀ تماس، متن پیام و هیچ داده‌ای که شما را شناسایی کند ارسال نمی‌شود و ابزار تحلیلی خارجی (مانند Google Analytics) به کار نمی‌رود.",
    ],
  },
  {
    heading: "چرا این اطلاعات را می‌خواهیم؟",
    paragraphs: [
      "فقط برای پاسخ‌گویی به همان درخواست و هماهنگی نوبت مشاوره. اطلاعات برای ارسال تبلیغات، فروش یا هر هدف دیگری استفاده نمی‌شود.",
      "جزئیات پرونده در جلسۀ مشاوره و به‌صورت مستقیم دریافت می‌شود؛ لطفاً اطلاعات حساس را در فرم وارد نکنید.",
    ],
  },
  {
    heading: "اطلاعات کجا می‌رود و چه مدت نگه داشته می‌شود؟",
    paragraphs: [
      "در صورت فعال و پیکربندی‌بودن ارسال آنلاین، درخواست از طریق تابع سرور Netlify پردازش و به کانال اطلاع‌رسانی پیکربندی‌شدۀ دفتر ارسال می‌شود. در نسخۀ ایستا ارسال آنلاین فعال نیست. در خود وب‌سایت پایگاه داده‌ای برای ذخیرۀ درخواست‌ها وجود ندارد.",
      "پس از پاسخ‌گویی و پایان موضوع، اطلاعات درخواست‌های بدون پرونده حذف می‌شود. اگر پرونده‌ای تشکیل شود، اطلاعات بر اساس مقررات حرفه‌ای و قانونی نگهداری می‌شود.",
    ],
  },
  {
    heading: "چه اقدام‌هایی برای محافظت انجام شده است؟",
    paragraphs: [
      "ارتباط با سایت از طریق HTTPS انجام می‌شود. اعتبارسنجی داده‌ها هم در مرورگر و هم در سرور انجام می‌شود، درخواست‌ها محدودیت نرخ دارند و برای جلوگیری از هرزنامه از روش‌های فنی (فیلد تله و کنترل زمان تکمیل فرم) استفاده می‌شود.",
      "هیچ کلید محرمانه یا رمز دسترسی در کد فرانت‌اند قرار ندارد؛ کلیدهای سرویس ارسال پیام فقط در متغیرهای محیطی سرور نگهداری می‌شوند.",
      "هیچ سامانه‌ای امنیت مطلق ندارد؛ در صورت مشاهدۀ هرگونه مشکل امنیتی، لطفاً سریع اطلاع دهید.",
    ],
  },
  {
    heading: "حقوق شما",
    paragraphs: [
      "می‌توانید بخواهید اطلاعات ارسالی شما بررسی، اصلاح یا حذف شود. برای این کار با ذکر نام و شمارۀ تماسی که در فرم وارد کرده‌اید با دفتر تماس بگیرید.",
      "اگر مایل باشید درخواست شما بدون نگهداری هیچ نسخه‌ای حذف شود، پس از پاسخ‌گویی به درخواست، این موضوع را اعلام کنید.",
    ],
  },
  {
    heading: "تغییرات این سیاست",
    paragraphs: [
      "در صورت تغییر روش پردازش اطلاعات، این صفحه به‌روزرسانی می‌شود و تاریخ بازبینی در انتهای صفحه ذکر خواهد شد.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="حریم خصوصی"
        title="سیاست حریم خصوصی"
        description="این صفحه به زبان ساده توضیح می‌دهد چه اطلاعاتی از طریق سایت دریافت می‌شود، چرا و چگونه نگهداری می‌شود."
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-extrabold leading-8 text-ink">{section.heading}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 24)} className="text-[14px] leading-9 text-ink/80">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-ink/10 bg-white/75 p-6">
            <h2 className="text-[15px] font-extrabold text-ink">تماس دربارۀ حریم خصوصی</h2>
            <p className="mt-2 text-[13.5px] leading-7 text-ink/75">
              برای هر پرسش یا درخواست مرتبط با اطلاعات خود، با دفتر تماس بگیرید:
            </p>
            {primaryPhone ? (
              <a
                href={primaryPhone.href}
                dir="ltr"
                className="mt-3 inline-flex items-center gap-2 text-base font-extrabold tracking-wider text-gold-deep"
              >
                {primaryPhone.display}
              </a>
            ) : (
              <Link
                to="/contact"
                className="mt-3 inline-flex items-center gap-2 text-[13.5px] font-extrabold text-gold-deep underline underline-offset-4"
              >
                ثبت درخواست از طریق فرم تماس
              </Link>
            )}
            <p className="mt-3 text-[12.5px] leading-7 text-ink/70">
              نشانی: {siteConfig.contact.address.full}
            </p>
          </div>

          <p className="mt-8 text-[12px] leading-7 text-ink/70">
            آخرین بازبینی: ۲۹ مهر ۱۴۰۵ ·{" "}
            <Link to="/contact" className="font-bold text-gold-deep underline underline-offset-4">
              تماس با دفتر
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
