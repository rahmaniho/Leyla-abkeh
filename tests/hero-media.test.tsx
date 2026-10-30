import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeroMedia from "../src/components/HeroMedia";
import App from "../src/App";
import { siteConfig } from "../src/config/site";
import { meta as homeMeta } from "../src/pages/Home";

const { hero } = siteConfig.media;
const originalPaused = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "paused")!;
const originalConnection = Object.getOwnPropertyDescriptor(navigator, "connection");
const play = vi.fn();
const pause = vi.fn();
const load = vi.fn();
let paused = true;

function video() {
  return document.querySelector("video[data-hero-video]") as HTMLVideoElement;
}

function intersect(visible: boolean) {
  act(() => {
    (globalThis as unknown as { __intersect: (value: boolean) => void }).__intersect(visible);
  });
}

beforeEach(() => {
  paused = true;
  play.mockReset().mockImplementation(() => {
    paused = false;
    return Promise.resolve();
  });
  pause.mockReset().mockImplementation(() => { paused = true; });
  load.mockReset().mockImplementation(() => { paused = true; });
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
  vi.unstubAllGlobals();
  Object.defineProperty(HTMLMediaElement.prototype, "paused", originalPaused);
  if (originalConnection) Object.defineProperty(navigator, "connection", originalConnection);
  else delete (navigator as Navigator & { connection?: unknown }).connection;
});

describe("فوتیج هیرو", () => {
  it("ابتدا پوستر محلی را نشان می‌دهد و فایل ویدئو را زودهنگام دریافت نمی‌کند", () => {
    render(<HeroMedia />);
    const element = video();
    expect(element).toHaveAttribute("poster", hero.poster);
    expect(element).toHaveAttribute("preload", "none");
    expect(element).toHaveAttribute("loop");
    expect(element).toHaveAttribute("playsinline");
    expect(element.muted).toBe(true);
    expect(element).not.toHaveAttribute("src");
    expect(element.querySelector("source")).toBeNull();
    expect(document.querySelector(`img[src='${hero.poster}']`)).toHaveAttribute("alt", "");
    expect(homeMeta.preloadImage?.href).toBe(hero.poster);
    expect(play).not.toHaveBeenCalled();
  });

  it("با ورود به قاب دید پخش می‌شود و انتخاب توقف کاربر با بازگشت حفظ می‌شود", () => {
    render(<HeroMedia />);
    intersect(true);
    expect(video()).toHaveAttribute("src", hero.sources[0]);
    expect(load).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();

    fireEvent.play(video());
    fireEvent.playing(video());
    expect(video()).toHaveClass("opacity-100");
    fireEvent.click(screen.getByRole("button", { name: "توقف ویدئوی پس‌زمینه" }));
    expect(pause).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "پخش ویدئوی پس‌زمینه" })).toBeInTheDocument();

    intersect(false);
    intersect(true);
    expect(play).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "پخش ویدئوی پس‌زمینه" }));
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("با خروج از قاب دید یا پنهان شدن برگه متوقف و با بازگشت ادامه می‌یابد", () => {
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    render(<HeroMedia />);
    intersect(true);
    intersect(false);
    expect(pause).toHaveBeenCalledTimes(1);
    intersect(true);
    expect(play).toHaveBeenCalledTimes(2);

    hidden = true;
    fireEvent(document, new Event("visibilitychange"));
    expect(pause).toHaveBeenCalledTimes(2);
    hidden = false;
    fireEvent(document, new Event("visibilitychange"));
    expect(play).toHaveBeenCalledTimes(3);
  });

  it("در ترجیح کاهش حرکت بارگذاری خودکار ندارد، اما کاربر می‌تواند پخش را انتخاب کند", () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query),
      matches: query.includes("prefers-reduced-motion"),
    }));
    render(<HeroMedia />);
    intersect(true);
    expect(video()).not.toHaveAttribute("src");
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "پخش ویدئوی پس‌زمینه" }));
    expect(video()).toHaveAttribute("src", hero.sources[0]);
    expect(play).toHaveBeenCalledOnce();
  });

  it.each([
    { saveData: true, effectiveType: "4g" },
    { saveData: false, effectiveType: "2g" },
  ])("در تنظیم صرفه‌جویی داده یا اتصال کند پخش خودکار ندارد: %o", (connection) => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
    render(<HeroMedia />);
    intersect(true);
    expect(video()).not.toHaveAttribute("src");
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "پخش ویدئوی پس‌زمینه" }));
    expect(play).toHaveBeenCalledOnce();
  });

  it("با فعال شدن صرفه‌جویی داده هنگام پخش خودکار، دریافت را متوقف می‌کند", () => {
    let saveData = false;
    let onChange: (() => void) | undefined;
    Object.defineProperty(navigator, "connection", {
      configurable: true,
      value: {
        get saveData() { return saveData; },
        effectiveType: "4g",
        addEventListener: (_type: string, callback: () => void) => { onChange = callback; },
        removeEventListener: vi.fn(),
      },
    });
    render(<HeroMedia />);
    intersect(true);
    fireEvent.playing(video());
    saveData = true;
    act(() => onChange?.());
    expect(pause).toHaveBeenCalledOnce();
    expect(video()).not.toHaveAttribute("src");
    expect(video()).toHaveClass("opacity-0");
    saveData = false;
    act(() => onChange?.());
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("با فعال شدن کاهش حرکت هنگام پخش، دریافت را متوقف و پوستر را جایگزین می‌کند", () => {
    let matches = false;
    let onChange: (() => void) | undefined;
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query),
      get matches() { return matches; },
      addEventListener: (_type, callback) => { onChange = callback as () => void; },
      removeEventListener: vi.fn(),
    }));

    render(<HeroMedia />);
    intersect(true);
    fireEvent.play(video());
    fireEvent.playing(video());
    matches = true;
    act(() => onChange?.());
    expect(pause).toHaveBeenCalledOnce();
    expect(video()).not.toHaveAttribute("src");
    expect(video()).toHaveClass("opacity-0");
  });

  it("اگر پخش خودکار مسدود شود، پوستر و دکمۀ پخش سالم می‌مانند", async () => {
    play.mockImplementation(() => Promise.reject(new Error("NotAllowedError")));
    render(<HeroMedia />);
    await act(async () => {
      intersect(true);
      await Promise.resolve();
    });
    expect(video()).toHaveClass("opacity-0");
    expect(screen.getByRole("button", { name: "پخش ویدئوی پس‌زمینه" })).toBeInTheDocument();
  });

  it("در صورت خطای پیاپی، منابع دیگر را امتحان و در نهایت پوستر را حفظ می‌کند", () => {
    render(<HeroMedia />);
    intersect(true);
    fireEvent.error(video());
    expect(video()).toHaveAttribute("src", hero.sources[1]);
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent.error(video());
    expect(video()).toHaveAttribute("src", hero.sources[2]);
    expect(play).toHaveBeenCalledTimes(3);
    fireEvent.error(video());
    expect(document.querySelector(`img[src='${hero.poster}']`)).toBeInTheDocument();
    expect(video()).toHaveClass("opacity-0");
    expect(screen.queryByRole("button", { name: /ویدئوی پس‌زمینه/ })).toBeNull();
  });

  it("خطای منبع هنگام توقف دستی، پخش را بی‌اجازۀ کاربر از سر نمی‌گیرد", () => {
    render(<HeroMedia />);
    intersect(true);
    fireEvent.play(video());
    fireEvent.click(screen.getByRole("button", { name: "توقف ویدئوی پس‌زمینه" }));
    fireEvent.error(video());
    expect(video()).toHaveAttribute("src", hero.sources[1]);
    expect(play).toHaveBeenCalledOnce();
  });

  it("تیتر، پرترۀ رسمی، پروانه و راه‌های ارتباطی در هیرو حفظ شده‌اند", () => {
    render(<App initialPath="/" />);
    const section = screen.getByRole("region", { name: /وکیل خانواده، کیفری/ });
    expect(section.querySelector(`img[alt='${siteConfig.lawyer.photo.alt}']`)).toBeInTheDocument();
    expect(section).toHaveTextContent(siteConfig.lawyer.licenseNumber!);
    expect(section).toHaveTextContent(siteConfig.contact.address.full);
    expect(section.querySelector(`a[href='tel:${siteConfig.contact.phoneE164}']`)).toBeInTheDocument();
    expect(section.querySelector("a[href='/contact/']")).toBeInTheDocument();
  });
});
