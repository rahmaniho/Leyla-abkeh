import PageHero from "../components/PageHero";
import ConsultationForm from "../components/ConsultationForm";
import { ClockIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "../components/Icons";
import {
  activeSocials,
  officePhone,
  openingHoursFa,
  primaryPhone,
  siteConfig,
  whatsappUrl,
} from "../config/site";
import { buildAttorneySchema, buildBreadcrumbSchema, pageUrl, type PageMeta } from "../lib/seo";
import { Link } from "../lib/router";

const breadcrumbs = [
  { name: "صفحهٔ اصلی", path: "/" },
  { name: "تماس", path: "/contact" },
];

export const meta: PageMeta = {
  title: "تماس با دفتر وکالت در قزوین | آدرس، تلفن و ساعات کاری | لیلا آبکه",
  description: `راه‌های تماس با دفتر وکالت ${siteConfig.lawyer.name} در ${siteConfig.site.city}: تلفن، واتساپ، نشانی دفتر، ساعات کاری و فرم درخواست مشاورهٔ آنلاین.`,
  path: "/contact",
  type: "website",
  breadcrumbs,
  jsonLd: [
    buildAttorneySchema(),
    buildBreadcrumbSchema(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      url: pageUrl("/contact"),
      name: "تماس با دفتر وکالت",
    },
  ],
};

export default function ContactPage() {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteConfig.contact.address.full
  )}`;

  return (
    <>
      <PageHero
        eyebrow="ارتباط با دفتر"
        title="تماس با دفتر وکالت"
        description="برای تعیین نوبت مشاوره، پرسش دربارهٔ یک موضوع حقوقی یا هماهنگی جلسه، از راه‌های زیر با دفتر در تماس باشید."
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-xl font-extrabold text-ink sm:text-2xl">اطلاعات تماس</h2>

            <div className="mt-6 space-y-4">
              <a
                href={primaryPhone.href}
                aria-label={primaryPhone.ariaLabel}
                className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white/75 p-5 transition-colors hover:border-gold/45 hover:bg-white"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[12.5px] font-medium text-ink/70">تلفن همراه دفتر</span>
                  <span dir="ltr" className="mt-1 block text-base font-extrabold tracking-wider text-ink">
                    {primaryPhone.display}
                  </span>
                </span>
              </a>

              {officePhone && (
                <a
                  href={officePhone.href}
                  className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white/75 p-5 transition-colors hover:border-gold/45 hover:bg-white"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                    <PhoneIcon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-medium text-ink/70">تلفن ثابت</span>
                    <span dir="ltr" className="mt-1 block text-base font-extrabold tracking-wider text-ink">
                      {officePhone.display}
                    </span>
                  </span>
                </a>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 rounded-2xl border border-ink/10 bg-white/75 p-5 transition-colors hover:border-gold/45 hover:bg-white"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-[12.5px] font-medium text-ink/70">واتساپ</span>
                  <span className="mt-1 block text-base font-extrabold text-ink">
                    ارسال پیام در واتساپ
                  </span>
                </span>
              </a>

              <div className="rounded-2xl border border-ink/10 bg-white/75 p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                    <MapPinIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[12.5px] font-medium text-ink/70">نشانی دفتر</h3>
                    <p className="mt-1 text-[14px] font-bold leading-7 text-ink">
                      {siteConfig.contact.address.full}
                    </p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-gold-deep underline decoration-gold/40 underline-offset-4 hover:text-ink"
                    >
                      مسیریابی در نقشه
                      <span className="sr-only">(باز شدن در پنجرهٔ جدید)</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white/75 p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-deep">
                    <ClockIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[12.5px] font-medium text-ink/70">ساعات کاری</h3>
                    <ul className="mt-1.5 space-y-1 text-[13.5px] text-ink/80">
                      {openingHoursFa.map((day) => (
                        <li key={day.schemaDay}>{day.display}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {activeSocials.length > 1 && (
              <div className="mt-8">
                <h2 className="text-[14px] font-extrabold text-ink">شبکه‌های اجتماعی</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {activeSocials.map((social) => (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-[12.5px] font-bold text-ink/80 transition-colors hover:border-gold hover:text-gold-deep"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-8 rounded-2xl border border-gold/25 bg-gold/5 p-5 text-[12.5px] leading-7 text-ink/75">
              برای حفظ محرمانگی، جزئیات حساس پرونده را در پیام یا فرم ارسال نکنید. اطلاعات ضروری
              در جلسهٔ مشاوره و به‌صورت امن دریافت می‌شود.{" "}
              <Link
                to="/privacy"
                className="font-bold text-gold-deep underline decoration-gold/40 underline-offset-4"
              >
                سیاست حریم خصوصی
              </Link>
            </p>
          </div>

          <div className="bg-ink rounded-[2rem] p-4 sm:p-6">
            <ConsultationForm />
          </div>
        </div>
      </section>
    </>
  );
}
