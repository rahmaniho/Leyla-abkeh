import Reveal from "./Reveal";
import ConsultationForm from "./ConsultationForm";
import { ClockIcon, MapPinIcon, PhoneIcon } from "./Icons";
import { HOURS_SUMMARY, officePhone, primaryPhone, siteConfig } from "../config/site";

export default function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden bg-ink-deep py-20 lg:py-28"
      aria-labelledby="contact-title"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-deep to-ink-soft" />
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)]" />
        <div className="animate-drift absolute -top-28 left-[10%] h-[420px] w-[420px] rounded-full bg-gold/20 blur-[130px]" />
        <div className="animate-drift-slow absolute -bottom-32 right-[8%] h-[400px] w-[400px] rounded-full bg-ink-mist/60 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[12.5px] font-bold text-gold-light backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-gold-light" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
              </span>
              مشاورۀ حضوری، تلفنی و آنلاین
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h2
              id="contact-title"
              className="mt-6 text-[1.7rem] font-black leading-[1.4] text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.35]"
            >
              همین امروز، با خیال راحت
              <span className="text-gradient-gold"> تصمیم بگیرید</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-lg text-[14.5px] leading-8 text-white/70">
              یک گفت‌وگوی کوتاه کافی است تا مسیر حقوقی شما روشن شود. درخواست‌تان را از فرم ثبت
              کنید یا تلفنی تماس بگیرید؛ پس از بررسی اولیه، گزینه‌های پیشِ رو توضیح داده می‌شود.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {primaryPhone ? (
                <a
                  href={primaryPhone.href}
                  aria-label={primaryPhone.ariaLabel}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-7 py-3.5 text-base font-extrabold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-12px_rgba(184,145,90,0.65)]"
                >
                  <PhoneIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="flex flex-col items-start leading-tight">
                    <span className="text-[11px] font-medium text-ink-deep/70">تماس با دفتر</span>
                    <span dir="ltr" className="text-[15px] font-black tracking-wider">
                      {primaryPhone.display}
                    </span>
                  </span>
                </a>
              ) : (
                <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-[12.5px] leading-7 text-white/70">
                  <span className="flex items-start gap-2.5">
                    <PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-gold-light" />
                    شمارۀ تلفن دفتر پس از تأیید نهایی منتشر می‌شود. برای اینکه با شما تماس گرفته
                    شود، درخواست مشاوره را از فرم روبه‌رو ثبت کنید.
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={400}>
            <ul className="mt-9 space-y-4 text-[13px] text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <span className="leading-6">
                  {HOURS_SUMMARY}
                  <span className="mt-1 block text-[12px] text-white/50">
                    پاسخ به درخواست‌های فرم در ساعات کاری انجام می‌شود.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <span className="leading-6">{siteConfig.contact.address.full}</span>
              </li>
              {officePhone && (
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                    <PhoneIcon className="h-4 w-4" />
                  </span>
                  <a
                    href={officePhone.href}
                    dir="ltr"
                    className="leading-6 transition-colors hover:text-gold-light"
                  >
                    {officePhone.display}
                  </a>
                </li>
              )}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={250} direction="left">
          <ConsultationForm />
        </Reveal>
      </div>
    </section>
  );
}
