import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { CheckIcon } from "./Icons";
import { Link } from "../lib/router";

/**
 * فرایند همکاری — چهار گام واقعی و قابل پیگیری.
 * هیچ‌کدام از گام‌ها وعدۀ پذیرش قطعی پرونده یا تضمین نتیجه نمی‌دهد.
 */
const STEPS = [
  {
    title: "ثبت درخواست",
    body: "فرم کوتاه سایت را پر می‌کنید؛ فقط نام، شمارۀ تماس و موضوع کلی لازم است. پس از ثبت، برای تعیین وقت با شما تماس گرفته می‌شود.",
  },
  {
    title: "بررسی اولیه",
    body: "پیش از تعیین وقت، موضوع به‌صورت مقدماتی بررسی می‌شود تا مشخص شود به چه نوع مشاوره یا مدرکی نیاز است.",
  },
  {
    title: "جلسۀ مشاوره",
    body: "در جلسۀ حضوری یا آنلاین، مدارک بررسی و مسیرهای پیشِ رو با مزایا و ریسک‌های هرکدام توضیح داده می‌شود.",
  },
  {
    title: "توافق مکتوب",
    body: "اگر تصمیم به ادامۀ کار گرفتید، حدود خدمات، مراحل و حق‌الوکاله پیش از شروع به‌صورت مکتوب مشخص می‌شود.",
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="relative scroll-mt-24 bg-cream py-20 lg:py-28"
      aria-labelledby="process-title"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="مسیر شروع"
          title="از درخواست تا تصمیم، در چهار گام"
          description="هیچ پرونده‌ای پیش از بررسی مدارک پذیرفته نمی‌شود و هیچ مرحله‌ای بدون توضیح قبلی انجام نمی‌شود."
          titleId="process-title"
        />

        <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="h-full">
              <Reveal delay={index * 120} className="h-full">
                <div className="group flex h-full flex-col rounded-3xl border border-ink/10 bg-white/70 p-7 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-deep">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light to-gold text-base font-black text-ink-deep shadow-gold"
                    aria-hidden="true"
                  >
                    {new Intl.NumberFormat("fa-IR").format(index + 1)}
                  </span>
                  <h3 className="mt-5 text-[15px] font-extrabold text-ink">{step.title}</h3>
                  <p className="mt-2.5 flex-1 text-[13px] leading-7 text-ink/75">{step.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={200}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-gold/25 bg-white/60 px-6 py-5 sm:flex-row sm:text-right">
            <p className="flex items-start gap-2.5 text-[13px] leading-7 text-ink/80">
              <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-gold-deep" />
              برای حفظ محرمانگی، در فرم اولیه جزئیات حساس پرونده را ننویسید؛ همان چند جملۀ کلی
              کافی است.
            </p>
            <Link
              to="/contact"
              className="shrink-0 rounded-2xl bg-ink px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-ink-soft"
            >
              شروع با ثبت درخواست
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
