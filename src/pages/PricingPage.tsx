import PageHero from "../components/PageHero";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import { SITE_FAQS } from "../content/faqs";
import { buildBreadcrumbSchema, buildFaqSchema, type PageMeta } from "../lib/seo";

const breadcrumbs = [
  { name: "صفحهٔ اصلی", path: "/" },
  { name: "تعرفه‌ها", path: "/pricing" },
];

const feeFaqs = SITE_FAQS.filter((faq) => faq.question.includes("هزینه"));

export const meta: PageMeta = {
  title: "تعرفهٔ مشاورهٔ حقوقی و شرایط وکالت در قزوین | لیلا آبکه",
  description:
    "تعرفهٔ شفاف مشاورهٔ حقوقی و شرایط وکالت در دفتر لیلا آبکه، قزوین. مبلغ مشاورهٔ تخصصی، مشاورهٔ اولیه و نحوهٔ تعیین حق‌الوکاله پرونده‌ها.",
  path: "/pricing",
  type: "website",
  breadcrumbs,
  jsonLd: [buildBreadcrumbSchema(breadcrumbs), buildFaqSchema(feeFaqs)],
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="تعرفهٔ شفاف"
        title="هزینهٔ مشاوره و وکالت"
        description="هزینه‌ها پیش از شروع کار به‌صورت مکتوب اعلام می‌شوند. مبلغ نهایی وکالت به نوع پرونده، مرحلهٔ دادرسی و حجم کار بستگی دارد."
        breadcrumbs={breadcrumbs}
      />
      <Pricing />
      {feeFaqs.length > 0 && (
        <FAQ
          items={feeFaqs}
          eyebrow="پرسش‌های مالی"
          title="پرسش‌هایی دربارهٔ هزینه‌ها"
          description="اگر پاسخ پرسش شما در این بخش نبود، در فرم مشاوره مطرح کنید."
          titleId="pricing-faq-title"
          openFirst={false}
        />
      )}
      <FinalCTA />
    </>
  );
}
