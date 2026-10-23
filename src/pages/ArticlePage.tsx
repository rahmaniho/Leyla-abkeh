import PageHero from "../components/PageHero";
import FinalCTA from "../components/FinalCTA";
import { Link } from "../lib/router";
import { ARTICLES, articlePath, type Article } from "../content/articles";
import { SERVICES, servicePath } from "../content/services";
import { formatDateFa, toDateAttribute, toFaDigits } from "../lib/format";
import { primaryPhone } from "../config/site";
import { COVER_HEIGHT, COVER_RATIO, COVER_SIZES, COVER_WIDTH, coverImage } from "../lib/images";

export default function ArticlePage({ article }: { article: Article }) {
  const breadcrumbs = [
    { name: "صفحهی اصلی", path: "/" },
    { name: "مقالات", path: "/articles" },
    { name: article.title, path: articlePath(article.slug) },
  ];

  const relatedServices = SERVICES.filter((service) =>
    article.relatedServices.includes(service.slug)
  );

  const otherArticles = ARTICLES.filter((item) => item.slug !== article.slug).slice(0, 2);

  const cover = article.cover ? coverImage(article.cover) : null;

  return (
    <>
      <PageHero eyebrow="مقالهی حقوقی" title={article.title} breadcrumbs={breadcrumbs}>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-white/70">
          <span>نویسنده: {article.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={toDateAttribute(article.publishDate)}>
            انتشار: {formatDateFa(article.publishDate)}
          </time>
          {article.lastReviewed && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={toDateAttribute(article.lastReviewed)}>
                آخرین بازبینی: {formatDateFa(article.lastReviewed)}
              </time>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{toFaDigits(article.readingMinutes)} دقیقه مطالعه</span>
        </div>
      </PageHero>

      <section className="bg-cream py-14 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 lg:px-8">
          <article>
            {cover && (
              <picture>
                {cover.sources.map((source) => (
                  <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={COVER_SIZES} />
                ))}
                <img
                  src={cover.src}
                  srcSet={cover.srcSet}
                  sizes={cover.srcSet ? COVER_SIZES : undefined}
                  alt={article.coverAlt ?? article.title}
                  width={COVER_WIDTH}
                  height={COVER_HEIGHT}
                  fetchPriority="high"
                  decoding="async"
                  className="mb-8 w-full rounded-3xl border border-ink/10 bg-sand object-cover"
                  style={{ aspectRatio: COVER_RATIO }}
                />
              </picture>
            )}

            <div
              className="article-prose"
              // محتوای Markdown در `renderMarkdown` پاک‌سازی شده است (تگ‌های HTML خام خنثی می‌شوند)
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <p className="mt-10 rounded-2xl border border-gold/25 bg-gold/5 p-5 text-[12.5px] leading-7 text-ink/75">
              این مقاله جنبهی اطلاع‌رسانی عمومی دارد و جایگزین مشاورهی حقوقی دربارهی پروندهی مشخص
              نیست. برای بررسی موضوع خود،{" "}
              <Link
                to="/contact"
                className="font-bold text-gold-deep underline decoration-gold/40 underline-offset-4"
              >
                درخواست مشاوره
              </Link>{" "}
              ثبت کنید.
            </p>
          </article>

          <aside className="space-y-6" aria-label="مطالب مرتبط">
            {relatedServices.length > 0 && (
              <nav
                aria-labelledby="article-services-title"
                className="rounded-3xl border border-ink/10 bg-white/70 p-6"
              >
                <h2 id="article-services-title" className="text-base font-extrabold text-ink">
                  خدمت مرتبط
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {relatedServices.map((service) => (
                    <li key={service.slug}>
                      <Link
                        to={servicePath(service.slug)}
                        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-gold-deep transition-colors hover:text-ink"
                      >
                        <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="rounded-3xl border border-ink/10 bg-white/70 p-6">
              <h2 className="text-base font-extrabold text-ink">درخواست مشاوره</h2>
              <p className="mt-2 text-[12.5px] leading-7 text-ink/70">
                برای بررسی موضوع خود با دفتر در تماس باشید.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-5 py-3 text-sm font-bold text-ink-deep shadow-gold"
              >
                فرم درخواست مشاوره
              </Link>
              {primaryPhone && (
                <a
                  href={primaryPhone.href}
                  dir="ltr"
                  className="mt-2.5 inline-flex w-full items-center justify-center rounded-2xl border border-ink/15 px-5 py-3 text-sm font-bold tracking-wide text-ink transition-colors hover:border-gold hover:text-gold-deep"
                >
                  <span dir="ltr">{primaryPhone.display}</span>
                </a>
              )}
            </div>

            {otherArticles.length > 0 && (
              <nav
                aria-labelledby="more-articles-title"
                className="rounded-3xl border border-ink/10 bg-white/70 p-6"
              >
                <h2 id="more-articles-title" className="text-base font-extrabold text-ink">
                  مقالات دیگر
                </h2>
                <ul className="mt-4 space-y-3">
                  {otherArticles.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to={articlePath(item.slug)}
                        className="block text-[13px] font-semibold leading-6 text-ink/80 transition-colors hover:text-gold-deep"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
