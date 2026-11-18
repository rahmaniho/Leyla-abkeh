import { useEffect, useState, type FormEvent } from "react";
import { supabaseComments, type PublicComment } from "../lib/supabase";
import { formatDateFa, toFaDigits } from "../lib/format";

const MIN_BODY = 3;
const MAX_BODY = 2000;
const MAX_NAME = 80;

/**
 * بخش نظرات مقالات
 * ------------------------------------------------------------------
 * - فقط نظرهای «تأییدشده» نمایش داده می‌شوند (خواندن با کلید anon مجاز است).
 * - نظر جدید همیشه «در انتظار تأیید» ثبت می‌شود؛ پس از تأیید مدیر در داشبورد نمایش داده می‌شود.
 * - اگر Supabase پیکربندی نشده باشد، کل بخش مخفی است (سایت بدون Supabase هم کامل کار می‌کند).
 */
export default function CommentSection({ slug }: { slug: string }) {
  const backend = supabaseComments;
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!backend) return;
    const controller = new AbortController();
    const query = new URLSearchParams({
      select: "id,author_name,body,created_at",
      article_slug: `eq.${slug}`,
      status: "eq.approved",
      order: "created_at.asc",
    });
    fetch(`${backend.url}/rest/v1/comments?${query.toString()}`, {
      headers: { apikey: backend.anonKey, authorization: `Bearer ${backend.anonKey}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as PublicComment[];
        setComments(data);
      })
      .catch(() => {
        /* نظرات قابل بارگذاری نبود؛ بخش بدون فهرست باقی می‌ماند */
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [backend, slug]);

  if (!backend) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!backend || submitting) return;
    const trimmedName = name.trim();
    const trimmedBody = body.trim();
    if (trimmedName.length < 2 || trimmedBody.length < MIN_BODY) {
      setFeedback({ kind: "error", text: "نام و متن نظر را کامل وارد کنید." });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch(`${backend.url}/rest/v1/comments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: backend.anonKey,
          authorization: `Bearer ${backend.anonKey}`,
          prefer: "return=minimal",
        },
        body: JSON.stringify({
          article_slug: slug,
          author_name: trimmedName.slice(0, MAX_NAME),
          body: trimmedBody.slice(0, MAX_BODY),
          status: "pending",
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setName("");
      setBody("");
      setFeedback({ kind: "ok", text: "نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود." });
    } catch {
      setFeedback({ kind: "error", text: "ثبت نظر در این لحظه ممکن نشد. کمی بعد دوباره تلاش کنید." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10" aria-labelledby="article-comments-title">
      <h2 id="article-comments-title" className="text-[17px] font-extrabold text-ink">
        دیدگاه‌ها
        {comments.length > 0 && (
          <span className="ms-2 text-[13px] font-bold text-ink/55">({toFaDigits(comments.length)})</span>
        )}
      </h2>
      <p className="mt-1 text-[12px] leading-6 text-ink/60">
        دیدگاه شما پس از بازبینی دفتر منتشر می‌شود؛ رعایت احترام و حریم خصوصی دیگران الزامی است.
      </p>

      {loading ? (
        <p className="mt-4 text-[12.5px] text-ink/50">در حال بارگذاری دیدگاه‌ها…</p>
      ) : comments.length > 0 ? (
        <ol className="mt-5 space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-2xl border border-ink/10 bg-white/70 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13px] font-bold text-ink">{comment.author_name}</span>
                <time dateTime={comment.created_at} className="text-[11px] text-ink/50">
                  {formatDateFa(comment.created_at)}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-7 text-ink/80">{comment.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-[12.5px] text-ink/55">هنوز دیدگاهی ثبت نشده است. اولین نفر باشید.</p>
      )}

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-ink/10 bg-white/70 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-[12px] font-bold text-ink/75">
            نام و نام خانوادگی
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={MAX_NAME}
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors placeholder:text-ink/30 focus:border-gold/50"
              placeholder="مثلاً سارا محمدی"
            />
          </label>
        </div>
        <label className="mt-4 block text-[12px] font-bold text-ink/75">
          متن دیدگاه
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
            minLength={MIN_BODY}
            maxLength={MAX_BODY}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-[13px] leading-7 outline-none transition-colors placeholder:text-ink/30 focus:border-gold/50"
            placeholder="دیدگاه خود را محترمانه بنویسید…"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-ink px-5 py-2.5 text-[13px] font-extrabold text-cream transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {submitting ? "در حال ثبت…" : "ثبت دیدگاه"}
          </button>
          {feedback && (
            <p
              role={feedback.kind === "error" ? "alert" : "status"}
              className={`text-[12px] font-bold ${feedback.kind === "ok" ? "text-emerald-700" : "text-red-700"}`}
            >
              {feedback.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
