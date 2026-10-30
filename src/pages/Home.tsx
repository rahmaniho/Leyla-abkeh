import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Features from "../components/Features";
import Services from "../components/Services";
import LegalTopics from "../components/LegalTopics";
import Process from "../components/Process";
import LatestArticles from "../components/LatestArticles";
import Benefits from "../components/Benefits";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import { SITE_FAQS } from "../content/faqs";
import FinalCTA from "../components/FinalCTA";
import { buildAttorneySchema, buildWebsiteSchema, type PageMeta } from "../lib/seo";
import { siteConfig } from "../config/site";

export const meta: PageMeta = {
  title: siteConfig.site.defaultTitle,
  description: siteConfig.site.defaultDescription,
  path: "/",
  type: "website",
  ogImageAlt: `${siteConfig.lawyer.name}، ${siteConfig.lawyer.jobTitle} در قزوین`,
  /* تصویر ثابت هیرو پیش از ویدئو نمایش داده می‌شود و جایگزین کم‌حرکت آن است. */
  preloadImage: {
    href: siteConfig.media.hero.poster,
    type: "image/jpeg",
  },
  jsonLd: [buildWebsiteSchema(), buildAttorneySchema()],
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Services limit={8} />
      <LegalTopics />
      <Process />
      <Benefits />
      <LatestArticles />
      <Testimonials />
      <Pricing />
      <FAQ items={SITE_FAQS.slice(0, 4)} moreHref="/faq" />
      <FinalCTA />
    </>
  );
}
