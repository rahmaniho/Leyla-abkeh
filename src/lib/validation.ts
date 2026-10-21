/**
 * پوشش TypeScript برای منطق اعتبارسنجی مشترک (مرورگر + تابع Netlify).
 * منبع حقیقت: `netlify/functions/_lib/validation.mjs`
 */
export {
  LIMITS,
  TOPICS,
  normalizeDigits,
  normalizeIranPhone,
  toE164,
  phoneKind,
  sanitizeSingleLine,
  validateSubmission,
} from "../../netlify/functions/_lib/validation.mjs";

export type SubmissionInput = {
  name?: string;
  phone?: string;
  topic?: string;
  message?: string;
  website?: string;
  startedAt?: number | string;
};

export type SubmissionData = {
  name: string;
  phone: string;
  phoneE164: string;
  topic: string;
  message: string;
};
