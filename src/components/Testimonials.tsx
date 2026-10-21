import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { StarIcon } from "./Icons";
import { APPROVED_TESTIMONIALS } from "../content/testimonials";
import { formatDateFa } from "../lib/format";

/**
 * فقط نظرات دارای رضایت و تأیید نمایش داده می‌شوند.
 * اگر هیچ نظر تأییدشده‌ای وجود نداشته باشد، بخش به‌طور کامل رندر نمی‌شود.
 */
export default function Testimonials() {
  if (APPROVED_TESTIMONIALS.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 bg-cream py-20 lg:py-28"
      aria-labelledby="testimonials-title"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="نظرات موکلان"
          title="آنچه موکلان از تجربهٔ خود می‌گویند"
          description="این نظرات با رضایت صریح صاحبان آن‌ها منتشر شده‌اند."
          titleId="testimonials-title"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-16">
          {APPROVED_TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 140}>
              <figure className="group relative flex h-full flex-col rounded-3xl border border-ink/10 bg-white/75 p-8 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:border-gold/45 hover:shadow-deep">
                <span
                  className="pointer-events-none absolute top-6 left-7 font-serif text-7xl font-black leading-none text-gold/20"
                  aria-hidden="true"
                >
                  ”
                </span>

                <div className="flex gap-1 text-gold" role="img" aria-label="امتیاز ۵ از ۵ ستاره">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <StarIcon key={starIndex} className="h-4.5 w-4.5" />
                  ))}
                </div>

                <blockquote className="mt-5 flex-1 text-[13.5px] leading-8 text-ink/75">
                  {testimonial.quote}
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-ink/10 pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ink to-ink-soft text-sm font-extrabold text-gold-light shadow-soft">
                    {testimonial.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-[14px] font-extrabold text-ink">{testimonial.author}</span>
                    <span className="mt-0.5 block text-[12px] font-medium text-gold-deep">
                      {testimonial.matter}
                      {testimonial.date ? ` · ${formatDateFa(testimonial.date)}` : ""}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
