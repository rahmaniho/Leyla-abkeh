"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AuthGate from "../../components/AuthGate";
import DashboardLayout from "../../components/DashboardLayout";
import BarChart from "../../components/BarChart";
import AreaChart from "../../components/AreaChart";
import {
  supabase,
  CONSULTATION_STATUS,
  COMMENT_STATUS,
  type ConsultationStatus,
  type CommentStatus,
  type VisitStatRow,
} from "../../lib/supabase";
import { lastNDays, formatDateTimeFa, percentFa, type DayBucket } from "../../lib/dates";
import Link from "next/link";

type Preset = "7" | "30" | "90" | "custom";

interface TopicCount {
  topic: string;
  count: number;
}

interface ReportData {
  days: DayBucket[];
  // مشاوره
  consultationsTotal: number;
  consultationsByStatus: Record<ConsultationStatus, number>;
  consultationsDaily: number[];
  topTopics: TopicCount[];
  // نظرات
  commentsByStatus: Record<CommentStatus, number>;
  // بازدید
  visitsTotal: number;
  dailyVisits: number[];
  topPages: { path: string; views: number }[];
  // مقالات (بهترین تلاش ممکن)
  articlesState: "loading" | "ok" | "unavailable";
  articlesCount: number | null;
}

const numFa = (value: number) => value.toLocaleString("fa-IR");

function toUtcKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function rangeFromPreset(preset: Preset, customFrom: string, customTo: string): DayBucket[] | { error: string } {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 12));

  if (preset !== "custom") {
    return lastNDays(Number(preset));
  }
  if (!customFrom || !customTo) return { error: "بازهٔ تاریخ را کامل انتخاب کنید." };
  const from = new Date(`${customFrom}T12:00:00Z`);
  const to = new Date(`${customTo}T12:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    return { error: "بازهٔ تاریخ نامعتبر است." };
  }
  const length = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (length > 366) return { error: "حداکثر بازهٔ مجاز ۳۶۶ روز است." };

  const days: DayBucket[] = [];
  for (let i = 0; i < length; i += 1) {
    const date = new Date(from.getTime() + i * 86_400_000);
    days.push({
      key: toUtcKey(date),
      label: new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
    });
  }
  return days;
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(report: ReportData, rangeLabel: string, generatedAt: string): string {
  const lines: string[] = [];
  const push = (cells: (string | number)[]) => lines.push(cells.map(csvCell).join(","));

  push(["گزارش عملکرد سایت — دفتر وکالت لیلا آبکه"]);
  push(["بازه", rangeLabel]);
  push(["زمان تولید", formatDateTimeFa(generatedAt)]);
  lines.push("");

  push(["شاخص", "مقدار"]);
  push(["کل درخواست‌های مشاوره", report.consultationsTotal]);
  push(["درخواست جدید", report.consultationsByStatus.new]);
  push(["در حال پیگیری", report.consultationsByStatus.in_progress]);
  push(["انجام‌شده", report.consultationsByStatus.done]);
  push(["لغوشده", report.consultationsByStatus.cancelled]);
  push(["دیدگاه در انتظار تأیید", report.commentsByStatus.pending]);
  push(["دیدگاه تأییدشده", report.commentsByStatus.approved]);
  push(["دیدگاه ردشده", report.commentsByStatus.rejected]);
  push(["بازدید کل صفحات", report.visitsTotal]);
  push(["تعداد مقالات (GitHub)", report.articlesCount ?? "در دسترس نیست"]);
  lines.push("");

  push(["روز", "بازدید", "درخواست مشاوره"]);
  report.days.forEach((day, index) => {
    push([day.key, report.dailyVisits[index] ?? 0, report.consultationsDaily[index] ?? 0]);
  });
  lines.push("");

  push(["مسیر صفحه", "بازدید"]);
  for (const page of report.topPages) push([page.path, page.views]);
  lines.push("");

  push(["موضوع مشاوره", "تعداد"]);
  for (const topic of report.topTopics) push([topic.topic, topic.count]);

  // BOM برای باز شدن صحیح فارسی در Excel
  return "\ufeff" + lines.join("\r\n");
}

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>("30");
  const [customFrom, setCustomFrom] = useState(() => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 29);
    return toUtcKey(date);
  });
  const [customTo, setCustomTo] = useState(() => toUtcKey(new Date()));
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>(() => new Date().toISOString());

  const rangeLabel = useMemo(() => {
    if (preset === "custom") return `${customFrom} تا ${customTo}`;
    return `${preset} روز اخیر`;
  }, [preset, customFrom, customTo]);

  const load = useCallback(async () => {
    const daysResult = rangeFromPreset(preset, customFrom, customTo);
    if (!Array.isArray(daysResult)) {
      setError(daysResult.error);
      return;
    }
    const days = daysResult;
    setLoading(true);
    setError(null);

    const fromIso = days[0].key + "T00:00:00.000Z";
    const toIso = days[days.length - 1].key + "T23:59:59.999Z";

    if (!supabase) {
      setError("اتصال Supabase پیکربندی نشده است.");
      setLoading(false);
      return;
    }
    const client = supabase;

    try {
      const [consultationsRes, commentsRes, visitsRes] = await Promise.all([
        client.from("consultations").select("created_at, status, topic").gte("created_at", fromIso).lte("created_at", toIso),
        client.from("comments").select("created_at, status").gte("created_at", fromIso).lte("created_at", toIso),
        client.from("visit_stats").select("day, path, views").gte("day", days[0].key).lte("day", days[days.length - 1].key),
      ]);

      if (consultationsRes.error || commentsRes.error || visitsRes.error) {
        setError("بارگذاری داده‌های گزارش ناموفق بود.");
        setLoading(false);
        return;
      }

      const consultationRows = (consultationsRes.data as { created_at: string; status: ConsultationStatus; topic: string | null }[]) ?? [];
      const commentRows = (commentsRes.data as { created_at: string; status: CommentStatus }[]) ?? [];
      const visitRows = (visitsRes.data as VisitStatRow[]) ?? [];

      const consultationsByStatus: Record<ConsultationStatus, number> = { new: 0, in_progress: 0, done: 0, cancelled: 0 };
      const topicMap = new Map<string, number>();
      const consultationsDailyMap = new Map(days.map((day) => [day.key, 0]));
      for (const row of consultationRows) {
        if (row.status in consultationsByStatus) consultationsByStatus[row.status] += 1;
        const topic = (row.topic ?? "").trim();
        if (topic) topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
        const key = new Date(row.created_at).toISOString().slice(0, 10);
        if (consultationsDailyMap.has(key)) consultationsDailyMap.set(key, (consultationsDailyMap.get(key) ?? 0) + 1);
      }

      const commentsByStatus: Record<CommentStatus, number> = { pending: 0, approved: 0, rejected: 0 };
      for (const row of commentRows) {
        if (row.status in commentsByStatus) commentsByStatus[row.status] += 1;
      }

      const dailyVisitMap = new Map(days.map((day) => [day.key, 0]));
      const perPath = new Map<string, number>();
      let visitsTotal = 0;
      for (const row of visitRows) {
        const views = Number(row.views) || 0;
        if (dailyVisitMap.has(row.day)) {
          dailyVisitMap.set(row.day, (dailyVisitMap.get(row.day) ?? 0) + views);
          visitsTotal += views;
          perPath.set(row.path, (perPath.get(row.path) ?? 0) + views);
        }
      }

      setData({
        days,
        consultationsTotal: consultationRows.length,
        consultationsByStatus,
        consultationsDaily: days.map((day) => consultationsDailyMap.get(day.key) ?? 0),
        topTopics: [...topicMap.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 6),
        commentsByStatus,
        visitsTotal,
        dailyVisits: days.map((day) => dailyVisitMap.get(day.key) ?? 0),
        topPages: [...perPath.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 8),
        articlesState: "loading",
        articlesCount: null,
      });
      setGeneratedAt(new Date().toISOString());
    } catch {
      setError("بارگذاری داده‌های گزارش ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    load();
  }, [load]);

  // تعداد مقالات را به‌صورت بهترین تلاش (اختیاری) از /api/articles می‌خوانیم
  useEffect(() => {
    if (!data || data.articlesState !== "loading") return;
    let cancelled = false;

    async function loadArticles() {
      try {
        if (!supabase) throw new Error("no-supabase");
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        const response = await fetch("/api/articles", {
          headers: token ? { authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          if (!cancelled) setData((current) => (current ? { ...current, articlesState: "unavailable" } : current));
          return;
        }
        const payload = (await response.json()) as { ok: boolean; articles?: unknown[] };
        if (!cancelled) {
          setData((current) =>
            current ? { ...current, articlesState: "ok", articlesCount: payload.articles?.length ?? 0 } : current,
          );
        }
      } catch {
        if (!cancelled) setData((current) => (current ? { ...current, articlesState: "unavailable" } : current));
      }
    }

    loadArticles();
    return () => {
      cancelled = true;
    };
  }, [data]);

  function exportCsv() {
    if (!data) return;
    const csv = buildCsv(data, rangeLabel, generatedAt);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `leyla-abkeh-report-${data.days[0].key}_${data.days[data.days.length - 1].key}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const consultationsShare = data ? percentFa(data.consultationsByStatus.done, data.consultationsTotal) : "—";

  return (
    <AuthGate>
      <DashboardLayout>
        <nav className="breadcrumb no-print" aria-label="مسیر صفحه"><Link href="/">خانه</Link><span aria-hidden="true">‹</span><span aria-current="page">گزارش‌ها</span></nav>
        
        <div className="page-head no-print">
          <div>
            <h1 className="page-title">گزارش‌ها</h1>
            <p className="page-sub">خلاصهٔ عملکرد سایت در بازهٔ انتخابی — خروجی CSV و چاپ برای بایگانی یا مدیران ارشد</p>
          </div>
          <div className="report-actions">
            <button type="button" className="btn secondary" onClick={exportCsv} disabled={!data}>
              خروجی CSV اکسل
            </button>
            <button type="button" className="btn" onClick={() => window.print()} disabled={!data}>
              چاپ / PDF
            </button>
          </div>
        </div>

        {/* ---------- انتخاب بازه ---------- */}
        <div className="panel no-print" style={{ padding: "12px 16px" }}>
          <div className="tabs" style={{ marginBottom: preset === "custom" ? 12 : 0 }}>
            {(["7", "30", "90"] as Preset[]).map((value) => (
              <button key={value} type="button" className={`tab${preset === value ? " active" : ""}`} onClick={() => setPreset(value)}>
                {value} روز اخیر
              </button>
            ))}
            <button type="button" className={`tab${preset === "custom" ? " active" : ""}`} onClick={() => setPreset("custom")}>
              بازهٔ دلخواه
            </button>
          </div>
          {preset === "custom" && (
            <div className="custom-range">
              <label>
                از تاریخ (میلادی)
                <input type="date" value={customFrom} max={customTo} onChange={(event) => setCustomFrom(event.target.value)} />
              </label>
              <label>
                تا تاریخ (میلادی)
                <input type="date" value={customTo} min={customFrom} max={toUtcKey(new Date())} onChange={(event) => setCustomTo(event.target.value)} />
              </label>
              <button type="button" className="btn secondary" onClick={load} disabled={loading}>اعمال بازه</button>
            </div>
          )}
        </div>

        {error && <p className="msg err" role="alert">{error}</p>}

        {/* ---------- سربرگ چاپی ---------- */}
        <div className="print-only print-letterhead">
          <strong>دفتر وکالت لیلا آبکه — گزارش عملکرد سایت</strong>
          <span>بازه: {rangeLabel} · زمان تولید: {formatDateTimeFa(generatedAt)}</span>
        </div>

        {loading && !data && <p className="row-meta">در حال تولید گزارش…</p>}

        {data && (
          <>
            {/* ---------- KPI های خلاصه ---------- */}
            <div className="cards kpi-grid">
              <div className="card kpi-card highlight">
                <div className="kpi-top">
                  <span className="kpi-label">درخواست مشاوره در بازه</span>
                  <span className="kpi-icon gold">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 8h6M9 12h6"/></svg>
                  </span>
                </div>
                <div className="kpi-value">{numFa(data.consultationsTotal)}</div>
                <div className="kpi-foot"><span>انجام‌شده: {numFa(data.consultationsByStatus.done)}</span></div>
              </div>
              <div className="card kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">دیدگاه در انتظار تأیید</span>
                  <span className="kpi-icon purple">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.9-5.2A8 8 0 1 1 21 12z"/></svg>
                  </span>
                </div>
                <div className="kpi-value">{numFa(data.commentsByStatus.pending)}</div>
                <div className="kpi-foot"><span>تأییدشده: {numFa(data.commentsByStatus.approved)}</span></div>
              </div>
              <div className="card kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">بازدید صفحه در بازه</span>
                  <span className="kpi-icon green">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
                  </span>
                </div>
                <div className="kpi-value">{numFa(data.visitsTotal)}</div>
                <div className="kpi-foot"><span>بی‌نام · بدون کوکی</span></div>
              </div>
              <div className="card kpi-card">
                <div className="kpi-top">
                  <span className="kpi-label">سهم درخواست‌های انجام‌شده</span>
                  <span className="kpi-icon blue">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                </div>
                <div className="kpi-value">{consultationsShare}</div>
                <div className="kpi-foot"><span>از کل درخواست‌های بازه</span></div>
              </div>
            </div>

            {/* ---------- مشاوره ---------- */}
            <section className="panel">
              <h2>درخواست‌های مشاوره — {rangeLabel}</h2>
              <table className="report-table">
                <tbody>
                  {(Object.keys(CONSULTATION_STATUS) as ConsultationStatus[]).map((status) => (
                    <tr key={status}>
                      <th>{CONSULTATION_STATUS[status]}</th>
                      <td>{numFa(data.consultationsByStatus[status])}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <th>جمع کل</th>
                    <td>{numFa(data.consultationsTotal)}</td>
                  </tr>
                </tbody>
              </table>
              {data.consultationsTotal === 0 ? (
                <p className="empty">در این بازه درخواست مشاوره‌ای ثبت نشده است.</p>
              ) : (
                <>
                  <h3 className="report-h3">روند روزانهٔ درخواست‌ها</h3>
                  <BarChart values={data.consultationsDaily} labels={data.days.map((day) => day.label)} ariaLabel="نمودار میله‌ای تعداد روزانهٔ درخواست مشاوره" unit="درخواست" />
                  {data.topTopics.length > 0 && (
                    <>
                      <h3 className="report-h3">موضوعات پرتکرار</h3>
                      <table className="report-table">
                        <thead>
                          <tr><th>موضوع</th><th>تعداد</th></tr>
                        </thead>
                        <tbody>
                          {data.topTopics.map((topic) => (
                            <tr key={topic.topic}><td>{topic.topic}</td><td>{numFa(topic.count)}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </>
              )}
            </section>

            {/* ---------- نظرات ---------- */}
            <section className="panel">
              <h2>نظرات — {rangeLabel}</h2>
              <table className="report-table">
                <tbody>
                  {(Object.keys(COMMENT_STATUS) as CommentStatus[]).map((status) => (
                    <tr key={status}>
                      <th>{COMMENT_STATUS[status]}</th>
                      <td>{numFa(data.commentsByStatus[status])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* ---------- بازدید ---------- */}
            <section className="panel">
              <h2>بازدید سایت — {rangeLabel}</h2>
              {data.visitsTotal === 0 ? (
                <p className="empty">در این بازه بازدیدی ثبت نشده است. شمارش از زمان انتشار این نسخه به‌صورت خودکار انجام می‌شود.</p>
              ) : (
                <>
                  <h3 className="report-h3">روند روزانهٔ بازدید</h3>
                  <AreaChart values={data.dailyVisits} labels={data.days.map((day) => day.label)} ariaLabel="نمودار ناحیه‌ای بازدید روزانهٔ سایت" unit="بازدید" stroke="#0e9f6a" gradientId="reportVisits" />
                  <h3 className="report-h3">پربازدیدترین صفحه‌ها</h3>
                  <table className="report-table">
                    <thead>
                      <tr><th>مسیر صفحه</th><th>بازدید</th><th>سهم</th></tr>
                    </thead>
                    <tbody>
                      {data.topPages.map((page) => (
                        <tr key={page.path}>
                          <td className="mono">{page.path}</td>
                          <td>{numFa(page.views)}</td>
                          <td>{percentFa(page.views, data.visitsTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </section>

            {/* ---------- مقالات ---------- */}
            <section className="panel">
              <h2>مقالات</h2>
              {data.articlesState === "loading" ? (
                <p className="row-meta">در حال دریافت آمار مقالات…</p>
              ) : data.articlesState === "ok" ? (
                <p className="row-body">تعداد مقالات منتشرشده/پیش‌نویس موجود در مخزن: <strong>{numFa(data.articlesCount ?? 0)}</strong> (خوانده‌شده از GitHub)</p>
              ) : (
                <p className="empty">آمار مقالات در دسترس نیست؛ توکن GITHUB_TOKEN در تنظیمات پنل پیکربندی نشده یا GitHub پاسخ نداد.</p>
              )}
            </section>
          </>
        )}
      </DashboardLayout>
    </AuthGate>
  );
}
