import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { primaryPhone, siteConfig } from "../config/site";
import { serviceTopics } from "../content/services";
import { validateSubmission } from "../lib/validation";
import { submitConsultation } from "../lib/consultation";
import { formatDateTimeFa } from "../lib/format";
import { cn } from "../utils/cn";
import { CheckIcon, PhoneIcon } from "./Icons";
import { Link } from "../lib/router";
import TurnstileWidget from "./TurnstileWidget";
import { track } from "../lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

interface FormValues {
  name: string;
  phone: string;
  topic: string;
  message: string;
  website: string;
}

const EMPTY_VALUES: FormValues = { name: "", phone: "", topic: "", message: "", website: "" };
const DUPLICATE_WINDOW_MS = 30_000;
const STORAGE_KEY = "consultation:last-submit";

const fieldClassName =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-sm text-white placeholder:text-white/50 transition-all duration-300 focus:border-gold/70 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gold/40";
const labelClassName = "mb-2 block text-[13px] font-bold text-white/85";
const errorClassName = "mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-red-300";

export default function ConsultationForm({ compact = false }: { compact?: boolean }) {
  const baseId = useId();
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string>("");
  const [reference, setReference] = useState<string | null>(null);
  const [receivedAt, setReceivedAt] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [unavailable, setUnavailable] = useState(false);
  const startedAtRef = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  const startedRef = useRef(false);

  const updateField = (field: keyof FormValues, value: string) => {
    if (!startedRef.current && field !== "website") {
      startedRef.current = true;
      track("form_start", { path: "/contact" });
    }
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field] && !current.form) return current;
      const next = { ...current };
      delete next[field];
      delete next.form;
      return next;
    });
  };

  const focusFirstError = (fieldErrors: Record<string, string>) => {
    const order = ["form", "name", "phone", "topic", "message"];
    const first = order.find((field) => fieldErrors[field]);
    if (!first) return;
    const element = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    element?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const localValidation = validateSubmission(
      { ...values, startedAt: startedAtRef.current },
      { now: Date.now() }
    );

    if (!localValidation.ok) {
      setErrors(localValidation.errors);
      setServerMessage("");
      setStatus("error");
      track("form_validation_error", {
        field: Object.keys(localValidation.errors)[0] ?? "form",
      });
      focusFirstError(localValidation.errors);
      return;
    }

    // جلوگیری از ارسال تکراری در فاصلهی کوتاه (سمت کاربر)
    try {
      const last = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
      if (last && Date.now() - last < DUPLICATE_WINDOW_MS) {
        setErrors({ form: "درخواست شما لحظاتی پیش ارسال شده است. لطفاً کمی صبر کنید." });
        setStatus("error");
        return;
      }
    } catch {
      /* دسترسی به localStorage ممکن نیست؛ محدودیت سمت سرور باقی است */
    }

    setStatus("submitting");
    setErrors({});
    setServerMessage("");
    setUnavailable(false);
    track("form_submit", { topic: values.topic });

    const result = await submitConsultation({
      name: values.name,
      phone: values.phone,
      topic: values.topic,
      message: values.message,
      website: values.website,
      startedAt: startedAtRef.current,
      turnstileToken: turnstileToken || undefined,
    });

    if (result.ok) {
      track("form_success", { topic: values.topic });
      setReference(result.reference);
      setReceivedAt(result.receivedAt);
      setStatus("success");
      setValues(EMPTY_VALUES);
      startedAtRef.current = Date.now();
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* نادیده گرفتن */
      }
      return;
    }

    const fieldErrors = result.errors ?? {};
    setErrors(fieldErrors);
    setServerMessage(result.message);
    setUnavailable(Boolean(result.unavailable));
    if (result.unavailable) {
      track("form_unavailable");
    } else if (result.retryAfter) {
      track("form_rate_limited");
    } else if (Object.keys(fieldErrors).length > 0) {
      track("form_validation_error", { field: Object.keys(fieldErrors)[0] ?? "form" });
    }
    setStatus("error");
    if (Object.keys(fieldErrors).length > 0) {
      focusFirstError(fieldErrors);
    } else {
      statusRef.current?.focus();
    }
  };

  const resetForm = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setServerMessage("");
    setReference(null);
    setReceivedAt(null);
    setTurnstileToken("");
    startedAtRef.current = Date.now();
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <div
        className="relative flex min-h-[420px] flex-col items-center justify-center rounded-[2rem] border border-gold/35 bg-white/[0.07] p-8 text-center shadow-deep backdrop-blur-2xl sm:p-10"
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={statusRef}
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold text-ink-deep shadow-gold">
          <CheckIcon className="h-10 w-10" />
        </span>
        <h3 className="mt-7 text-2xl font-black text-white">درخواست شما ثبت شد</h3>
        <p className="mt-4 max-w-sm text-[14px] leading-8 text-white/70">
          درخواست شما در سامانهی دفتر ثبت و به اطلاع وکیل رسید. برای هماهنگی نوبت با شما تماس
          گرفته می‌شود.
        </p>

        <dl className="mt-6 w-full max-w-sm space-y-2 rounded-2xl border border-white/12 bg-ink/40 px-5 py-4 text-right text-[13px]">
          {reference && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/60">کد پیگیری</dt>
              <dd className="font-bold tracking-wider text-gold-light" dir="ltr">
                {reference}
              </dd>
            </div>
          )}
          {receivedAt && (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/60">زمان ثبت</dt>
              <dd className="font-semibold text-white/85">{formatDateTimeFa(receivedAt)}</dd>
            </div>
          )}
        </dl>

        <p className="mt-4 text-[12px] leading-6 text-white/60">
          کد پیگیری را نگه دارید؛ برای پیگیری وضعیت درخواست، آن را هنگام تماس اعلام کنید.
        </p>

        <button
          type="button"
          onClick={resetForm}
          className="mt-7 rounded-full border border-white/20 px-6 py-2.5 text-[13px] font-bold text-white/85 transition-colors hover:border-gold/50 hover:text-gold-light"
        >
          ثبت درخواست جدید
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "relative rounded-[2rem] border border-white/12 bg-white/[0.07] shadow-deep backdrop-blur-2xl",
        compact ? "p-6 sm:p-7" : "p-7 sm:p-9"
      )}
      aria-label="فرم درخواست مشاوره"
    >
      <h3 className="text-xl font-extrabold text-white">درخواست مشاوره</h3>
      <p className="mt-2 text-[13px] leading-6 text-white/60">
        فرم را کامل کنید؛ پس از ثبت، برای تعیین نوبت با شما تماس گرفته می‌شود.
      </p>

      {!siteConfig.forms.deliveryAvailable && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-[12.5px] leading-6 text-amber-100"
        >
          <strong className="font-bold">توجه:</strong> در این نسخهی سایت، ثبت آنلاین درخواست
          فعال نشده است. فرم برای بازبینی نمایش داده می‌شود و ارسال آن انجام نمی‌شود؛ لطفاً از
          راه‌های تماس دفتر استفاده کنید.
        </div>
      )}

      <div className="mt-6 space-y-5">
        {/* تلهی هرزنامه — از دید کاربر و صفحه‌خوان پنهان است */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor={`${baseId}-website`}>وب‌سایت</label>
          <input
            id={`${baseId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-name`} className={labelClassName}>
            نام و نام خانوادگی
          </label>
          <input
            id={`${baseId}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            data-field="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
            maxLength={siteConfig.forms.maxNameLength}
            placeholder="مثلاً: سارا محمدی"
            className={cn(fieldClassName, errors.name && "border-red-400/70")}
          />
          {errors.name && (
            <p id={`${baseId}-name-error`} className={errorClassName}>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-phone`} className={labelClassName}>
            شماره تماس
          </label>
          <input
            id={`${baseId}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            dir="ltr"
            data-field="phone"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? `${baseId}-phone-error` : `${baseId}-phone-hint`
            }
            placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
            className={cn(fieldClassName, "text-right", errors.phone && "border-red-400/70")}
          />
          {errors.phone ? (
            <p id={`${baseId}-phone-error`} className={errorClassName}>
              {errors.phone}
            </p>
          ) : (
            <p id={`${baseId}-phone-hint`} className="mt-1.5 text-[11.5px] text-white/60">
              شمارهی موبایل یا تلفن ثابت ایران؛ با ارقام فارسی یا لاتین.
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-topic`} className={labelClassName}>
            موضوع پرونده
          </label>
          <select
            id={`${baseId}-topic`}
            name="topic"
            required
            data-field="topic"
            value={values.topic}
            onChange={(event) => updateField("topic", event.target.value)}
            aria-invalid={Boolean(errors.topic)}
            aria-describedby={errors.topic ? `${baseId}-topic-error` : undefined}
            className={cn(
              fieldClassName,
              "appearance-none [&>option]:bg-ink [&>option]:text-white",
              errors.topic && "border-red-400/70"
            )}
          >
            <option value="">انتخاب کنید…</option>
            {serviceTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {errors.topic && (
            <p id={`${baseId}-topic-error`} className={errorClassName}>
              {errors.topic}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-message`} className={labelClassName}>
            شرح کوتاه موضوع{" "}
            <span className="font-medium text-white/60">(اختیاری)</span>
          </label>
          <textarea
            id={`${baseId}-message`}
            name="message"
            rows={3}
            data-field="message"
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? `${baseId}-message-error` : undefined}
            maxLength={siteConfig.forms.maxMessageLength}
            placeholder="در چند جمله، موضوع را شرح دهید…"
            className={cn(fieldClassName, "resize-none", errors.message && "border-red-400/70")}
          />
          {errors.message ? (
            <p id={`${baseId}-message-error`} className={errorClassName}>
              {errors.message}
            </p>
          ) : (
            <p className="mt-1.5 text-[11.5px] text-white/60">
              برای حفظ محرمانگی، جزئیات حساس پرونده را در فرم ننویسید؛ در جلسهی مشاوره مطرح کنید.
            </p>
          )}
        </div>

        <TurnstileWidget onToken={setTurnstileToken} />

        {(errors.form || serverMessage) && (
          <div
            ref={statusRef}
            tabIndex={-1}
            role="alert"
            className={
              unavailable
                ? "rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-[13px] leading-6 text-amber-100"
                : "rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-[13px] leading-6 text-red-200"
            }
          >
            <p>{errors.form ?? serverMessage}</p>
            {primaryPhone ? (
              <a
                href={primaryPhone.href}
                className="mt-2 inline-flex items-center gap-2 font-bold text-red-100 underline decoration-red-300/50 underline-offset-4 hover:text-white"
              >
                <PhoneIcon className="h-4 w-4" />
                تماس تلفنی با دفتر
              </a>
            ) : (
              <p className="mt-2 text-[12.5px] leading-6 text-red-100/90">
                اگر ارسال دوباره هم موفق نشد، لطفاً کمی بعد تلاش کنید؛ شمارهی تلفن دفتر در حال
                تأیید نهایی است و به‌زودی در همین صفحه منتشر می‌شود.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className={cn(
            "group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-gold-light via-gold-light to-gold px-6 py-4 text-base font-extrabold text-ink-deep shadow-gold transition-all duration-300",
            status === "submitting"
              ? "cursor-not-allowed opacity-70"
              : "hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-12px_rgba(184,145,90,0.7)]"
          )}
          aria-busy={status === "submitting"}
        >
          {status === "submitting" ? (
            <>
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-ink-deep/30 border-t-ink-deep"
                aria-hidden="true"
              />
              در حال ارسال…
            </>
          ) : (
            <>
              ارسال درخواست مشاوره
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1"
                aria-hidden="true"
              >
                <path d="M19 12H5m6-6-6 6 6 6" />
              </svg>
            </>
          )}
        </button>

        <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-[11.5px] leading-6 text-white/50">
          <CheckIcon className="h-3.5 w-3.5 text-gold" />
          اطلاعات شما محرمانه است و فقط برای پاسخ‌گویی به همین درخواست استفاده می‌شود.
          <Link
            to="/privacy"
            className="font-bold text-gold-light underline decoration-gold/40 underline-offset-4 hover:text-white"
          >
            سیاست حریم خصوصی
          </Link>
        </p>
      </div>
    </form>
  );
}
