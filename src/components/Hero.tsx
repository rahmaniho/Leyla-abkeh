import Reveal from "./Reveal";
import LawyerPortrait from "./LawyerPortrait";
import {
  ClockIcon,
  LockIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  ShieldIcon,
} from "./Icons";
import { Link } from "../lib/router";
import { track } from "../lib/analytics";
import {
  HOURS_SUMMARY,
  officePhone,
  primaryPhone,
  siteConfig,
} from "../config/site";

/** نشان‌های اعتماد فقط شامل گزاره‌های قابل اثبات (بدون ادعای مدرک تأییدنشده) */
const TRUST_BADGES = [
  { icon: ShieldIcon, text: "ارزیابی صادقانه، بدون وعدهٔ نتیجه" },
  { icon: LockIcon, text: "رازداری حرفه‌ای اطلاعات موکل" },
  { icon: ScaleIcon, text: "توضیح شفاف هر مرحلهٔ پرونده" },
];

export default function Hero() {
  const { lawyer, contact } = siteConfig;

  return (
    <section className="relative overflow-hidden bg-ink pt-28 pb-16 lg:pt-36 lg:pb-24" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]" />
        <div className="animate-drift absolute -top-32 right-[8%] h-[430px] w-[430px] rounded-full bg-gold/25 blur-[130px]" />
        <div className="animate-drift-slow absolute top-1/3 -left-24 h-[380px] w-[380px] rounded-full bg-ink-mist/50 blur-[120px]" />
        <div className="animate-drift absolute -bottom-40 right-1/3 h-[360px] w-[360px] rounded-full bg-gold-deep/20 blur-[140px]" />
        <div className="animate-spin-slow absolute -left-40 top-10 h-[520px] w-[520px] rounded-full border border-white/[0.06]">
          <span className="absolute top-1/2 -right-1 h-2.5 w-2.5 rounded-full bg-gold/70 shadow-[0_0_18px_4px_rgba(184,145,90,0.55)]" />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-[13px] font-semibold text-gold-light backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-gold-light" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
              </span>
              {lawyer.jobTitle} · {siteConfig.site.city}
            </p>
          </Reveal>

          <Reveal delay={100}>
            <h1
              id="hero-title"
              className="mt-6 text-[2rem] font-black leading-[1.35] text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.28]"
            >
              وکیل خانواده، کیفری و ملکی
              <br />
              <span className="text-gradient-gold">در قزوین</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-6 max-w-xl text-[15px] leading-8 text-white/70 sm:text-lg sm:leading-9">
              از نخستین مشاوره تا پایان پرونده، در کنار شما هستم؛ با ارزیابی واقع‌بینانه، توضیح
              شفاف هر مرحله و پیگیری مستمر. اطلاعات موکل، راز حرفه‌ای است.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
              <Link
                to="/contact"
                onClick={() => track("cta_click", { location: "hero", target: "/contact" })}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-7 py-3.5 text-base font-bold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(184,145,90,0.65)]"
              >
                درخواست مشاوره
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden="true"
                >
                  <path d="M19 12H5m6-6-6 6 6 6" />
                </svg>
              </Link>
              {primaryPhone ? (
                <a
                  href={primaryPhone.href}
                  aria-label={primaryPhone.ariaLabel}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10"
                >
                  <PhoneIcon className="h-5 w-5 text-gold-light" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] font-medium text-white/60">تماس مستقیم</span>
                    <span dir="ltr" className="tracking-wider">
                      {primaryPhone.display}
                    </span>
                  </span>
                </a>
              ) : (
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:bg-white/10"
                >
                  مشاهدهٔ خدمات حقوقی
                </Link>
              )}
            </div>
          </Reveal>

          <Reveal delay={350}>
            <p className="mt-4 max-w-md text-[12px] leading-6 text-white/55">
              فرم کوتاه است: نام، شمارهٔ تماس و موضوع کلی پرونده. جزئیات حساس را در جلسه مطرح
              کنید.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-[12.5px] font-medium text-white/70">
                  <Icon className="h-4.5 w-4.5 text-gold" />
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={250} direction="left" className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-gold/35 via-gold/10 to-transparent blur-2xl"
              aria-hidden="true"
            />

            <article className="relative rounded-[2rem] border border-white/12 bg-white/[0.07] p-4 shadow-deep backdrop-blur-2xl sm:p-5">
              <div className="overflow-hidden rounded-3xl">
                <LawyerPortrait
                  sizes="(min-width: 1024px) 420px, 88vw"
                  priority
                  className="rounded-2xl"
                />

                <div className="relative -mt-14 px-3">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-ink/90 px-4 py-3 backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[12px] font-semibold text-white/85">
                        پذیرش پرونده با تعیین وقت
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-gold-light">{lawyer.name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-1.5 pt-5 pb-1.5">
                <div>
                  <p className="text-lg font-extrabold text-white">{lawyer.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-white/60">
                    {lawyer.jobTitle}
                    {lawyer.barAssociation ? ` · ${lawyer.barAssociation}` : ""}
                  </p>
                </div>

                <div className="h-px bg-gradient-to-l from-transparent via-white/15 to-transparent" />

                <ul className="space-y-3 text-[12.5px] text-white/75">
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <PhoneIcon className="h-4 w-4" />
                    </span>
                    {primaryPhone ? (
                      <a
                        href={primaryPhone.href}
                        dir="ltr"
                        className="font-semibold tracking-wider transition-colors hover:text-gold-light"
                      >
                        {primaryPhone.display}
                      </a>
                    ) : (
                      <Link
                        to="/contact"
                        className="font-semibold transition-colors hover:text-gold-light"
                      >
                        درخواست تماس
                      </Link>
                    )}
                    {officePhone && (
                      <a
                        href={officePhone.href}
                        dir="ltr"
                        className="mr-auto tracking-wider text-white/70 transition-colors hover:text-gold-light"
                      >
                        {officePhone.display}
                      </a>
                    )}
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <MapPinIcon className="h-4 w-4" />
                    </span>
                    <span className="leading-6">{contact.address.full}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-light">
                      <ClockIcon className="h-4 w-4" />
                    </span>
                    <span>{HOURS_SUMMARY}</span>
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
