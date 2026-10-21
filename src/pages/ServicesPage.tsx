import PageHero from "../components/PageHero";
import Services from "../components/Services";
import Benefits from "../components/Benefits";
import FinalCTA from "../components/FinalCTA";
import { buildAttorneySchema, type PageMeta } from "../lib/seo";

export const meta: PageMeta = {
  title: "خدمات حقوقی در قزوین | وکالت خانواده، کیفری و ملکی — لیلا آبکه",
  description:
    "حوزه‌های فعالیت دفتر وکالت لیلا آبکه در قزوین: دعاوی خانواده، کیفری، اموال غیرمنقول و امور ثبتی، چک و اسناد تجاری، حقوق کار و حقوق شرکت‌ها.",
  path: "/services",
  type: "website",
  breadcrumbs: [
    { name: "صفحهٔ اصلی", path: "/" },
    { name: "خدمات حقوقی", path: "/services" },
  ],
  jsonLd: [buildAttorneySchema()],
};

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
      <Benefits />
      <FinalCTA />
    </>
  );
}
