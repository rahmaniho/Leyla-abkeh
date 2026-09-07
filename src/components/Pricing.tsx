import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { CheckIcon } from "./Icons";
import { cn } from "../utils/cn";

const PLANS = [
  {
    name: "مشاورهٔ رایگان",
    price: "رایگان",
    unit: "بدون هیچ تعهدی",
    desc: "۱۵ دقیقه تماس تلفنی برای آشنایی با پروندهٔ شما",
    features: [
      "بررسی اولیهٔ پروندهٔ شما",
      "ارزیابی امکان موفقیت",
      "معرفی مسیر حقوقی مناسب",
      "پاسخ به پرسش‌های شما",
    ],
    cta: "رزرو نوبت رایگان",
    featured: false,
  },
  {
    name: "مشاورهٔ تخصصی",
    price: "۹۸۰٬۰۰۰",
    unit: "تومان · جلسهٔ کامل",
    desc: "جلسهٔ حضوری یا آنلاین ۴۵ تا ۶۰ دقیقه‌ای",
    features: [
      "تحلیل کامل مدارک و مستندات",
      "تعیین راهکار حقوقی دقیق",
      "ارائهٔ برنامهٔ اقدام مکتوب",
      "تخمین هزینهٔ مراحل بعدی",
      "اولویت در رزرو نوبت وکالت",
    ],
    cta: "درخواست مشاورهٔ تخصصی",
    featured: true,
    badge: "پیشنهاد اکثر موکلان",
  },
  {
    name: "وکالت کامل پرونده",
    price: "توافقی",
    unit: "بر اساس نوع پرونده",
    desc: "از تنظیم دادخواست تا اجرای کامل رأی",
    features: [
      "وکالت در تمام مراحل دادرسی",
      "حضور در جلسات و مراجع قضایی",
      "گزارش مستمر پیشرفت پرونده",
      "پیگیری اجرای رأی صادره",
    ],
    cta: "استعلام هزینهٔ وکالت",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-cream to-sand py-20 lg:py-28"
      aria-labelledby="pricing-title"
    >
      <div className="pointer-events-none absolute -top-20 right-[15%] h-80 w-80 rounded-full bg-gold/12 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="تعرفهٔ شفاف"
          title="هزینه‌ای که از همان ابتدا روشن است"
          description="هر مسیر، از مشاورهٔ رایگان آغاز می‌شود. تعرفه‌ها شفاف، مکتوب و بدون هیچ هزینهٔ پنهانی است."
        />

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-3 lg:mt-16 lg:gap-7">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 150} className="h-full">
              <article
                className={cn(
                  "relative flex h-full flex-col rounded-[1.8rem] p-8 transition-all duration-500 hover:-translate-y-2.5",
                  plan.featured
                    ? "border border-gold/40 bg-gradient-to-b from-ink to-ink-deep text-white shadow-deep lg:-my-4 lg:py-12"
                    : "border border-ink/8 bg-white/70 text-ink shadow-soft backdrop-blur-xl hover:border-gold/40 hover:shadow-deep"
                )}
              >
                {plan.badge && (
                  <span className="absolute -top-4 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-l from-gold-light to-gold-deep px-5 py-1.5 text-[12px] font-extrabold text-ink-deep shadow-gold">
                    ✦ {plan.badge}
                  </span>
                )}

                <h3 className={cn("text-lg font-extrabold", plan.featured ? "text-white" : "text-ink")}>
                  {plan.name}
                </h3>
                <p className={cn("mt-2 text-[12.5px] leading-6", plan.featured ? "text-white/55" : "text-ink/50")}>
                  {plan.desc}
                </p>

                <div className="mt-6 flex items-baseline gap-2.5">
                  <span
                    className={cn(
                      "text-4xl font-black tracking-tight",
                      plan.featured ? "text-gradient-gold animate-shimmer" : "text-ink"
                    )}
                  >
                    {plan.price}
                  </span>
                  <span className={cn("text-[12.5px] font-semibold", plan.featured ? "text-white/50" : "text-ink/45")}>
                    {plan.unit}
                  </span>
                </div>

                <ul className={cn("mt-7 flex-1 space-y-3.5 border-t pt-7", plan.featured ? "border-white/12" : "border-ink/8")}>
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full",
                          plan.featured ? "bg-gold/20 text-gold-light" : "bg-gold/15 text-gold-deep"
                        )}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span className={cn("text-[13.5px] leading-6", plan.featured ? "text-white/75" : "text-ink/70")}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={cn(
                    "mt-8 inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5",
                    plan.featured
                      ? "bg-gradient-to-l from-gold-light via-gold to-gold-deep text-ink-deep shadow-gold hover:shadow-[0_18px_44px_-10px_rgba(184,145,90,0.6)]"
                      : "border-2 border-ink/15 text-ink hover:border-gold hover:bg-gold/10 hover:text-gold-deep"
                  )}
                >
                  {plan.cta}
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={250}>
          <p className="mt-10 text-center text-[12.5px] font-medium text-ink/45">
            * در صورت قبول وکالت، هزینهٔ مشاورهٔ تخصصی از حقالوکاله کسر خواهد شد.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
