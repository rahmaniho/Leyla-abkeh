"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AuthGate from "../components/AuthGate";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ArticlesTable, { articleStatus, formatJalali, type DashboardArticle } from "../components/ArticlesTable";
import {
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Newspaper,
  PenLine,
  PhoneCall,
  Eye,
  Plus,
  FilePlus2,
  ExternalLink,
  FileDown,
  MessageSquare,
} from "lucide-react";
import {
  supabase,
  CONSULTATION_STATUS,
  type ConsultationRow,
  type AdminNotification,
  type VisitStatRow,
} from "../lib/supabase";
import { lastNDays, relativeTimeFa, formatDateTimeFa } from "../lib/dates";
import { buildDemoData, buildDemoArticles } from "../lib/demo";

interface DashboardData {
  consultationsNew: number;
  consultationsInProgress: number;
  consultationsLast30: number;
  consultationsPrior30: number;
  consultationsDaily: number[];
  consultationsDailyAll: number[];
  commentsPending: number;
  visitsLast30: number;
  visitsPrior30: number;
  dailyVisits: number[];
  dailyArticleViews: number[];
  dailyLabels: string[];
  topPages: { path: string; views: number }[];
  recentConsultations: ConsultationRow[];
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

const CHART_COLORS = {
  visits: "#5796F5",
  articleViews: "#AD6AE8",
  consultations: "#F2A45E",
} as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const [articles, setArticles] = useState<DashboardArticle[] | null>(null);
  const [articlesState, setArticlesState] = useState<"loading" | "ready" | "error" | "unconfigured">("loading");
  const [articlesMessage, setArticlesMessage] = useState("");
  // حالت نمایشی (?demo=1): دادهٔ قطعیِ ساختگی + نوار هشدار «حالت نمایشی»؛ هرگز به‌عنوان دادهٔ واقعی
  const [demo] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("demo") === "1");

  const loadArticles = useCallback(async () => {
    if (demo) {
      setArticles(buildDemoArticles());
      setArticlesState("ready");
      return;
    }
    setArticlesState((state) => (state === "ready" ? state : "loading"));
    try {
      const headers: Record<string, string> = {};
      if (supabase) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) headers.authorization = `Bearer ${token}`;
      }
      const response = await fetch("/api/articles", { headers });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; articles?: DashboardArticle[]; message?: string };
      if (response.status === 501) {
        setArticlesState("unconfigured");
        setArticlesMessage(payload.message ?? "GITHUB_TOKEN در تنظیمات Vercel تنظیم نشده است.");
        setArticles([]);
        return;
      }
      if (!response.ok || !payload.ok) {
        setArticlesState("error");
        setArticlesMessage(payload.message ?? "دریافت فهرست مقالات ناموفق بود.");
        return;
      }
      setArticles(payload.articles ?? []);
      setArticlesState("ready");
    } catch {
      setArticlesState("error");
      setArticlesMessage("دریافت فهرست مقالات ناموفق بود. اتصال شبکه را بررسی کنید.");
    }
  }, [demo]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  useEffect(() => {
    if (demo) {
      setData(buildDemoData());
      return;
    }
    if (!supabase) return;
    let mounted = true;

    async function load() {
      try {
        const client = supabase!;
        const days90 = lastNDays(90);
        const since90 = days90[0].key + "T00:00:00.000Z";
        const days30 = lastNDays(30);
        const since30 = days30[0].key + "T00:00:00.000Z";
        const priorDays = lastNDays(60);
        const priorSince = priorDays[0].key + "T00:00:00.000Z";

        const [
          newCount,
          inProgress,
          consultationsLast30,
          consultationsPrior30,
          consultationsRows90,
          commentsPending,
          visitRows,
          recentConsultations,
          notifications,
          unread,
        ] = await Promise.all([
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
          client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "in_progress"),
          client.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", since30),
          client.from("consultations").select("id", { count: "exact", head: true }).gte("created_at", priorSince).lt("created_at", since30),
          client.from("consultations").select("created_at").gte("created_at", since90),
          client.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
          client.from("visit_stats").select("day, path, views").gte("day", days90[0].key),
          client.from("consultations").select("*").order("created_at", { ascending: false }).limit(4),
          client.from("admin_notifications").select("*").order("created_at", { ascending: false }).limit(5),
          client.from("admin_notifications").select("id", { count: "exact", head: true }).eq("read", false),
        ]);

        if (!mounted) return;

        const dayBuckets90 = new Map(days90.map((day) => [day.key, 0]));
        const articleBuckets90 = new Map(days90.map((day) => [day.key, 0]));
        let visitsLast30 = 0;
        let visitsPrior30 = 0;
        const perPath = new Map<string, number>();
        const inLast30 = new Set(days30.map((day) => day.key));

        for (const row of (visitRows.data as VisitStatRow[] | null) ?? []) {
          const views = Number(row.views) || 0;
          const isArticle = typeof row.path === "string" && row.path.startsWith("/articles/");
          if (dayBuckets90.has(row.day)) {
            dayBuckets90.set(row.day, (dayBuckets90.get(row.day) ?? 0) + views);
            if (isArticle) articleBuckets90.set(row.day, (articleBuckets90.get(row.day) ?? 0) + views);
          }
          if (inLast30.has(row.day)) {
            visitsLast30 += views;
            perPath.set(row.path, (perPath.get(row.path) ?? 0) + views);
          } else {
            visitsPrior30 += views;
          }
        }

        const consultationsDailyMap = new Map(days90.map((day) => [day.key, 0]));
        for (const row of (consultationsRows90.data as { created_at: string }[] | null) ?? []) {
          const key = new Date(row.created_at).toISOString().slice(0, 10);
          if (consultationsDailyMap.has(key)) consultationsDailyMap.set(key, (consultationsDailyMap.get(key) ?? 0) + 1);
        }

        const consultationsDaily90 = days90.map((day) => consultationsDailyMap.get(day.key) ?? 0);

        setData({
          consultationsNew: newCount.count ?? 0,
          consultationsInProgress: inProgress.count ?? 0,
          consultationsLast30: consultationsLast30.count ?? 0,
          consultationsPrior30: consultationsPrior30.count ?? 0,
          consultationsDaily: consultationsDaily90.slice(-30),
          consultationsDailyAll: consultationsDaily90,
          commentsPending: commentsPending.count ?? 0,
          visitsLast30,
          visitsPrior30,
          dailyVisits: days90.map((day) => dayBuckets90.get(day.key) ?? 0),
          dailyArticleViews: days90.map((day) => articleBuckets90.get(day.key) ?? 0),
          dailyLabels: days90.map((day) => day.label),
          topPages: [...perPath.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 5),
          recentConsultations: (recentConsultations.data as ConsultationRow[]) ?? [],
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
  }, [demo]);

  const timeline = useMemo<TimelineEntry[]>(() => {
    if (!data) return [];
    const entries: TimelineEntry[] = [];
    for (const row of data.recentConsultations) {
      entries.push({ id: `c-${row.id}`, at: row.created_at, kind: "consultation", title: `درخواست مشاوره — ${row.name}`, detail: row.topic, href: "/consultations" });
    }
    for (const item of data.notifications.filter((n) => n.ref_table === "comments" && !n.read)) {
      entries.push({ id: `m-${item.id}`, at: item.created_at, kind: "comment", title: item.title, detail: item.body, href: "/comments" });
    }
    return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
  }, [data]);

  // دادهٔ نمودار برای بازهٔ انتخابی (۷ / ۳۰ / ۹۰ روز اخیر)
  const chartData = useMemo(() => {
    if (!data) return [] as { label: string; visits: number; articleViews: number; consultations: number }[];
    return data.dailyLabels.slice(-range).map((label, index) => {
      const offset = data.dailyLabels.length - range;
      return {
        label,
        visits: data.dailyVisits[offset + index],
        articleViews: data.dailyArticleViews[offset + index],
        consultations: data.consultationsDailyAll[offset + index],
      };
    });
  }, [data, range]);

  const articleStats = useMemo(() => {
    if (!articles) return { published: 0, drafts: 0, scheduled: 0, total: 0 };
    let published = 0, drafts = 0, scheduled = 0;
    for (const article of articles) {
      const status = articleStatus(article);
      if (status === "published") published += 1;
      else if (status === "draft") drafts += 1;
      else scheduled += 1;
    }
    return { published, drafts, scheduled, total: articles.length };
  }, [articles]);

  const latestArticles = useMemo(() => {
    if (!articles) return [] as DashboardArticle[];
    return [...articles]
      .sort((a, b) => {
        const aTime = a.publishDate ? new Date(a.publishDate).getTime() : 0;
        const bTime = b.publishDate ? new Date(b.publishDate).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [articles]);

  const contentStatusSegments = useMemo(
    () => [
      { name: "منتشرشده", value: articleStats.published, color: "#2DCF91" },
      { name: "زمان‌بندی‌شده", value: articleStats.scheduled, color: "#5796F5" },
      { name: "پیش‌نویس", value: articleStats.drafts, color: "#8B93A5" },
    ].filter((segment) => segment.value > 0),
    [articleStats]
  );

  const maxTopViews = data ? Math.max(1, ...data.topPages.map((page) => page.views)) : 1;
  const articlesReady = articlesState === "ready";

  return (
    <AuthGate>
      <DashboardLayout>
        {/* ============ سرصفحه: مسیر + اقدام‌ها ============ */}
        <nav className="breadcrumb no-print" aria-label="مسیر صفحه">
          <Link href="/">خانه</Link>
          <span aria-hidden="true">‹</span>
          <span aria-current="page">داشبورد</span>
        </nav>
        <div className="page-head">
          <div>
            <h1 className="page-title">داشبورد</h1>
            <p className="page-sub">نمای کلی زندهٔ عملکرد سایت، محتوا و کارهای در انتظار اقدام</p>
          </div>
          <div className="page-actions no-print">
            {data && data.commentsPending > 0 && (
              <Link href="/comments" className="btn secondary sm" title="دیدگاه‌های در انتظار تأیید">
                <MessageSquare size={15} strokeWidth={2} aria-hidden="true" />
                {data.commentsPending.toLocaleString("fa-IR")} دیدگاه در انتظار
              </Link>
            )}
            <Link href="/articles" className="btn gold sm">
              <Plus size={15} strokeWidth={2.4} aria-hidden="true" /> افزودن مقاله
            </Link>
            <Link href="/coming-soon?module=pages" className="btn secondary sm">
              <FilePlus2 size={15} strokeWidth={2} aria-hidden="true" /> ایجاد صفحه
            </Link>
            <a href="https://leyla-abkeh.ir" target="_blank" rel="noreferrer" className="btn secondary sm">
              <ExternalLink size={15} strokeWidth={2} aria-hidden="true" /> مشاهده وب‌سایت
            </a>
            <Link href="/reports" className="btn secondary sm">
              <FileDown size={15} strokeWidth={2} aria-hidden="true" /> خروجی گزارش
            </Link>
          </div>
        </div>

        {demo && (
          <p className="msg info demo-ribbon" role="status">
            <strong>حالت نمایشی</strong> — ارقام این صفحه دادهٔ ساختگیِ قطعی برای پیش‌نمایش رابط کاربری‌اند، نه دادهٔ واقعی دفتر.
          </p>
        )}
        {error && <p className="msg err" role="alert">{error}</p>}
        {!articlesReady && articlesState !== "loading" && (
          <p className={`msg ${articlesState === "unconfigured" ? "info" : "err"}`} role="status">
            {articlesMessage}
          </p>
        )}

        {/* ============ KPI ها (دادهٔ واقعی) ============ */}
        <div className="cards kpi-grid">
          <StatCard
            icon={Newspaper}
            tone="blue"
            label="مقالات منتشرشده"
            value={articlesReady ? articleStats.published : "…"}
            sub={articlesReady ? `از ${articleStats.total.toLocaleString("fa-IR")} مقالهٔ کل${articleStats.scheduled ? ` · ${articleStats.scheduled.toLocaleString("fa-IR")} زمان‌بندی‌شده` : ""}` : "دریافت از مخزن Git…"}
            href="/articles"
          />
          <StatCard
            icon={PenLine}
            tone="orange"
            label="پیش‌نویس مقالات"
            value={articlesReady ? articleStats.drafts : "…"}
            sub="در دست ویرایش — منتشر نشده‌اند"
            href="/articles"
          />
          <StatCard
            icon={PhoneCall}
            tone="green"
            label="درخواست‌های مشاوره جدید"
            value={data ? data.consultationsNew : "…"}
            sub={data ? `۳۰ روز اخیر: ${data.consultationsLast30.toLocaleString("fa-IR")}` : "…"}
            delta={data ? { current: data.consultationsLast30, previous: data.consultationsPrior30 } : null}
            spark={data?.consultationsDaily}
            href="/consultations"
          />
          <StatCard
            icon={Eye}
            tone="purple"
            label="بازدید ۳۰ روز اخیر"
            value={data ? data.visitsLast30 : "…"}
            sub={data ? `۳۰ روز قبل: ${data.visitsPrior30.toLocaleString("fa-IR")}` : "…"}
            delta={data ? { current: data.visitsLast30, previous: data.visitsPrior30 } : null}
            spark={data?.dailyVisits.slice(-30)}
            href="/reports"
          />
        </div>

        {/* ============ نمودار ترکیبی + وضعیت محتوا ============ */}
        <div className="dash-grid">
          <section className="panel" aria-label="روند بازدید و درخواست‌ها">
            <div className="panel-head">
              <div>
                <h2>روند بازدید و درخواست‌های مشاوره</h2>
                <span className="panel-sub">بازدید بی‌نام · بدون کوکی · دادهٔ واقعی پایگاه‌داده</span>
              </div>
              <div className="tabs no-print" role="group" aria-label="بازهٔ نمودار">
                {([7, 30, 90] as const).map((value) => (
                  <button key={value} type="button" className={`tab${range === value ? " active" : ""}`} onClick={() => setRange(value)}>
                    {value} روز
                  </button>
                ))}
              </div>
            </div>
            {data ? (
              data.visitsLast30 === 0 && data.visitsPrior30 === 0 ? (
                <p className="empty">هنوز بازدیدی ثبت نشده است. پس از انتشار شمارشگر بی‌نام، داده‌ها اینجا نمایش داده می‌شود.</p>
              ) : (
                <>
                  <div dir="ltr" style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-strong)" />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--text-2)" }}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={18}
                        />
                        <YAxis
                          yAxisId="views"
                          orientation="left"
                          width={36}
                          tick={{ fontSize: 11, fill: "var(--text-2)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="consult"
                          orientation="right"
                          width={30}
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "var(--text-2)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "var(--blue-tint)" }}
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--line-strong)",
                            borderRadius: 12,
                            fontSize: "0.74rem",
                            fontFamily: "inherit",
                          }}
                        />
                        <Bar yAxisId="views" dataKey="visits" name="بازدید کل" fill={CHART_COLORS.visits} radius={[6, 6, 0, 0]} maxBarSize={26} />
                        <Line yAxisId="views" type="monotone" dataKey="articleViews" name="بازدید مقالات" stroke={CHART_COLORS.articleViews} strokeWidth={2.4} dot={false} />
                        <Line yAxisId="consult" type="monotone" dataKey="consultations" name="درخواست مشاوره" stroke={CHART_COLORS.consultations} strokeWidth={2.4} dot={{ r: 2.4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-legend" dir="rtl">
                    <span><i style={{ background: CHART_COLORS.visits }} /> بازدید کل</span>
                    <span><i style={{ background: CHART_COLORS.articleViews }} /> بازدید مقالات</span>
                    <span><i style={{ background: CHART_COLORS.consultations }} /> درخواست مشاوره</span>
                  </div>
                </>
              )
            ) : (
              <p className="row-meta">در حال بارگذاری نمودار…</p>
            )}
          </section>

          {/* ---------- وضعیت محتوای سایت ---------- */}
          <section className="panel" aria-label="وضعیت محتوای سایت">
            <div className="panel-head">
              <div>
                <h2>وضعیت محتوای سایت</h2>
                <span className="panel-sub">بر اساس فرانت‌متر فایل‌های مقاله در مخزن</span>
              </div>
            </div>
            {articlesReady && articleStats.total > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <div dir="ltr" style={{ position: "relative", width: 150, height: 150, flex: "0 0 auto" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={contentStatusSegments} dataKey="value" nameKey="name" innerRadius={52} outerRadius={70} paddingAngle={3} strokeWidth={2} stroke="var(--surface)">
                        {contentStatusSegments.map((segment) => (
                          <Cell key={segment.name} fill={segment.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--line-strong)",
                          borderRadius: 12,
                          fontSize: "0.74rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <b style={{ fontSize: "1.25rem", color: "var(--text)", lineHeight: 1 }}>{articleStats.total.toLocaleString("fa-IR")}</b>
                    <span style={{ fontSize: "0.58rem", color: "var(--text-2)" }}>مقاله</span>
                  </div>
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: "0.74rem" }}>
                  {contentStatusSegments.map((segment) => (
                    <li key={segment.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i style={{ width: 11, height: 11, borderRadius: 3, background: segment.color, display: "inline-block" }} />
                      <span style={{ color: "var(--text-2)" }}>{segment.name}</span>
                      <b style={{ color: "var(--text)" }}>{segment.value.toLocaleString("fa-IR")}</b>
                    </li>
                  ))}
                </ul>
              </div>
            ) : articlesReady ? (
              <p className="empty">هنوز مقاله‌ای در مخزن ثبت نشده است.</p>
            ) : (
              <p className="row-meta">در حال دریافت وضعیت محتوا…</p>
            )}
            <p className="panel-sub" style={{ marginTop: 10 }}>حالت «در بازبینی» پس از راه‌اندازی گردش‌کار تأیید محتوا اضافه می‌شود.</p>
          </section>
        </div>

        {/* ============ سه کارت ثانویه ============ */}
        <div className="grid-3">
          {/* مقالات اخیر */}
          <section className="panel" aria-label="مقالات اخیر">
            <div className="panel-head">
              <h2>مقالات اخیر</h2>
              <Link href="/articles" className="nav-link">همه ←</Link>
            </div>
            {articlesReady && latestArticles.length === 0 ? (
              <p className="empty">هنوز مقاله‌ای ثبت نشده است.</p>
            ) : (
              (latestArticles ?? []).map((article) => (
                <div className="notif-row" key={article.slug} style={{ padding: "8px 6px" }}>
                  <span className="notif-body" style={{ gap: 3 }}>
                    <a className="notif-title" style={{ textDecoration: "none", lineHeight: 1.9 }} href={`https://leyla-abkeh.ir/articles/${article.slug}`} target="_blank" rel="noreferrer">
                      {article.title ?? article.slug}
                    </a>
                    <span className="timeline-meta">
                      <span>{formatJalali(article.publishDate)}</span>
                      <StatusBadge type="article" status={articleStatus(article)} />
                    </span>
                  </span>
                </div>
              ))
            )}
            {!articlesReady && articlesState === "loading" && <p className="row-meta">در حال بارگذاری…</p>}
          </section>

          {/* فعالیت‌های اخیر */}
          <section className="panel" aria-label="فعالیت‌های اخیر">
            <div className="panel-head">
              <h2>فعالیت‌های اخیر</h2>
              <Link href="/notifications" className="nav-link">همه ←</Link>
            </div>
            {timeline.length === 0 ? (
              <p className="empty">{data ? "هنوز رویدادی ثبت نشده است." : "در حال بارگذاری…"}</p>
            ) : (
              <ol className="timeline">
                {timeline.map((entry) => (
                  <li key={entry.id} className="timeline-item">
                    <span className={`timeline-dot ${entry.kind}`} aria-hidden="true" />
                    <div>
                      <Link href={entry.href} className="timeline-title">{entry.title}</Link>
                      <div className="timeline-meta">
                        <span>{entry.detail}</span>
                        <time dateTime={entry.at}>{relativeTimeFa(entry.at)}</time>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* صفحات پربازدید */}
          <section className="panel" aria-label="صفحات پربازدید">
            <div className="panel-head">
              <h2>صفحات پربازدید — ۳۰ روز</h2>
              <Link href="/reports" className="nav-link">گزارش ←</Link>
            </div>
            {data && data.topPages.length === 0 ? (
              <p className="empty">داده‌ای برای نمایش نیست.</p>
            ) : (
              (data?.topPages ?? []).map((page) => (
                <div className="top-page" key={page.path}>
                  <div className="top-page-head">
                    <span className="mono top-path" dir="ltr">{page.path}</span>
                    <b>{page.views.toLocaleString("fa-IR")}</b>
                  </div>
                  <div className="top-bar">
                    <div className="top-bar-fill" style={{ width: `${(page.views / maxTopViews) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
            {!data && <p className="row-meta">در حال بارگذاری…</p>}
          </section>
        </div>

        {/* ============ آخرین مقالات (جدول کامل) ============ */}
        <section className="panel" aria-label="آخرین مقالات">
          <div className="panel-head">
            <div>
              <h2>آخرین مقالات</h2>
              <span className="panel-sub">جستجو، فیلتر وضعیت، مرتب‌سازی و صفحه‌بندی روی محتوای مخزن</span>
            </div>
            <Link href="/articles" className="btn secondary sm no-print">
              <Plus size={15} strokeWidth={2.2} aria-hidden="true" /> افزودن مقاله
            </Link>
          </div>
          {articlesReady ? (
            <ArticlesTable articles={articles ?? []} onChanged={loadArticles} />
          ) : articlesState === "loading" ? (
            <div className="skeleton" style={{ height: 240 }} aria-hidden="true" />
          ) : (
            <p className="empty">{articlesMessage || "فهرست مقالات در دسترس نیست."}</p>
          )}
        </section>

        {/* ============ آخرین درخواست‌های مشاوره (اقدام سریع) ============ */}
        <section className="panel" aria-label="آخرین درخواست‌های مشاوره">
          <div className="panel-head">
            <h2>آخرین درخواست‌های مشاوره</h2>
            <Link href="/consultations" className="nav-link">همهٔ درخواست‌ها ←</Link>
          </div>
          {data && data.recentConsultations.length === 0 ? (
            <p className="empty">هنوز درخواستی ثبت نشده است.</p>
          ) : (
            (data?.recentConsultations ?? []).map((row) => (
              <div className="row" key={row.id}>
                <div className="row-head">
                  <div className="row-identity">
                    <div>
                      <span className="row-title">{row.name}</span>
                      <div className="row-meta">{row.topic} · <a className="mono" href={`tel:${row.phone}`}>{row.phone}</a></div>
                    </div>
                  </div>
                  <span className="row-meta">{formatDateTimeFa(row.created_at)}</span>
                </div>
                <div className="row-actions">
                  <span className={`badge ${row.status}`}>{CONSULTATION_STATUS[row.status]}</span>
                  <Link href="/consultations" className="btn secondary sm">مدیریت ←</Link>
                </div>
              </div>
            ))
          )}
        </section>
      </DashboardLayout>
    </AuthGate>
  );
}
