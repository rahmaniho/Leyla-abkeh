import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import {
  BriefcaseIcon,
  DocCheckIcon,
  FamilyIcon,
  GavelIcon,
  HardHatIcon,
  HomeIcon,
} from "./Icons";

const SERVICES = [
  {
    icon: FamilyIcon,
    title: "دعاوی خانواده",
    desc: "طلاق، مهریه، نفقه، حضانت و اجرت‌المثل؛ با حساسیت، حفظ کرامت طرفین و تلاش برای راه‌حل کم‌تنش‌تر.",
    tags: ["طلاق", "مهریه", "حضانت"],
  },
  {
    icon: GavelIcon,
    title: "دعاوی کیفری",
    desc: "دفاع در جرایم عمدی و غیرعمدی، تنظیم شکواییه و لایحه و حضور مؤثر در مراجع قضایی و انتظامی.",
    tags: ["شکایت", "دفاع کیفری"],
  },
  {
    icon: HomeIcon,
    title: "امور ملکی و ثبتی",
    desc: "خرید، فروش، اجاره، تنظیم اسناد رسمی، خلع ید و دعاوی ناشی از قراردادهای ملکی و ثبتی.",
    tags: ["قرارداد", "سند رسمی"],
  },
  {
    icon: DocCheckIcon,
    title: "چک و اسناد تجاری",
    desc: "وصول چک‌های برگشتی از مسیر حقوقی و کیفری، دعاوی مطالبات و اسناد تجاری در سریع‌ترین زمان ممکن.",
    tags: ["چک برگشتی", "مطالبات"],
  },
  {
    icon: HardHatIcon,
    title: "حقوق کار و بیمه",
    desc: "اختلافات کارگر و کارفرما، سنوات و مزایای پایان کار، بیمه و دعاوی هیئت‌های تشخیص اداره کار.",
    tags: ["سنوات", "بیمه", "کارگر و کارفرما"],
  },
  {
    icon: BriefcaseIcon,
    title: "حقوق شرکت‌ها",
    desc: "ثبت شرکت، تنظیم اساسنامه و قراردادهای تجاری، مشاورهٔ حقوقی مستمر و حل اختلافات شرکتی.",
    tags: ["قرارداد", "اختلافات شرکتی"],
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-cream via-sand to-cream py-20 lg:py-28"
      aria-labelledby="services-title"
    >
      {/* گوی‌های محو تزئینی */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-ink/8 blur-[110px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="حوزه‌های فعالیت"
          title="در هر مسیر حقوقی، همراه شما هستم"
          description="از خانواده تا تجارت؛ برای هر مسئلهٔ حقوقی، راهکاری دقیق، شفاف و قابل اجرا پیشنهاد می‌کنم."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.title} delay={(i % 3) * 140}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/8 bg-white/70 p-7 shadow-soft backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 hover:shadow-deep">
                <div className="flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/15 to-gold/5 text-gold-deep transition-all duration-500 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-gold group-hover:to-gold-deep group-hover:text-white group-hover:shadow-gold">
                    <service.icon className="h-7 w-7" />
                  </span>
                  <span className="text-4xl font-black text-ink/6 transition-colors duration-500 group-hover:text-gold/25">
                    {String(i + 1).padStart(2, "۰")}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-extrabold text-ink">{service.title}</h3>
                <p className="mt-3 flex-1 text-[13.5px] leading-7 text-ink/60">{service.desc}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-ink/10 bg-ink/4 px-3 py-1 text-[11.5px] font-semibold text-ink/55 transition-colors duration-300 group-hover:border-gold/35 group-hover:text-gold-deep"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-gold-deep transition-all duration-300 hover:gap-3.5 hover:text-ink"
                >
                  درخواست مشاوره در این حوزه
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M19 12H5m6-6-6 6 6 6" />
                  </svg>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
