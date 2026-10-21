import PageHero from "../components/PageHero";
import FAQ from "../components/FAQ";
import FinalCTA from "../components/FinalCTA";
import { SITE_FAQS } from "../content/faqs";
import { buildBreadcrumbSchema, buildFaqSchema, type PageMeta } from "../lib/seo";

const breadcrumbs = [
  { name: "صفحهٔ اصلی", path: "/" },
  { name: "سوالات متداول", path: "/faq" },
];

export const meta: PageMeta = {
  title: "سوالات متداول حقوقی | هزینه، مدارک و مراحل — لیلا آبکه",
  description:
    "پاسخ به پرسش‌های پرتکرار دربارهٔ مشاورهٔ حقوقی در قزوین: هزینه و تعرفه، مدارک لازم، محرمانگی اطلاعات، مدت رسیدگی و امکان مشاورهٔ آنلاین.",
  path: "/faq",
  type: "website",
  breadcrumbs,
  jsonLd: [buildFaqSchema(SITE_FAQS), buildBreadcrumbSchema(breadcrumbs)],
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="پرسش‌های پرتکرار"
        title="سوالات متداول"
        description="پاسخ شفاف به پرسش‌هایی که پیش از مراجعه به وکیل مطرح می‌شود. اگر پاسخ پرسش خود را نیافتید، در فرم مشاوره بپرسید."
        breadcrumbs={breadcrumbs}
      />
      <FAQ
        items={SITE_FAQS}
        eyebrow="پاسخ‌های کوتاه و روشن"
        title="پیش از مراجعه بدانید"
        description="این پاسخ‌ها عمومی هستند؛ ارزیابی پروندهٔ مشخص نیازمند بررسی مدارک است."
        titleId="faq-page-title"
        openFirst={false}
      />
      <FinalCTA />
    </>
  );
}
