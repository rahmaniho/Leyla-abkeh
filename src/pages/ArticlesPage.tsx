import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import FinalCTA from "../components/FinalCTA";
import { ARTICLES, articlePath } from "../content/articles";
import { formatDateFa, toFaDigits } from "../lib/format";
import { buildBreadcrumbSchema, type PageMeta } from "../lib/seo";
import { Link } from "../lib/router";

const breadcrumbs = [
  { name: "صفحهٔ اصلی", path: "/" },
  { name: "مقالات", path: "/articles" },
];

export const meta: PageMeta = {
  title: "مقالات حقوقی | راهنمای مسائل خانواده، ملکی و تجاری | لیلا آبکه",
  description:
    "مقالات حقوقی دفتر وکالت لیلا آبکه: راهنمای عملی موضوعات خانواده، چک و اسناد تجاری، ملکی و کیفری با نگاه به رویهٔ عملی و مدارک لازم.",
  path: "/articles",
  type: "website",
  breadcrumbs,
  jsonLd: [
    buildBreadcrumbSchema(breadcrumbs),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "مقالات حقوقی",
      inLanguage: "fa-IR",
    },
  ],
};

export default function ArticlesPage() {
  return (
    <>
      <PageHero
        eyebrow="مقالات حقوقی"
        title="راهنمای حقوقی، بدون پیچیدگی"
        description="مطالب این بخش با هدف روشن‌کردن مسیرهای قانونی نوشته می‌شوند؛ نه جایگزین مشاورهٔ حقوقی، بلکه نقطهٔ شروع برای پرسش‌های درست."
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {ARTICLES.length === 0 ? (
            <p className="rounded-2xl border border-ink/10 bg-white/70 p-8 text-center text-[14px] text-ink/70">
              در حال حاضر مقاله‌ای منتشر نشده است. به‌زودی مطالب جدید در همین بخش منتشر می‌شود.
            </p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ARTICLES.map((article, index) => (
                <li key={article.slug}>
                  <Reveal delay={index * 100} className="h-full">
                    <article className="flex h-full flex-col rounded-3xl border border-ink/10 bg-white/75 p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-deep">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-ink/70">
                        <time dateTime={article.publishDate}>{formatDateFa(article.publishDate)}</time>
                        <span aria-hidden="true">·</span>
                        <span>{toFaDigits(article.readingMinutes)} دقیقه مطالعه</span>
                      </div>

                      <h2 className="mt-3 text-[16.5px] font-extrabold leading-8 text-ink">
                        <Link to={articlePath(article.slug)} className="hover:text-gold-deep">
                          {article.title}
                        </Link>
                      </h2>

                      <p className="mt-3 flex-1 text-[13px] leading-7 text-ink/70">
                        {article.description}
                      </p>

                      <Link
                        to={articlePath(article.slug)}
                        className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-gold-deep transition-all hover:gap-3 hover:text-ink"
                      >
                        خواندن مقاله
                        <span aria-hidden="true">←</span>
                      </Link>
                    </article>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
