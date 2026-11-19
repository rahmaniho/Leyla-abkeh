"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";
import Shell from "../../components/Shell";
import Avatar from "../../components/Avatar";
import { supabase, COMMENT_STATUS, type CommentRow, type CommentStatus } from "../../lib/supabase";

const TABS: CommentStatus[] = ["pending", "approved", "rejected"];

function formatFa(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CommentsPage() {
  const [tab, setTab] = useState<CommentStatus>("pending");
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function load(status: CommentStatus) {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) setMessage({ kind: "err", text: "بارگذاری نظرات ناموفق بود." });
    else setRows((data as CommentRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function setStatus(id: string, status: CommentStatus) {
    if (!supabase) return;
    const { error } = await supabase.from("comments").update({ status }).eq("id", id);
    if (error) {
      setMessage({ kind: "err", text: "عملیات انجام نشد. دوباره تلاش کنید." });
      return;
    }
    setRows((current) => current.filter((row) => row.id !== id));
    setMessage({ kind: "ok", text: status === "approved" ? "نظر تأیید و منتشر شد." : "نظر رد شد." });
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      setMessage({ kind: "err", text: "حذف انجام نشد." });
      return;
    }
    setRows((current) => current.filter((row) => row.id !== id));
    setMessage({ kind: "ok", text: "نظر حذف شد." });
  }

  return (
    <AuthGate>
      <Shell>
        <h1 className="page-title">نظرات مقالات</h1>
        <p className="page-sub">هیچ نظری بدون تأیید شما روی سایت منتشر نمی‌شود</p>

        <div className="tabs" role="tablist" aria-label="وضعیت نظرات">
          {TABS.map((status) => (
            <button key={status} className={`tab${tab === status ? " active" : ""}`} onClick={() => setTab(status)} role="tab" aria-selected={tab === status}>
              {COMMENT_STATUS[status]}
            </button>
          ))}
        </div>

        {message && <p className={`msg ${message.kind}`} role="status">{message.text}</p>}

        {loading ? (
          <p className="row-meta">در حال بارگذاری…</p>
        ) : rows.length === 0 ? (
          <div className="panel"><p className="row-body">{tab === "pending" ? "صف انتظار خالی است." : "موردی وجود ندارد."}</p></div>
        ) : (
          rows.map((comment) => (
            <article className="row" key={comment.id}>
              <div className="row-head">
                <div className="row-identity">
                  <Avatar name={comment.author_name} size={38} />
                  <span className="row-title">{comment.author_name}</span>
                </div>
                <span className="row-meta">{formatFa(comment.created_at)}</span>
              </div>
              <p className="row-body">{comment.body}</p>
              <div className="row-meta" style={{ marginTop: 6 }}>
                مقاله:{" "}
                <a href={`https://leyla-abkeh.ir/articles/${comment.article_slug}/`} target="_blank" rel="noopener noreferrer" dir="ltr" className="mono">
                  /articles/{comment.article_slug}/
                </a>
              </div>
              <div className="row-actions">
                {tab !== "approved" && (
                  <button className="btn ok" onClick={() => setStatus(comment.id, "approved")}>تأیید و انتشار</button>
                )}
                {tab !== "rejected" && (
                  <button className="btn secondary" onClick={() => setStatus(comment.id, "rejected")}>رد کردن</button>
                )}
                <button className="btn danger" onClick={() => remove(comment.id)}>حذف</button>
                <span className={`badge ${comment.status}`}>{COMMENT_STATUS[comment.status]}</span>
              </div>
            </article>
          ))
        )}
      </Shell>
    </AuthGate>
  );
}
