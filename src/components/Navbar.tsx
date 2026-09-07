import { useEffect, useState } from "react";
import { cn } from "../utils/cn";
import { CloseIcon, MenuIcon, ScaleIcon } from "./Icons";

const NAV_LINKS = [
  { href: "#services", label: "خدمات" },
  { href: "#about", label: "درباره من" },
  { href: "#testimonials", label: "نظرات" },
  { href: "#faq", label: "سوالات" },
  { href: "#contact", label: "تماس" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-ink/80 shadow-deep backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="ناوبری اصلی"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"
      >
        {/* لوگو */}
        <a href="#top" className="group flex items-center gap-3" aria-label="لیلا آبکه، وکیل پایه یک دادگستری — بازگشت به ابتدای صفحه">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-light to-gold-deep text-ink-deep shadow-gold transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105">
            <ScaleIcon className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight text-white">
              لیلا آبکه
            </span>
            <span className="text-[11px] font-medium text-gold-light">
              وکیل پایه یک دادگستری
            </span>
          </span>
        </a>

        {/* لینک‌های دسکتاپ */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-white/75 transition-colors duration-300 after:absolute after:inset-x-4 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden rounded-full bg-gradient-to-l from-gold to-gold-deep px-6 py-3 text-sm font-bold text-white shadow-gold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-10px_rgba(184,145,90,0.6)] sm:inline-flex"
          >
            مشاوره رایگان
          </a>

          {/* دکمه همبرگری */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 lg:hidden"
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* منوی موبایل */}
      <div
        id="mobile-menu"
        className={cn(
          "grid overflow-hidden border-b border-white/10 bg-ink/95 backdrop-blur-2xl transition-[grid-template-rows,opacity] duration-500 ease-out lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <ul className="space-y-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-gradient-to-l from-gold to-gold-deep px-4 py-3.5 text-center text-sm font-bold text-white shadow-gold"
              >
                درخواست مشاوره رایگان
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
