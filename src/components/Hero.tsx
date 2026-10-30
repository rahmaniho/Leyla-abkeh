import HeroMedia from "./HeroMedia";
import LawyerPortrait from "./LawyerPortrait";
import { ClockIcon, LockIcon, MapPinIcon, PhoneIcon, ScaleIcon, ShieldIcon } from "./Icons";
import { Link } from "../lib/router";
import { track } from "../lib/analytics";
import { HOURS_SUMMARY, officePhone, primaryPhone, siteConfig } from "../config/site";

/** نشان‌ها فقط شامل گزاره‌های قابل اثبات هستند. */
const TRUST_BADGES = [
  { icon: ShieldIcon, text: "ارزیابی صادقانه، بدون وعدۀ نتیجه" },
  { icon: LockIcon, text: "رازداری حرفه‌ای اطلاعات موکل" },
  { icon: ScaleIcon, text: "توضیح شفاف هر مرحلۀ پرونده" },
];

export default function Hero() {
  const { lawyer, contact } = siteConfig;

  return (
    <section
      className="relative isolate flex min-h-[780px] overflow-hidden bg-ink-deep pt-32 pb-14 sm:pt-36 lg:min-h-[830px] lg:pt-40 lg:pb-20"
      aria-labelledby="hero-title"
    >
      <HeroMedia />

      <div className="relative mx-auto flex w-full max-w-7xl items-center px-5 lg:px-8">
        <div className="w-full max-w-[720px]">
          <p className="inline-flex items-center gap-3 text-[14px] font-bold text-gold-light sm:text-base">
            <span className="h-px w-8 bg-gold-light/80 sm:w-11" aria-hidden="true" />
            دفتر وکالت {lawyer.name} <span className="text-white/35" aria-hidden="true">/</span> {siteConfig.site.city}
          </p>

          <h1
            id="hero-title"
            className="mt-5 text-[2rem] font-black leading-[1.5] text-white sm:text-[3.05rem] sm:leading-[1.4] lg:text-[3.45rem]"
          >
            وکیل خانواده، کیفری
            <br />
            و ملکی <span className="text-gradient-gold">در قزوین</span>
          </h1>

          <p className="mt-5 max-w-xl text-[16px] leading-8 text-white/80 sm:text-lg sm:leading-9">
            از نخستین مشاوره تا پایان پرونده، در کنار شما هستم؛ با ارزیابی واقع‌بینانه، توضیح
            شفاف هر مرحله و پیگیری مستمر. اطلاعات موکل، راز حرفه‌ای است.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/contact"
              onClick={() => track("cta_click", { location: "hero", target: "/contact" })}
              className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-7 py-3 text-base font-bold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(184,145,90,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
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
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-2xl border border-white/25 bg-ink-deep/40 px-7 py-3 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-light/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
              >
                <PhoneIcon className="h-5 w-5 text-gold-light" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[11px] font-medium text-white/70">تماس مستقیم</span>
                  <span dir="ltr" className="tracking-wider">{primaryPhone.display}</span>
                </span>
              </a>
            ) : (
              <Link
                to="/services"
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/25 bg-ink-deep/40 px-7 py-3 text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-light/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
              >
                مشاهدۀ خدمات حقوقی
              </Link>
            )}
          </div>

          <p className="mt-3 max-w-md text-[13px] leading-6 text-white/65">
            فرم کوتاه است: نام، شمارۀ تماس و موضوع کلی پرونده. جزئیات حساس را در جلسه مطرح کنید.
          </p>

          <div className="mt-7 flex items-center gap-4 border-t border-white/15 pt-6">
            <div className="hero-lawyer-photo h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold-light/70 bg-ink-soft shadow-deep">
              <LawyerPortrait sizes="64px" priority />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-white">{lawyer.name}</p>
              <p className="text-[13px] leading-6 text-white/75">
                {lawyer.jobTitle}{lawyer.barAssociation ? ` · ${lawyer.barAssociation}` : ""}
              </p>
              {lawyer.licenseNumber && (
                <p className="text-[12px] text-white/65">
                  شمارۀ پروانۀ وکالت: <span className="font-bold text-gold-light">{lawyer.licenseNumber}</span>
                </p>
              )}
              <p className="text-[12px] text-white/65">پذیرش پرونده با تعیین وقت</p>
            </div>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] leading-6 text-white/75">
            <li className="flex items-start gap-2">
              <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-gold-light" />
              <span>{contact.address.full}</span>
            </li>
            <li className="flex items-start gap-2">
              <ClockIcon className="mt-1 h-4 w-4 shrink-0 text-gold-light" />
              <span>{HOURS_SUMMARY}</span>
            </li>
            {officePhone && (
              <li className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 shrink-0 text-gold-light" />
                <a href={officePhone.href} dir="ltr" className="hover:text-gold-light">{officePhone.display}</a>
              </li>
            )}
          </ul>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4">
            {TRUST_BADGES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                <Icon className="h-4 w-4 shrink-0 text-gold-light" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
