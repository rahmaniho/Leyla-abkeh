import { useCallback, useEffect, useRef, useState } from "react";
import { withBase } from "../lib/base";
import { siteConfig } from "../config/site";

/**
 * لوگوموشن دفتر — تنها محل پخش ویدئو در کل سایت
 * ------------------------------------------------------------------
 * تصمیم‌های طراحی (بر پایۀ ممیزی خود ویدئو و ساختار صفحه):
 * ۱. ویدئو تزئینی است، پس **هیچ‌وقت** در مسیر بحرانی بارگذاری صفحه نیست:
 *    تا پیش از ورود کاربر به قاب دید، فایل MP4 درخواست نمی‌شود
 *    (`preload="none"` و بدون `src` در HTML اولیه).
 * ۲. یک بار در ورود به قاب دید پخش می‌شود؛ بدون `loop`، چون پایان ویدئو
 *    دقیقاً روی لوگوی کامل و روشن است و تکرار، پرش ناگهانی «بزرگ → کوچک»
 *    ایجاد می‌کرد. پس از پایان، دکمۀ «پخش دوباره» می‌آید.
 * ۳. اگر کاربر از بخش خارج شود، پخش متوقف می‌شود (باتری/پردازنده) و با
 *    بازگشت ادامه می‌یابد — مگر اینکه خودش دستی متوقف کرده باشد.
 * ۴. `prefers-reduced-motion`: ویدئو هرگز بارگذاری نمی‌شود و فریم نهایی
 *    (لوگوی کامل و روشن) به‌صورت تصویر ثابت نمایش داده می‌شود.
 * ۵. اگر پخش خودکار مسدود شود یا فایل خطا بدهد، رابط کاربری نمی‌شکند:
 *    در حالت مسدود، فریم نهایی + دکمۀ پخش؛ در حالت خطا، لوگوی ثابت کامل.
 * ۶. ابعاد ثابت و `aspect-ratio` جلوی CLS را می‌گیرد؛ دکمه با صفحه‌کلید
 *    قابل استفاده است و ویدئو خودش focus نمی‌گیرد (کنترل بومی ندارد).
 */

type Status = "idle" | "playing" | "paused" | "ended";

export default function LogoMotion({ className = "" }: { className?: string }) {
  const { brand } = siteConfig;
  const { logoMotion } = siteConfig.media;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const userPausedRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failed, setFailed] = useState(false);
  /** پوستر اولیه = فریم شروع ویدئو تا هنگام آغاز پخش هیچ پرش تصویری نباشد */
  const [poster, setPoster] = useState(withBase(logoMotion.poster));

  /** فریم پایانی؛ هم برای کاهش حرکت و هم برای وقتی پخش ممکن نیست */
  const showFinalFrame = useCallback(() => {
    setPoster(withBase(logoMotion.endFrame));
  }, [logoMotion.endFrame]);

  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.src) {
      video.src = withBase(logoMotion.mp4);
      video.load();
    }
    video.muted = true;

    const attempt = video.play?.();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        // سیاست مرورگر پخش خودکار را رد کرد (مثلاً حالت کم‌مصرف iOS)
        setStatus("paused");
        showFinalFrame();
      });
    }
  }, [logoMotion.mp4, showFinalFrame]);

  /* ترجیح کاربر برای کاهش حرکت */
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;

    const apply = () => {
      setReducedMotion(query.matches);
      if (!query.matches) return;

      const video = videoRef.current;
      video?.pause();
      setStatus("paused");
      showFinalFrame();
    };

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, [showFinalFrame]);

  /* بارگذاری در نزدیکی قاب دید، پخش فقط با دیده‌شدن واقعی */
  useEffect(() => {
    if (reducedMotion || failed) return;

    const frame = frameRef.current;
    if (!frame) return;

    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }

    const attachSource = () => {
      const video = videoRef.current;
      if (!video || video.src) return;
      video.src = withBase(logoMotion.mp4);
      video.muted = true;
      video.preload = "auto";
      video.load();
    };

    // ۳۰۰ پیکسل پیش از رسیدن به قاب دید: فقط بارگذاری، نه پخش
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          attachSource();
          preloadObserver.disconnect();
        }
      },
      { rootMargin: "300px 0px", threshold: 0 }
    );

    // با دیده‌شدن ۲۰٪ از کارت: پخش؛ با خروج: توقف
    const playObserver = new IntersectionObserver(
      (entries) => {
        const video = videoRef.current;
        if (!video) return;

        if (entries.some((entry) => entry.isIntersecting)) {
          if (!userPausedRef.current && !video.ended) start();
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: "0px", threshold: 0.2 }
    );

    preloadObserver.observe(frame);
    playObserver.observe(frame);

    return () => {
      preloadObserver.disconnect();
      playObserver.disconnect();
    };
  }, [reducedMotion, failed, start, logoMotion.mp4]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (status === "playing") {
      userPausedRef.current = true;
      video.pause();
      setStatus("paused");
      return;
    }

    userPausedRef.current = false;
    if (video.ended) video.currentTime = 0;
    start();
  };

  /* ---- جایگزین خطا: لوگوی ثابت کامل (بدون بریدگی) ---- */
  if (failed) {
    return (
      <figure
        className={`relative flex items-center justify-center overflow-hidden rounded-3xl border border-gold/25 bg-ink-deep p-6 shadow-deep ${className}`}
      >
        <img
          src={withBase(brand.lockup.png)}
          alt={brand.alt}
          width={brand.lockup.width}
          height={brand.lockup.height}
          className="h-auto w-full max-w-[220px] object-contain"
        />
      </figure>
    );
  }

  const label =
    status === "playing"
      ? "توقف لوگوموشن"
      : status === "ended"
        ? "پخش دوبارۀ لوگوموشن"
        : "پخش لوگوموشن";

  return (
    <figure
      ref={frameRef}
      className={`relative overflow-hidden rounded-3xl border border-gold/25 bg-ink-deep shadow-deep ${className}`}
    >
      <div
        className="relative"
        style={{ aspectRatio: `${logoMotion.width} / ${logoMotion.height}` }}
      >
        <video
          ref={videoRef}
          className="block h-full w-full object-contain"
          width={logoMotion.width}
          height={logoMotion.height}
          poster={poster}
          preload="none"
          playsInline
          aria-label={logoMotion.alt}
          onError={() => setFailed(true)}
          onEnded={() => setStatus("ended")}
          onPlay={() => setStatus("playing")}
          onPause={() => setStatus((current) => (current === "ended" ? current : "paused"))}
        >
          {/* ویدئو صدا ندارد؛ این ردیف متن تصویر را برای فناوری‌های کمکی توصیف می‌کند */}
          <track
            kind="captions"
            src={withBase(logoMotion.captions)}
            srcLang="fa"
            label="توصیف تصویری"
            default
          />
        </video>
      </div>

      {!reducedMotion && (
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/80 px-3.5 py-2 text-[11.5px] font-bold text-white/85 backdrop-blur-md transition-colors hover:border-gold/50 hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
          aria-label={label}
        >
          <span aria-hidden="true" className="text-[10px] leading-none">
            {status === "playing" ? "❚❚" : "▶"}
          </span>
          {status === "playing" ? "توقف" : status === "ended" ? "پخش دوباره" : "پخش"}
        </button>
      )}
    </figure>
  );
}
