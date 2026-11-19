"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGate from "../components/AuthGate";
import TopNav from "../components/TopNav";
import BarChart from "../components/BarChart";
import {
  supabase,
  CONSULTATION_STATUS,
  type ConsultationRow,
  type CommentRow,
  type AdminNotification,
  type VisitStatRow,
} from "../lib/supabase";
import { lastNDays, relativeTimeFa, formatDateTimeFa } from "../lib/dates";

interface DashboardData {
  consultationsNew: number;
  consultationsInProgress: number;
  consultationsLast30: number;
  consultationsPrior30: number;
  commentsPending: number;
  commentsApproved: number;
  visitsLast30: number;
  visitsPrior30: number;
  dailyVisits: number[];
  dailyLabels: string[];
  topPages: { path: string; views: number }[];
  recentConsultations: ConsultationRow[];
  pendingComments: CommentRow[];
  notifications: AdminNotification[];
  unreadNotifications: number;
}

interface TimelineEntry {
  id: string;
  at: string;
  kind: "consultation" | "comment";
  title: string;
  detail: string;
  href: string;
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <span className="delta flat">بدون تغییر</span>;
  }
  if (previous === 0) {
    return <span className="delta up">جدید ↑</span>;
  }
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  if (rounded === 0) return <span className="delta flat">بدون تغییر</span>;
  const up = rounded > 0;
  return (
    <span className={`delta ${up ? "up" : "down"}`}>
      {Math.abs(rounded)}٪ {up ? "↑" : "↓"}
    </span>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    async function load() {
      try {
        const client = supabase!;
        const days30 = lastNDays(30);
        const since30 = days30[0].key + "T00:00:00.000Z";
        const priorDays = lastNDays(60);
        const priorSince = priorDays[0].key + "T00:00:00.000Z";

        const [
          newCount,
          inProgress,
          consultationsLast30,
          consultationsPrior30,
          commentsPending,
          commentsApproved,
          visitRows,
          recentConsultations,
          pendingComments,
          notifications,
          unread,
        ] = await Promise.all([
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
          client.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", since30),
          client
            .from("consultations")
            .select("id", { count: "exact", head: true })
            .gte("created_at", priorSince)
            .lt("created_at", since30),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
          client.from("visit_stats").select("day, path, views").gte("day", priorDays[0].key),
          client.from("consultations").select("*").order("created_at", { ascending: false }).limit(4),
          client.from("comments").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(4),
          client.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(6),
          client.from("admin_notifications").select("id", { count: "exact", head: true }).eq("read", false),
        ]);

        if (!mounted) return;

        const rows = (visitRows.data as VisitStatRow[] | null) ?? [];
        const dayCount = new Map(days30.map((day) => [day.key, 0]));
        let visitsLast30 = 0;
        let visitsPrior30 = 0;
        const perPath = new Map<string, number>();

        for (const row of rows) {
          const views = Number(row.views) || 0;
          if (dayCount.has(row.day)) {
            dayCount.set(row.day, (dayCount.get(row.day) ?? 0) + views);
            visitsLast30 += views;
            perPath.set(row.path, (perPath.get(row.path) ?? 0) + views);
          } else {
            visitsPrior30 += views;
          }
        }

        const topPages = [...perPath.entries()]
          .map(([path, views]) => ({ path, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setData({
          consultationsNew: newCount.count ?? 0,
          consultationsInProgress: inProgress.count ?? 0,
          consultationsLast30: consultationsLast30.count ?? 0,
          consultationsPrior30: consultationsPrior30.count ?? 0,
          commentsPending: commentsPending.count ?? 0,
          commentsApproved: commentsApproved.count ?? 0,
          visitsLast30,
          visitsPrior30,
          dailyVisits: days30.map((day) => dayCount.get(day.key) ?? 0),
          dailyLabels: days30.map((day) => day.label),
          topPages,
          recentConsultations: (recentConsultations.data as ConsultationRow[]) ?? [],
          pendingComments: (pendingComments.data as CommentRow[]) ?? [],
          notifications: (notifications.data as AdminNotification[]) ?? [],
          unreadNotifications: unread.count ?? 0,
        });
      } catch {
        if (mounted) setError("بارگذاری اطلاعات ناموفق بود. اتصال Supabase و دسترسی حساب را بررسی کنید.");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const timeline = useMemo<TimelineEntry[]>(() => {
    if (!data) return [];
    const entries: TimelineEntry[] = [];
    for (const row of data.recentConsultations) {
      entries.push({
        id: `c-${row.id}`,
        at: row.created_at,
        kind: "consultation",
        title: `درخواست مشاوره — ${row.name}`,
        detail: row.topic,
        href: "/consultations",
      });
    }
    for (const row of data.pendingComments) {
      entries.push({
        id: `m-${row.id}`,
        at: row.created_at,
        kind: "comment",
        title: `دیدگاه در انتظار تأیید — ${row.author_name}`,
        detail: row.article_slug,
        href: "/comments",
      });
    }
    return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 7);
  }, [data]);

  const maxTopViews = data ? Math.max(1, ...data.topPages.map((page) => page.views)) : 1;

  return (
    <AuthGate>
      <TopNav />
      <main className="container">
        <div className="page-head">
          <div>
            <h1 className="page-title">داشبورد</h1>
            <p className="page-sub">نمای کلی زندهٔ عملکرد سایت و کارهای در انتظار اقدام</p>
          </div>
          <Link href="/reports" className="btn secondary">مشاهدهٔ گزارش کامل ←</Link>
        </div>

        {error && <p className="msg err" role="alert">{error}</p>}

        {/* ---------- KPI ها ---------- */}
        <div className="cards kpi-grid">
          <Link href="/consultations" className="card kpi highlight">
            <div className="lbl">درخواست جدید (در انتظار رسیدگی)</div>
            <div className="num">{data ? data.consultationsNew : "…"}</div>
            <div className="kpi-foot">
              <span>۳۰ روز اخیر: {data ? data.consultationsLast30 : "…"}</span>
              {data && <Delta current={data.consultationsLast30} previous={data.consultationsPrior30} />}
            </div>
          </Link>

          <Link href="/consultations" className="card kpi">
            <div className="lbl">در حال پیگیری</div>
            <div className="num">{data ? data.consultationsInProgress : "…"}</div>
            <div className="kpi-foot"><span>صف فعال پیگیری</span></div>
          </Link>

          <Link href="/comments" className="card kpi">
            <div className="lbl">دیدگاه در انتظار تأیید</div>
            <div className="num">{data ? data.commentsPending : "…"}</div>
            <div className="kpi-foot"><span>تأییدشدهٔ کل: {data ? data.commentsApproved : "…"}</span></div>
          </Link>

          <Link href="/reports" className="card kpi">
            <div className="lbl">بازدید ۳۰ روز اخیر</div>
            <div className="num">{data ? data.visitsLast30 : "…"}</div>
            <div className="kpi-foot">
              <span>۳۰ روز قبل: {data ? data.visitsPrior30 : "…"}</span>
              {data && <Delta current={data.visitsLast30} previous={data.visitsPrior30} />}
            </div>
          </Link>
        </div>

        <div className="dash-grid">
          {/* ---------- ستون اصلی ---------- */}
          <div className="dash-main">
            <section className="panel">
              <div className="panel-head">
                <h2>روند بازدید سایت — ۳۰ روز اخیر</h2>
                <span className="row-meta">بازدید بی‌نام · بدون کوکی</span>
              </div>
              {data ? (
                data.visitsLast30 === 0 && data.visitsPrior30 === 0 ? (
                  <p className="empty">هنوز بازدیدی ثبت نشده است. پس از انتشار این نسخه، شمارش به‌صورت خودکار آغاز می‌شود.</p>
                ) : (
                  <BarChart values={data.dailyVisits} labels={data.dailyLabels} ariaLabel="نمودار میله‌ای بازدید روزانهٔ سایت در ۳۰ روز اخیر" unit="بازدید" />
                )
              ) : (
                <p className="row-meta">در حال بارگذاری نمودار…</p>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>فعالیت‌های اخیر</h2>
                <span className="row-meta">ترکیبی از درخواست‌ها و دیدگاه‌ها</span>
              </div>
              {timeline.length === 0 ? (
                <p className="empty">هنوز رویدادی ثبت نشده است. با ثبت اولین درخواست مشاوره یا دیدگاه، اینجا نمایش داده می‌شود.</p>
              ) : (
                <ol className="timeline">
                  {timeline.map((entry) => (
                    <li key={entry.id} className="timeline-item">
                      <span className={`timeline-dot ${entry.kind}`} aria-hidden="true" />
                      <div className="timeline-body">
                        <Link href={entry.href} className="timeline-title">{entry.title}</Link>
                        <div className="timeline-meta">
                          <span>{entry.detail}</span>
                          <span>·</span>
                          <time dateTime={entry.at}>{relativeTimeFa(entry.at)}</time>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="panel">
              <h2>آخرین درخواست‌های مشاوره</h2>
              {data && data.recentConsultations.length === 0 ? (
                <p className="empty">هنوز درخواستی ثبت نشده است.</p>
              ) : (
                (data?.recentConsultations ?? []).map((row) => (
                  <div className="row" key={row.id}>
                    <div className="row-head">
                      <span className="row-title">{row.name}</span>
                      <span className="row-meta">{formatDateTimeFa(row.created_at)}</span>
                    </div>
                    <div className="row-meta" style={{ marginTop: 4 }}>
                      {row.topic} · <a className="mono" href={`tel:${row.phone}`}>{row.phone}</a>
                    </div>
                    <div className="row-actions">
                      <span className={`badge ${row.status}`}>{CONSULTATION_STATUS[row.status]}</span>
                      <Link href="/consultations" className="nav-link" style={{ padding: "4px 8px" }}>مدیریت ←</Link>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          {/* ---------- ستون کناری ---------- */}
          <div className="dash-side">
            <section className="panel">
              <div className="panel-head">
                <h2>رویدادهای تازه</h2>
                <Link href="/notifications" className="nav-link" style={{ padding: "4px 8px" }}>
                  همه ←{data && data.unreadNotifications > 0 ? ` (${data.unreadNotifications} خوانده‌نشده)` : ""}
                </Link>
              </div>
              {data && data.notifications.length === 0 ? (
                <p className="empty">هنوز رویدادی رخ نداده است.</p>
              ) : (
                (data?.notifications ?? []).map((item) => (
                  <Link
                    key={item.id}
                    href={item.ref_table === "consultations" ? "/consultations" : "/comments"}
                    className={`notif-row${item.read ? "" : " unread"}`}
                  >
                    <span className="notif-dot" aria-hidden="true" />
                    <span className="notif-body">
                      <span className="notif-title">{item.title}</span>
                      {item.body && <span className="notif-summary">{item.body}</span>}
                      <span className="notif-time">{relativeTimeFa(item.created_at)}</span>
                    </span>
                  </Link>
                ))
              )}
            </section>

            <section className="panel">
              <h2>پربازدیدترین صفحه‌ها — ۳۰ روز</h2>
              {data && data.topPages.length === 0 ? (
                <p className="empty">داده‌ای برای نمایش نیست.</p>
              ) : (
                (data?.topPages ?? []).map((page) => (
                  <div className="top-page" key={page.path}>
                    <div className="top-page-head">
                      <span className="mono top-path">{page.path}</span>
                      <span>{page.views}</span>
                    </div>
                    <div className="top-bar">
                      <div className="top-bar-fill" style={{ width: `${(page.views / maxTopViews) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="panel">
              <h2>دیدگاه‌های در انتظار تأیید</h2>
              {data && data.pendingComments.length === 0 ? (
                <p className="empty">صف نظرات خالی است — آفرین!</p>
              ) : (
                (data?.pendingComments ?? []).map((comment) => (
                  <div className="row" key={comment.id}>
                    <div className="row-head">
                      <span className="row-title">{comment.author_name}</span>
                      <span className="row-meta">{relativeTimeFa(comment.created_at)}</span>
                    </div>
                    <p className="row-body">{comment.body.slice(0, 140)}{comment.body.length > 140 ? "…" : ""}</p>
                    <div className="row-actions">
                      <Link href="/comments" className="btn secondary" style={{ padding: "6px 12px" }}>بررسی و تأیید ←</Link>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </main>
    </AuthGate>
  );
}
