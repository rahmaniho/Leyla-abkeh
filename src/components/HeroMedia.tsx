import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "../config/site";
import { withBase } from "../lib/base";

/**
 * فوتیج صرفاً تزئینی است. پوستر در HTML اولیه وجود دارد، اما MP4 فقط هنگام
 * دیده‌شدن هیرو و در صورت مجازبودن حرکت و مصرف داده بارگذاری می‌شود؛
 * در صورت کاهش حرکت، صرفه‌جویی داده یا خطا پوستر ثابت نمایش داده می‌شود.
 */
export default function HeroMedia() {
  const { hero } = siteConfig.media;
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const saveDataRef = useRef(false);
  const failedRef = useRef(false);
  const sourceIndexRef = useRef(0);
  const [hasFrame, setHasFrame] = useState(false);

  // در HTML پیش‌رندر src و autoplay نداریم. تنظیم ویژگی muted پس از اتصال ref
  // از ناسازگاری hydration در مرورگرهایی که muted را از attribute جدا می‌خوانند جلوگیری می‌کند.
  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
    }
  }, []);

  const start = useCallback(() => {
    const video = videoRef.current;
    if (!video || failedRef.current) return;

    if (!video.hasAttribute("src")) {
      video.src = withBase(hero.sources[sourceIndexRef.current]);
      video.load();
    }
    video.muted = true;
    if (!video.paused) return;

    try {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        // پخش خودکار ممکن است در مرورگر یا حالت کم‌مصرف مسدود باشد؛ پوستر می‌ماند.
        attempt.catch(() => {});
      }
    } catch {
      // اگر مرورگر اجازه ندهد، پوستر ثابت بدون کنترل اضافه نمایش داده می‌شود.
    }
  }, [hero.sources]);

  useEffect(() => {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame) return;

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    }).connection;

    const updateDataPreference = () => {
      saveDataRef.current = Boolean(
        connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? "")
      );
    };
    reducedMotionRef.current = Boolean(motion?.matches);
    updateDataPreference();

    const pause = () => {
      if (!video.paused) video.pause();
    };
    const stopAndShowPoster = () => {
      pause();
      if (video.hasAttribute("src")) {
        video.removeAttribute("src");
        video.load();
      }
      setHasFrame(false);
    };
    const resumeIfAllowed = () => {
      if (visibleRef.current && !document.hidden && !reducedMotionRef.current && !saveDataRef.current) {
        start();
      }
    };

    const onMotionChange = () => {
      reducedMotionRef.current = Boolean(motion?.matches);
      if (reducedMotionRef.current) {
        // با فعال شدن کاهش حرکت، به فریم ثابت برگرد و دریافت را متوقف کن.
        stopAndShowPoster();
      } else {
        resumeIfAllowed();
      }
    };
    const onConnectionChange = () => {
      updateDataPreference();
      if (saveDataRef.current) stopAndShowPoster();
      else resumeIfAllowed();
    };
    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else resumeIfAllowed();
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      visibleRef.current = true;
      resumeIfAllowed();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          visibleRef.current = entries.some((entry) => entry.isIntersecting);
          if (visibleRef.current) resumeIfAllowed();
          else pause();
        },
        { threshold: 0.05 }
      );
      observer.observe(frame);
    }

    motion?.addEventListener?.("change", onMotionChange);
    connection?.addEventListener?.("change", onConnectionChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer?.disconnect();
      motion?.removeEventListener?.("change", onMotionChange);
      connection?.removeEventListener?.("change", onConnectionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pause();
    };
  }, [start]);

  const onVideoError = () => {
    const video = videoRef.current;
    // حذف src هنگام فعال‌شدن کاهش حرکت نباید خطای واقعی تلقی شود.
    if (!video?.hasAttribute("src")) return;

    if (sourceIndexRef.current + 1 < hero.sources.length) {
      // در صورت خطای منبع، نسخۀ بعدی همان فوتیج را امتحان کن.
      sourceIndexRef.current += 1;
      setHasFrame(false);
      video.src = withBase(hero.sources[sourceIndexRef.current]);
      video.load();
      if (visibleRef.current && !document.hidden && !reducedMotionRef.current && !saveDataRef.current) {
        start();
      }
      return;
    }
    failedRef.current = true;
    setHasFrame(false);
  };

  const onVideoPlaying = () => {
    const video = videoRef.current;
    if (!video) return;
    // رویداد پخش ممکن است پس از خروج از قاب یا تغییر ترجیح حرکت برسد.
    if (
      failedRef.current ||
      !video.hasAttribute("src") ||
      !visibleRef.current ||
      document.hidden ||
      reducedMotionRef.current ||
      saveDataRef.current
    ) {
      if (!video.paused) video.pause();
      return;
    }
    setHasFrame(true);
  };

  return (
    <div ref={frameRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={withBase(hero.poster)}
        alt=""
        width={hero.posterWidth}
        height={hero.posterHeight}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="hero-media-poster absolute inset-0 h-full w-full object-cover"
      />
      {/* ویدئو تزئینی است و muted پیش از هر پخش در ref تنظیم می‌شود. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={attachVideo}
        data-hero-video
        className={`hero-media-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${hasFrame ? "opacity-100" : "opacity-0"}`}
        width={hero.width}
        height={hero.height}
        poster={withBase(hero.poster)}
        preload="none"
        loop
        playsInline
        onPlaying={onVideoPlaying}
        onError={onVideoError}
      />
      <div className="hero-media-veil absolute inset-0" />
    </div>
  );
}
