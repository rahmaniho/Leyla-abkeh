import PageHero from "../components/PageHero";
import Services from "../components/Services";
import FinalCTA from "../components/FinalCTA";
import { Link } from "../lib/router";
import { buildAttorneySchema, type PageMeta } from "../lib/seo";

export const meta: PageMeta = {
  title: "خدمات حقوقی در قزوین | وکالت خانواده، کیفری و ملکی | لیلا آبکه",
  description:
    "حوزه‌های فعالیت دفتر وکالت لیلا آبکه در قزوین: دعاوی خانواده، کیفری، اموال غیرمنقول و امور ثبتی، چک و اسناد تجاری، حقوق کار و حقوق شرکت‌ها.",
  path: "/services",
  type: "website",
  breadcrumbs: [
    { name: "صفحۀ اصلی", path: "/" },
    { name: "خدمات حقوقی", path: "/services" },
  ],
  jsonLd: [buildAttorneySchema()],
};

const STEPS = [
  {
    title: "ارسال درخواست",
    body: "موضوع را از فرم مشاوره یا تلفنی مطرح می‌کنید. برای حفظ محرمانگی، جزئیات حساس پرونده را در فرم ننویسید؛ همان چند خط برای تشخیص مسیر کلی کافی است.",
  },
  {
    title: "بررسی اولیه و تعیین وقت",
    body: "در ساعات کاری، درخواست بررسی و برای تعیین وقت تماس گرفته می‌شود. اگر موضوع فوری باشد (مانند مهلت قانونی یا بازداشت)، این نکته را در تماس مشخص کنید.",
  },
  {
    title: "جلسه و برنامۀ اقدام",
    body: "در جلسۀ مشاوره، مدارک بررسی و گزینه‌های پیشِ رو با مزایا، ریسک و برآورد هزینۀ هر مرحله توضیح داده می‌شود تا تصمیم با آگاهی گرفته شود.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="حوزه‌های فعالیت"
        title="خدمات حقوقی دفتر وکالت"
        description="هر پرونده مسیر خودش را دارد. در این بخش، حوزه‌های اصلی فعالیت و رویکرد دفتر در هر حوزه توضیح داده شده است. اگر موضوع شما در فهرست نیست، در فرم مشاوره «سایر موضوعات» را انتخاب کنید."
        breadcrumbs={meta.breadcrumbs}
      />

      <Services />

      <section id="process" className="relative scroll-mt-24 bg-white/70 py-20 lg:py-28" aria-labelledby="process-title">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-[12.5px] font-extrabold tracking-[0.2em] text-gold-deep">مسیر همکاری</p>
          <h2 id="process-title" className="mt-4 text-2xl font-extrabold leading-[1.45] text-ink sm:text-3xl">
            از نخستین تماس تا برنامۀ روشن
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-8 text-ink/70">
            هیچ پرونده‌ای بدون شناخت مدارک و شرایط، ارزیابی نمی‌شود. سه گام زیر چارچوب کار است؛
            زمان هر گام به موضوع و مرجع رسیدگی بستگی دارد.
          </p>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-soft">
                <span className="text-[12.5px] font-extrabold text-gold-deep">
                  {["۰۱", "۰۲", "۰۳"][index]}
                </span>
                <h3 className="mt-3 text-base font-extrabold text-ink">{step.title}</h3>
                <p className="mt-3 text-[13.5px] leading-8 text-ink/70">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/pricing"
              className="rounded-full border border-ink/15 px-6 py-3 text-[13px] font-extrabold text-ink transition-colors hover:border-gold/50 hover:text-gold-deep"
            >
              تعرفۀ مشاوره و وکالت
            </Link>
            <Link
              to="/faq"
              className="rounded-full border border-ink/15 px-6 py-3 text-[13px] font-extrabold text-ink transition-colors hover:border-gold/50 hover:text-gold-deep"
            >
              پرسش‌های متداول
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
