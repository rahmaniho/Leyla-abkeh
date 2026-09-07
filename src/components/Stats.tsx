import Counter from "./Counter";
import Reveal from "./Reveal";

const STATS = [
  { value: 850, suffix: "+", label: "پروندهٔ موفق", desc: "در دعاوی گوناگون قضایی" },
  { value: 95, suffix: "٪", label: "نرخ موفقیت", desc: "در پرونده‌های پذیرفته‌شده" },
  { value: 12, suffix: "+", label: "سال تجربه", desc: "وکالت و مشاورهٔ حقوقی" },
  { value: 4.9, suffix: "", label: "امتیاز رضایت", desc: "از مجموع ۵ امتیاز موکلان", decimals: 1 },
];

export default function Stats() {
  return (
    <section aria-label="آمار و دستاوردها" className="relative border-b border-ink/5 bg-cream py-16 lg:py-20">
      <div className="bg-grid-light pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-12 px-5 lg:grid-cols-4 lg:px-8">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 120} className="relative text-center">
            <p className="text-gradient-gold text-5xl font-black tracking-tight lg:text-6xl">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
              />
            </p>
            <p className="mt-3 text-base font-extrabold text-ink">{stat.label}</p>
            <p className="mt-1 text-[12.5px] font-medium text-ink/50">{stat.desc}</p>
            {i < STATS.length - 1 && (
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
