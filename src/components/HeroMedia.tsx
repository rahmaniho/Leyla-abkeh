import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "../config/site";
import { withBase } from "../lib/base";

/**
 * فوتیج صرفاً تزئینی است. پوستر در HTML اولیه وجود دارد، اما MP4 فقط هنگام
 * دیده‌شدن هیرو و در صورت مجازبودن حرکت و مصرف داده بارگذاری می‌شود. کاربر
 * همواره می‌تواند آن را متوقف کند یا آگاهانه پخش را آغاز کند.
 */
export default function HeroMedia() {
  const { hero } = siteConfig.media;
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const visibleRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const saveDataRef = useRef(false);
  const manuallyPlayingRef = useRef(false);
  const userPausedRef = useRef(false);
  const failedRef = useRef(false);
  const sourceIndexRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);

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
        attempt.catch(() => {
          // پخش خودکار ممکن است در مرورگر یا حالت کم‌مصرف مسدود باشد.
          if (mountedRef.current && video.paused) setPlaying(false);
        });
      }
    } catch {
      if (mountedRef.current) setPlaying(false);
    }
  }, [hero.sources]);

  useEffect(() => {
    mountedRef.current = true;
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
      setPlaying(false);
    };
    const resumeIfAllowed = () => {
      if (
        visibleRef.current &&
        !document.hidden &&
        !userPausedRef.current &&
        (manuallyPlayingRef.current || (!reducedMotionRef.current && !saveDataRef.current))
      ) {
        start();
      }
    };

    const onMotionChange = () => {
      reducedMotionRef.current = Boolean(motion?.matches);
      if (reducedMotionRef.current) {
        // با فعال شدن کاهش حرکت، به فریم ثابت برگرد و دریافت را متوقف کن.
        manuallyPlayingRef.current = false;
        stopAndShowPoster();
      } else {
        resumeIfAllowed();
      }
    };
    const onConnectionChange = () => {
      updateDataPreference();
      if (saveDataRef.current && !manuallyPlayingRef.current) stopAndShowPoster();
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
      mountedRef.current = false;
      observer?.disconnect();
      motion?.removeEventListener?.("change", onMotionChange);
      connection?.removeEventListener?.("change", onConnectionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pause();
    };
  }, [start]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      userPausedRef.current = true;
      manuallyPlayingRef.current = false;
      video.pause();
      setPlaying(false);
    } else {
      userPausedRef.current = false;
      manuallyPlayingRef.current = true;
      start();
    }
  };

  const onVideoError = () => {
    const video = videoRef.current;
    // حذف src هنگام فعال‌شدن کاهش حرکت نباید خطای واقعی تلقی شود.
    if (!video?.hasAttribute("src")) return;

    if (sourceIndexRef.current + 1 < hero.sources.length) {
      // در صورت خطای منبع، نسخۀ بعدی همان فوتیج را امتحان کن.
      sourceIndexRef.current += 1;
      setHasFrame(false);
      setPlaying(false);
      video.src = withBase(hero.sources[sourceIndexRef.current]);
      video.load();
      if (
        visibleRef.current &&
        !document.hidden &&
        !userPausedRef.current &&
        (manuallyPlayingRef.current || (!reducedMotionRef.current && !saveDataRef.current))
      ) start();
      return;
    }
    failedRef.current = true;
    setFailed(true);
    setHasFrame(false);
    setPlaying(false);
  };

  return (
    <>
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
          onPlay={() => setPlaying(true)}
          onPlaying={() => setHasFrame(true)}
          onPause={() => setPlaying(false)}
          onError={onVideoError}
        />
        <div className="hero-media-veil absolute inset-0" />
      </div>

      {!failed && (
        <div className="pointer-events-none absolute inset-x-0 top-[84px] z-20 mx-auto flex max-w-7xl justify-end px-5 lg:top-[100px] lg:px-8">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "توقف ویدئوی پس‌زمینه" : "پخش ویدئوی پس‌زمینه"}
            className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-ink-deep/60 px-4 py-2 text-[13px] font-bold text-white/85 backdrop-blur-md transition-colors hover:border-gold-light/70 hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep"
          >
            {playing ? (
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M3.5 2.5h3v11h-3zm6 0h3v11h-3z" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M4 2.5 13 8l-9 5.5z" />
              </svg>
            )}
            {playing ? "توقف ویدئو" : "پخش ویدئو"}
          </button>
        </div>
      )}
    </>
  );
}
