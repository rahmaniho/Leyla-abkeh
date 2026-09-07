import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { EyeIcon, LockIcon, ScaleIcon, ZapIcon } from "./Icons";

const FEATURES = [
  {
    icon: ScaleIcon,
    title: "تخصص حقوقی عمیق",
    desc: "پایه یک دادگستری با تمرکز ویژه بر دعاوی خانواده، کیفری و ملکی؛ ترکیب دانش روز حقوقی با تجربهٔ عملیِ واقعی.",
  },
  {
    icon: EyeIcon,
    title: "صداقت و شفافیت",
    desc: "ارزیابی واقع‌بینانهٔ پرونده در همان نخستین جلسه؛ هیچ وعدهٔ غیرواقعی نمی‌دهم و مسیر پیشِ رو را شفاف ترسیم می‌کنم.",
  },
  {
    icon: LockIcon,
    title: "رازداری حرفه‌ای",
    desc: "اطلاعات شما نزد وکیل، راز حرفه‌ای محسوب می‌شود؛ هیچ جزئیاتی بدون اجازهٔ شما در هیچ‌جا مطرح نخواهد شد.",
  },
  {
    icon: ZapIcon,
    title: "پاسخگویی سریع",
    desc: "در کوتاه‌ترین زمان به تماس‌ها و پیام‌های شما پاسخ می‌دهم و از آخرین وضعیت پرونده همیشه آگاه خواهید بود.",
  },
];

export default function Features() {
  return (
    <section id="about" className="relative scroll-mt-24 bg-cream py-20 lg:py-28" aria-labelledby="features-title">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="چرا لیلا آبکه؟"
          title="اعتمادی که روی اصول بنا شده است"
          description="در شرایط سخت حقوقی، آنچه بیش از هر چیز اهمیت دارد، آرامش خاطری است که از شفافیت، تخصص و اخلاق حرفه‌ای می‌آید."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 130}>
              <article className="group relative h-full overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-7 shadow-soft backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/45 hover:shadow-deep">
                {/* هالهٔ طلایی هنگام هاور */}
                <div
                  className="pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full bg-gold/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ink to-ink-soft text-gold-light shadow-soft transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:from-ink-soft group-hover:to-ink">
                    <feature.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold text-ink">{feature.title}</h3>
                  <p className="mt-3 text-[13.5px] leading-7 text-ink/60">{feature.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
