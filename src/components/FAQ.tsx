import { useState } from "react";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { ChevronDownIcon } from "./Icons";
import { Link } from "../lib/router";
import { cn } from "../utils/cn";
import { SITE_FAQS, type SiteFaq } from "../content/faqs";

interface FAQProps {
  items?: SiteFaq[];
  eyebrow?: string;
  title?: string;
  description?: string;
  titleId?: string;
  /** اگر true باشد، اولین سوال باز است */
  openFirst?: boolean;
  /** لینک «همهٔ پرسش‌ها» در پایان بخش */
  moreHref?: string;
  moreLabel?: string;
}

export default function FAQ({
  items = SITE_FAQS,
  eyebrow = "پرسش‌های پرتکرار",
  title = "سوالات متداول",
  description = "پاسخ شفاف به دغدغه‌هایی که معمولاً پیش از مراجعه به وکیل مطرح می‌شود.",
  titleId = "faq-title",
  openFirst = true,
  moreHref,
  moreLabel = "مشاهدهٔ همهٔ پرسش‌های متداول",
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number>(openFirst ? 0 : -1);

  return (
    <section id="faq" className="relative scroll-mt-24 bg-cream py-20 lg:py-28" aria-labelledby={titleId}>
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} titleId={titleId} />

        <div className="mt-12 space-y-4 lg:mt-14">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={index * 90}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-500",
                    isOpen
                      ? "border-gold/45 bg-white shadow-deep"
                      : "border-ink/10 bg-white/70 shadow-soft hover:border-gold/30"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-button-${index}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right transition-colors sm:px-6"
                    >
                      <span
                        className={cn(
                          "text-[14.5px] font-extrabold leading-7",
                          isOpen ? "text-gold-deep" : "text-ink"
                        )}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                          isOpen
                            ? "rotate-180 bg-gradient-to-br from-gold-light to-gold text-ink-deep shadow-gold"
                            : "border border-ink/15 bg-white text-ink/70"
                        )}
                        aria-hidden="true"
                      >
                        <ChevronDownIcon className="h-4.5 w-4.5" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    inert={!isOpen}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="px-5 pb-6 text-[13.5px] leading-8 text-ink/75 sm:px-6">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {moreHref && (
          <div className="mt-10 text-center">
            <Link
              to={moreHref}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-6 py-3 text-[13px] font-extrabold text-ink transition-colors hover:border-gold/50 hover:text-gold-deep"
            >
              {moreLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
