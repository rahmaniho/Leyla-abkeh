import {
  ClockIcon,
  InstagramIcon,
  LinkedInIcon,
  MapPinIcon,
  PhoneIcon,
  ScaleIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./Icons";

const QUICK_LINKS = [
  { href: "#top", label: "صفحهٔ اصلی" },
  { href: "#about", label: "درباره من" },
  { href: "#services", label: "خدمات حقوقی" },
  { href: "#testimonials", label: "نظرات موکلان" },
  { href: "#pricing", label: "تعرفه‌ها" },
  { href: "#faq", label: "سوالات متداول" },
];

const SERVICE_LINKS = [
  "دعاوی خانواده",
  "دعاوی کیفری",
  "امور ملکی و ثبتی",
  "چک و اسناد تجاری",
  "حقوق کار و بیمه",
  "حقوق شرکت‌ها",
];

const SOCIALS = [
  { icon: InstagramIcon, label: "اینستاگرام", href: "#" },
  { icon: WhatsAppIcon, label: "واتساپ", href: "https://wa.me/989121234567" },
  { icon: TelegramIcon, label: "تلگرام", href: "https://t.me/example" },
  { icon: LinkedInIcon, label: "لینکدین", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-ink-deep" aria-label="پاورقی سایت">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr]">
          {/* برند */}
          <div>
            <a href="#top" className="flex items-center gap-3" aria-label="لیلا آبکه — بازگشت به ابتدای صفحه">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light to-gold-deep text-ink-deep shadow-gold">
                <ScaleIcon className="h-6 w-6" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold text-white">لیلا آبکه</span>
                <span className="text-[11px] font-medium text-gold-light">وکیل پایه یک دادگستری</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-[13px] leading-7 text-white/50">
              دفاعِ هوشمند، همراه با اعتماد؛ دفتر تخصصی وکالت و مشاورهٔ حقوقی در
              قزوین با بیش از ۱۲ سال تجربه در دعاوی خانواده، کیفری، ملکی و تجاری.
            </p>
            <ul className="mt-6 flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-gold/15 hover:text-gold-light"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* لینک‌های سریع */}
          <nav aria-label="لینک‌های سریع">
            <h3 className="text-[14px] font-extrabold text-white">دسترسی سریع</h3>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-[13px] text-white/55 transition-colors duration-300 hover:text-gold-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/50 transition-all duration-300 group-hover:w-2.5" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* خدمات */}
          <nav aria-label="حوزه‌های فعالیت">
            <h3 className="text-[14px] font-extrabold text-white">حوزه‌های فعالیت</h3>
            <ul className="mt-5 space-y-3">
              {SERVICE_LINKS.map((service) => (
                <li key={service}>
                  <a
                    href="#services"
                    className="group inline-flex items-center gap-2 text-[13px] text-white/55 transition-colors duration-300 hover:text-gold-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/50 transition-all duration-300 group-hover:w-2.5" />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* اطلاعات تماس */}
          <div>
            <h3 className="text-[14px] font-extrabold text-white">اطلاعات تماس</h3>
            <ul className="mt-5 space-y-4 text-[13px] text-white/55">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <a href="tel:+989121234567" dir="ltr" className="pt-1.5 font-semibold tracking-wider transition-colors hover:text-gold-light">
                  ۰۹۱۲ ۱۲۳ ۴۵۶۷
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <span className="leading-6">
                  قزوین، خیابان خیام شمالی، برج آرین،
                  <br />
                  طبقهٔ چهارم، واحد ۱۲
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <span className="leading-6">
                  شنبه تا چهارشنبه: ۹ تا ۱۸
                  <br />
                  پنجشنبه‌ها: ۹ تا ۱۳
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row">
          <p className="text-[12px] text-white/40">
            © ۱۴۰۵ لیلا آبکه — تمامی حقوق محفوظ است.
          </p>
          <p className="text-[12px] text-white/40">
            عضو رسمی کانون وکلای دادگستری استان قزوین
          </p>
        </div>
      </div>
    </footer>
  );
}
