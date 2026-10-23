import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { indexablePaths } from "../src/routes";

function renderPage(path: string) {
  return render(<App initialPath={path} />);
}

const accessibleName = (element: Element): string => {
  const aria = element.getAttribute("aria-label")?.trim();
  if (aria) return aria;
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
  }
  return (element.textContent ?? "").trim();
};

describe("دسترس‌پذیری پایه در همۀ صفحات", () => {
  const paths = indexablePaths();

  it("هر صفحه دقیقاً یک H1 دارد", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      const h1s = document.querySelectorAll("h1");
      expect(h1s.length, `تعداد H1 در ${path}`).toBe(1);
      unmount();
    }
  });

  it("همۀ تصاویر alt دارند", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      for (const image of Array.from(document.querySelectorAll("img"))) {
        expect(image.getAttribute("alt"), `تصویر بدون alt در ${path}`).not.toBeNull();
      }
      unmount();
    }
  });

  it("همۀ لینک‌ها نام دسترس‌پذیر دارند", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      for (const link of Array.from(document.querySelectorAll("a"))) {
        expect(accessibleName(link), `لینک بدون نام در ${path}`).not.toBe("");
      }
      unmount();
    }
  });

  it("همۀ دکمه‌ها نام دسترس‌پذیر دارند", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      for (const button of Array.from(document.querySelectorAll("button"))) {
        expect(accessibleName(button), `دکمه بدون نام در ${path}`).not.toBe("");
      }
      unmount();
    }
  });

  it("هیچ شناسۀ تکراری در صفحه نیست", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
      expect(new Set(ids).size, `شناسۀ تکراری در ${path}`).toBe(ids.length);
      unmount();
    }
  });

  it("همۀ فیلدهای فرم برچسب دارند", () => {
    const { unmount } = renderPage("/contact");
    const form = document.querySelector("form");
    expect(form).not.toBeNull();

    const fields = Array.from(form!.querySelectorAll("input, select, textarea")).filter(
      (field) => field.getAttribute("type") !== "hidden"
    );
    expect(fields.length).toBeGreaterThan(3);

    for (const field of fields) {
      const id = field.getAttribute("id");
      const hasLabel = id ? Boolean(document.querySelector(`label[for="${id}"]`)) : false;
      const hasAria = Boolean(field.getAttribute("aria-label") || field.getAttribute("aria-labelledby"));
      expect(hasLabel || hasAria, `فیلد بدون برچسب: ${field.getAttribute("name")}`).toBe(true);
    }
    unmount();
  });

  it("لینک‌های خارجی target=_blank با rel امن هستند", () => {
    for (const path of paths) {
      const { unmount } = renderPage(path);
      for (const link of Array.from(document.querySelectorAll('a[target="_blank"]'))) {
        const rel = link.getAttribute("rel") ?? "";
        expect(rel).toContain("noopener");
        expect(rel).toContain("noreferrer");
      }
      unmount();
    }
  });

  it("هر بخش اصلی، سرتیتر دارد", () => {
    const { unmount } = renderPage("/");
    for (const section of Array.from(document.querySelectorAll("main section"))) {
      const labelled =
        section.getAttribute("aria-labelledby") || section.getAttribute("aria-label") || section.querySelector("h1,h2");
      expect(Boolean(labelled), "بخش بدون عنوان").toBe(true);
    }
    unmount();
  });
});
