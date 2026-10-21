import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { ARTICLES, articlePath } from "../src/content/articles";
import { SERVICES, servicePath } from "../src/content/services";

/**
 * آزمون خودکار axe روی صفحات کلیدی.
 * jsdom چیدمان واقعی ندارد، بنابراین قواعد وابسته به رنگ/چیدمان
 * (color-contrast و …) غیرفعال‌اند؛ کنتراست به‌صورت محاسبهٔ مستقل بررسی شده است.
 */
const DISABLED_RULES = {
  "color-contrast": { enabled: false },
  "landmark-one-main": { enabled: false },
  region: { enabled: false },
};

const PAGES = [
  "/",
  "/services",
  servicePath(SERVICES[0].slug),
  "/about",
  "/articles",
  articlePath(ARTICLES[0].slug),
  "/faq",
  "/pricing",
  "/contact",
  "/privacy",
  "/404",
];

describe("axe — دسترس‌پذیری خودکار", () => {
  for (const path of PAGES) {
    it(`بدون نقض جدی در ${path}`, async () => {
      const { container, unmount } = render(<App initialPath={path} />);

      const results = await axe.run(container, {
        rules: DISABLED_RULES,
        resultTypes: ["violations"],
      });

      const serious = results.violations
        .filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))
        .map((violation) => `${violation.id}: ${violation.nodes.length} مورد`);

      expect(serious, `نقض‌های جدی در ${path}`).toEqual([]);
      unmount();
    }, 20_000);
  }
});
