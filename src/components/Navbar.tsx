import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { NAV_ITEMS } from "../config/nav";
import { Link, usePathname } from "../lib/router";
import { CloseIcon, MenuIcon, PhoneIcon } from "./Icons";
import BrandLogo from "./BrandLogo";
import { track } from "../lib/analytics";
import { siteConfig, primaryPhone } from "../config/site";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // بستن منو هنگام تغییر مسیر (تنظیم وضعیت در زمان رندر، بدون افکت)
  const [trackedPath, setTrackedPath] = useState(pathname);
  if (trackedPath !== pathname) {
    setTrackedPath(pathname);
    setOpen(false);
  }

  // بستن با Escape و قفل اسکرول هنگام باز بودن منو
  useEffect(() => {
    if (!open) return;

    const toggle = menuButtonRef.current;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-white/10 bg-ink/95 shadow-deep backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="ناوبری اصلی"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8"
      >
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label={`${siteConfig.lawyer.name}، ${siteConfig.lawyer.professionalTitle} — صفحۀ اصلی`}
        >
          {/* لوگوی کامل رسمی: نشان + خطاطی + نام لاتین، بدون بریدگی */}
          <BrandLogo
            height={54}
            priority
            className="block shrink-0 transition-transform duration-500 group-hover:scale-[1.03] sm:hidden"
          />
          <BrandLogo
            height={62}
            priority
            className="hidden shrink-0 transition-transform duration-500 group-hover:scale-[1.03] sm:block"
          />
          <span className="hidden w-44 flex-col leading-[1.6] xl:flex">
            <span className="text-[12px] font-medium text-gold-light">
              {siteConfig.lawyer.professionalTitle}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-300",
                    active ? "text-gold-light" : "text-white/75 hover:text-white",
                    "after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-px after:origin-right after:bg-gold after:transition-transform after:duration-300",
                    active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2.5">
          {primaryPhone ? (
            <a
              href={primaryPhone.href}
              aria-label={primaryPhone.ariaLabel}
              className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white/85 transition-colors hover:border-gold/50 hover:text-gold-light md:inline-flex"
            >
              <PhoneIcon className="h-4 w-4 text-gold-light" />
              <span dir="ltr" className="tracking-wide">
                {primaryPhone.display}
              </span>
            </a>
          ) : (
            <Link
              to="/contact"
              className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-white/85 transition-colors hover:border-gold/50 hover:text-gold-light md:inline-flex"
            >
              <PhoneIcon className="h-4 w-4 text-gold-light" />
              درخواست تماس
            </Link>
          )}

          <Link
            to="/contact"
            onClick={() => track("cta_click", { location: "navbar", target: "/contact" })}
            className="hidden rounded-full bg-gradient-to-l from-gold-light via-gold-light to-gold px-5 py-2.5 text-[13px] font-bold text-ink-deep shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-10px_rgba(184,145,90,0.6)] sm:inline-flex"
          >
            درخواست مشاوره
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "بستن منوی ناوبری" : "باز کردن منوی ناوبری"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 lg:hidden"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={cn(
          "grid overflow-hidden border-b border-white/10 bg-ink/98 backdrop-blur-2xl transition-[grid-template-rows,opacity] duration-400 ease-out lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <ul className="space-y-1 px-5 pb-5">
            {NAV_ITEMS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[14px] font-medium transition-colors",
                      active
                        ? "bg-white/10 text-gold-light"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="flex gap-2 pt-2">
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-4 py-3.5 text-center text-sm font-bold text-ink-deep shadow-gold"
              >
                درخواست مشاوره
              </Link>
              {primaryPhone ? (
                <a
                  href={primaryPhone.href}
                  aria-label={primaryPhone.ariaLabel}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3.5 text-sm font-bold text-white/85"
                >
                  <PhoneIcon className="h-4 w-4 text-gold-light" />
                  تماس
                </a>
              ) : (
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3.5 text-sm font-bold text-white/85"
                >
                  <PhoneIcon className="h-4 w-4 text-gold-light" />
                  تماس
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
