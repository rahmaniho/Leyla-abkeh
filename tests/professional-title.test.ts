import { describe, expect, it } from "vitest";
import { ARTICLES, getArticle } from "../src/content/articles";
import { PENDING_VERIFICATION, siteConfig, verification } from "../src/config/site";
import { render } from "../src/entry-server";
import { applyMetaInBrowser, buildAttorneySchema, buildLawyerMembershipSchema } from "../src/lib/seo";
import { buildLlmsFile, resolveRoute } from "../src/routes";

const ASSOCIATION = "کانون وکلای دادگستری قزوین";
const TITLE = `وکیل پایه یک دادگستری و عضو ${ASSOCIATION}`;

function renderedPage(path: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = render(path).html;
  return wrapper;
}

describe("عنوان حرفه‌ای و عضویت تأییدشده", () => {
  it("در منبع مرکزی ثبت شده و دیگر در فهرست نیازمند تأیید نیست", () => {
    expect(siteConfig.lawyer.jobTitle).toBe("وکیل پایه یک دادگستری");
    expect(siteConfig.lawyer.barAssociation).toBe(ASSOCIATION);
    expect(siteConfig.lawyer.professionalTitle).toBe(TITLE);
    expect(verification.barAssociation).toBe(false);
    expect(PENDING_VERIFICATION.map((item) => item.key)).not.toContain("lawyer.barAssociation");
  });

  it("در هیرو، سربرگ، پاورقی و برچسب‌های دسترس‌پذیری دیده می‌شود", () => {
    const home = renderedPage("/");
    expect(home.querySelector('[aria-labelledby="hero-title"]')?.textContent).toContain(TITLE);
    expect(home.querySelector("footer")?.textContent).toContain(TITLE);
    expect(home.querySelector('nav[aria-label="ناوبری اصلی"] a')?.getAttribute("aria-label")).toContain(TITLE);
    expect(home.querySelector("footer a")?.getAttribute("aria-label")).toContain(TITLE);
    expect(siteConfig.lawyer.photo.alt).toContain(TITLE);
  });

  it("صفحۀ درباره عنوان کامل دارد و اعلان قدیمیِ تأییدنشدن را نمایش نمی‌دهد", () => {
    const about = renderedPage("/about");
    expect(about.querySelector("h1")?.textContent).toContain(TITLE);
    expect(about.querySelector("main")?.textContent).toContain(TITLE);
    expect(about.textContent).not.toContain("عضویت در کانون وکلا پس از تأیید");
  });

  it("عنوان کامل در معرفی نویسندۀ مقاله و متن و alt مقالۀ معرفی به‌روز می‌شود", () => {
    const article = getArticle("behtarin-vakil-qazvin");
    expect(article).toBeDefined();
    expect(article?.body).toContain(TITLE);
    expect(article?.html).toContain(TITLE);
    expect(article?.coverAlt).toContain(TITLE);
    expect(article?.html).not.toContain("{{lawyer.professionalTitle}}");
    expect(article?.coverAlt).not.toContain("{{lawyer.professionalTitle}}");

    const page = renderedPage("/articles/behtarin-vakil-qazvin");
    const authorBox = [...page.querySelectorAll("aside")].find((aside) =>
      aside.textContent?.includes("این مقاله در دفتر وکالت")
    );
    expect(authorBox?.textContent).toContain(TITLE);
  });

  it("متای اصلی و درباره، alt اشتراک‌گذاری، و llms.txt از همان عنوان استفاده می‌کنند", () => {
    const home = resolveRoute("/").meta;
    const about = resolveRoute("/about").meta;
    expect(home.title).toContain(TITLE);
    expect(home.description).toContain(TITLE);
    expect(home.ogImageAlt).toContain(TITLE);
    expect(about.title).toContain(TITLE);
    expect(about.description).toContain(TITLE);
    expect(render("/").head).toContain(TITLE);
    expect(render("/about").head).toContain(TITLE);

    const llms = buildLlmsFile();
    expect(llms).toContain(`- عنوان: ${TITLE}`);
    expect(llms).not.toContain("تعرفۀ دقیق، عضویت کانون");
  });

  it("alt تصویر اشتراک‌گذاری هنگام جابه‌جایی کلاینتی هم به‌روز می‌شود", () => {
    const previousHead = document.head.innerHTML;
    try {
      const home = resolveRoute("/").meta;
      const article = resolveRoute("/articles/behtarin-vakil-qazvin").meta;
      applyMetaInBrowser(home);
      expect(document.head.querySelector('meta[property="og:image:alt"]')?.getAttribute("content")).toBe(home.ogImageAlt);
      applyMetaInBrowser(article);
      expect(document.head.querySelector('meta[property="og:image:alt"]')?.getAttribute("content")).toBe(article.ogImageAlt);
    } finally {
      document.head.innerHTML = previousHead;
    }
  });

  it("عضویت به شخص وکیل نسبت داده می‌شود، نه به دفتر وکالت", () => {
    const expectedMembership = { "@type": "Organization", name: ASSOCIATION };
    const attorney = buildAttorneySchema();
    expect(attorney).not.toHaveProperty("memberOf");
    expect(attorney.founder).toMatchObject({
      "@type": "Person",
      jobTitle: "وکیل پایه یک دادگستری",
      memberOf: expectedMembership,
    });
    expect(buildLawyerMembershipSchema(null)).toEqual({});

    const aboutPerson = resolveRoute("/about").meta.jsonLd?.find((item) => item["@type"] === "Person");
    expect(aboutPerson?.memberOf).toEqual(expectedMembership);

    for (const article of ARTICLES) {
      const schema = resolveRoute(`/articles/${article.slug}`).meta.jsonLd?.find((item) => item["@type"] === "Article");
      expect(schema?.author, article.slug).toMatchObject({
        "@type": "Person",
        jobTitle: "وکیل پایه یک دادگستری",
        memberOf: expectedMembership,
      });
    }
  });
});
