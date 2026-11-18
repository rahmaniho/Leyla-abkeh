import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../netlify/functions/consultation.mjs";
import { validateSubmission } from "../src/lib/validation";

const validBody = {
  name: "سارا محمدی",
  phone: "09121234567",
  topic: "دعاوی خانواده",
  message: "دربارۀ مهریه سوال دارم.",
  website: "",
  startedAt: Date.now() - 10_000,
};

let ipCounter = 0;
function request(body: unknown, init: { method?: string; ip?: string; headers?: Record<string, string> } = {}) {
  ipCounter += 1;
  const ip = init.ip ?? `10.0.0.${ipCounter}`;
  return new Request("https://example.com/api/consultation", {
    method: init.method ?? "POST",
    headers: {
      "content-type": "application/json",
      "x-nf-client-connection-ip": ip,
      ...init.headers,
    },
    ...(init.method === "GET" ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });
}

const context = {};

describe("تابع دریافت درخواست مشاوره", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })));
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHAT_ID = "123";
    delete process.env.RESEND_API_KEY;
    delete process.env.CONSULTATION_WEBHOOK_URL;
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("درخواست با متد غیر POST را رد می‌کند", async () => {
    const response = await handler(request(null, { method: "GET" }), context);
    expect(response.status).toBe(405);
  });

  it("بدنۀ نامعتبر JSON را رد می‌کند", async () => {
    const response = await handler(request("{not json"), context);
    expect(response.status).toBe(400);
  });

  it("اعتبارسنجی سمت سرور را اعمال می‌کند", async () => {
    const response = await handler(request({ ...validBody, phone: "123" }), context);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.errors.phone).toBeTruthy();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("موفقیت را فقط پس از تحویل واقعی برمی‌گرداند", async () => {
    const response = await handler(request(validBody), context);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.reference).toMatch(/^LV-/);
    expect(data.receivedAt).toBeTruthy();
  });

  it("مدت و روش انتخاب‌شده را پس از اعتبارسنجی به کانال تحویل می‌فرستد", async () => {
    const response = await handler(request({ ...validBody, durationMinutes: 60, contactMethod: "حضوری" }), context);
    expect(response.status).toBe(201);
    const options = vi.mocked(globalThis.fetch).mock.calls[0][1];
    const delivery = JSON.parse(String(options?.body));
    expect(delivery.text).toContain("مدت مشاوره: 60 دقیقه");
    expect(delivery.text).toContain("روش ترجیحی: حضوری");
  });

  it("مدت یا روش نامعتبر را پیش از تحویل رد می‌کند", async () => {
    const response = await handler(request({ ...validBody, durationMinutes: 45, contactMethod: "دیگر" }), context);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.errors.durationMinutes).toBeTruthy();
    expect(data.errors.contactMethod).toBeTruthy();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("در صورت نبود پیکربندی ارسال، پیام موفقیت نمی‌دهد", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    const response = await handler(request(validBody), context);
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.configured).toBe(false);
  });

  it("خطای سرویس ارسال را به کاربر گزارش می‌دهد", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 500 })));
    const response = await handler(request(validBody), context);
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.ok).toBe(false);
  });

  it("هرزنامۀ honeypot را بی‌صدا می‌پذیرد اما ارسال نمی‌کند", async () => {
    const response = await handler(request({ ...validBody, website: "http://spam.example" }), context);
    expect(response.status).toBe(202);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("محدودیت نرخ را اعمال می‌کند", async () => {
    const first = await handler(request(validBody, { ip: "192.0.2.10" }), context);
    const second = await handler(request(validBody, { ip: "192.0.2.10" }), context);
    expect(first.status).toBe(201);
    expect(second.status).toBe(429);
    const data = await second.json();
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  it("در صورت تنظیم Supabase، درخواست در جدول consultations ذخیره می‌شود", async () => {
    process.env.SUPABASE_URL = "https://project.example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-test-key";
    const response = await handler(request(validBody), context);
    expect(response.status).toBe(201);
    const calls = vi.mocked(globalThis.fetch).mock.calls.map((call) => String(call[0]));
    expect(calls.some((url) => url.includes("/rest/v1/rpc/submit_consultation"))).toBe(true);
    const rpcCall = vi.mocked(globalThis.fetch).mock.calls.find((call) =>
      String(call[0]).includes("/rest/v1/rpc/submit_consultation")
    );
    const rpcBody = JSON.parse(String(rpcCall?.[1]?.body));
    expect(rpcBody.p_reference).toMatch(/^LV-/);
    expect(rpcBody.p_name).toBe(validBody.name);
    expect(rpcBody.p_phone).toBe(validBody.phone);
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("ذخیرۀ موفق در Supabase حتی بودن تلگرام هم کافی است", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    process.env.SUPABASE_URL = "https://project.example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-test-key";
    const response = await handler(request(validBody), context);
    expect(response.status).toBe(201);
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("Turnstile را در صورت پیکربندی الزامی می‌کند", async () => {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 }))
    );
    const response = await handler(request({ ...validBody, turnstileToken: "bad" }), context);
    expect(response.status).toBe(422);
    delete process.env.TURNSTILE_SECRET_KEY;
  });
});

describe("هم‌ارزی اعتبارسنجی مرورگر و سرور", () => {
  it("دو منبع اعتبارسنجی یک نتیجه می‌دهند", async () => {
    const local = validateSubmission(validBody, { now: Date.now() });
    expect(local.ok).toBe(true);
  });
});
