import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { primaryPhone, siteConfig } from "../src/config/site";
import { SERVICES } from "../src/content/services";
import { ARTICLES, articlePath } from "../src/content/articles";
import { PRACTICE_GROUPS } from "../src/content/practices";

function renderAt(path: string) {
  return render(<App initialPath={path} />);
}

describe("صفحۀ اصلی", () => {
  it("عنوان اصلی و اطلاعات وکیل را نشان می‌دهد", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("وکیل");
    expect(screen.getAllByText(siteConfig.lawyer.name).length).toBeGreaterThan(0);
  });

  it("شمارۀ تأییدشدۀ دفتر با لینک tel درست نمایش داده می‌شود", () => {
    const { unmount } = renderAt("/");

    // شمارۀ واقعی دفتر (تأییدشده توسط مالک)
    expect(primaryPhone?.e164).toBe("+989900925811");

    const telLinks = Array.from(document.querySelectorAll("a[href^='tel:']"));
    expect(telLinks.length).toBeGreaterThan(0);
    for (const link of telLinks) {
      expect(link.getAttribute("href")).toBe("tel:+989900925811");
    }

    // شمارۀ نمونۀ قدیمی هرگز نباید در صفحه بماند
    expect(document.body.innerHTML).not.toContain("09121234567");
    expect(document.body.innerHTML).not.toContain("+989121234567");
    unmount();
  });

  it("شماره به شکل فارسی و خوانا نمایش داده می‌شود", () => {
    const { unmount } = renderAt("/contact");
    expect(primaryPhone?.display).toBe("۰۹۹۰ ۰۹۲ ۵۸۱۱");
    expect(document.body.textContent).toContain("۰۹۹۰ ۰۹۲ ۵۸۱۱");
    unmount();
  });

  it("ایمیل، واتساپ و نقشۀ مختصات در صفحۀ تماس موجود است", () => {
    const { unmount } = renderAt("/contact");

    const email = document.querySelector('a[href="mailto:info@leyla-abkeh.ir"]');
    expect(email).not.toBeNull();

    // واتساپ از همان شمارۀ تأییدشده ساخته می‌شود
    const whatsapp = document.querySelector('a[href^="https://wa.me/"]');
    expect(whatsapp?.getAttribute("href")).toBe("https://wa.me/989900925811");

    // نقشه بر پایۀ مختصات تأییدشده
    const map = Array.from(document.querySelectorAll("a[href*='google.com/maps']")).map((a) =>
      a.getAttribute("href")
    );
    expect(map.some((href) => href?.includes("36.2665941") && href?.includes("50.0236544"))).toBe(
      true
    );

    expect(document.body.textContent).toContain("مجتمع تجاری نیایش");
    unmount();
  });

  it("صفحۀ تماس، نشانی تأییدشده را «تأییدنشده» معرفی نمی‌کند", () => {
    const { unmount } = renderAt("/contact");
    const text = document.body.textContent ?? "";

    // نشانی و مختصات تأیید شده‌اند؛ تنها ساعات کاری تأییدنشده می‌ماند
    expect(text).not.toContain("نشانی و ساعات کاری این صفحه هنوز تأیید نهایی نشده");
    expect(text).toContain("ساعات کاری این صفحه هنوز تأیید نهایی نشده");
    unmount();
  });

  it("لینک پرش به محتوای اصلی وجود دارد", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "پرش به محتوای اصلی" })).toHaveAttribute("href", "#main");
  });

  it("هیچ دادۀ تأییدنشده (آمار و نظرات) منتشر نمی‌شود", () => {
    renderAt("/");
    expect(screen.queryByText("نرخ موفقیت")).toBeNull();
    expect(screen.queryByText("پروندۀ موفق")).toBeNull();
    expect(screen.queryByText("آنچه موکلان از تجربۀ خود می‌گویند")).toBeNull();
    expect(screen.queryByText(/بیش از ۱۲ سال/)).toBeNull();
  });

  it("نقشۀ انواع دعاوی حقوقی را نشان می‌دهد و به صفحه‌های خدمت لینک می‌دهد", () => {
    const { unmount } = renderAt("/");
    const main = document.getElementById("main") as HTMLElement;

    expect(
      within(main).getByRole("heading", { name: "انواع دعاوی حقوقی، دسته‌بندی‌شده" })
    ).toBeInTheDocument();

    for (const group of PRACTICE_GROUPS) {
      const links = within(main)
        .getAllByRole("link", { name: group.title })
        .map((link) => link.getAttribute("href"));
      expect(links, `پیوند خدمت ${group.service} در نقشه نیست`).toContain(
        `/services/${group.service}/`
      );
    }

    // گروه‌هایی که مقالۀ توضیحی دارند، به همان مقاله پیوند می‌دهند
    const linked = PRACTICE_GROUPS.flatMap((group) =>
      group.claims.filter((claim) => claim.article).map((claim) => claim.article as string)
    );
    expect(linked.length).toBeGreaterThan(0);
    for (const article of linked) {
      expect(
        Array.from(main.querySelectorAll("a")).some(
          (anchor) => anchor.getAttribute("href") === `/articles/${article}/`
        ),
        `پیوند مقالۀ ${article} در نقشه پیدا نشد`
      ).toBe(true);
    }

    unmount();
  });

  it("همۀ حوزه‌های فعالیت روی صفحۀ اصلی دیده می‌شوند", () => {
    const { unmount } = renderAt("/");
    const main = document.getElementById("main") as HTMLElement;
    for (const service of SERVICES) {
      expect(
        within(main).getAllByRole("link", { name: service.title }).length,
        `حوزۀ ${service.slug} در صفحه اصلی نیست`
      ).toBeGreaterThan(0);
    }
    unmount();
  });

  it("فرم ارسال واقعی دارد و پیام موفقیت کاذب نشان نمی‌دهد", () => {
    renderAt("/");
    expect(screen.queryByText("درخواست شما ثبت شد")).toBeNull();
    expect(screen.getByRole("form", { name: "فرم درخواست مشاوره" })).toBeInTheDocument();
  });
});

describe("ناوبری موبایل", () => {
  it("در حالت بسته inert است و با دکمه باز می‌شود", () => {
    renderAt("/");
    const toggle = screen.getByRole("button", { name: "باز کردن منوی ناوبری" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const menu = document.getElementById("mobile-menu");
    expect(menu).toHaveAttribute("inert");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "بستن منوی ناوبری" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(menu).not.toHaveAttribute("inert");
  });

  it("با کلید Escape بسته می‌شود و فوکوس به دکمۀ منو برمی‌گردد", () => {
    renderAt("/");
    const toggle = screen.getByRole("button", { name: "باز کردن منوی ناوبری" });
    fireEvent.click(toggle);
    fireEvent.keyDown(document, { key: "Escape" });

    const reopened = screen.getByRole("button", { name: "باز کردن منوی ناوبری" });
    expect(reopened).toBeInTheDocument();
    expect(document.activeElement).toBe(reopened);
    expect(reopened).toHaveAttribute("aria-expanded", "false");
  });
});

describe("صفحات خدمات", () => {
  it("هر خدمت صفحۀ مستقل با H1 و FAQ دارد", () => {
    for (const service of SERVICES) {
      const { unmount } = renderAt(`/services/${service.slug}`);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(service.title);
      expect(screen.getByText("پرسش‌های متداول دربارۀ " + service.title)).toBeInTheDocument();
      unmount();
    }
  });

  it("صفحۀ فهرست خدمات به همۀ صفحات خدمات لینک می‌دهد", () => {
    renderAt("/services");
    const main = document.getElementById("main") as HTMLElement;
    for (const service of SERVICES) {
      const links = within(main).getAllByRole("link", { name: service.title });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href", `/services/${service.slug}/`);
    }
  });

  it("مسیر ناموجود صفحۀ ۴۰۴ نشان می‌دهد", () => {
    renderAt("/nope");
    expect(screen.getByText("این صفحه پیدا نشد")).toBeInTheDocument();
    expect(document.title).toContain("پیدا نشد");
  });
});

describe("صفحۀ تماس و فرم مشاوره", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.fetch = originalFetch;
  });

  function fillForm() {
    fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
      target: { value: "سارا محمدی" },
    });
    fireEvent.change(screen.getByLabelText("شماره تماس"), {
      target: { value: "۰۹۱۲۱۲۳۴۵۶۷" },
    });
    fireEvent.change(screen.getByLabelText("موضوع پرونده"), {
      target: { value: "دعاوی خانواده" },
    });
    fireEvent.change(screen.getByLabelText(/شرح کوتاه موضوع/), {
      target: { value: "دربارۀ مهریه سوال دارم." },
    });
  }

  it("خطاهای اعتبارسنجی را زیر هر فیلد نشان می‌دهد", () => {
    renderAt("/contact");
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(screen.getByText("نام و نام خانوادگی را کامل وارد کنید.")).toBeInTheDocument();
    expect(screen.getByText(/شمارۀ تماس معتبر نیست/)).toBeInTheDocument();
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveAttribute("aria-invalid", "true");
  });

  it("شمارۀ نامعتبر را رد می‌کند و درخواستی ارسال نمی‌کند", () => {
    renderAt("/contact");
    fillForm();
    fireEvent.change(screen.getByLabelText("شماره تماس"), { target: { value: "12345" } });
    vi.setSystemTime(new Date(Date.now() + 5000));
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(screen.getByText(/شمارۀ تماس معتبر نیست/)).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("پس از پاسخ موفق سرور، کد پیگیری نمایش می‌دهد", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          reference: "LV-TEST-123",
          receivedAt: "2026-10-21T10:00:00.000Z",
        }),
        { status: 201, headers: { "content-type": "application/json" } }
      )
    );

    renderAt("/contact");
    fillForm();
    vi.setSystemTime(new Date(Date.now() + 5000));
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(await screen.findByText("درخواست شما ثبت شد", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText("LV-TEST-123")).toBeInTheDocument();

    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const payload = JSON.parse(String(init?.body));
    expect(payload.phone).toBe("۰۹۱۲۱۲۳۴۵۶۷");
    expect(payload.website).toBe("");
  });

  it("در صورت خطای سرور، پیام خطا می‌دهد و اطلاعات فرم را حفظ می‌کند", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, message: "ارسال درخواست در این لحظه ممکن نشد." }),
        { status: 502, headers: { "content-type": "application/json" } }
      )
    );

    renderAt("/contact");
    fillForm();
    vi.setSystemTime(new Date(Date.now() + 5000));
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(
      await screen.findByText("ارسال درخواست در این لحظه ممکن نشد.", {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.queryByText("درخواست شما ثبت شد")).toBeNull();
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue("سارا محمدی");
    expect(screen.getByLabelText("شماره تماس")).toHaveValue("۰۹۱۲۱۲۳۴۵۶۷");
    // مسیر جایگزین تماس تلفنی (شماره اکنون تأیید شده است)
    expect(screen.getByRole("link", { name: /تماس تلفنی با دفتر/ })).toBeInTheDocument();
  });

  it("اگر مسیر تابع وجود نداشته باشد (استقرار ایستا) پیام «فعال نیست» نشان می‌دهد", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response("<!doctype html><title>404</title>", {
        status: 404,
        headers: { "content-type": "text/html" },
      })
    );

    renderAt("/contact");
    fillForm();
    vi.setSystemTime(new Date(Date.now() + 5000));
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(
      await screen.findByText(/ثبت آنلاین درخواست در این نسخۀ سایت فعال نیست/, {}, { timeout: 3000 })
    ).toBeInTheDocument();
    expect(screen.queryByText("درخواست شما ثبت شد")).toBeNull();
    // اطلاعات فرم نباید از دست برود
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue("سارا محمدی");
  });

  it("در حین ارسال، دکمه غیرفعال می‌شود (جلوگیری از ارسال تکراری)", async () => {
    let resolveFetch: (value: Response) => void = () => {};
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise<Response>((resolve) => { resolveFetch = resolve; })
    );

    renderAt("/contact");
    fillForm();
    vi.setSystemTime(new Date(Date.now() + 5000));
    const form = screen.getByRole("form", { name: "فرم درخواست مشاوره" });
    fireEvent.submit(form);

    const button = await screen.findByRole("button", { name: /در حال ارسال/ });
    expect(button).toBeDisabled();

    resolveFetch(
      new Response(JSON.stringify({ ok: true, reference: "LV-XYZ", receivedAt: "2026-10-21T10:00:00.000Z" }), {
        status: 201,
      })
    );
    expect(await screen.findByText("درخواست شما ثبت شد", {}, { timeout: 3000 })).toBeInTheDocument();
  });
});

describe("صفحات محتوایی", () => {
  it("صفحۀ سوالات متداول، همۀ پرسش‌ها را دارد", () => {
    renderAt("/faq");
    expect(screen.getAllByRole("button", { expanded: false }).length).toBeGreaterThan(0);
  });

  it("صفحۀ تعرفه‌ها تا تأیید دفتر هیچ رقم تأییدنشده‌ای نشان نمی‌دهد", () => {
    renderAt("/pricing");
    expect(screen.queryByText(/۹۸۰٬۰۰۰/)).toBeNull();
    expect(screen.getAllByText(/اعلام پیش از جلسه/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/مشاورۀ اولیۀ تلفنی رایگان/)).toBeNull();
  });

  it("صفحۀ مقالات، مقاله‌ها را فهرست می‌کند", () => {
    renderAt("/articles");
    expect(screen.getAllByRole("link", { name: /خواندن مقاله/ }).length).toBeGreaterThan(0);
  });

  it("کارت هر مقاله تصویر شاخص با نسخۀ AVIF/WebP و بارگذاری تنبل دارد", () => {
    renderAt("/articles");
    const cards = document.querySelectorAll("article picture");
    expect(cards.length).toBe(ARTICLES.length);

    for (const picture of Array.from(cards)) {
      const types = Array.from(picture.querySelectorAll("source")).map((source) =>
        source.getAttribute("type")
      );
      expect(types).toEqual(["image/avif", "image/webp"]);

      const image = picture.querySelector("img") as HTMLImageElement;
      expect(image.getAttribute("src")).toMatch(/^\/images\/covers\/.+\.jpg$/);
      expect(image.getAttribute("srcset")).toContain("640w");
      expect(image.getAttribute("loading")).toBe("lazy");
      expect(image.getAttribute("width")).toBe("1200");
      expect(image.getAttribute("height")).toBe("630");
      // تصویر تزئینی است؛ نام مقاله در لینک عنوان آمده است
      expect(image.getAttribute("alt")).toBe("");
    }
  });

  it("صفحۀ مقاله تصویر شاخص با alt توصیفی و بارگذاری با اولویت بالا دارد", () => {
    const article = ARTICLES[0];
    renderAt(articlePath(article.slug));

    const picture = document.querySelector("article picture") as HTMLElement;
    expect(picture).not.toBeNull();

    const image = picture.querySelector("img") as HTMLImageElement;
    expect(image.getAttribute("alt")).toBe(article.coverAlt);
    expect(image.getAttribute("fetchpriority")).toBe("high");
    expect(image.getAttribute("src")).toBe(article.cover);
    expect(picture.querySelectorAll("source").length).toBe(2);
  });

  it("صفحۀ حریم خصوصی توضیح جمع‌آوری داده دارد", () => {
    renderAt("/privacy");
    expect(screen.getByText("چه اطلاعاتی دریافت می‌شود؟")).toBeInTheDocument();
  });
});
