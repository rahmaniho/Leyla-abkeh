"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGate from "../components/AuthGate";
import TopNav from "../components/TopNav";
import { supabase, CONSULTATION_STATUS, type ConsultationRow, type CommentRow } from "../lib/supabase";

interface Stats {
  consultationsNew: number;
  consultationsInProgress: number;
  consultationsTotal: number;
  commentsPending: number;
  commentsApproved: number;
}

function formatFa(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<ConsultationRow[]>([]);
  const [pendingComments, setPendingComments] = useState<CommentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    async function load() {
      try {
        const client = supabase!;
        const [n, ip, total, cp, ca, recentRows, pendingRows] = await Promise.all([
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
          client.from("consultations").select("id", { count: "exact", head: true }),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
          client.from("consultations").select("*").order("created_at", { ascending: false }).limit(5),
          client.from("comments").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
        ]);
        if (!mounted) return;
        setStats({
          consultationsNew: n.count ?? 0,
          consultationsInProgress: ip.count ?? 0,
          consultationsTotal: total.count ?? 0,
          commentsPending: cp.count ?? 0,
          commentsApproved: ca.count ?? 0,
        });
        setRecent((recentRows.data as ConsultationRow[]) ?? []);
        setPendingComments((pendingRows.data as CommentRow[]) ?? []);
      } catch (err) {
        if (mounted) setError("بارگذاری اطلاعات ناموفق بود. اتصال Supabase و دسترسی حساب را بررسی کنید.");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthGate>
      <TopNav />
      <main className="container">
        <h1 className="page-title">داشبورد</h1>
        <p className="page-sub">نمای کلی وضعیت سایت، درخواست‌های مشاوره و نظرات</p>

        {error && <p className="msg err" role="alert">{error}</p>}

        <div className="cards">
          <Link href="/consultations" className="card highlight">
            <div className="num">{stats ? stats.consultationsNew : "…"}</div>
            <div className="lbl">درخواست مشاورهٔ جدید</div>
          </Link>
          <Link href="/consultations" className="card">
            <div className="num">{stats ? stats.consultationsInProgress : "…"}</div>
            <div className="lbl">در حال پیگیری</div>
          </Link>
          <Link href="/consultations" className="card">
            <div className="num">{stats ? stats.consultationsTotal : "…"}</div>
            <div className="lbl">کل درخواست‌ها</div>
          </Link>
          <Link href="/comments" className="card">
            <div className="num">{stats ? stats.commentsPending : "…"}</div>
            <div className="lbl">نظرات در انتظار تأیید</div>
          </Link>
        </div>

        <section className="panel">
          <h2>آخرین درخواست‌های مشاوره</h2>
          {recent.length === 0 ? (
            <p className="row-meta">{stats ? "هنوز درخواستی ثبت نشده است." : "در حال بارگذاری…"}</p>
          ) : (
            recent.map((row) => (
              <div className="row" key={row.id}>
                <div className="row-head">
                  <span className="row-title">{row.name}</span>
                  <span className="row-meta">{formatFa(row.created_at)}</span>
                </div>
                <div className="row-meta" style={{ marginTop: 4 }}>{row.topic} · <a className="mono" href={`tel:${row.phone}`}>{row.phone}</a></div>
                <div className="row-actions">
                  <span className={`badge ${row.status}`}>{CONSULTATION_STATUS[row.status]}</span>
                  <Link href="/consultations" className="nav-link" style={{ padding: "4px 8px" }}>مدیریت ←</Link>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="panel">
          <h2>نظرات در انتظار تأیید شما</h2>
          {pendingComments.length === 0 ? (
            <p className="row-meta">{stats ? "صف نظرات خالی است." : "در حال بارگذاری…"}</p>
          ) : (
            pendingComments.map((comment) => (
              <div className="row" key={comment.id}>
                <div className="row-head">
                  <span className="row-title">{comment.author_name}</span>
                  <span className="row-meta">{formatFa(comment.created_at)}</span>
                </div>
                <p className="row-body">{comment.body.slice(0, 180)}{comment.body.length > 180 ? "…" : ""}</p>
                <div className="row-actions">
                  <Link href="/comments" className="btn secondary" style={{ padding: "6px 12px" }}>بررسی و تأیید ←</Link>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </AuthGate>
  );
}
