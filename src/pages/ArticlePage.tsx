import { useEffect, useState } from "react";
import PageHero from "../components/PageHero";
import FinalCTA from "../components/FinalCTA";
import { Link } from "../lib/router";
import { ARTICLES, articlePath, type Article } from "../content/articles";
import { SERVICES, servicePath } from "../content/services";
import { formatDateFa, toDateAttribute, toFaDigits } from "../lib/format";
import { primaryPhone, siteConfig } from "../config/site";
import {
  CARD_SIZES,
  COVER_HEIGHT,
  COVER_RATIO,
  COVER_SIZES,
  COVER_WIDTH,
  coverImage,
} from "../lib/images";
import { adjacentArticles, relatedArticles } from "../lib/related";
import { pageUrl } from "../lib/seo";

/** نوار پیشرفت مطالعۀ مقاله — فقط پس از اسکرول کاربر efe دارد */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-40 h-0.5 bg-transparent motion-reduce:hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-l from-gold via-gold-light to-gold-deep transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/** فهرست مطالب: در موبایل بازشو، در دسکتاپ کارت کنار مقاله */
function TableOfContents({ article }: { article: Article }) {
  if (article.headings.length < 3) return null;

  return (
    <nav aria-labelledby="toc-title" className="rounded-3xl border border-ink/10 bg-white/70 p-6">
      <h2 id="toc-title" className="text-base font-extrabold text-ink">
        در این مقاله
      </h2>
      <ol className="mt-4 space-y-2.5">
        {article.headings.map((heading, index) => (
          <li key={heading.id} className="flex gap-2.5 text-[13px] leading-6">
            <span className="mt-0.5 shrink-0 text-[11px] font-bold text-gold-deep" aria-hidden="true">
              {toFaDigits(index + 1)}
            </span>
            <a
              href={`#${heading.id}`}
              className="text-ink/75 underline decoration-transparent underline-offset-4 transition-colors hover:text-gold-deep hover:decoration-gold/40"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** اشتراک‌گذاری: کپی نشانی و واتساپ */
function ShareRow({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(pageUrl(`/articles/${article.slug}`));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  /*
   * نشانی اشتراک‌گذاری از canonical ساخته می‌شود، نه از `window`؛ در
   * پیش‌رندر مرورگری نیست و اگر به `window` تکیه کنیم، پیوند واتساپ در HTML
   * خروجی بی‌نشانی می‌ماند و پس از hydration هم دوباره ساخته نمی‌شود.
   */
  const canonical = pageUrl(`/articles/${article.slug}`);
  const shareText = `${article.title} — ${siteConfig.site.name}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${canonical}`)}`;

  return (
    <div className="mt-12 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-white/70 p-4">
      <span className="text-[12.5px] font-bold text-ink/70">اشتراک‌گذاری مقاله</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-3.5 py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-gold hover:text-gold-deep"
      >
        {copied ? "نشانی کپی شد" : "کپی نشانی"}
      </button>
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-3.5 py-2 text-[12.5px] font-semibold text-ink transition-colors hover:border-gold hover:text-gold-deep"
      >
        ارسال در واتساپ
      </a>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "نشانی مقاله در حافظه کپی شد" : ""}
      </span>
    </div>
  );
}

/** معرفی نویسنده و پیوند به صفحۀ درباره ما */
function AuthorBox() {
  const lawyer = siteConfig.lawyer;

  return (
    <aside className="mt-8 flex flex-col gap-5 rounded-3xl border border-gold/25 bg-gold/5 p-6 sm:flex-row sm:items-center">
      <img
        src={`${lawyer.photo.basePath}-560.avif`}
        alt={lawyer.photo.alt}
        width={96}
        height={128}
        loading="lazy"
        decoding="async"
        className="h-28 w-20 shrink-0 rounded-2xl border border-gold/30 object-cover"
      />
      <div className="text-[13px] leading-7 text-ink/75">
        <p className="text-[14px] font-extrabold text-ink">
          {lawyer.name} — {lawyer.professionalTitle}
        </p>
        <p className="mt-1.5">
          این مقاله در دفتر وکالت {lawyer.name} نوشته و بازبینی شده است.
          {lawyer.licenseNumber ? ` شمارۀ پروانۀ وکالت: ${lawyer.licenseNumber}.` : ""} محتوای
          سایت اطلاع‌رسانی عمومی است و جایگزین بررسی پروندۀ مشخص نیست.
        </p>
        <Link
          to="/about"
          className="mt-2 inline-flex items-center gap-1.5 font-bold text-gold-deep underline decoration-gold/40 underline-offset-4 hover:text-ink"
        >
          دربارۀ دفتر و رویکرد کار
          <span aria-hidden="true">←</span>
        </Link>
      </div>
    </aside>
  );
}

function RelatedCard({ article }: { article: Article }) {
  const cover = article.cover ? coverImage(article.cover) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white/75 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-deep">
      {cover && (
        <picture>
          {cover.sources.map((source) => (
            <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={CARD_SIZES} />
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
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[15px] font-extrabold leading-7 text-ink">
          <Link to={articlePath(article.slug)} className="hover:text-gold-deep">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-[12.5px] leading-7 text-ink/70">{article.description}</p>
        <span className="mt-3 text-[11.5px] text-ink/60">
          {toFaDigits(article.readingMinutes)} دقیقه مطالعه
        </span>
      </div>
    </article>
  );
}

export default function ArticlePage({ article }: { article: Article }) {
  const breadcrumbs = [
    { name: "صفحۀ اصلی", path: "/" },
    { name: "مقالات", path: "/articles" },
    { name: article.title, path: articlePath(article.slug) },
  ];

  const relatedServices = SERVICES.filter((service) =>
    article.relatedServices.includes(service.slug)
  );

  const related = relatedArticles(article, ARTICLES, 3);
  const { newer, older } = adjacentArticles(article, ARTICLES);
  const cover = article.cover ? coverImage(article.cover) : null;

  return (
    <>
      <ReadingProgress />
      <PageHero eyebrow="مقالۀ حقوقی" title={article.title} breadcrumbs={breadcrumbs}>
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

            {article.headings.length >= 3 && (
              <details className="mb-8 rounded-2xl border border-ink/10 bg-white/70 p-5 lg:hidden">
                <summary className="cursor-pointer text-[13.5px] font-extrabold text-ink">
                  فهرست مطالب این مقاله
                </summary>
                <ol className="mt-4 space-y-2">
                  {article.headings.map((heading, index) => (
                    <li key={heading.id} className="flex gap-2.5 text-[13px] leading-6">
                      <span className="text-[11px] font-bold text-gold-deep" aria-hidden="true">
                        {toFaDigits(index + 1)}
                      </span>
                      <a href={`#${heading.id}`} className="text-ink/75 hover:text-gold-deep">
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div
              className="article-prose"
              // محتوای Markdown در `renderMarkdown` پاک‌سازی شده است (تگ‌های HTML خام خنثی می‌شوند)
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <p className="mt-10 rounded-2xl border border-gold/25 bg-gold/5 p-5 text-[12.5px] leading-7 text-ink/75">
              این مقاله جنبۀ اطلاع‌رسانی عمومی دارد و جایگزین مشاورۀ حقوقی دربارۀ پروندۀ مشخص
              نیست. برای بررسی موضوع خود،{" "}
              <Link
                to="/contact"
                className="font-bold text-gold-deep underline decoration-gold/40 underline-offset-4"
              >
                درخواست مشاوره
              </Link>{" "}
              ثبت کنید.
            </p>

            <ShareRow article={article} />
            <AuthorBox />

            {(newer || older) && (
              <nav aria-label="مقاله‌های مجاور" className="mt-8 grid gap-4 sm:grid-cols-2">
                {newer && (
                  <Link
                    to={articlePath(newer.slug)}
                    className="group rounded-2xl border border-ink/10 bg-white/70 p-5 transition-colors hover:border-gold/40"
                  >
                    <span className="text-[11.5px] font-bold text-ink/60">مقالۀ تازه‌تر</span>
                    <span className="mt-1.5 block text-[13.5px] font-extrabold leading-7 text-ink group-hover:text-gold-deep">
                      {newer.title}
                    </span>
                  </Link>
                )}
                {older && (
                  <Link
                    to={articlePath(older.slug)}
                    className="group rounded-2xl border border-ink/10 bg-white/70 p-5 text-left transition-colors hover:border-gold/40 sm:text-right"
                  >
                    <span className="text-[11.5px] font-bold text-ink/60">مقالۀ پیشین</span>
                    <span className="mt-1.5 block text-[13.5px] font-extrabold leading-7 text-ink group-hover:text-gold-deep">
                      {older.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          <aside className="space-y-6" aria-label="مطالب مرتبط">
            <TableOfContents article={article} />

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
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mx-auto mt-16 max-w-7xl px-5 lg:px-8">
            <h2 className="text-xl font-extrabold text-ink">مقاله‌های مرتبط</h2>
            <p className="mt-2 text-[13px] text-ink/65">
              موضوع‌هایی نزدیک به همین مقاله، از همان گروه دعاوی.
            </p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <RelatedCard article={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <FinalCTA />
    </>
  );
}
