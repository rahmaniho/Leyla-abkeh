import { Link } from "../lib/router";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import LogoMotion from "../components/LogoMotion";
import FinalCTA from "../components/FinalCTA";
import { siteConfig } from "../config/site";
import { buildAttorneySchema, buildLawyerMembershipSchema, absoluteUrl, pageUrl, type PageMeta } from "../lib/seo";
import LawyerPortrait from "../components/LawyerPortrait";

export const meta: PageMeta = {
  title: `دربارۀ لیلا آبکه | ${siteConfig.lawyer.professionalTitle}`,
  description: `لیلا آبکه، ${siteConfig.lawyer.professionalTitle}؛ آشنایی با رویکرد دفتر، محرمانگی اطلاعات موکل، شفافیت هزینه‌ها و پیگیری پرونده.`,
  path: "/about",
  type: "website",
  breadcrumbs: [
    { name: "صفحۀ اصلی", path: "/" },
    { name: "درباره وکیل", path: "/about" },
  ],
  jsonLd: [
    buildAttorneySchema(),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${pageUrl("/about")}#person`,
      name: siteConfig.lawyer.name,
      jobTitle: siteConfig.lawyer.jobTitle,
      ...buildLawyerMembershipSchema(),
      // تصویر اصلی + تصاویر رسمی دفتر: این‌ها همان فایل‌هایی هستند که در
      // مقالۀ «انتخاب وکیل در قزوین» هم منتشر شده‌اند، تا موتور جست‌وجو
      // (به‌ویژه جست‌وجوی تصویر) این عکس‌ها را به نام وکیل نسبت دهد.
      image: [
        absoluteUrl(`${siteConfig.lawyer.photo.basePath}.jpg`),
        absoluteUrl("/images/covers/leyla-abkeh-vakil-qazvin-cover.jpg"),
        absoluteUrl("/images/articles/leyla-abkeh-vakil-qazvin-1200.jpg"),
      ],
      url: pageUrl("/about"),
      worksFor: { "@id": `${siteConfig.site.url}/#attorney` },
      ...(siteConfig.lawyer.licenseNumber && siteConfig.lawyer.licenseNumberLatin
        ? {
            identifier: {
              "@type": "PropertyValue",
              propertyID: "شمارۀ پروانۀ وکالت",
              value: siteConfig.lawyer.licenseNumberLatin,
            },
          }
        : {}),
      address: {
        "@type": "PostalAddress",
        addressLocality: siteConfig.contact.address.city,
        addressCountry: siteConfig.contact.address.country,
      },
    },
  ],
};

const APPROACH = [
  {
    title: "ارزیابی صادقانه، نه وعدۀ شیرین",
    body: "هیچ پرونده‌ای از پیش برنده نیست. پیش از قبول وکالت، نقاط قوت و ضعف پرونده و ریسک‌های آن صریح گفته می‌شود تا تصمیم با آگاهی گرفته شود.",
  },
  {
    title: "توضیح مسیر، پیش از هر اقدام",
    body: "هر مرحله — از تنظیم دادخواست تا اجرای رأی — پیش از انجام توضیح داده می‌شود؛ هیچ اقدامی بدون اطلاع موکل انجام نمی‌شود.",
  },
  {
    title: "شفافیت هزینه‌ها",
    body: "تعرفۀ مشاوره مشخص است و حق‌الوکالۀ پرونده پس از بررسی موضوع در قرارداد وکالت تعیین می‌شود.",
  },
  {
    title: "رازداری حرفه‌ای",
    body: "اطلاعات موکل، راز حرفه‌ای است. انتشار هرگونه جزئیات پرونده یا نظر موکل، تنها با رضایت صریح خود او انجام می‌شود.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="درباره وکیل"
        title={`${siteConfig.lawyer.name}، ${siteConfig.lawyer.professionalTitle}`}
        description={`دفتر وکالت و مشاورۀ حقوقی در ${siteConfig.site.city}؛ با تمرکز بر دعاوی خانواده، کیفری، ملکی و ثبتی، اسناد تجاری، حقوق کار و امور شرکت‌ها.`}
        breadcrumbs={meta.breadcrumbs}
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-16 lg:px-8">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-soft">
              <LawyerPortrait sizes="(min-width: 1024px) 340px, 90vw" />
              <div className="space-y-2 p-5">
                <p className="text-base font-extrabold text-ink">{siteConfig.lawyer.name}</p>
                <p className="text-[14px] leading-6 text-ink/80">{siteConfig.lawyer.professionalTitle}</p>
                <p className="text-[12.5px] text-ink/70">دفتر: {siteConfig.contact.address.full}</p>
                {siteConfig.lawyer.licenseNumber && (
                  <p className="text-[12.5px] text-ink/70">
                    شمارۀ پروانۀ وکالت:{" "}
                    <span className="font-extrabold text-ink/90">
                      {siteConfig.lawyer.licenseNumber}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </Reveal>

          <div>
            <h2 className="text-xl font-extrabold leading-9 text-ink sm:text-2xl">
              وکالت، یعنی تصمیم‌گیری آگاهانه در شرایط سخت
            </h2>
            <div className="mt-4 space-y-4 text-[14px] leading-9 text-ink/80">
              <p>
                وقتی کسی به وکیل مراجعه می‌کند، معمولاً در یکی از دشوارترین دوره‌های زندگی خود است:
                اختلاف خانوادگی، پروندۀ کیفری، معاملۀ ملکی که به مشکل خورده یا مطالبه‌ای که سال‌ها
                معطل مانده است. در چنین شرایطی، آنچه بیش از هر چیز کمک می‌کند، یک ارزیابی روشن و
                یک مسیر مشخص است.
              </p>
              <p>
                رویکرد این دفتر بر سه پایه استوار است: توضیح صریح وضعیت حقوقی پرونده، تعیین
                گام‌های بعدی پیش از هر اقدام و پیگیری مستمر تا پایان کار. اگر مسیر پیشنهادی
                ریسک داشته باشد، همان ابتدا گفته می‌شود؛ اگر پرونده نیازمند کارشناسی یا اقدام
                تخصصی دیگری باشد، پیش از طرح دعوا مشخص می‌شود.
              </p>
              <p>
                این وب‌سایت با همین نگاه طراحی شده است: اطلاعات عمومی، شفاف و قابل استناد دربارۀ
                مسیرهای حقوقی، به‌همراه امکان ثبت درخواست مشاوره. در همۀ مراحل، محرمانگی اطلاعات
                موکل رعایت می‌شود.
              </p>
            </div>

            <div className="mt-12">
              <SectionHeader
                eyebrow="رویکرد کاری"
                title="آنچه در این دفتر انتظار دارید"
                align="start"
                titleId="approach-title"
              />
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {APPROACH.map((item, index) => (
                  <Reveal key={item.title} delay={index * 100}>
                    <article className="h-full rounded-2xl border border-ink/10 bg-white/70 p-6">
                      <h3 className="text-[15px] font-extrabold text-ink">{item.title}</h3>
                      <p className="mt-2.5 text-[13.5px] leading-7 text-ink/70">{item.body}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="mt-16 flex flex-col items-center">
              <span aria-hidden="true" className="mb-10 h-px w-16 bg-gold/40" />
              <div className="relative flex w-full justify-center">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[80px]"
                />
                <LogoMotion className="relative w-full max-w-[280px] sm:max-w-[320px]" />
              </div>
            </div>

            <p className="mt-8 text-[12.5px] leading-7 text-ink/70">
              اگر در حال انتخاب وکیل هستید، راهنمای{" "}
              <Link
                to="/articles/behtarin-vakil-qazvin"
                className="font-bold text-gold-deep underline decoration-gold/40 underline-offset-4"
              >
                معیارهای انتخاب وکیل در قزوین
              </Link>{" "}
              توضیح می‌دهد در جلسۀ اول چه پرسش‌هایی را مطرح کنید.
            </p>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
