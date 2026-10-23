import { useEffect, useMemo, useState } from "react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import FinalCTA from "../components/FinalCTA";
import { ARTICLES, articlePath, type Article } from "../content/articles";
import {
  ARTICLE_CLAIM_TITLE,
  ARTICLE_GROUP_ID,
  PRACTICE_GROUPS,
  PRACTICE_BY_ID,
} from "../content/practices";
import { formatDateFa, toFaDigits } from "../lib/format";
import { buildBreadcrumbSchema, pageUrl, type PageMeta } from "../lib/seo";
import { Link } from "../lib/router";
import { matchesAll, normalizeFa, searchTerms } from "../lib/text";
import {
  CARD_SIZES,
  COVER_HEIGHT,
  COVER_RATIO,
  COVER_WIDTH,
  coverImage,
} from "../lib/images";

const breadcrumbs = [
  { name: "صفحۀ اصلی", path: "/" },
  { name: "مقالات", path: "/articles" },
];

export const meta: PageMeta = {
  title: "مقالات حقوقی | راهنمای مسائل خانواده، ملکی و تجاری | لیلا آبکه",
  description:
    "مقالات حقوقی دفتر وکالت لیلا آبکه: راهنمای عملی موضوعات خانواده، چک و اسناد تجاری، ملکی و کیفری با نگاه به رویۀ عملی و مدارک لازم.",
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
      isPartOf: { "@id": `${pageUrl("/articles")}#blog` },
    },
    /*
     * موجودیت Blog و فهرست مقالات:
     * مقاله‌ها با `isPartOf` به همین گره ارجاع می‌دهند. ItemList هم به
     * موتورهای جست‌وجو و دستیارهای هوش مصنوعی می‌گوید این صفحه یک فهرست
     * مرتب است، نه چند لینک پراکنده.
     */
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": `${pageUrl("/articles")}#blog`,
      name: "مقالات حقوقی دفتر وکالت لیلا آبکه",
      inLanguage: "fa-IR",
      publisher: { "@id": `${pageUrl("/")}#attorney` },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "فهرست مقالات حقوقی",
      numberOfItems: ARTICLES.length,
      itemListElement: ARTICLES.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: pageUrl(articlePath(article.slug)),
        name: article.title,
      })),
    },
  ],
};

/** گروه دعاوی مقاله؛ اگر در نقشه نبود، از خدمت مرتبط حدس زده می‌شود */
function groupOf(article: Article): string | null {
  const direct = ARTICLE_GROUP_ID.get(article.slug);
  if (direct) return direct;
  const byService = PRACTICE_GROUPS.find((group) =>
    article.relatedServices.includes(group.service)
  );
  return byService ? byService.id : null;
}

/** متن قابل جست‌وجوی هر مقاله (یک‌بار ساخته و کش می‌شود) */
const SEARCH_INDEX = new Map(
  ARTICLES.map((article) => [
    article.slug,
    normalizeFa(
      [
        article.title,
        article.description,
        article.tags.join(" "),
        ARTICLE_CLAIM_TITLE.get(article.slug) ?? "",
      ].join(" ")
    ),
  ])
);

const GROUP_OF: Record<string, string | null> = Object.fromEntries(
  ARTICLES.map((article) => [article.slug, groupOf(article)])
);

function readQuery(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

export default function ArticlesPage() {
  const [query, setQuery] = useState(readQuery);
  const [group, setGroup] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "old">("new");

  const terms = useMemo(() => searchTerms(query), [query]);

  const results = useMemo(() => {
    const filtered = ARTICLES.filter((article) => {
      if (group !== "all" && GROUP_OF[article.slug] !== group) return false;
      return matchesAll(SEARCH_INDEX.get(article.slug) ?? "", terms);
    });

    return [...filtered].sort((a, b) =>
      sort === "new"
        ? a.publishDate < b.publishDate
          ? 1
          : -1
        : a.publishDate < b.publishDate
          ? -1
          : 1
    );
  }, [group, terms, sort]);

  /* نشانی صفحه با جست‌وجو هم‌گام می‌شود تا پیوند نتیجه قابل اشتراک باشد */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [query]);

  const activeGroup = group === "all" ? null : PRACTICE_BY_ID.get(group)?.title ?? null;
  const isFiltering = terms.length > 0 || group !== "all";

  return (
    <>
      <PageHero
        eyebrow="مقالات حقوقی"
        title="راهنمای حقوقی، بدون پیچیدگی"
        description="مطالب این بخش با هدف روشن‌کردن مسیرهای قانونی نوشته می‌شوند؛ نه جایگزین مشاورۀ حقوقی، بلکه نقطۀ شروع برای پرسش‌های درست."
        breadcrumbs={breadcrumbs}
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {ARTICLES.length === 0 ? (
            <p className="rounded-2xl border border-ink/10 bg-white/70 p-8 text-center text-[14px] text-ink/70">
              در حال حاضر مقاله‌ای منتشر نشده است. به‌زودی مطالب جدید در همین بخش منتشر می‌شود.
            </p>
          ) : (
            <>
              <form
                role="search"
                onSubmit={(event) => event.preventDefault()}
                className="rounded-3xl border border-ink/10 bg-white/75 p-5 shadow-soft sm:p-6"
              >
                <label htmlFor="articles-search" className="text-[13px] font-extrabold text-ink">
                  جست‌وجو در مقالات
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="articles-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="مثلاً: مهریه، چک، تقسیم ترکه، اخراج از کار"
                    autoComplete="off"
                    aria-describedby="articles-search-hint"
                    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-gold focus:ring-2 focus:ring-gold/30"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setGroup("all");
                      }}
                      className="rounded-2xl border border-ink/15 px-4 py-3 text-[12.5px] font-bold text-ink transition-colors hover:border-gold hover:text-gold-deep"
                    >
                      پاک کردن
                    </button>
                    <label className="sr-only" htmlFor="articles-sort">
                      ترتیب نمایش
                    </label>
                    <select
                      id="articles-sort"
                      value={sort}
                      onChange={(event) => setSort(event.target.value as "new" | "old")}
                      className="rounded-2xl border border-ink/15 bg-white px-3 py-3 text-[12.5px] font-semibold text-ink outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                    >
                      <option value="new">تازه‌ترین</option>
                      <option value="old">قدیمی‌ترین</option>
                    </select>
                  </div>
                </div>
                <p id="articles-search-hint" className="mt-2.5 text-[11.5px] text-ink/55">
                  جست‌وجو در عنوان، توضیح و برچسب مقاله‌ها انجام می‌شود؛ نیازی به نوشتن نیم‌فاصله
                  یا «ی» و «ک» فارسی نیست.
                </p>

                <ul className="mt-4 flex flex-wrap gap-2" aria-label="فیلتر بر پایۀ گروه دعاوی">
                  <li>
                    <button
                      type="button"
                      onClick={() => setGroup("all")}
                      aria-pressed={group === "all"}
                      className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                        group === "all"
                          ? "border-gold bg-gold/15 text-ink"
                          : "border-ink/15 text-ink/70 hover:border-gold/50 hover:text-ink"
                      }`}
                    >
                      همه ({toFaDigits(ARTICLES.length)})
                    </button>
                  </li>
                  {PRACTICE_GROUPS.map((practiceGroup) => {
                    const count = ARTICLES.filter(
                      (article) => GROUP_OF[article.slug] === practiceGroup.id
                    ).length;
                    if (count === 0) return null;
                    return (
                      <li key={practiceGroup.id}>
                        <button
                          type="button"
                          onClick={() => setGroup(practiceGroup.id)}
                          aria-pressed={group === practiceGroup.id}
                          className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                            group === practiceGroup.id
                              ? "border-gold bg-gold/15 text-ink"
                              : "border-ink/15 text-ink/70 hover:border-gold/50 hover:text-ink"
                          }`}
                        >
                          {practiceGroup.title} ({toFaDigits(count)})
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </form>

              <p role="status" aria-live="polite" className="mt-6 text-[12.5px] text-ink/65">
                {toFaDigits(results.length)} مقاله
                {activeGroup ? ` در گروه «${activeGroup}»` : ""}
                {terms.length > 0 ? ` برای «${query.trim()}»` : ""}
              </p>

              {results.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-ink/10 bg-white/75 p-8 text-center">
                  <p className="text-[14px] font-extrabold text-ink">
                    مقاله‌ای با این عبارت پیدا نشد.
                  </p>
                  <p className="mt-2 text-[13px] leading-7 text-ink/70">
                    واژۀ کوتاه‌تری امتحان کنید یا فیلتر گروه را بردارید. اگر موضوع پروندۀ شما در
                    فهرست نیست، از صفحۀ تماس بپرسید.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setGroup("all");
                    }}
                    className="mt-5 rounded-2xl border border-ink/15 px-4 py-2.5 text-[12.5px] font-bold text-ink hover:border-gold hover:text-gold-deep"
                  >
                    نمایش همۀ مقاله‌ها
                  </button>
                </div>
              ) : (
                <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((article, index) => {
                    const cover = article.cover ? coverImage(article.cover) : null;
                    const claimTitle = ARTICLE_CLAIM_TITLE.get(article.slug);

                    return (
                      <li key={article.slug} data-testid="article-card">
                        <Reveal delay={Math.min(index, 5) * 80} className="h-full">
                          <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white/75 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-deep">
                            {cover && (
                              <picture>
                                {cover.sources.map((source) => (
                                  <source
                                    key={source.type}
                                    type={source.type}
                                    srcSet={source.srcSet}
                                    sizes={CARD_SIZES}
                                  />
                                ))}
                                <img
                                  src={cover.src}
                                  srcSet={cover.srcSet}
                                  sizes={cover.srcSet ? CARD_SIZES : undefined}
                                  alt=""
                                  width={COVER_WIDTH}
                                  height={COVER_HEIGHT}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full border-b border-ink/10 bg-sand object-cover"
                                  style={{ aspectRatio: COVER_RATIO }}
                                />
                              </picture>
                            )}

                            <div className="flex flex-1 flex-col p-6">
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-ink/70">
                                <time dateTime={article.publishDate}>
                                  {formatDateFa(article.publishDate)}
                                </time>
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

                              {claimTitle && (
                                <p className="mt-3 text-[11.5px] font-semibold text-gold-deep">
                                  {claimTitle}
                                </p>
                              )}

                              <Link
                                to={articlePath(article.slug)}
                                className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-gold-deep transition-all hover:gap-3 hover:text-ink"
                              >
                                خواندن مقاله
                                <span aria-hidden="true">←</span>
                              </Link>
                            </div>
                          </article>
                        </Reveal>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!isFiltering && (
                <p className="mt-10 rounded-2xl border border-ink/10 bg-white/60 p-5 text-[12.5px] leading-7 text-ink/65">
                  موضوع پروندۀ شما در این فهرست نیست؟ صفحۀ{" "}
                  <Link to="/services" className="font-bold text-gold-deep underline underline-offset-4">
                    خدمات حقوقی
                  </Link>{" "}
                  حوزه‌های کار دفتر را نشان می‌دهد و از{" "}
                  <Link to="/contact" className="font-bold text-gold-deep underline underline-offset-4">
                    فرم تماس
                  </Link>{" "}
                  می‌توانید پرسش خود را مطرح کنید.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
