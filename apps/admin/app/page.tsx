"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGate from "../components/AuthGate";
import Shell from "../components/Shell";
import AreaChart from "../components/AreaChart";
import BarChart from "../components/BarChart";
import DonutChart from "../components/DonutChart";
import Sparkline from "../components/Sparkline";
import Avatar from "../components/Avatar";
import {
  supabase,
  CONSULTATION_STATUS,
  COMMENT_STATUS,
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
  consultationsDaily: number[];
  commentsPending: number;
  commentsApproved: number;
  commentsRejected: number;
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
  if (previous === 0 && current === 0) return <span className="delta flat">بدون تغییر</span>;
  if (previous === 0) return <span className="delta up">جدید ↑</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return <span className="delta flat">بدون تغییر</span>;
  const up = change > 0;
  return <span className={`delta ${up ? "up" : "down"}`}>{Math.abs(change)}٪ {up ? "↑" : "↓"}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 14 | 30>(30);

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
          consultationsRows30,
          commentsPending,
          commentsApproved,
          commentsRejected,
          visitRows,
          recentConsultations,
          pendingComments,
          notifications,
          unread,
        ] = await Promise.all([
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
          client.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", since30),
          client.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", priorSince).lt("created_at", since30),
          client.from("consultations").select("created_at").gte("created_at", since30),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "rejected"),
          client.from("visit_stats").select("day, path, views").gte("day", priorDays[0].key),
          client.from("consultations").select("*").order("created_at", { ascending: false }).limit(4),
          client.from("comments").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(4),
          client.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(5),
          client.from("admin_notifications").select("id", { count: "exact", head: true }).eq("read", false),
        ]);

        if (!mounted) return;

        const dayCount = new Map(days30.map((day) => [day.key, 0]));
        let visitsLast30 = 0;
        let visitsPrior30 = 0;
        const perPath = new Map<string, number>();
        for (const row of (visitRows.data as VisitStatRow[] | null) ?? []) {
          const views = Number(row.views) || 0;
          if (dayCount.has(row.day)) {
            dayCount.set(row.day, (dayCount.get(row.day) ?? 0) + views);
            visitsLast30 += views;
            perPath.set(row.path, (perPath.get(row.path) ?? 0) + views);
          } else {
            visitsPrior30 += views;
          }
        }

        const consultationsDailyMap = new Map(days30.map((day) => [day.key, 0]));
        for (const row of (consultationsRows30.data as { created_at: string }[] | null) ?? []) {
          const key = new Date(row.created_at).toISOString().slice(0, 10);
          if (consultationsDailyMap.has(key)) consultationsDailyMap.set(key, (consultationsDailyMap.get(key) ?? 0) + 1);
        }

        setData({
          consultationsNew: newCount.count ?? 0,
          consultationsInProgress: inProgress.count ?? 0,
          consultationsLast30: consultationsLast30.count ?? 0,
          consultationsPrior30: consultationsPrior30.count ?? 0,
          consultationsDaily: days30.map((day) => consultationsDailyMap.get(day.key) ?? 0),
          commentsPending: commentsPending.count ?? 0,
          commentsApproved: commentsApproved.count ?? 0,
          commentsRejected: commentsRejected.count ?? 0,
          visitsLast30,
          visitsPrior30,
          dailyVisits: days30.map((day) => dayCount.get(day.key) ?? 0),
          dailyLabels: days30.map((day) => day.label),
          topPages: [...perPath.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 5),
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
      entries.push({ id: `c-${row.id}`, at: row.created_at, kind: "consultation", title: `درخواست مشاوره — ${row.name}`, detail: row.topic, href: "/consultations" });
    }
    for (const row of data.pendingComments) {
      entries.push({ id: `m-${row.id}`, at: row.created_at, kind: "comment", title: `دیدگاه در انتظار تأیید — ${row.author_name}`, detail: row.article_slug, href: "/comments" });
    }
    return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
  }, [data]);

  const chartSlice = useMemo(() => {
    if (!data) return { values: [] as number[], labels: [] as string[] };
    return {
      values: data.dailyVisits.slice(-range),
      labels: data.dailyLabels.slice(-range),
    };
  }, [data, range]);

  const commentsTotal = data ? data.commentsPending + data.commentsApproved + data.commentsRejected : 0;
  const maxTopViews = data ? Math.max(1, ...data.topPages.map((page) => page.views)) : 1;

  return (
    <AuthGate>
      <Shell>
        <div className="page-head">
          <div>
            <h1 className="page-title">داشبورد</h1>
            <p className="page-sub">نمای کلی زندهٔ عملکرد سایت، درخواست‌ها و کارهای در انتظار اقدام</p>
          </div>
          <Link href="/reports" className="btn gold">گزارش کامل ←</Link>
        </div>

        {error && <p className="msg err" role="alert">{error}</p>}

        {/* ============ KPI ها ============ */}
        <div className="cards kpi-grid">
          <Link href="/consultations" className="card kpi-card highlight">
            <div className="kpi-top">
              <span className="kpi-label">درخواست جدید</span>
              <span className="kpi-icon gold">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v2a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h2a2 2 0 0 1 2 1.7c.13 1 .37 2 .71 2.9a2 2 0 0 1-.5 2.1L7.6 12.4a16 16 0 0 0 4 4l2.7-1.7a2 2 0 0 1 2.1.5c.9.34 1.9.58 2.9.71a2 2 0 0 1 1.7 2z"/></svg>
              </span>
            </div>
            <div className="kpi-value">{data ? data.consultationsNew.toLocaleString("fa-IR") : "…"}</div>
            <div className="kpi-foot">
              <span>۳۰ روز اخیر: {data ? data.consultationsLast30.toLocaleString("fa-IR") : "…"}</span>
              {data && <Delta current={data.consultationsLast30} previous={data.consultationsPrior30} />}
            </div>
            {data && <Sparkline values={data.consultationsDaily} color="#b8915a" ariaLabel="روند ۳۰ روزهٔ درخواست‌ها" />}
          </Link>

          <Link href="/consultations" className="card kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">در حال پیگیری</span>
              <span className="kpi-icon blue">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>
              </span>
            </div>
            <div className="kpi-value">{data ? data.consultationsInProgress.toLocaleString("fa-IR") : "…"}</div>
            <div className="kpi-foot"><span>صف فعال پیگیری شما</span></div>
          </Link>

          <Link href="/comments" className="card kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">دیدگاه در انتظار تأیید</span>
              <span className="kpi-icon purple">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.9-5.2A8 8 0 1 1 21 12z"/></svg>
              </span>
            </div>
            <div className="kpi-value">{data ? data.commentsPending.toLocaleString("fa-IR") : "…"}</div>
            <div className="kpi-foot"><span>تأییدشدهٔ کل: {data ? data.commentsApproved.toLocaleString("fa-IR") : "…"}</span></div>
          </Link>

          <Link href="/reports" className="card kpi-card">
            <div className="kpi-top">
              <span className="kpi-label">بازدید ۳۰ روز اخیر</span>
              <span className="kpi-icon green">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
              </span>
            </div>
            <div className="kpi-value">{data ? data.visitsLast30.toLocaleString("fa-IR") : "…"}</div>
            <div className="kpi-foot">
              <span>۳۰ روز قبل: {data ? data.visitsPrior30.toLocaleString("fa-IR") : "…"}</span>
              {data && <Delta current={data.visitsLast30} previous={data.visitsPrior30} />}
            </div>
            {data && <Sparkline values={data.dailyVisits} color="#0e9f6a" ariaLabel="روند ۳۰ روزهٔ بازدید" />}
          </Link>
        </div>

        <div className="dash-grid">
          {/* ============ ستون اصلی ============ */}
          <div className="dash-main">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>روند بازدید سایت</h2>
                  <span className="panel-sub">بازدید بی‌نام · بدون کوکی · مسیرهای عمومی</span>
                </div>
                <div className="tabs" role="group" aria-label="بازهٔ نمودار" style={{ margin: 0 }}>
                  {([7, 14, 30] as const).map((value) => (
                    <button key={value} type="button" className={`tab${range === value ? " active" : ""}`} onClick={() => setRange(value)}>
                      {value} روز
                    </button>
                  ))}
                </div>
              </div>
              {data ? (
                data.visitsLast30 === 0 && data.visitsPrior30 === 0 ? (
                  <p className="empty">هنوز بازدیدی ثبت نشده است. پس از انتشار نسخهٔ شمارش، داده‌ها اینجا نمایش داده می‌شود.</p>
                ) : (
                  <AreaChart values={chartSlice.values} labels={chartSlice.labels} ariaLabel="نمودار ناحیه‌ای بازدید روزانهٔ سایت" unit="بازدید" gradientId="dashVisits" />
                )
              ) : (
                <p className="row-meta">در حال بارگذاری نمودار…</p>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>آخرین درخواست‌های مشاوره</h2>
                <Link href="/consultations" className="nav-link" style={{ fontSize: "0.72rem", color: "var(--gold-deep)", textDecoration: "none", fontWeight: 800 }}>همهٔ درخواست‌ها ←</Link>
              </div>
              {data && data.recentConsultations.length === 0 ? (
                <p className="empty">هنوز درخواستی ثبت نشده است.</p>
              ) : (
                (data?.recentConsultations ?? []).map((row) => (
                  <div className="row" key={row.id}>
                    <div className="row-head">
                      <div className="row-identity">
                        <Avatar name={row.name} size={38} />
                        <div>
                          <span className="row-title">{row.name}</span>
                          <div className="row-meta">{row.topic} · <a className="mono" href={`tel:${row.phone}`}>{row.phone}</a></div>
                        </div>
                      </div>
                      <span className="row-meta">{formatDateTimeFa(row.created_at)}</span>
                    </div>
                    <div className="row-actions">
                      <span className={`badge ${row.status}`}>{CONSULTATION_STATUS[row.status]}</span>
                      <Link href="/consultations" className="btn secondary" style={{ padding: "5px 12px", fontSize: "0.72rem" }}>مدیریت ←</Link>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>روند روزانهٔ درخواست‌ها — ۳۰ روز اخیر</h2>
                </div>
              </div>
              {data ? (
                data.consultationsLast30 === 0 ? (
                  <p className="empty">در ۳۰ روز اخیر درخواستی ثبت نشده است.</p>
                ) : (
                  <BarChart values={data.consultationsDaily} labels={data.dailyLabels} ariaLabel="نمودار میله‌ای درخواست‌های روزانهٔ مشاوره" unit="درخواست" />
                )
              ) : (
                <p className="row-meta">در حال بارگذاری…</p>
              )}
            </section>
          </div>

          {/* ============ ستون کناری ============ */}
          <div className="dash-side">
            <section className="panel">
              <div className="panel-head">
                <h2>وضعیت نظرات (کل)</h2>
                <Link href="/comments" className="nav-link" style={{ fontSize: "0.72rem", color: "var(--gold-deep)", textDecoration: "none", fontWeight: 800 }}>مدیریت ←</Link>
              </div>
              {data ? (
                commentsTotal === 0 ? (
                  <p className="empty">هنوز دیدگاهی ثبت نشده است.</p>
                ) : (
                  <DonutChart
                    ariaLabel="توزیع وضعیت نظرات سایت"
                    centerLabel="دیدگاه"
                    centerValue={commentsTotal.toLocaleString("fa-IR")}
                    segments={[
                      { label: COMMENT_STATUS.pending, value: data.commentsPending, color: "#d9732b" },
                      { label: COMMENT_STATUS.approved, value: data.commentsApproved, color: "#0e9f6a" },
                      { label: COMMENT_STATUS.rejected, value: data.commentsRejected, color: "#b42318" },
                    ]}
                  />
                )
              ) : (
                <p className="row-meta">در حال بارگذاری…</p>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2>رویدادهای تازه</h2>
                <Link href="/notifications" className="nav-link" style={{ fontSize: "0.72rem", color: "var(--gold-deep)", textDecoration: "none", fontWeight: 800 }}>
                  همه ←{data && data.unreadNotifications > 0 ? ` (${data.unreadNotifications.toLocaleString("fa-IR")} جدید)` : ""}
                </Link>
              </div>
              {data && data.notifications.length === 0 ? (
                <p className="empty">هنوز رویدادی رخ نداده است.</p>
              ) : (
                (data?.notifications ?? []).map((item) => (
                  <Link key={item.id} href={item.ref_table === "consultations" ? "/consultations" : "/comments"} className={`notif-row${item.read ? "" : " unread"}`}>
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
                      <b>{page.views.toLocaleString("fa-IR")}</b>
                    </div>
                    <div className="top-bar">
                      <div className="top-bar-fill" style={{ width: `${(page.views / maxTopViews) * 100}%` }} />
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="panel">
              <h2>فعالیت‌های اخیر</h2>
              {timeline.length === 0 ? (
                <p className="empty">هنوز رویدادی ثبت نشده است.</p>
              ) : (
                <ol className="timeline">
                  {timeline.map((entry) => (
                    <li key={entry.id} className="timeline-item">
                      <span className={`timeline-dot ${entry.kind}`} aria-hidden="true" />
                      <div>
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
          </div>
        </div>
      </Shell>
    </AuthGate>
  );
}
