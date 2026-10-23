import { createHash, randomBytes } from "node:crypto";
import { LIMITS, validateSubmission } from "./_lib/validation.mjs";

/**
 * تابع دریافت درخواست مشاوره
 * ------------------------------------------------------------------
 * - فقط POST
 * - اعتبارسنجی سمت سرور با همان منطق فرم (اعتماد به اعتبارسنجی مرورگر ممنوع)
 * - محدودیت نرخ درخواست بر پایهی IP (هش‌شده، در حافظهی نمونه)
 * - ضد‌هرزنامه: honeypot + زمان پر کردن فرم + (اختیاری) Cloudflare Turnstile
 * - ارسال اطلاع‌رسانی فقط از طریق متغیرهای محیطی سرور؛ هیچ کلیدی در فرانت‌اند نیست
 * - در صورت نبود پیکربندی ارسال، پاسخ موفقیت‌آمیز داده نمی‌شود (۵۰۳)
 */

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const MIN_INTERVAL_MS = 15 * 1000;
const MAX_BODY_BYTES = 10 * 1024;

/** @type {Map<string, number[]>} */
const rateBuckets = new Map();

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
  return createHash("sha256").update(`consultation:${ip}`).digest("hex").slice(0, 24);
}

function isRateLimited(key, now) {
  const timestamps = (rateBuckets.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  const last = timestamps[timestamps.length - 1] ?? 0;
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(key, timestamps);
    return { limited: true, retryAfter: Math.ceil((timestamps[0] + RATE_WINDOW_MS - now) / 1000) };
  }
  if (last && now - last < MIN_INTERVAL_MS) {
    rateBuckets.set(key, timestamps);
    return { limited: true, retryAfter: Math.ceil((MIN_INTERVAL_MS - (now - last)) / 1000) };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { limited: false, retryAfter: 0 };
}

function makeReference() {
  const time = Date.now().toString(36).toUpperCase();
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `LV-${time}-${random}`;
}

async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { enabled: false, passed: true };
  if (!token) return { enabled: true, passed: false };

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const outcome = await response.json();
    return { enabled: true, passed: outcome.success === true };
  } catch (error) {
    console.error(JSON.stringify({ event: "turnstile_error", message: String(error?.name) }));
    return { enabled: true, passed: false };
  }
}

function buildMessage(data, meta) {
  return [
    "📩 درخواست مشاورهی جدید از سایت",
    "",
    `نام: ${data.name}`,
    `تماس: ${data.phone}`,
    `موضوع: ${data.topic}`,
    data.message ? `شرح: ${data.message}` : "شرح: —",
    "",
    `کد پیگیری: ${meta.reference}`,
    `زمان: ${meta.receivedAtLocal}`,
    "منبع: فرم سایت",
  ].join("\n");
}

async function deliverTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8000),
  });
  return response.ok;
}

async function deliverEmail(subject, text) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULTATION_NOTIFY_EMAIL;
  const from = process.env.CONSULTATION_FROM_EMAIL;
  if (!apiKey || !to || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
    signal: AbortSignal.timeout(8000),
  });
  return response.ok;
}

async function deliverWebhook(payload) {
  const url = process.env.CONSULTATION_WEBHOOK_URL;
  if (!url) return false;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.CONSULTATION_WEBHOOK_SECRET
        ? { "x-consultation-secret": process.env.CONSULTATION_WEBHOOK_SECRET }
        : {}),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
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

  const rate = isRateLimited(hashIp(ip), now);
  if (rate.limited) {
    return json(429, {
      ok: false,
      message: "تعداد درخواست‌ها زیاد است. لطفاً چند دقیقه بعد دوباره تلاش کنید یا تلفنی تماس بگیرید.",
      retryAfter: rate.retryAfter,
    });
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

  if (payload && typeof payload === "object" && String(payload.website ?? "").length > 0) {
    // پاسخ یکسان با موفقیت برای جلوگیری از بازخورد به بات‌ها؛ هیچ اطلاعاتی ذخیره نمی‌شود.
    console.warn(JSON.stringify({ event: "consultation_honeypot" }));
    return json(202, { ok: true, reference: null, receivedAt: new Date(now).toISOString() });
  }

  const validation = validateSubmission(payload, { now });
  if (!validation.ok) {
    return json(422, { ok: false, errors: validation.errors, message: "اطلاعات فرم کامل یا معتبر نیست." });
  }

  const turnstile = await verifyTurnstile(payload.turnstileToken, ip);
  if (turnstile.enabled && !turnstile.passed) {
    return json(422, {
      ok: false,
      errors: { form: "اعتبارسنجی ضد‌هرزنامه ناموفق بود. صفحه را دوباره بارگذاری کنید." },
      message: "اعتبارسنجی ضد‌هرزنامه ناموفق بود.",
    });
  }

  const reference = makeReference();
  const receivedAt = new Date(now).toISOString();
  const receivedAtLocal = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Tehran",
  }).format(new Date(now));

  const text = buildMessage(validation.data, { reference, receivedAtLocal });
  const subject = `درخواست مشاورهی جدید — ${validation.data.topic} — ${reference}`;

  const configured =
    Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
    Boolean(process.env.RESEND_API_KEY && process.env.CONSULTATION_NOTIFY_EMAIL && process.env.CONSULTATION_FROM_EMAIL) ||
    Boolean(process.env.CONSULTATION_WEBHOOK_URL);

  if (!configured) {
    console.error(JSON.stringify({ event: "consultation_not_configured", reference }));
    return json(503, {
      ok: false,
      configured: false,
      message:
        "سامانهی ثبت درخواست هنوز پیکربندی نشده است. لطفاً تلفنی با دفتر تماس بگیرید تا درخواست شما ثبت شود.",
    });
  }

  const results = await Promise.allSettled([
    deliverTelegram(text),
    deliverEmail(subject, text),
    deliverWebhook({ reference, receivedAt, ...validation.data }),
  ]);

  const delivered = results.some((result) => result.status === "fulfilled" && result.value === true);
  const failures = results.filter(
    (result) => result.status === "rejected" || (result.status === "fulfilled" && result.value === false)
  ).length;

  console.log(
    JSON.stringify({
      event: "consultation_received",
      reference,
      receivedAt,
      delivered,
      channelFailures: failures,
    })
  );

  if (!delivered) {
    return json(502, {
      ok: false,
      message: "ارسال درخواست در این لحظه ممکن نشد. لطفاً دوباره تلاش کنید یا تلفنی تماس بگیرید.",
    });
  }

  return json(201, {
    ok: true,
    reference,
    receivedAt,
    message: "درخواست شما ثبت شد.",
  });
};

export const config = {
  path: "/api/consultation",
};

export const __testing = { LIMITS, isRateLimited, rateBuckets, makeReference, hashIp };
