import { siteConfig } from "../config/site";

export interface ConsultationPayload {
  name: string;
  phone: string;
  topic: string;
  durationMinutes?: number;
  contactMethod?: string;
  message?: string;
  /** فیلد تلۀ هرزنامه؛ باید خالی بماند */
  website?: string;
  startedAt?: number;
  turnstileToken?: string;
}

export interface ConsultationSuccess {
  ok: true;
  reference: string | null;
  receivedAt: string;
  message?: string;
}

export interface ConsultationFailure {
  ok: false;
  message: string;
  errors?: Record<string, string>;
  retryAfter?: number;
  /**
   * سرور دریافت درخواست در این استقرار فعال نیست (نسخۀ ایستا یا
   * پیکربندی‌نشده). این حالت از «خطای شبکه» جدا گزارش می‌شود تا پیام
   * به کاربر درست و قابل اقدام باشد.
   */
  unavailable?: boolean;
}

export type ConsultationResult = ConsultationSuccess | ConsultationFailure;

const TIMEOUT_MS = 20_000;

/**
 * ارسال درخواست مشاوره به تابع سرور.
 * هیچ کلید محرمانه‌ای در این ماژول وجود ندارد؛ تمام پیکربندی سمت سرور است.
 */
export const FORM_UNAVAILABLE_MESSAGE =
  "ثبت آنلاین درخواست در این نسخۀ سایت فعال نیست. اطلاعات فرم شما ارسال نشد؛ لطفاً از راه‌های تماس دفتر استفاده کنید یا کمی بعد دوباره تلاش کنید.";

export async function submitConsultation(payload: ConsultationPayload): Promise<ConsultationResult> {
  // اگر این استقرار اصلاً سرور دریافت درخواست ندارد، درخواست شبکه‌ای بی‌فایده فرستاده نمی‌شود.
  if (!siteConfig.forms.deliveryAvailable) {
    return { ok: false, unavailable: true, message: FORM_UNAVAILABLE_MESSAGE };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(siteConfig.forms.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as
      | (Partial<ConsultationSuccess> & Partial<ConsultationFailure>)
      | null;

    // پاسخ غیر JSON یا ۴۰۴/۴۰۵/۵۰۱ یعنی مسیر تابع وجود ندارد (استقرار ایستا)
    const endpointMissing =
      [404, 405, 501].includes(response.status) && (!data || typeof data !== "object");

    if (endpointMissing) {
      return { ok: false, unavailable: true, message: FORM_UNAVAILABLE_MESSAGE };
    }

    if (response.ok && data?.ok) {
      return {
        ok: true,
        reference: data.reference ?? null,
        receivedAt: data.receivedAt ?? new Date().toISOString(),
        message: data.message,
      };
    }

    return {
      ok: false,
      message:
        data?.message ??
        "ارسال درخواست انجام نشد. لطفاً دوباره تلاش کنید یا تلفنی با دفتر تماس بگیرید.",
      errors: data?.errors,
      retryAfter: data?.retryAfter,
    };
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      message: isAbort
        ? "ارتباط با سرور طول کشید و درخواست ارسال نشد. لطفاً دوباره تلاش کنید."
        : "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کنید یا تلفنی تماس بگیرید.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** پیام خطای عمومی برای خطاهای شبکه‌ای/سروری */
export const GENERIC_FORM_ERROR =
  "درخواست شما ثبت نشد. اطلاعات فرم حفظ شده است؛ می‌توانید دوباره تلاش کنید.";

export const PHONE_FALLBACK_HINT = "در صورت تکرار خطا، لطفاً تلفنی با دفتر تماس بگیرید.";
