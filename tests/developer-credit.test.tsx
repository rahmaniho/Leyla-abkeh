import { readFileSync } from "node:fs";
import path from "node:path";
import { act, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Footer from "../src/components/Footer";
import { siteConfig } from "../src/config/site";
import { withBase } from "../src/lib/base";
import { RouterProvider } from "../src/lib/router";

const assets = [
  { name: "mark.png", width: 256, height: 256 },
  { name: "wordmark-fa.png", width: 383, height: 96 },
  { name: "wordmark-en.png", width: 410, height: 48 },
];

function renderFooter() {
  return render(<RouterProvider><Footer /></RouterProvider>);
}

afterEach(() => vi.unstubAllGlobals());

describe("امضای توسعه‌دهندۀ پاورقی", () => {
  it("کنار کپی‌رایت قرار دارد و سایر متن‌های پاورقی را حفظ می‌کند", () => {
    renderFooter();
    const footer = screen.getByRole("contentinfo", { name: "پاورقی سایت" });
    const credit = within(footer).getByRole("link", { name: /طراحی و توسعه توسط کارن سافت.*KarenSoft/ });
    const copyright = within(footer).getByText(/تمامی حقوق محفوظ است/);

    expect(copyright).toHaveTextContent(siteConfig.lawyer.name);
    expect(credit.parentElement).toBe(copyright.parentElement);
    expect(within(footer).getByText("محتوای این سایت جنبۀ اطلاع‌رسانی عمومی دارد و جایگزین مشاورۀ حقوقی نیست.")).toBeInTheDocument();
    expect(within(footer).getByRole("navigation", { name: "لینک‌های سریع" })).toBeInTheDocument();
    expect(within(footer).getByRole("navigation", { name: "حوزه‌های فعالیت" })).toBeInTheDocument();
    expect(within(footer).getByAltText(siteConfig.brand.alt)).toBeInTheDocument();
  });

  it("لینک امن، نام دسترس‌پذیر، جهت لاتین و فوکوس صفحه‌کلید دارد", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /کارن سافت.*KarenSoft.*پنجرۀ جدید/ });
    expect(link).toHaveAttribute("href", "https://www.karen-soft.ir");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("dir", "ltr");
    expect(link).toHaveTextContent(/Designed\s*&\s*Developed by/);
    expect(link.tabIndex).toBe(0);
    link.focus();
    expect(link).toHaveFocus();
  });

  it("حرکت کوتاه را فقط با ورود امضا به قاب آغاز می‌کند و مشاهده‌گر را پاک می‌کند", () => {
    const count = (globalThis as unknown as { __observerCount: () => number }).__observerCount;
    const intersect = (globalThis as unknown as { __intersect: (visible: boolean) => void }).__intersect;
    const before = count();
    const view = renderFooter();
    const link = screen.getByRole("link", { name: /کارن سافت.*KarenSoft/ });
    expect(count()).toBe(before + 1);
    expect(link).not.toHaveClass("developer-credit--visible");
    act(() => intersect(true));
    expect(link).toHaveClass("developer-credit--visible");
    act(() => intersect(false));
    expect(link).not.toHaveClass("developer-credit--visible");
    view.unmount();
    expect(count()).toBe(before);
  });

  it("اگر مشاهده‌گر در مرورگر موجود نباشد، امضا همچنان نمایش داده می‌شود", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    renderFooter();
    expect(screen.getByRole("link", { name: /کارن سافت.*KarenSoft/ })).toHaveClass("developer-credit--visible");
  });

  it("از سه برش شفاف لوگوی اصلی با مسیر سازگار با base استفاده می‌کند", () => {
    renderFooter();
    const link = screen.getByRole("link", { name: /کارن سافت.*KarenSoft/ });
    const images = [...link.querySelectorAll("img")];
    expect(images).toHaveLength(3);

    assets.forEach(({ name, width, height }, index) => {
      const image = images[index];
      expect(image).toHaveAttribute("src", withBase(`/images/karensoft/${name}`));
      expect(image).toHaveAttribute("alt", "");
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("width", String(width));
      expect(image).toHaveAttribute("height", String(height));

      const png = readFileSync(path.join(process.cwd(), "public/images/karensoft", name));
      expect(png.toString("ascii", 12, 16)).toBe("IHDR");
      expect(png.readUInt32BE(16)).toBe(width);
      expect(png.readUInt32BE(20)).toBe(height);
      expect(png[25]).toBe(6); // RGBA؛ هنر اصلی روی پس‌زمینه حفظ می‌شود.
    });
  });
});
