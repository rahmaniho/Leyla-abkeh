import {
  ClockIcon,
  InstagramIcon,
  LinkedInIcon,
  MapPinIcon,
  PhoneIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "./Icons";
import { Link } from "../lib/router";
import BrandLogo from "./BrandLogo";
import { FOOTER_LEGAL_LINKS, NAV_ITEMS } from "../config/nav";
import { SERVICES, servicePath } from "../content/services";
import {
  activeSocials,
  officePhone,
  openingHoursFa,
  primaryPhone,
  siteConfig,
  type SocialKey,
} from "../config/site";

const SOCIAL_ICONS: Record<SocialKey, typeof InstagramIcon> = {
  instagram: InstagramIcon,
  telegram: TelegramIcon,
  linkedin: LinkedInIcon,
  whatsapp: WhatsAppIcon,
};

export default function Footer() {
  const year = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    timeZone: "Asia/Tehran",
  }).format(new Date());

  return (
    <footer className="border-t border-white/8 bg-ink-deep pb-24 md:pb-0" aria-label="پاورقی سایت">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.1fr]">
          <div>
            <Link
              to="/"
              className="flex items-center gap-3"
              aria-label={`${siteConfig.lawyer.name} — بازگشت به صفحهٔ اصلی`}
            >
              <BrandLogo size={44} />
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold text-white">{siteConfig.lawyer.name}</span>
                <span className="text-[11px] font-medium text-gold-light">
                  {siteConfig.lawyer.jobTitle}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-[13px] leading-7 text-white/60">
              دفتر وکالت و مشاورهٔ حقوقی در {siteConfig.site.city}؛ همراهی در دعاوی خانواده،
              کیفری، ملکی، اسناد تجاری، حقوق کار و امور شرکت‌ها.
            </p>
            {activeSocials.length > 0 && (
              <ul className="mt-6 flex gap-3">
                {activeSocials.map(({ key, label, href }) => {
                  const Icon = SOCIAL_ICONS[key];
                  return (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-gold/15 hover:text-gold-light"
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <nav aria-label="لینک‌های سریع">
            <h2 className="text-[14px] font-extrabold text-white">دسترسی سریع</h2>
            <ul className="mt-5 space-y-3">
              {[{ href: "/", label: "صفحهٔ اصلی" }, ...NAV_ITEMS, ...FOOTER_LEGAL_LINKS].map(
                (link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="group inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-300 hover:text-gold-light"
                    >
                      <span className="h-1 w-1 rounded-full bg-gold/50 transition-all duration-300 group-hover:w-2.5" />
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          <nav aria-label="حوزه‌های فعالیت">
            <h2 className="text-[14px] font-extrabold text-white">حوزه‌های فعالیت</h2>
            <ul className="mt-5 space-y-3">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link
                    to={servicePath(service.slug)}
                    className="group inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors duration-300 hover:text-gold-light"
                  >
                    <span className="h-1 w-1 rounded-full bg-gold/50 transition-all duration-300 group-hover:w-2.5" />
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[14px] font-extrabold text-white">اطلاعات تماس</h2>
            <ul className="mt-5 space-y-4 text-[13px] text-white/60">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <span className="flex flex-col gap-1">
                  {primaryPhone ? (
                    <a
                      href={primaryPhone.href}
                      dir="ltr"
                      className="pt-1 font-semibold tracking-wider transition-colors hover:text-gold-light"
                    >
                      {primaryPhone.display}
                    </a>
                  ) : (
                    <Link to="/contact" className="pt-1 leading-6 transition-colors hover:text-gold-light">
                      درخواست تماس از طریق فرم
                      <span className="mt-1 block text-[11.5px] text-white/45">
                        شمارهٔ تلفن در حال تأیید نهایی است
                      </span>
                    </Link>
                  )}
                  {officePhone && (
                    <a
                      href={officePhone.href}
                      dir="ltr"
                      className="tracking-wider transition-colors hover:text-gold-light"
                    >
                      {officePhone.display}
                    </a>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <span className="leading-6">{siteConfig.contact.address.full}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-light">
                  <ClockIcon className="h-4 w-4" />
                </span>
                <span className="flex flex-col gap-1 leading-6">
                  {openingHoursFa.map((day) => (
                    <span key={day.schemaDay}>{day.display}</span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-7 sm:flex-row">
          <p className="text-[12px] text-white/50" suppressHydrationWarning>
            © {year} {siteConfig.lawyer.name} — تمامی حقوق محفوظ است.
          </p>
          <p className="text-[12px] text-white/50">
            محتوای این سایت جنبهٔ اطلاع‌رسانی عمومی دارد و جایگزین مشاورهٔ حقوقی نیست.
          </p>
        </div>
      </div>
    </footer>
  );
}
