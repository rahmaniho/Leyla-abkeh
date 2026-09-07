import Reveal from "./Reveal";
import {
  ClockIcon,
  LockIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  ShieldIcon,
} from "./Icons";

const PHONE = "۰۹۱۲ ۱۲۳ ۴۵۶۷";
const PHONE_TEL = "tel:+989121234567";

const TRUST_BADGES = [
  { icon: ScaleIcon, text: "عضو رسمی کانون وکلای دادگستری" },
  { icon: ShieldIcon, text: "بیش از ۱۲ سال تجربهٔ وکالت" },
  { icon: LockIcon, text: "محرمانگی کامل اطلاعات موکل" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink pt-32 pb-20 lg:pt-40 lg:pb-28"
    >
      {/* لایه‌های پس‌زمینهٔ محیطی */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
        <div className="animate-drift absolute -top-32 right-[8%] h-[430px] w-[430px] rounded-full bg-gold/25 blur-[130px]" />
        <div className="animate-drift-slow absolute top-1/3 -left-24 h-[380px] w-[380px] rounded-full bg-ink-mist/50 blur-[120px]" />
        <div className="animate-drift absolute -bottom-40 right-1/3 h-[360px] w-[360px] rounded-full bg-gold-deep/20 blur-[140px]" />
        {/* حلقهٔ چرخان تزئینی */}
        <div className="animate-spin-slow absolute -left-40 top-10 h-[520px] w-[520px] rounded-full border border-white/[0.06]">
          <span className="absolute top-1/2 -right-1 h-2.5 w-2.5 rounded-full bg-gold/70 shadow-[0_0_18px_4px_rgba(184,145,90,0.55)]" />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8">
        {/* متن اصلی */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[13px] font-semibold text-gold-light backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-gold-light" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
              </span>
              وکیل پایه یک دادگستری · قزوین
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-7 text-4xl font-black leading-[1.35] text-white sm:text-5xl lg:text-[3.6rem] lg:leading-[1.3]">
              دفاعِ هوشمند،
              <br />
              <span className="text-gradient-gold animate-shimmer">
                همراه با اعتماد
              </span>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
              از نخستین مشاوره تا صدور رأی نهایی، در کنار شما هستم؛ با تخصص،
              صداقت و پیگیری بی‌وقفه تا پیچیده‌ترین پرونده‌های حقوقی را با
              آرامش خاطر پشت سر بگذارید.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-8 py-4 text-base font-bold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-12px_rgba(184,145,90,0.65)]"
              >
                درخواست مشاوره رایگان
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
                  <path d="M19 12H5m6-6-6 6 6 6" />
                </svg>
              </a>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-8 py-4 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/10"
              >
                <PhoneIcon className="h-5 w-5 text-gold-light" />
                تماس فوری
              </a>
            </div>
          </Reveal>

          {/* نشان‌های اعتماد */}
          <Reveal delay={480}>
            <ul className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-[13px] font-medium text-white/60">
                  <Icon className="h-4.5 w-4.5 text-gold" />
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* کارت معرفی شیشه‌ای */}
        <Reveal delay={300} direction="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="animate-floaty relative">
            {/* درخشش پشت کارت */}
            <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-gold/40 via-gold/10 to-transparent blur-2xl" aria-hidden="true" />

            <article className="relative rounded-[2rem] border border-white/12 bg-white/[0.07] p-5 shadow-deep backdrop-blur-2xl">
              <div className="overflow-hidden rounded-3xl">
                <img
                  src="/images/lawyer.jpg"
                  alt="پرترهٔ لیلا آبکه، وکیل پایه یک دادگستری"
                  className="aspect-[4/4.4] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                  width={640}
                  height={704}
                />
                {/* نوار وضعیت روی تصویر */}
                <div className="relative -mt-14 px-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-ink/85 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[12px] font-semibold text-white/85">
                        نوبت مشاورهٔ امروز آزاد است
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-gold-light">
                      لیلا آبکه
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-2 pt-5 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">لیلا آبکه</h2>
                    <p className="mt-0.5 text-[13px] text-white/55">
                      وکیل پایه یک دادگستری · کانون وکلای قزوین
                    </p>
                  </div>
                  <span className="rounded-full border border-gold/35 bg-gold/15 px-3 py-1.5 text-[12px] font-bold text-gold-light">
                    ✦ ارزیابی صادقانه
                  </span>
                </div>

                <div className="h-px bg-gradient-to-l from-transparent via-white/15 to-transparent" />

                <ul className="space-y-3 text-[13px] text-white/70">
                  <li className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <PhoneIcon className="h-4.5 w-4.5" />
                    </span>
                    <a href={PHONE_TEL} dir="ltr" className="font-semibold tracking-wider transition-colors hover:text-gold-light">
                      {PHONE}
                    </a>
                    <span className="mr-auto text-white/40">تماس مستقیم</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <MapPinIcon className="h-4.5 w-4.5" />
                    </span>
                    <span>قزوین، خیابان خیام شمالی، برج آرین، طبقهٔ ۴، واحد ۱۲</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <ClockIcon className="h-4.5 w-4.5" />
                    </span>
                    <span>شنبه تا چهارشنبه ۹–۱۸ · پنجشنبه‌ها ۹–۱۳</span>
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
