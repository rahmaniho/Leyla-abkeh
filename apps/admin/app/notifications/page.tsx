"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "../../components/AuthGate";
import Shell from "../../components/Shell";
import { supabase, type AdminNotification } from "../../lib/supabase";
import { relativeTimeFa, formatDateTimeFa } from "../../lib/dates";

export default function NotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    async function load() {
      const { data, error: queryError } = await supabase!
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!mounted) return;
      if (queryError) {
        setError("بارگذاری اعلان‌ها ناموفق بود.");
      } else {
        setItems((data as AdminNotification[]) ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function markAllRead() {
    if (!supabase || marking) return;
    setMarking(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("admin_notifications")
      .update({ read: true })
      .eq("read", false);
    if (updateError) {
      setError("به‌روزرسانی اعلان‌ها ناموفق بود.");
    } else {
      setItems((current) => current.map((item) => ({ ...item, read: true })));
    }
    setMarking(false);
  }

  async function markOneRead(id: string) {
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from("admin_notifications")
      .update({ read: true })
      .eq("id", id);
    if (!updateError) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    }
  }

  const unread = items.filter((item) => !item.read).length;

  return (
    <AuthGate>
      <Shell>
        <div className="page-head">
          <div>
            <h1 className="page-title">اعلان‌ها</h1>
            <p className="page-sub">هر رویداد تازهٔ سایت (درخواست مشاوره، دیدگاه جدید) همین‌جا نمایش داده می‌شود</p>
          </div>
          <button type="button" className="btn secondary" onClick={markAllRead} disabled={marking || unread === 0}>
            {marking ? "در حال انجام…" : "همه را خوانده کن"}
          </button>
        </div>

        {error && <p className="msg err" role="alert">{error}</p>}

        {loading ? (
          <p className="row-meta">در حال بارگذاری…</p>
        ) : items.length === 0 ? (
          <div className="panel empty-panel">
            <p className="empty">هنوز رویدادی رخ نداده است.</p>
            <p className="row-meta">به‌محض ثبت اولین درخواست مشاوره یا دیدگاه از سوی مخاطبان، اعلان آن اینجا و در زنگولهٔ بالای صفحه ظاهر می‌شود.</p>
          </div>
        ) : (
          <section className="panel notif-panel">
            {items.map((item) => {
              const href = item.ref_table === "consultations" ? "/consultations" : "/comments";
              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`notif-row big${item.read ? "" : " unread"}`}
                  onClick={() => markOneRead(item.id)}
                >
                  <span className="notif-icon" aria-hidden="true">
                    {item.ref_table === "consultations" ? (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 8h6M9 12h6"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.9-5.2A8 8 0 1 1 21 12z"/></svg>
                    )}
                  </span>
                  <span className="notif-body">
                    <span className="notif-title">{item.title}</span>
                    {item.body && <span className="notif-summary">{item.body}</span>}
                    <span className="notif-time">
                      {relativeTimeFa(item.created_at)} · <span className="mono">{formatDateTimeFa(item.created_at)}</span>
                    </span>
                  </span>
                  {!item.read && <span className="notif-chip">جدید</span>}
                </Link>
              );
            })}
          </section>
        )}
      </Shell>
    </AuthGate>
  );
}
