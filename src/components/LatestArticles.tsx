import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { ARTICLES, articlePath } from "../content/articles";
import { formatDateFa, toFaDigits } from "../lib/format";
import { Link } from "../lib/router";

/**
 * منتخب مقالات آموزشی در صفحهٔ اصلی.
 * فقط مقالات منتشرشده (بدون پیش‌نویس) نمایش داده می‌شوند و هر آیتم به صفحهٔ
 * کامل مقاله لینک دارد؛ این بخش هم به کشف محتوا و هم به لینک‌سازی داخلی کمک می‌کند.
 */
export default function LatestArticles({ limit = 2 }: { limit?: number }) {
  const items = ARTICLES.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section
      id="articles"
      className="relative scroll-mt-24 bg-gradient-to-b from-cream to-sand py-20 lg:py-28"
      aria-labelledby="latest-articles-title"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="مقالات آموزشی"
            title="پیش از تصمیم، مسیر را بشناسید"
            description="راهنماهای کوتاه و کاربردی دربارهٔ موضوعاتی که بیشتر سؤال می‌شوند؛ نوشته‌شده برای روشن‌کردن مسیر، نه وعدهٔ نتیجه."
            titleId="latest-articles-title"
            align="start"
          />
          <Link
            to="/articles"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-[12.5px] font-bold text-ink transition-colors hover:border-gold hover:text-gold-deep"
          >
            همهٔ مقالات
            <span aria-hidden="true">←</span>
          </Link>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((article, index) => (
            <li key={article.slug}>
              <Reveal delay={index * 120} className="h-full">
                <article className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-white/75 p-7 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-gold/45 hover:shadow-deep">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-ink/60">
                    <time dateTime={article.publishDate.slice(0, 10)}>
                      {formatDateFa(article.publishDate)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{toFaDigits(article.readingMinutes)} دقیقه مطالعه</span>
                    {article.lastReviewed && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>بازبینی: {formatDateFa(article.lastReviewed)}</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-3 text-[17px] font-extrabold leading-8 text-ink">
                    <Link
                      to={articlePath(article.slug)}
                      className="transition-colors group-hover:text-gold-deep"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  <p className="mt-3 flex-1 text-[13px] leading-7 text-ink/75">
                    {article.description}
                  </p>

                  <Link
                    to={articlePath(article.slug)}
                    className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors hover:text-ink"
                  >
                    خواندن مقاله
                    <span className="sr-only">: {article.title}</span>
                  </Link>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
