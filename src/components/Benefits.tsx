import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { CalendarIcon, DocCheckIcon, EyeIcon, PhoneIcon } from "./Icons";

const BENEFITS = [
  {
    icon: EyeIcon,
    title: "ارزیابی صادقانهٔ پرونده",
    desc: "پیش از قبول وکالت، شانس موفقیت شما را صریح و بی‌اغراق اعلام می‌کنم تا با چشمان باز تصمیم بگیرید.",
  },
  {
    icon: CalendarIcon,
    title: "پیگیری قدم‌به‌قدم",
    desc: "از تنظیم دادخواست تا اجرای رأی، در تمام مراحل حضور فعال دارم و روند کار را مرتب گزارش می‌دهم.",
  },
  {
    icon: DocCheckIcon,
    title: "شفافیت کامل هزینه‌ها",
    desc: "حقالوکاله و هزینه‌ها از ابتدا روشن و مکتوب است؛ بدون هزینه‌های پنهان یا غافلگیرکننده.",
  },
  {
    icon: PhoneIcon,
    title: "ارتباط مستقیم با وکیل",
    desc: "بدون واسطه و منشی، مستقیم با خود وکیل گفت‌وگو می‌کنید و پاسخ پرسش‌هایتان را به‌سرعت می‌گیرید.",
  },
];

export default function Benefits() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 lg:py-28" aria-labelledby="benefits-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)]" />
        <div className="animate-drift absolute -top-24 right-[12%] h-96 w-96 rounded-full bg-gold/16 blur-[130px]" />
        <div className="animate-drift-slow absolute -bottom-32 left-[6%] h-96 w-96 rounded-full bg-ink-mist/45 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          dark
          eyebrow="تفاوت را احساس کنید"
          title="چهار دلیل برای انتخاب این دفتر"
          description="آنچه یک وکیل خوب را از یک وکیل معمولی جدا می‌کند، فقط دانش نیست؛ نحوهٔ رفتار با موکل است."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {BENEFITS.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 130}>
              <article className="group h-full rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/40 hover:bg-white/[0.09]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-light transition-all duration-500 group-hover:scale-110 group-hover:bg-gold group-hover:text-ink-deep">
                    <benefit.icon className="h-6 w-6" />
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-white/20 to-transparent" aria-hidden="true" />
                  <span className="text-2xl font-black text-white/10 transition-colors duration-500 group-hover:text-gold/40">
                    {String(i + 1).padStart(2, "۰")}
                  </span>
                </div>
                <h3 className="mt-6 text-[17px] font-extrabold text-white">{benefit.title}</h3>
                <p className="mt-3 text-[13px] leading-7 text-white/55">{benefit.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
