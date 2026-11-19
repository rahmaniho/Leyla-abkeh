import { createHash } from "node:crypto";

/**
 * شمارش بی‌نام بازدید صفحات
 * ------------------------------------------------------------------
 * - فقط POST؛ مسیر صفحه (path) بررسی و پاک‌سازی می‌شود.
 * - هیچ کوکی، IP یا هدر کاربردی ذخیره نمی‌شود؛ حداکثر «شمارنده روزانه به تفکیک مسیر» نگه داشته می‌شود.
 * - محدودیت نرخ بر پایه IP هش‌شده (در حافظه نمونه)؛ خطاهای داخلی هرگز به کاربر بازخورد منفی نمی‌دهند.
 * - ذخیره از طریق RPC با security definer انجام می‌شود؛ هیچ دسترسی مستقیمی به جدول داده نمی‌شود.
 */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 120;
const MAX_BODY_BYTES = 2 * 1024;
const PATH_RE = /^\/[A-Za-z0-9._~/%-]{0,127}$/;

/** @type {Map<string, number[]>} */
const rateBuckets = new Map();

const noContent = () =>
  new Response(null, {
    status: 204,
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });

function hashIp(ip) {
  return createHash("sha256").update(`visit:${ip}`).digest("hex").slice(0, 24);
}

function isRateLimited(key, now) {
  const timestamps = (rateBuckets.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return false;
}

/** مسیر را از کوئری/هشتگ جدا و اعتبارسنجی می‌کند؛ نامعتبر → null */
export function sanitizePath(raw) {
  if (typeof raw !== "string") return null;
  const clean = raw.split("?")[0].split("#")[0].slice(0, 128);
  if (!PATH_RE.test(clean)) return null;
  if (clean === "/admin" || clean.startsWith("/admin/") || clean.startsWith("/api/")) return null;
  return clean;
}

async function recordVisit(path) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;

  const response = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/record_visit`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ p_path: path }),
    signal: AbortSignal.timeout(5000),
  });
  return response.ok;
}

export default async (req) => {
  if (req.method !== "POST") {
    return json(405, { ok: false, message: "متد پشتیبانی نمی‌شود." });
  }

  const now = Date.now();
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(hashIp(ip), now)) {
    // ساکت رد می‌شود؛ شمارش بازدید نباید تجربه کاربر را مختل کند
    return noContent();
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { ok: false, message: "حجم درخواست بیش از حد مجاز است." });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { ok: false, message: "داده‌های ارسالی معتبر نیست." });
  }

  const path = sanitizePath(payload?.path);
  if (!path) {
    // مسیر نامعتبر یا غیرمجاز: ساکت رد می‌شود
    return noContent();
  }

  try {
    await recordVisit(path);
  } catch (error) {
    console.error(JSON.stringify({ event: "visit_record_error", message: String(error?.name) }));
  }

  return noContent();
};
