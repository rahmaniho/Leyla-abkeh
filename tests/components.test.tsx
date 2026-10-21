import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { primaryPhone, siteConfig } from "../src/config/site";
import { SERVICES } from "../src/content/services";

function renderAt(path: string) {
  return render(<App initialPath={path} />);
}

describe("صفحهٔ اصلی", () => {
  it("عنوان اصلی و اطلاعات وکیل را نشان می‌دهد", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("وکیل");
    expect(screen.getAllByText(siteConfig.lawyer.name).length).toBeGreaterThan(0);
  });

  it("لینک تماس با شمارهٔ صحیح و aria-label دارد", () => {
    renderAt("/");
    const links = screen.getAllByRole("link", { name: primaryPhone.ariaLabel });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", `tel:${siteConfig.contact.phoneE164}`);
    }
  });

  it("لینک پرش به محتوای اصلی وجود دارد", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "پرش به محتوای اصلی" })).toHaveAttribute("href", "#main");
  });

  it("هیچ دادهٔ تأییدنشده (آمار و نظرات) منتشر نمی‌شود", () => {
    renderAt("/");
    expect(screen.queryByText("نرخ موفقیت")).toBeNull();
    expect(screen.queryByText("پروندهٔ موفق")).toBeNull();
    expect(screen.queryByText("آنچه موکلان از تجربهٔ خود می‌گویند")).toBeNull();
    expect(screen.queryByText(/بیش از ۱۲ سال/)).toBeNull();
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

  it("با کلید Escape بسته می‌شود", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("button", { name: "باز کردن منوی ناوبری" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: "باز کردن منوی ناوبری" })).toBeInTheDocument();
  });
});

describe("صفحات خدمات", () => {
  it("هر خدمت صفحهٔ مستقل با H1 و FAQ دارد", () => {
    for (const service of SERVICES) {
      const { unmount } = renderAt(`/services/${service.slug}`);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(service.title);
      expect(screen.getByText("پرسش‌های متداول دربارهٔ " + service.title)).toBeInTheDocument();
      unmount();
    }
  });

  it("صفحهٔ فهرست خدمات به همهٔ صفحات خدمات لینک می‌دهد", () => {
    renderAt("/services");
    const main = document.getElementById("main") as HTMLElement;
    for (const service of SERVICES) {
      const links = within(main).getAllByRole("link", { name: service.title });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href", `/services/${service.slug}`);
    }
  });

  it("مسیر ناموجود صفحهٔ ۴۰۴ نشان می‌دهد", () => {
    renderAt("/nope");
    expect(screen.getByText("این صفحه پیدا نشد")).toBeInTheDocument();
    expect(document.title).toContain("پیدا نشد");
  });
});

describe("صفحهٔ تماس و فرم مشاوره", () => {
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
      target: { value: "دربارهٔ مهریه سوال دارم." },
    });
  }

  it("خطاهای اعتبارسنجی را زیر هر فیلد نشان می‌دهد", () => {
    renderAt("/contact");
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(screen.getByText("نام و نام خانوادگی را کامل وارد کنید.")).toBeInTheDocument();
    expect(screen.getByText(/شمارهٔ تماس معتبر نیست/)).toBeInTheDocument();
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveAttribute("aria-invalid", "true");
  });

  it("شمارهٔ نامعتبر را رد می‌کند و درخواستی ارسال نمی‌کند", () => {
    renderAt("/contact");
    fillForm();
    fireEvent.change(screen.getByLabelText("شماره تماس"), { target: { value: "12345" } });
    vi.setSystemTime(new Date(Date.now() + 5000));
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(screen.getByText(/شمارهٔ تماس معتبر نیست/)).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: /تماس تلفنی با دفتر/ })).toBeInTheDocument();
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
  it("صفحهٔ سوالات متداول، همهٔ پرسش‌ها را دارد", () => {
    renderAt("/faq");
    expect(screen.getAllByRole("button", { expanded: false }).length).toBeGreaterThan(0);
  });

  it("صفحهٔ تعرفه‌ها مبلغ را از منبع مرکزی نشان می‌دهد", () => {
    renderAt("/pricing");
    expect(screen.getAllByText(/۹۸۰٬۰۰۰/).length).toBeGreaterThan(0);
  });

  it("صفحهٔ مقالات، مقاله‌ها را فهرست می‌کند", () => {
    renderAt("/articles");
    expect(screen.getAllByRole("link", { name: /خواندن مقاله/ }).length).toBeGreaterThan(0);
  });

  it("صفحهٔ حریم خصوصی توضیح جمع‌آوری داده دارد", () => {
    renderAt("/privacy");
    expect(screen.getByText("چه اطلاعاتی دریافت می‌شود؟")).toBeInTheDocument();
  });
});
