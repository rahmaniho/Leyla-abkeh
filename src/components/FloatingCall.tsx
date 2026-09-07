import { PhoneIcon } from "./Icons";

/** دکمهٔ شناور تماس سریع — همیشه در دسترس */
export default function FloatingCall() {
  return (
    <a
      href="tel:+989121234567"
      aria-label="تماس فوری با وکیل — ۰۹۱۲ ۱۲۳ ۴۵۶۷"
      className="group fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold-deep text-ink-deep shadow-gold transition-all duration-300 hover:scale-110 sm:bottom-7 sm:left-7"
    >
      <span className="animate-ring absolute inset-0 rounded-full bg-gold/50" aria-hidden="true" />
      <PhoneIcon className="relative h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full border border-gold/30 bg-ink/90 px-4 py-2 text-[12px] font-bold text-gold-light opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 sm:block">
        تماس فوری با وکیل
      </span>
    </a>
  );
}
