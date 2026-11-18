import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * اتصال کلاینت به Supabase (عمومی — کلید anon؛ دسترسی‌ها با RLS محدود می‌شوند)
 * اگر متغیرها تنظیم نشده باشند، `supabase` برابر null است و رابط کاربری پیام راهنما نشان می‌دهد.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseReady = Boolean(url && anonKey);

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export type ConsultationStatus = "new" | "in_progress" | "done" | "cancelled";

export const CONSULTATION_STATUS: Record<ConsultationStatus, string> = {
  new: "جدید",
  in_progress: "در حال پیگیری",
  done: "انجام‌شده",
  cancelled: "لغوشده",
};

export const COMMENT_STATUS = {
  pending: "در انتظار تأیید",
  approved: "تأییدشده",
  rejected: "ردشده",
} as const;
export type CommentStatus = keyof typeof COMMENT_STATUS;

export interface ConsultationRow {
  id: string;
  reference: string;
  name: string;
  phone: string;
  topic: string;
  message: string | null;
  duration_minutes: number | null;
  contact_method: string | null;
  status: ConsultationStatus;
  notes: string | null;
  created_at: string;
}

export interface CommentRow {
  id: string;
  article_slug: string;
  author_name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
}
