import { CONSULTATION_STATUS, COMMENT_STATUS, type ConsultationStatus, type CommentStatus } from "../lib/supabase";

export type ArticleStatus = "published" | "draft" | "scheduled" | "review";

const ARTICLE_STATUS: Record<ArticleStatus, string> = {
  published: "منتشرشده",
  draft: "پیش‌نویس",
  scheduled: "زمان‌بندی‌شده",
  review: "در بازبینی",
};

interface StatusBadgeProps {
  type: "article" | "consultation" | "comment";
  status: string;
}

/** نشان وضعیت استاندارد با رنگ‌های مشخصات (سبز/خاکستری/آبی/نارنجی) */
export default function StatusBadge({ type, status }: StatusBadgeProps) {
  if (type === "article") {
    const key = (Object.keys(ARTICLE_STATUS) as ArticleStatus[]).includes(status as ArticleStatus) ? (status as ArticleStatus) : "draft";
    return <span className={`badge ${key}`}>{ARTICLE_STATUS[key]}</span>;
  }
  if (type === "consultation") {
    const key = status as ConsultationStatus;
    return <span className={`badge ${status}`}>{CONSULTATION_STATUS[key] ?? status}</span>;
  }
  const key = status as CommentStatus;
  return <span className={`badge ${status}`}>{COMMENT_STATUS[key] ?? status}</span>;
}
