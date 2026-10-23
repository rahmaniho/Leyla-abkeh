import { primaryPhone } from "../config/site";
import { PhoneIcon } from "./Icons";
import { Link, usePathname } from "../lib/router";
import { track } from "../lib/analytics";

/**
 * دکمۀ شناور «درخواست تماس».
 * - در صفحۀ تماس پنهان می‌شود تا روی فرم و دکمۀ ارسال نیفتد.
 * - تا تأیید شمارۀ تلفن، به فرم درخواست مشاوره لینک می‌دهد (نه شمارۀ نمونه).
 */
export default function FloatingCall() {
  const pathname = usePathname();
  if (pathname === "/contact") return null;

  const label = primaryPhone ? "تماس با دفتر" : "درخواست تماس";
  const shell =
    "group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-ink-deep shadow-gold transition-all duration-300 hover:scale-105 sm:left-6 sm:h-14 sm:w-14";

  const body = (
    <>
      <span className="absolute inset-0 rounded-full bg-gold/45 animate-ring" aria-hidden="true" />
      <PhoneIcon className="relative h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-full border border-gold/30 bg-ink/95 px-4 py-2 text-[12px] font-bold text-gold-light opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
        {label}
      </span>
    </>
  );

  if (primaryPhone) {
    return (
      <a href={primaryPhone.href} aria-label={primaryPhone.ariaLabel} className={shell}>
        {body}
      </a>
    );
  }

  return (
    <Link
      to="/contact"
      onClick={() => track("cta_click", { location: "floating", target: "/contact" })}
      aria-label="درخواست تماس از طریق فرم مشاوره"
      className={shell}
    >
      {body}
    </Link>
  );
}
