/**
 * اتصال عمومی به Supabase — فقط برای بخش نظرات مقالات.
 * ------------------------------------------------------------------
 * کلید anon عمومی است و مورد امنیتی نیست؛ دسترسی‌ها با RLS سمت سرور محدود می‌شوند
 * (خواندن فقط نظرهای «تأییدشده»، درج فقط به‌صورت «در انتظار تأیید»).
 * اگر متغیرها تنظیم نشده باشند، بخش نظرات به‌سادگی غیرفعال است.
 */

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const supabaseComments =
  rawUrl && anonKey ? { url: rawUrl.replace(/\/+$/, ""), anonKey } : null;

export interface PublicComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}
