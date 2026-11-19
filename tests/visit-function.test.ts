import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler, { sanitizePath } from "../netlify/functions/visit.mjs";

let ipCounter = 0;
function request(body: unknown, init: { method?: string; ip?: string; headers?: Record<string, string> } = {}) {
  ipCounter += 1;
  const ip = init.ip ?? `10.10.0.${ipCounter}`;
  return new Request("https://example.com/api/visit", {
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

describe("تابع شمارش بی‌نام بازدید", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })),
    );
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  it("درخواست با متد غیر POST را رد می‌کند", async () => {
    const response = await handler(request(null, { method: "GET" }), context);
    expect(response.status).toBe(405);
  });

  it("بدنۀ نامعتبر JSON را رد می‌کند", async () => {
    const response = await handler(request("{broken"), context);
    expect(response.status).toBe(400);
  });

  it("کوئری و هشتگ را از مسیر حذف و مسیر پاک را ثبت می‌کند", async () => {
    const response = await handler(request({ path: "/articles/test?utm_source=x#top" }), context);
    expect(response.status).toBe(204);
    const call = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(call[0])).toBe("https://example.supabase.co/rest/v1/rpc/record_visit");
    const sent = JSON.parse(String(call[1]?.body)) as { p_path: string };
    expect(sent.p_path).toBe("/articles/test");
  });

  it("مسیر نامعتبر را ساکت رد می‌کند و چیزی ثبت نمی‌شود", async () => {
    const response = await handler(request({ path: "/<script>alert(1)</script>" }), context);
    expect(response.status).toBe(204);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("مسیرهای /admin و /api شمارش نمی‌شوند", async () => {
    expect(sanitizePath("/admin")).toBeNull();
    expect(sanitizePath("/admin/login")).toBeNull();
    expect(sanitizePath("/api/consultation")).toBeNull();
    const response = await handler(request({ path: "/admin" }), context);
    expect(response.status).toBe(204);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("بدون پیکربندی سرور هم پاسخی نمی‌دهد که کاربر را نگران کند", async () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    const response = await handler(request({ path: "/contact" }), context);
    expect(response.status).toBe(204);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("سقوط RPC میزبان نباید خطا به کاربر برگرداند", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const response = await handler(request({ path: "/contact" }), context);
    expect(response.status).toBe(204);
  });

  it("حجم بیش از حد مجاز را رد می‌کند", async () => {
    const response = await handler(request({ path: "/x" }, { headers: { "content-length": "99999" } }), context);
    expect(response.status).toBe(413);
  });
});
