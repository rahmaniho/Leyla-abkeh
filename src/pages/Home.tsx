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
import { buildAttorneySchema, buildFaqSchema, buildWebsiteSchema, type PageMeta } from "../lib/seo";
import { siteConfig } from "../config/site";

const HOME_FAQS = SITE_FAQS.slice(0, 4);

const FEATURED_ARTICLE_SLUGS = [
  "behtarin-vakil-qazvin",
  "mehrieh-motalebe-va-ijra",
  "nafaqe-motalebe-va-tark-enfaq",
  "elzam-be-tanzim-sanad-rasmi",
  "enhesar-varasat-madarek-va-marahel",
  "dafaa-dar-dadgah",
];

export const meta: PageMeta = {
  title: siteConfig.site.defaultTitle,
  description: siteConfig.site.defaultDescription,
  path: "/",
  type: "website",
  ogImageAlt: `${siteConfig.lawyer.name}، ${siteConfig.lawyer.professionalTitle}`,
  /* تصویر ثابت هیرو پیش از ویدئو نمایش داده می‌شود و جایگزین کم‌حرکت آن است. */
  preloadImage: {
    href: siteConfig.media.hero.poster,
    type: "image/jpeg",
  },
  jsonLd: [buildWebsiteSchema(), buildAttorneySchema(), buildFaqSchema(HOME_FAQS)],
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
      <LatestArticles slugs={FEATURED_ARTICLE_SLUGS} />
      <Testimonials />
      <Pricing />
      <FAQ items={HOME_FAQS} moreHref="/faq" />
      <FinalCTA />
    </>
  );
}
