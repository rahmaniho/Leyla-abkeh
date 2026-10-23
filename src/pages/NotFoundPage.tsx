import PageHero from "../components/PageHero";
import { Link } from "../lib/router";
import { SERVICES, servicePath } from "../content/services";
import { ARTICLES, articlePath } from "../content/articles";
import type { PageMeta } from "../lib/seo";

export const meta: PageMeta = {
  title: "صفحه پیدا نشد | دفتر وکالت لیلا آبکه",
  description: "نشانی وارد‌شده در این سایت وجود ندارد. از لینک‌های زیر به بخش‌های اصلی سایت بروید.",
  path: "/404",
  noindex: true,
  type: "website",
};

export default function NotFoundPage() {
  const recent = ARTICLES.slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="خطای ۴۰۴"
        title="این صفحه پیدا نشد"
        description="ممکن است نشانی تغییر کرده باشد یا اشتباه تایپ شده باشد. از مسیرهای زیر ادامه دهید."
      />

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-6 py-3 text-sm font-bold text-ink-deep shadow-gold"
            >
              صفحۀ اصلی
            </Link>
            <Link
              to="/services"
              className="rounded-2xl border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-gold hover:text-gold-deep"
            >
              خدمات حقوقی
            </Link>
            <Link
              to="/contact"
              className="rounded-2xl border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-gold hover:text-gold-deep"
            >
              تماس با دفتر
            </Link>
          </div>

          <h2 className="mt-10 text-[15px] font-extrabold text-ink">تازه‌ترین مقاله‌ها</h2>
          <ul className="mt-4 space-y-2">
            {recent.map((article) => (
              <li key={article.slug}>
                <Link
                  to={articlePath(article.slug)}
                  className="block rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-[13.5px] font-semibold text-ink/80 transition-colors hover:border-gold/40 hover:text-gold-deep"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-ink/60">
            یا در{" "}
            <Link to="/articles" className="font-bold text-gold-deep underline underline-offset-4">
              فهرست مقالات
            </Link>{" "}
            جست‌وجو کنید.
          </p>

          <h2 className="mt-10 text-[15px] font-extrabold text-ink">حوزه‌های فعالیت</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  to={servicePath(service.slug)}
                  className="block rounded-xl border border-ink/10 bg-white/70 px-4 py-3 text-[13.5px] font-semibold text-ink/80 transition-colors hover:border-gold/40 hover:text-gold-deep"
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
