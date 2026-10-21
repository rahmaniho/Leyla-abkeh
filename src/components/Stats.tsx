import Counter from "./Counter";
import Reveal from "./Reveal";
import { VERIFIED_STATS } from "../content/stats";

/**
 * بخش آمار تنها در صورتی رندر می‌شود که آمار تأییدشده و مستند وجود داشته باشد.
 * اعداد بدون منبع منتشر نمی‌شوند.
 */
export default function Stats() {
  if (VERIFIED_STATS.length === 0) return null;

  return (
    <section aria-label="آمار و دستاوردها" className="relative border-b border-ink/5 bg-cream py-16 lg:py-20">
      <div
        className="bg-grid-light pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-12 px-5 lg:grid-cols-4 lg:px-8">
        {VERIFIED_STATS.map((stat, index) => (
          <Reveal key={stat.id} delay={index * 120} className="relative text-center">
            <p className="text-gradient-gold text-5xl font-black tracking-tight lg:text-6xl">
              <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
            </p>
            <p className="mt-3 text-base font-extrabold text-ink">{stat.label}</p>
            <p className="mt-1 text-[12.5px] font-medium text-ink/70">{stat.description}</p>
            {index < VERIFIED_STATS.length - 1 && (
              <span
                className="absolute top-1/2 left-0 hidden h-16 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/35 to-transparent lg:block"
                aria-hidden="true"
              />
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
