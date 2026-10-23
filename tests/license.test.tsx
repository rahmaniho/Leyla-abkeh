import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";
import { siteConfig, verification } from "../src/config/site";
import { buildAttorneySchema } from "../src/lib/seo";

/**
 * آزمون شمارهی پروانهی وکالت
 * ------------------------------------------------------------------
 * شماره توسط مالک تأیید شده است (۲۳۷۰). این آزمون‌ها سه چیز را تضمین می‌کنند:
 * ۱. مقدار در منبع واحد درست است و دیگر «تأییدنشده» شمرده نمی‌شود.
 * ۲. در جایی که کاربر می‌بیند (کارت وکیل در Hero و صفحهی درباره) نمایش داده شود.
 * ۳. در دادهی ساختاریافته به‌صورت ماشین‌خوان بیاید — و اگر روزی از فهرست
 *    تأیید خارج شد، خودکار حذف شود.
 */

const renderAt = (p: string) => render(<App initialPath={p} />);

describe("شمارهی پروانه", () => {
  it("در منبع واحد ثبت شده و دیگر تأییدنشده نیست", () => {
    expect(siteConfig.lawyer.licenseNumber).toBe("۲۳۷۰");
    expect(siteConfig.lawyer.licenseNumberLatin).toBe("2370");
    expect(verification.licenseNumber).toBe(false);
  });

  it("از فهرست «نیازمند تأیید» حذف شده است", () => {
    const pending = JSON.parse(
      readFileSync(path.join(process.cwd(), "src", "config", "verification.json"), "utf8")
    ) as { key: string }[];

    expect(pending.map((item) => item.key)).not.toContain("lawyer.licenseNumber");
  });

  it("در کارت وکیل صفحهی اصلی نمایش داده می‌شود", () => {
    const { unmount } = renderAt("/");
    expect(screen.getAllByText("شمارهی پروانهی وکالت:").length).toBeGreaterThan(0);
    expect(screen.getAllByText("۲۳۷۰").length).toBeGreaterThan(0);
    unmount();
  });

  it("در کارت وکیل صفحهی «درباره» نمایش داده می‌شود", () => {
    const { unmount } = renderAt("/about");
    expect(screen.getAllByText("۲۳۷۰").length).toBeGreaterThan(0);
    unmount();
  });

  it("در دادهی ساختاریافته با ارقام لاتین می‌آید", () => {
    const schema = buildAttorneySchema() as Record<string, unknown>;
    const identifier = schema.identifier as { propertyID: string; value: string };

    expect(identifier.value).toBe("2370");
    expect(identifier.propertyID).toContain("پروانهی وکالت");
  });
});
