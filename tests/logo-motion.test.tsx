import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { siteConfig } from "../src/config/site";

/**
 * آزمون لوگوموشن
 * ------------------------------------------------------------------
 * این آزمون‌ها رفتار واقعی کامپوننت را قفل می‌کنند:
 * - فقط یک نمونه در کل سایت، و فقط در صفحۀ «درباره»
 * - بدون بارگذاری زودهنگام (بدون src و با preload="none")
 * - پخش فقط با ورود به قاب دید؛ توقف با خروج از آن
 * - احترام کامل به prefers-reduced-motion (بدون بارگذاری ویدئو)
 * - رفتار سالم وقتی پخش خودکار مسدود شود یا فایل خطا بدهد
 * - ابعاد ثابت برای جلوگیری از CLS
 */

const { logoMotion, brand } = siteConfig.media ? { logoMotion: siteConfig.media.logoMotion, brand: siteConfig.brand } : ({} as never);

const renderAt = (path: string) => render(<App initialPath={path} />);
const getVideo = () => document.querySelector("video") as HTMLVideoElement | null;

const intersect = (isIntersecting: boolean) =>
  act(() => {
    (globalThis as unknown as { __intersect: (v: boolean) => void }).__intersect(isIntersecting);
  });

const play = vi.fn();
const pause = vi.fn();
const load = vi.fn();
let paused = true;

beforeEach(() => {
  paused = true;

  play.mockReset().mockImplementation(() => Promise.resolve());
  pause.mockReset().mockImplementation(() => {
    paused = true;
    return undefined;
  });
  load.mockReset();

  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(pause);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(load);
  Object.defineProperty(HTMLMediaElement.prototype, "paused", {
    configurable: true,
    get: () => paused,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("محل و تعداد پخش", () => {
  it("لوگوموشن فقط دربارۀ ما و ویدئوی مستقل هیرو فقط در صفحۀ اصلی است", () => {
    const about = renderAt("/about");
    expect(document.querySelectorAll("video")).toHaveLength(1);
    expect(getVideo()?.getAttribute("poster")).toBe(logoMotion.poster);
    about.unmount();

    const home = renderAt("/");
    expect(document.querySelectorAll("video")).toHaveLength(1);
    expect(document.querySelector("video[data-hero-video]")).not.toBeNull();
    home.unmount();

    for (const path of ["/contact", "/services", "/faq", "/pricing", "/articles"]) {
      const view = renderAt(path);
      expect(document.querySelectorAll("video"), `مسیر ${path}`).toHaveLength(0);
      view.unmount();
    }
  });

  it("لوگوی ثابت هدر و فوتر حذف نشده است", () => {
    const { unmount } = renderAt("/about");
    expect(document.querySelectorAll("img[alt='لوگوی دفتر وکالت لیلا آبکه']").length).toBeGreaterThan(0);
    unmount();
  });
});

describe("بارگذاری ویدئو", () => {
  it("در HTML اولیه هیچ فایلی از ویدئو درخواست نمی‌شود", () => {
    const { unmount } = renderAt("/about");
    const video = getVideo();

    expect(video).not.toBeNull();
    // نه src و نه source؛ بنابراین مرورگر MP4 را دانلود نمی‌کند
    expect(video!.hasAttribute("src")).toBe(false);
    expect(video!.querySelector("source")).toBeNull();
    expect(video!.getAttribute("preload")).toBe("none");
    expect(video!.hasAttribute("autoplay")).toBe(false);
    expect(video!.hasAttribute("loop")).toBe(false);
    expect(play).not.toHaveBeenCalled();
    unmount();
  });

  it("پوستر، فریم شروع ویدئو است تا پرش تصویری نداشته باشیم", () => {
    const { unmount } = renderAt("/about");
    expect(getVideo()!.getAttribute("poster")).toBe(logoMotion.poster);
    unmount();
  });

  it("ابعاد ثابت و aspect-ratio دارد تا CLS ایجاد نشود", () => {
    const { unmount } = renderAt("/about");
    const video = getVideo()!;
    expect(video.getAttribute("width")).toBe(String(logoMotion.width));
    expect(video.getAttribute("height")).toBe(String(logoMotion.height));

    const frame = video.closest("figure")?.querySelector("div[style]") as HTMLElement | null;
    expect(frame?.style.aspectRatio.replace(/\s/g, "")).toBe(
      `${logoMotion.width}/${logoMotion.height}`
    );
    unmount();
  });

  it("با ورود به قاب دید بارگذاری و پخش می‌شود", () => {
    const { unmount } = renderAt("/about");
    const video = getVideo()!;
    expect(
      (globalThis as unknown as { __observerCount: () => number }).__observerCount()
    ).toBeGreaterThan(0);

    intersect(true);

    expect(video.getAttribute("src")).toContain(logoMotion.mp4);
    expect(load).toHaveBeenCalled();
    expect(play).toHaveBeenCalled();
    unmount();
  });

  it("با خروج از قاب دید پخش متوقف می‌شود", () => {
    const { unmount } = renderAt("/about");
    intersect(true);
    paused = false;

    intersect(false);
    expect(pause).toHaveBeenCalled();
    unmount();
  });
});

describe("دسترس‌پذیری و حرکت", () => {
  it("در prefers-reduced-motion ویدئو بارگذاری نمی‌شود و فریم نهایی ثابت می‌ماند", () => {
    const media = window.matchMedia as unknown as (q: string) => MediaQueryList;
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      ...media(query),
      matches: query.includes("prefers-reduced-motion"),
    }));

    const { unmount } = renderAt("/about");
    const video = getVideo()!;

    expect(video.getAttribute("poster")).toBe(logoMotion.endFrame);
    expect(video.hasAttribute("src")).toBe(false);
    expect(play).not.toHaveBeenCalled();
    // دکمۀ پخش برای کاربری که حرکت کمتر می‌خواهد نمایش داده نمی‌شود
    expect(screen.queryByRole("button", { name: /لوگوموشن/ })).toBeNull();
    unmount();
  });

  it("دکمه پخش/توقف با صفحه‌کلید قابل استفاده و دارای نام دسترس‌پذیر است", () => {
    const { unmount } = renderAt("/about");
    const button = screen.getByRole("button", { name: "پخش لوگوموشن" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");

    fireEvent.click(button);
    expect(play).toHaveBeenCalled();
    unmount();
  });

  it("ویدئو خودش کنترل بومی ندارد و فوکوس را نمی‌دزدد", () => {
    const { unmount } = renderAt("/about");
    const video = getVideo()!;
    expect(video.hasAttribute("controls")).toBe(false);
    expect(video.getAttribute("tabindex")).toBeNull();
    expect(video.hasAttribute("playsinline")).toBe(true);
    unmount();
  });
});

describe("حالت‌های خطا", () => {
  it("اگر پخش خودکار مسدود شود، فریم نهایی و دکمۀ پخش می‌ماند", async () => {
    play.mockImplementation(() => Promise.reject(new Error("NotAllowedError")));

    const { unmount } = renderAt("/about");
    await act(async () => {
      intersect(true);
      await Promise.resolve();
    });

    expect(getVideo()!.getAttribute("poster")).toBe(logoMotion.endFrame);
    expect(screen.getByRole("button", { name: "پخش لوگوموشن" })).toBeInTheDocument();
    unmount();
  });

  it("در صورت خطای فایل، لوگوی ثابت کامل نمایش داده می‌شود", () => {
    const { unmount } = renderAt("/about");
    fireEvent.error(getVideo()!);

    expect(document.querySelector("video")).toBeNull();
    const lockup = document.querySelector(`img[src='${brand.lockup.png}']`);
    expect(lockup).not.toBeNull();
    expect(lockup).toHaveAttribute("alt", brand.alt);
    unmount();
  });

  it("پس از پایان ویدئو، دکمۀ «پخش دوباره» می‌آید و از ابتدا پخش می‌کند", () => {
    const { unmount } = renderAt("/about");
    const video = getVideo()!;

    fireEvent.ended(video);
    const replay = screen.getByRole("button", { name: "پخش دوبارۀ لوگوموشن" });

    paused = true;
    fireEvent.click(replay);
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalled();
    unmount();
  });
});
