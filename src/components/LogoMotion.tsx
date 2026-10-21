import { useEffect, useRef, useState } from "react";
import { withBase } from "../lib/base";
import { siteConfig } from "../config/site";

/**
 * لوگوموشن رسمی دفتر
 * ------------------------------------------------------------------
 * - بدون صدا و با `loop` تا مزاحمتی برای کاربر نداشته باشد.
 * - اگر کاربر `prefers-reduced-motion` را فعال کرده باشد، ویدیو متوقف
 *   می‌ماند و پوستر (فریم ثابت لوگو) دیده می‌شود؛ ساختار DOM عوض نمی‌شود
 *   تا در hydration تفاوتی میان سرور و کلاینت پیش نیاید.
 * - تا آماده‌شدن ویدیو، همان پوستر نمایش داده می‌شود (بدون پرش چیدمان).
 */
export default function LogoMotion({ className = "" }: { className?: string }) {
  const { logoMotion } = siteConfig.media;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  /**
   * چرا همهٔ کارها در یک افکت انجام می‌شود؟
   * - React ویژگی `muted` را در خروجی سرور نمی‌نویسد؛ اگر مقداردهی را به
   *   کلاینت بسپاریم، مرورگر ویدیوی بی‌صدا‌نشده را autoplay نمی‌کند. پس
   *   بی‌صدا بودن را روی خود عنصر اعمال و سپس پخش را آغاز می‌کنیم.
   * - اگر کاربر `prefers-reduced-motion` را فعال کرده باشد، ویدیو متوقف
   *   می‌ماند و پوستر دیده می‌شود. ساختار DOM در سرور و کلاینت یکسان است،
   *   بنابراین hydration سالم می‌ماند.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const apply = () => {
      const reduced = Boolean(query?.matches);
      setReducedMotion(reduced);

      if (reduced) {
        video.pause();
        setPlaying(false);
        return;
      }

      // پخش خودکار ممکن است توسط سیاست مرورگر رد شود؛ در آن حالت دکمهٔ پخش می‌ماند.
      // در محیط‌های آزمایشی (jsdom) این متد Promise برنمی‌گرداند؛ بنابراین محافظت می‌کنیم.
      const attempt = video.play?.();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => setPlaying(false));
      }
    };

    apply();
    query?.addEventListener("change", apply);
    return () => query?.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <figure className={`relative overflow-hidden rounded-3xl bg-ink-deep ${className}`}>
      <video
        ref={videoRef}
        className="mx-auto block h-full w-full object-contain"
        width={logoMotion.width}
        height={logoMotion.height}
        poster={withBase(logoMotion.poster)}
        autoPlay
        loop
        playsInline
        preload="metadata"
        aria-label={logoMotion.alt}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      >
        <source src={withBase(logoMotion.mp4)} type="video/mp4" />
        {/* ویدیو صدا ندارد؛ این ردیف متن، تصویر را برای کاربران کم‌بینا/ناشنوا توصیف می‌کند */}
        <track
          kind="captions"
          src={withBase(logoMotion.captions)}
          srcLang="fa"
          label="توصیف تصویری"
          default
        />
        {/* جایگزین برای مرورگرهای بدون پشتیبانی ویدیو */}
        <img
          src={withBase(logoMotion.poster)}
          alt={logoMotion.alt}
          width={logoMotion.width}
          height={logoMotion.height}
        />
      </video>

      {!reducedMotion && (
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/80 px-3.5 py-2 text-[11.5px] font-bold text-white/85 backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold-light"
          aria-label={playing ? "توقف لوگوموشن" : "پخش لوگوموشن"}
        >
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
          {playing ? "توقف" : "پخش"}
        </button>
      )}
    </figure>
  );
}
