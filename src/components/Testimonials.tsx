import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { StarIcon } from "./Icons";

const TESTIMONIALS = [
  {
    quote:
      "با وجود پیچیدگی پروندهٔ مهریه، خانم آبکه با آرامش و تسلط کامل موضوع را مدیریت کرد و در نهایت بهترین نتیجهٔ ممکن برای من حاصل شد.",
    name: "مریم رضایی",
    role: "دعاوی خانواده",
  },
  {
    quote:
      "چک برگشتی من در کمتر از دو ماه وصول شد. پیگیری، دقت و صداقت ایشان واقعاً بی‌نظیر بود و در تمام مراحل در جریان کار قرار داشتم.",
    name: "حمید کریمی",
    role: "چک و اسناد تجاری",
  },
  {
    quote:
      "برای تنظیم قرارداد خرید ملک به دفتر ایشان مراجعه کردیم. تک‌تک بندهای قرارداد با حوصله توضیح داده شد و خیال ما کاملاً راحت بود.",
    name: "شرکت آریا تجارت قزوین",
    role: "امور قراردادها و ملکی",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-gold" role="img" aria-label="امتیاز ۵ از ۵ ستاره">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className="h-4.5 w-4.5 drop-shadow-[0_2px_6px_rgba(184,145,90,0.45)]" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative scroll-mt-24 bg-cream py-20 lg:py-28"
      aria-labelledby="testimonials-title"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="نظرات موکلان"
          title="آنچه موکلان از تجربهٔ خود می‌گویند"
          description="اعتماد شما مهم‌ترین سرمایهٔ این دفتر است؛ صدای موکلان پیشین، گویاترین گواه آن است."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-16">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 160}>
              <figure className="group relative flex h-full flex-col rounded-3xl border border-white/70 bg-white/60 p-8 shadow-soft backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-gold/45 hover:shadow-deep">
                {/* علامت نقل‌قول */}
                <span
                  className="pointer-events-none absolute top-6 left-7 font-serif text-7xl font-black leading-none text-gold/15 transition-colors duration-500 group-hover:text-gold/30"
                  aria-hidden="true"
                >
                  ”
                </span>

                <Stars />

                <blockquote className="mt-5 flex-1 text-[13.5px] leading-8 text-ink/70">
                  {t.quote}
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-ink/8 pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ink to-ink-soft text-sm font-extrabold text-gold-light shadow-soft">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-[14px] font-extrabold text-ink">{t.name}</span>
                    <span className="mt-0.5 block text-[12px] font-medium text-gold-deep">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
