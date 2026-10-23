import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "../src/App";
import { render } from "../src/entry-server";

/**
 * آزمون هم‌خوانی hydration
 * ------------------------------------------------------------------
 * HTML پیش‌رندرشده را در jsdom قرار می‌دهد و همان درخت را hydrate می‌کند.
 * هر ناسازگاری بین خروجی سرور و کلاینت به‌صورت خطا در کنسول ظاهر می‌شود،
 * بنابراین این آزمون از خطاهای واقعی زمان بارگذاری جلوگیری می‌کند.
 */

const HYDRATION_PATTERN = /hydrat|did not match|server (?:rendered|html)|text content does not match/i;

let consoleErrors: string[] = [];
const originalError = console.error;
let roots: Root[] = [];
let containers: HTMLElement[] = [];

beforeEach(() => {
  consoleErrors = [];
  console.error = (...args: unknown[]) => {
    consoleErrors.push(args.map((arg) => String(arg)).join(" "));
  };
});

afterEach(() => {
  for (const root of roots) {
    act(() => root.unmount());
  }
  for (const container of containers) container.remove();
  roots = [];
  containers = [];
  console.error = originalError;
  window.history.replaceState({}, "", "/");
});

const paths = [
  "/",
  "/services",
  "/services/khanevadeh",
  "/services/chek-va-esnad",
  "/about",
  "/faq",
  "/pricing",
  "/contact",
  "/articles",
  "/articles/chek-bargashkhte-masir-haye-ghanooni",
  "/privacy",
  "/missing-page",
];

describe("hydration", () => {
  it.each(paths)("صفحهی %s بدون ناسازگاری hydration بارگذاری می‌شود", async (path) => {
    window.history.replaceState({}, "", path);

    const { html } = render(path);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div id="root">${html}</div>`;
    document.body.appendChild(wrapper);
    containers.push(wrapper);

    const container = wrapper.querySelector("#root") as HTMLElement;

    await act(async () => {
      roots.push(hydrateRoot(container, <App initialPath={path} />));
    });

    const hydrationErrors = consoleErrors.filter((message) => HYDRATION_PATTERN.test(message));
    expect(hydrationErrors).toEqual([]);
  });

  it("بدون جاوااسکریپت، محتوای پیش‌رندرشده در HTML وجود دارد", () => {
    const { html } = render("/services/keyfari");
    expect(html).toContain("دعاوی کیفری");
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("<h1");
  });
});
