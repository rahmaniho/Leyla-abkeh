import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import ConsultationForm from "../components/ConsultationForm";
import { CheckIcon, ClockIcon, PhoneIcon } from "../components/Icons";
import { Link } from "../lib/router";
import { ARTICLES, articlePath } from "../content/articles";
import { SERVICES, servicePath, type Service } from "../content/services";
import { formatDateFa, toDateAttribute } from "../lib/format";
import { primaryPhone } from "../config/site";

export default function ServicePage({ service }: { service: Service }) {
  const breadcrumbs = [
    { name: "صفحهٔ اصلی", path: "/" },
    { name: "خدمات حقوقی", path: "/services" },
    { name: service.title, path: servicePath(service.slug) },
  ];

  const relatedServices = SERVICES.filter((item) => service.related.includes(item.slug));
  const relatedArticles = ARTICLES.filter((article) =>
    article.relatedServices.includes(service.slug)
  ).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="خدمات حقوقی"
        title={service.title}
        description={service.summary}
        breadcrumbs={breadcrumbs}
      >
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-6 py-3 text-sm font-bold text-ink-deep shadow-gold transition-transform hover:-translate-y-0.5"
          >
            درخواست مشاوره در این حوزه
          </Link>
          <a
            href={primaryPhone.href}
            aria-label={primaryPhone.ariaLabel}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 px-6 py-3 text-sm font-bold text-white/90 transition-colors hover:border-gold/50 hover:text-gold-light"
          >
            <PhoneIcon className="h-4.5 w-4.5 text-gold-light" />
            <span dir="ltr" className="tracking-wide">
              {primaryPhone.display}
            </span>
          </a>
        </div>
      </PageHero>

      <section className="bg-cream py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:px-8">
          <div>
            <div className="space-y-5">
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-[14.5px] leading-9 text-ink/80">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 space-y-12">
              {service.sections.map((section) => (
                <Reveal key={section.heading}>
                  <article>
                    <h2 className="text-xl font-extrabold leading-9 text-ink sm:text-2xl">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 24)}
                          className="text-[14px] leading-9 text-ink/75"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-5 space-y-3 rounded-2xl border border-ink/10 bg-white/70 p-5">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-3 text-[13.5px] leading-7 text-ink/80">
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-deep">
                              <CheckIcon className="h-3 w-3" />
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>

            <section className="mt-14" aria-labelledby="service-faq-title">
              <h2 id="service-faq-title" className="text-xl font-extrabold text-ink sm:text-2xl">
                پرسش‌های متداول دربارهٔ {service.title}
              </h2>
              <div className="mt-6 space-y-4">
                {service.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group rounded-2xl border border-ink/10 bg-white/70 p-5 open:border-gold/40 open:bg-white"
                  >
                    <summary className="cursor-pointer list-none text-[14px] font-extrabold leading-7 text-ink marker:hidden">
                      <span className="flex items-start justify-between gap-4">
                        {faq.question}
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-gold-deep transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 text-[13.5px] leading-8 text-ink/75">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {relatedArticles.length > 0 && (
              <section className="mt-14" aria-labelledby="related-articles-title">
                <h2 id="related-articles-title" className="text-xl font-extrabold text-ink sm:text-2xl">
                  مقالات مرتبط
                </h2>
                <ul className="mt-5 space-y-3">
                  {relatedArticles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        to={articlePath(article.slug)}
                        className="flex flex-col gap-1 rounded-2xl border border-ink/10 bg-white/70 px-5 py-4 transition-colors hover:border-gold/40 hover:bg-white"
                      >
                        <span className="text-[14px] font-extrabold text-ink">{article.title}</span>
                        <span className="text-[12.5px] leading-6 text-ink/70">{article.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="mt-12 flex flex-wrap items-center gap-2 text-[12px] leading-7 text-ink/70">
              <ClockIcon className="h-4 w-4 text-gold-deep" />
              آخرین به‌روزرسانی این صفحه:{" "}
              <time dateTime={toDateAttribute(service.updated)}>{formatDateFa(service.updated)}</time>
              <span aria-hidden="true">·</span>
              این محتوا جنبهٔ اطلاع‌رسانی عمومی دارد و جایگزین مشاورهٔ حقوقی دربارهٔ پروندهٔ مشخص
              نیست.
            </p>
          </div>

          <aside className="space-y-6" aria-label="اقدام‌های پیشنهادی">
            <div className="rounded-3xl border border-ink/10 bg-white/75 p-6 shadow-soft">
              <h2 className="text-base font-extrabold text-ink">موضوع پروندهٔ شما در این حوزه است؟</h2>
              <p className="mt-2 text-[13px] leading-7 text-ink/70">
                برای بررسی اولیه و تعیین مسیر، درخواست مشاوره ثبت کنید یا تلفنی تماس بگیرید.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-5 py-3 text-sm font-bold text-ink-deep shadow-gold transition-transform hover:-translate-y-0.5"
              >
                درخواست مشاوره
              </Link>
              <a
                href={primaryPhone.href}
                dir="ltr"
                aria-label={primaryPhone.ariaLabel}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/15 px-5 py-3 text-sm font-bold tracking-wide text-ink transition-colors hover:border-gold hover:text-gold-deep"
              >
                {primaryPhone.display}
              </a>
            </div>

            {relatedServices.length > 0 && (
              <nav
                aria-labelledby="related-services-title"
                className="rounded-3xl border border-ink/10 bg-white/60 p-6"
              >
                <h2 id="related-services-title" className="text-base font-extrabold text-ink">
                  حوزه‌های مرتبط
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {relatedServices.map((related) => (
                    <li key={related.slug}>
                      <Link
                        to={servicePath(related.slug)}
                        className="flex items-center gap-2 text-[13.5px] font-semibold text-gold-deep transition-colors hover:text-ink"
                      >
                        <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
                        {related.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="hidden lg:block">
              <ConsultationForm compact />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
