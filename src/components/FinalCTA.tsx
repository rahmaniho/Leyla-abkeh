import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";
import { CheckIcon, ClockIcon, PhoneIcon } from "./Icons";

const PHONE = "۰۹۱۲ ۱۲۳ ۴۵۶۷";
const PHONE_TEL = "tel:+989121234567";

const SERVICE_OPTIONS = [
  "دعاوی خانواده",
  "دعاوی کیفری",
  "امور ملکی و ثبتی",
  "چک و اسناد تجاری",
  "حقوق کار و بیمه",
  "حقوق شرکت‌ها",
  "سایر موضوعات",
];

export default function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden bg-ink-deep py-20 lg:py-28"
      aria-labelledby="contact-title"
    >
      {/* پس‌زمینه */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-deep to-ink-soft" />
        <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)]" />
        <div className="animate-drift absolute -top-28 left-[10%] h-[420px] w-[420px] rounded-full bg-gold/20 blur-[130px]" />
        <div className="animate-drift-slow absolute -bottom-32 right-[8%] h-[400px] w-[400px] rounded-full bg-ink-mist/60 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* متن و دکمه تماس */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-[12.5px] font-bold text-gold-light backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ring absolute inline-flex h-full w-full rounded-full bg-gold-light" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
              </span>
              ظرفیت مشاورهٔ این هفته محدود است
            </span>
          </Reveal>

          <Reveal delay={120}>
            <h2
              id="contact-title"
              className="mt-6 text-3xl font-black leading-[1.4] text-white sm:text-4xl lg:text-[2.7rem] lg:leading-[1.35]"
            >
              همین امروز، با خیال راحت
              <span className="text-gradient-gold animate-shimmer"> تصمیم بگیرید</span>
            </h2>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-5 max-w-lg text-[15px] leading-8 text-white/60">
              یک تماس کوتاه کافی است تا مسیر حقوقی شما روشن شود. در نخستین
              مشاورهٔ رایگان، پروندهٔ شما بررسی و بهترین راهکار پیشنهاد می‌شود —
              بدون هیچ تعهدی.
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href={PHONE_TEL}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-8 py-4 text-base font-extrabold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-12px_rgba(184,145,90,0.65)]"
              >
                <PhoneIcon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                تماس فوری
                <span dir="ltr" className="text-[15px] font-black tracking-wider">
                  {PHONE}
                </span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-[13px] font-medium text-white/50">
              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-gold" />
                پاسخگویی در کمتر از ۲ ساعت کاری
              </span>
              <span className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-gold" />
                شنبه تا چهارشنبه ۹–۱۸ · پنجشنبه‌ها ۹–۱۳
              </span>
            </div>
          </Reveal>
        </div>

        {/* فرم مشاوره */}
        <Reveal delay={300} direction="left">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2.4rem] bg-gradient-to-br from-gold/30 via-gold/8 to-transparent blur-2xl" aria-hidden="true" />

            {submitted ? (
              <div
                role="status"
                aria-live="polite"
                className="relative flex min-h-[480px] flex-col items-center justify-center rounded-[2rem] border border-gold/35 bg-white/[0.07] p-10 text-center shadow-deep backdrop-blur-2xl"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-ink-deep shadow-gold">
                  <CheckIcon className="h-10 w-10" />
                </span>
                <h3 className="mt-7 text-2xl font-black text-white">درخواست شما ثبت شد</h3>
                <p className="mt-4 max-w-xs text-[14px] leading-8 text-white/65">
                  سپاس از اعتماد شما. حداکثر تا پایان وقت اداریِ امروز، برای
                  هماهنگی نوبت مشاوره با شما تماس گرفته می‌شود.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-8 rounded-full border border-white/20 px-6 py-2.5 text-[13px] font-bold text-white/80 transition-colors hover:border-gold/50 hover:text-gold-light"
                >
                  ثبت درخواست جدید
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="relative rounded-[2rem] border border-white/12 bg-white/[0.07] p-7 shadow-deep backdrop-blur-2xl sm:p-9"
                aria-label="فرم درخواست مشاوره رایگان"
              >
                <h3 className="text-xl font-extrabold text-white">درخواست مشاورهٔ رایگان</h3>
                <p className="mt-2 text-[13px] leading-6 text-white/55">
                  فرم را پر کنید؛ کارشناس دفتر برای تعیین نوبت با شما تماس می‌گیرد.
                </p>

                <div className="mt-7 space-y-5">
                  <div>
                    <label htmlFor="cta-name" className="mb-2 block text-[13px] font-bold text-white/80">
                      نام و نام خانوادگی
                    </label>
                    <input
                      id="cta-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="مثلاً: سارا محمدی"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition-all duration-300 focus:border-gold/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-phone" className="mb-2 block text-[13px] font-bold text-white/80">
                      شماره تماس
                    </label>
                    <input
                      id="cta-phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      dir="ltr"
                      placeholder="۰۹۱۲ ··· ····"
                      className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-right text-sm text-white placeholder:text-white/30 transition-all duration-300 focus:border-gold/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>

                  <div>
                    <label htmlFor="cta-service" className="mb-2 block text-[13px] font-bold text-white/80">
                      موضوع پرونده
                    </label>
                    <select
                      id="cta-service"
                      name="service"
                      required
                      defaultValue=""
                      className="w-full appearance-none rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white transition-all duration-300 focus:border-gold/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30 [&>option]:bg-ink [&>option]:text-white"
                    >
                      <option value="" disabled>
                        انتخاب کنید…
                      </option>
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="cta-message" className="mb-2 block text-[13px] font-bold text-white/80">
                      شرح کوتاه موضوع <span className="font-medium text-white/40">(اختیاری)</span>
                    </label>
                    <textarea
                      id="cta-message"
                      name="message"
                      rows={3}
                      placeholder="در چند جمله، موضوع را شرح دهید…"
                      className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition-all duration-300 focus:border-gold/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-6 py-4 text-base font-extrabold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-12px_rgba(184,145,90,0.7)]"
                  >
                    ارسال درخواست مشاوره
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">
                      <path d="M19 12H5m6-6-6 6 6 6" />
                    </svg>
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-[11.5px] text-white/40">
                    <CheckIcon className="h-3.5 w-3.5 text-gold" />
                    اطلاعات شما کاملاً محرمانه خواهد ماند.
                  </p>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
