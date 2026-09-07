import { useState } from "react";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { ChevronDownIcon } from "./Icons";
import { cn } from "../utils/cn";

const FAQS = [
  {
    q: "هزینهٔ مشاوره چقدر است؟",
    a: "مشاورهٔ اولیه (حدود ۱۵ دقیقه، تلفنی) کاملاً رایگان است. اگر نیاز به بررسی دقیق‌تر مدارک داشته باشید، جلسهٔ مشاورهٔ تخصصی با تعرفهٔ شفاف (۹۸۰ هزار تومان) برگزار می‌شود که در صورت قبول وکالت، از حقالوکاله کسر خواهد شد.",
  },
  {
    q: "چه مدارکی باید برای جلسهٔ مشاوره همراه داشته باشم؟",
    a: "هر سندی که به موضوع پرونده مربوط است؛ مانند قراردادها، چک، اسناد رسمی، مدارک هویتی، آرای پیشین و مکاتبات. اگر مدرکی ندارید نگران نباشید؛ در همان جلسه، فهرست مدارک لازم را برای شما مشخص می‌کنم.",
  },
  {
    q: "آیا اطلاعات پروندهٔ من محرمانه باقی می‌ماند؟",
    a: "بله، قطعاً. بر اساس قانون وکالت و آیین حرفه‌ای کانون وکلا، تمام اطلاعات شما نزد وکیل، راز حرفه‌ای محسوب می‌شود و بدون رضایت صریح شما، هیچ جزئیاتی با هیچ شخص یا مرجعی مطرح نخواهد شد.",
  },
  {
    q: "روند رسیدگی به پرونده معمولاً چقدر طول می‌کشد؟",
    a: "مدت رسیدگی به نوع دعوا و مرجع قضایی بستگی دارد؛ اما تفاوت در پیگیری است: پس از قبول وکالت، در هر مرحله به‌طور مستمر از وضعیت پرونده مطلع می‌شوید و هیچ مرحله‌ای بدون پیگیری باقی نمی‌ماند.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 bg-cream py-20 lg:py-28" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="پرسش‌های پرتکرار"
          title="سوالات متداول"
          description="پاسخ شفاف به دغدغه‌هایی که معمولاً پیش از مراجعه به وکیل ذهن موکلان را مشغول می‌کند."
        />

        <div className="mt-12 space-y-4 lg:mt-14">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={faq.q} delay={i * 110}>
                <div
                  className={cn(
                    "overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500",
                    isOpen
                      ? "border-gold/45 bg-white/85 shadow-deep"
                      : "border-ink/8 bg-white/55 shadow-soft hover:border-gold/30"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right transition-colors"
                    >
                      <span className={cn("text-[15px] font-extrabold", isOpen ? "text-gold-deep" : "text-ink")}>
                        {faq.q}
                      </span>
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500",
                          isOpen
                            ? "rotate-180 bg-gradient-to-br from-gold to-gold-deep text-white shadow-gold"
                            : "border border-ink/12 bg-white/70 text-ink/55"
                        )}
                      >
                        <ChevronDownIcon className="h-4.5 w-4.5" />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="min-h-0">
                      <p className="px-6 pb-6 text-[13.5px] leading-8 text-ink/65">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
