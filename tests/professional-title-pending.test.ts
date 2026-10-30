import { afterEach, describe, expect, it, vi } from "vitest";

const ASSOCIATION = "کانون وکلای دادگستری قزوین";

afterEach(() => {
  vi.doUnmock("../src/config/verification.json");
  vi.resetModules();
});

describe("بازگشت عضویت به دروازۀ تأیید", () => {
  it("عضویت تأییدنشده از عنوان، صفحات، مقاله، متا و Schema حذف می‌شود", async () => {
    vi.resetModules();
    vi.doMock("../src/config/verification.json", async () => {
      const actual = await vi.importActual<{ default: { key: string; label: string; detail: string }[] }>(
        "../src/config/verification.json"
      );
      return {
        default: [...actual.default, { key: "lawyer.barAssociation", label: "عضویت", detail: "در انتظار تأیید" }],
      };
    });

    const { siteConfig, verification } = await import("../src/config/site");
    const { getArticle } = await import("../src/content/articles");
    const { buildAttorneySchema } = await import("../src/lib/seo");
    const { buildLlmsTxt } = await import("../src/lib/llms");
    const { render } = await import("../src/entry-server");

    expect(verification.barAssociation).toBe(true);
    expect(siteConfig.lawyer.barAssociation).toBeNull();
    expect(siteConfig.lawyer.professionalTitle).toBe("وکیل پایه یک دادگستری");
    expect(siteConfig.lawyer.photo.alt).not.toContain(ASSOCIATION);
    expect(siteConfig.site.defaultTitle).not.toContain(ASSOCIATION);
    expect(siteConfig.site.defaultDescription).not.toContain(ASSOCIATION);
    expect(buildAttorneySchema().founder).not.toHaveProperty("memberOf");

    const article = getArticle("behtarin-vakil-qazvin");
    expect(article?.body).not.toContain(ASSOCIATION);
    expect(article?.html).not.toContain(ASSOCIATION);
    expect(article?.coverAlt).not.toContain(ASSOCIATION);
    const llms = buildLlmsTxt([], siteConfig.site.url);
    expect(llms).not.toContain(ASSOCIATION);
    expect(llms).toContain("عضویت کانون");

    for (const path of ["/", "/about", "/articles/behtarin-vakil-qazvin"]) {
      const page = render(path);
      expect(page.html, path).not.toContain(ASSOCIATION);
      expect(page.head, path).not.toContain(ASSOCIATION);
    }
  });
});
