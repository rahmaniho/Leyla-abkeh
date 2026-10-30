import PageHero from "../components/PageHero";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import { SITE_FAQS } from "../content/faqs";
import { buildBreadcrumbSchema, buildFaqSchema, type PageMeta } from "../lib/seo";

const breadcrumbs = [
  { name: "صفحۀ اصلی", path: "/" },
  { name: "تعرفه‌ها", path: "/pricing" },
];

const feeFaqs = SITE_FAQS.filter((faq) => faq.question.includes("هزینه"));

export const meta: PageMeta = {
  title: "تعرفۀ مشاورۀ حقوقی و شرایط وکالت در قزوین | لیلا آبکه",
  description:
    "تعرفۀ شفاف مشاورۀ حقوقی و شرایط وکالت در دفتر لیلا آبکه، قزوین. مبلغ مشاورۀ تخصصی، مشاورۀ اولیه و نحوۀ تعیین حق‌الوکاله پرونده‌ها.",
  path: "/pricing",
  type: "website",
  breadcrumbs,
  jsonLd: [buildBreadcrumbSchema(breadcrumbs), buildFaqSchema(feeFaqs)],
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="تعرفۀ شفاف"
        title="هزینۀ مشاوره و وکالت"
        description="هزینه‌ها پیش از شروع کار به‌صورت مکتوب اعلام می‌شوند. مبلغ نهایی وکالت به نوع پرونده، مرحلۀ دادرسی و حجم کار بستگی دارد."
        breadcrumbs={breadcrumbs}
      />
      <Pricing />

      <section id="fees" className="relative scroll-mt-24 bg-cream py-20 lg:py-24" aria-labelledby="fees-title">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          <h2 id="fees-title" className="text-2xl font-extrabold leading-[1.45] text-ink sm:text-3xl">
            چه چیزی بر حق‌الوکاله اثر می‌گذارد؟
          </h2>
          <p className="mt-4 max-w-2xl text-[14px] leading-8 text-ink/70">
            حق‌الوکالۀ پرونده پس از بررسی مدارک و در قرارداد وکالت به‌صورت مکتوب تعیین می‌شود.
            چهار عامل اصلی در این تعیین اثر دارند:
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "نوع و پیچیدگی دعوا",
                body: "برخی پرونده‌ها مستندات روشن و مسیر کوتاه دارند؛ برخی نیازمند بررسی کارشناسی، ادلۀ متعدد یا دعاوی مرتبط هستند.",
              },
              {
                title: "مرحلۀ رسیدگی",
                body: "بدوی، تجدیدنظر و اجرای حکم هر یک کار و زمان جداگانه‌ای می‌خواهند و به‌صورت جداگانه توافق می‌شوند.",
              },
              {
                title: "تعداد جلسات و کارشناسی",
                body: "تعداد جلسات، حضور کارشناس و نیاز به پیگیری‌های متعدد در برآورد هزینه لحاظ می‌شود.",
              },
              {
                title: "ارزش مالی موضوع",
                body: "در دعاوی مالی، ارزش خواسته و میزان مطالبه بر تعیین حق‌الوکاله اثر دارد.",
              },
            ].map((item) => (
              <li key={item.title} className="rounded-2xl border border-ink/10 bg-white/70 p-5">
                <h3 className="text-[14px] font-extrabold text-ink">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-7 text-ink/70">{item.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 rounded-2xl bg-white/60 p-5 text-[13px] leading-8 text-ink/75">
            تعرفۀ مشاوره جدا از حق‌الوکالۀ پرونده است. شرایط وکالت پس از بررسی مدارک و پیش از شروع کار در قرارداد مشخص می‌شود.
          </p>
        </div>
      </section>

      {feeFaqs.length > 0 && (
        <FAQ
          items={feeFaqs}
          eyebrow="پرسش‌های مالی"
          title="پرسش‌هایی دربارۀ هزینه‌ها"
          description="اگر پاسخ پرسش شما در این بخش نبود، در فرم مشاوره مطرح کنید."
          titleId="pricing-faq-title"
          openFirst={false}
        />
      )}
      <FinalCTA />
    </>
  );
}
