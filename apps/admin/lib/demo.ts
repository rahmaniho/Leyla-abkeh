/**
 * حالت نمایشی (دمو) — فقط برای پیش‌نمایش رابط کاربری
 * ---------------------------------------------------------------
 * فعال‌سازی: آدرس پنل با پارامتر `?demo=1` باز شود.
 * در این حالت به‌جای اتصال Supabase/GitHub، دادهٔ قطعی (deterministic) و
 * واقع‌نما نمایش داده می‌شود و یک نوار هشدار «حالت نمایشی» بالای صفحه
 * ظاهر می‌شود. هیچ‌گاه دادهٔ «دمو» به‌عنوان دادهٔ واقعی معرفی نمی‌شود.
 */

import { lastNDays } from "./dates";
import type { ConsultationRow, AdminNotification } from "./supabase";

/** تصادفی قطعی بر اساس بذر */
function rand(seed: number): number {
  const x = Math.sin(seed * 9973 + 17) * 43758.5453;
  return x - Math.floor(x);
}

function dayOfWeek(isoDay: string): number {
  return new Date(`${isoDay}T12:00:00.000Z`).getUTCDay();
}

export interface DemoArticle {
  slug: string;
  title: string;
  publishDate: string;
  draft: boolean;
}

export interface DemoDashboardData {
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

/** هشدارهای دمو (همان شکل AdminNotification) */
function demoNotifications(): AdminNotification[] {
  const now = Date.now();
  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return [
    { id: "demo-n1", type: "consultation_new", title: "درخواست مشاورهٔ جدید", body: "مریم رضایی — دعاوی مهریه", ref_table: "consultations", ref_id: "demo-c1", read: false, created_at: at(24) },
    { id: "demo-n2", type: "comment_new", title: "دیدگاه جدید برای مقاله", body: "سارا احمدی دربارهٔ «مهریه عندالاستطاعه»", ref_table: "comments", ref_id: "demo-m1", read: false, created_at: at(58) },
    { id: "demo-n3", type: "consultation_new", title: "درخواست مشاورهٔ جدید", body: "علی محمدی — چک و اسناد تجاری", ref_table: "consultations", ref_id: "demo-c2", read: false, created_at: at(190) },
    { id: "demo-n4", type: "comment_new", title: "دیدگاه جدید برای مقاله", body: "حسین کریمی دربارهٔ «دانستنی‌های قرارداد اجاره»", ref_table: "comments", ref_id: "demo-m2", read: true, created_at: at(60 * 5) },
    { id: "demo-n5", type: "consultation_new", title: "درخواست مشاورهٔ جدید", body: "زهرا موسوی — ملکی و ثبت اسناد", ref_table: "consultations", ref_id: "demo-c3", read: true, created_at: at(60 * 26) },
  ];
}

/** دادهٔ کامل داشبورد برای حالت نمایشی */
export function buildDemoData(): DemoDashboardData {
  const days90 = lastNDays(90);
  const now = Date.now();

  const visits = days90.map((day, i) => {
    const base = 22 + rand(i + 3) * 26 + Math.sin(i / 7.5) * 7;
    const friday = dayOfWeek(day.key) === 5 ? 1.35 : 1;
    return Math.max(4, Math.round(base * friday));
  });
  const articleViews = visits.map((v, i) => Math.max(2, Math.round(v * (0.42 + rand(i + 11) * 0.18))));
  const consultationsDailyAll = days90.map((day, i) => {
    const wave = 2.1 + Math.sin(i / 6.2) * 1.5 + (rand(i + 41) - 0.35) * 3;
    const friday = dayOfWeek(day.key) === 5 ? -1.3 : 0;
    return Math.max(0, Math.round(wave + friday));
  });

  const sum = (list: number[]) => list.reduce((acc, value) => acc + value, 0);
  const visitsLast30 = sum(visits.slice(-30));
  const visitsPrior30 = sum(visits.slice(-60, -30));
  const consultationsLast30 = sum(consultationsDailyAll.slice(-30));
  const consultationsPrior30 = sum(consultationsDailyAll.slice(-60, -30));

  const at = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();

  const recentConsultations: ConsultationRow[] = [
    { id: "demo-c1", reference: "JD-2411-017", name: "مریم رضایی", phone: "0912•••4817", topic: "مهریه و نفقه", message: "درخواست مشاورهٔ حضوری دربارهٔ مطالبهٔ مهریه", duration_minutes: 30, contact_method: "phone", status: "new", notes: null, created_at: at(24) },
    { id: "demo-c2", reference: "JD-2411-016", name: "علی محمدی", phone: "0935•••2290", topic: "چک و اسناد تجاری", message: "برگشت چک و اقدامات قانونی", duration_minutes: 45, contact_method: "phone", status: "new", notes: null, created_at: at(190) },
    { id: "demo-c3", reference: "JD-2411-015", name: "زهرا موسوی", phone: "0919•••7712", topic: "ملکی و ثبت اسناد", message: "خلع ید از ملک مشاعی", duration_minutes: 30, contact_method: "in_person", status: "in_progress", notes: "مدارک مالکیت دریافت شد", created_at: at(60 * 5) },
    { id: "demo-c4", reference: "JD-2411-014", name: "حسین کریمی", phone: "0901•••6643", topic: "قراردادها و مطالبات", message: "داوری در قرارداد مشارکت", duration_minutes: 30, contact_method: "phone", status: "done", notes: "جلسهٔ مشاوره برگزار شد", created_at: at(60 * 30) },
  ];

  const topPages = [
    { path: "/articles/mehrieh-endol-estatiaat", views: 486 },
    { path: "/services/khanevadeh", views: 342 },
    { path: "/articles/shek-va-promissory-note", views: 265 },
    { path: "/", views: 228 },
    { path: "/articles/khal-yad-az-melk-mosha", views: 154 },
  ];

  return {
    consultationsNew: 3,
    consultationsInProgress: 2,
    consultationsLast30,
    consultationsPrior30,
    consultationsDaily: consultationsDailyAll.slice(-30),
    consultationsDailyAll,
    commentsPending: 4,
    visitsLast30,
    visitsPrior30,
    dailyVisits: visits,
    dailyArticleViews: articleViews,
    dailyLabels: days90.map((day) => day.label),
    topPages,
    recentConsultations,
    notifications: demoNotifications(),
    unreadNotifications: 3,
  };
}

/** مقالات نمونهٔ دمو (mix واقعی‌نما از منتشرشده/زمان‌بندی‌شده/پیش‌نویس) */
export function buildDemoArticles(): DemoArticle[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const iso = (daysAgo: number) => new Date(now - daysAgo * day).toISOString();
  return [
    { slug: "mehrieh-endol-estatiaat", title: "مهریه عندالاستطاعه؛ شرایط و مراحل مطالبه", publishDate: iso(4), draft: false },
    { slug: "shek-va-promissory-note", title: "چک و سفته؛ تفاوت‌ها و آثار حقوقی هر کدام", publishDate: iso(11), draft: false },
    { slug: "khal-yad-az-melk-mosha", title: "خلع ید از ملک مشاع؛ راهنمای عملی", publishDate: iso(19), draft: false },
    { slug: "talagh-be-lazem", title: "طلاق به درخواست زوجه؛ شروط و مسیر قانونی", publishDate: iso(27), draft: false },
    { slug: "gharardad-mosharekat-dar-sakhteman", title: "نکات کلیدی قرارداد مشارکت در ساخت", publishDate: iso(38), draft: false },
    { slug: "ersh-va-varasat-moslaman", title: "ارث و طبقات ارث‌بران؛ پاسخ به رایج‌ترین پرسش‌ها", publishDate: iso(47), draft: false },
    { slug: "ejarat-va-taslim-ajareh", title: "تخلیهٔ عین مستأجره؛ شرایط قانونی و رویهٔ دادگاه", publishDate: iso(62), draft: false },
    { slug: "dadkhast-hamvatani-rajebesbah-mehrieh", title: "اعسار از پرداخت مهریه؛ شرایط و مدارک لازم", publishDate: iso(80), draft: false },
    { slug: "nafaqe-ayalat", title: "نفقه ایام عده؛ میزان و نحوهٔ مطالبه", publishDate: iso(95), draft: false },
    { slug: "daftari-be-nasam-karen-release", title: "چک بی‌محل و مجازات قانونی آن", publishDate: iso(-6), draft: false },
    { slug: "mosabeghat-dar-davo", title: "روش‌های اعتراض به رأی داوری", publishDate: iso(-13), draft: false },
    { slug: "raftar-monasibe-dadegah", title: "آداب حضور در دادگاه برای افراد غیرحقوقی", publishDate: iso(2), draft: true },
    { slug: "soalat-motavalie-moshtariyan", title: "سؤالات متداول مراجعه‌کنندگان (پرسش و پاسخ)", publishDate: iso(9), draft: true },
    { slug: "rehne-banki-va-yegnemi", title: "رهن بانکی و ابطال سند رهنی؛ رویهٔ جدید", publishDate: iso(15), draft: true },
  ];
}
