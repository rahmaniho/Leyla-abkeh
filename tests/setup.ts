import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom این APIها را پیاده‌سازی نمی‌کند
interface RegisteredObserver {
  callback: IntersectionObserverCallback;
  target?: Element;
  instance: IntersectionObserver;
}

const registeredObservers: RegisteredObserver[] = [];

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds: ReadonlyArray<number> = [];
  private readonly record: RegisteredObserver;

  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, instance: this };
    registeredObservers.push(this.record);
  }

  observe(target: Element): void {
    this.record.target = target;
  }

  unobserve(): void {}

  disconnect(): void {
    const index = registeredObservers.indexOf(this.record);
    if (index >= 0) registeredObservers.splice(index, 1);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

/** ابزار آزمون: شبیه‌سازی ورود/خروج همهی بخش‌های مشاهده‌شده از قاب دید */
Object.defineProperty(globalThis, "__intersect", {
  writable: true,
  configurable: true,
  value: (isIntersecting: boolean) => {
    for (const record of [...registeredObservers]) {
      record.callback(
        [{ isIntersecting, target: record.target } as unknown as IntersectionObserverEntry],
        record.instance
      );
    }
  },
});

Object.defineProperty(globalThis, "__observerCount", {
  writable: true,
  configurable: true,
  value: () => registeredObservers.length,
});

Object.defineProperty(window, "scrollTo", { writable: true, value: vi.fn() });
Object.defineProperty(Element.prototype, "scrollIntoView", { writable: true, value: vi.fn() });
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});
