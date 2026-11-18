"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { supabase, CONSULTATION_STATUS, type ConsultationRow, type ConsultationStatus } from "../../lib/supabase";

const FILTERS: { key: "all" | ConsultationStatus; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "new", label: "جدید" },
  { key: "in_progress", label: "در حال پیگیری" },
  { key: "done", label: "انجام‌شده" },
  { key: "cancelled", label: "لغوشده" },
];

function formatFa(iso: string) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Tehran" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ConsultationsPage() {
  const [rows, setRows] = useState<ConsultationRow[]>([]);
  const [filter, setFilter] = useState<"all" | ConsultationStatus>("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [savingNotes, setSavingNotes] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) setMessage({ kind: "err", text: "بارگذاری درخواست‌ها ناموفق بود." });
        else setRows((data as ConsultationRow[]) ?? []);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => rows.filter((row) => filter === "all" || row.status === filter), [rows, filter]);

  async function changeStatus(id: string, status: ConsultationStatus) {
    if (!supabase) return;
    const previous = rows;
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
    const { error } = await supabase.from("consultations").update({ status }).eq("id", id);
    if (error) {
      setRows(previous);
      setMessage({ kind: "err", text: "تغییر وضعیت ذخیره نشد. دوباره تلاش کنید." });
    }
  }

  async function saveNotes(id: string, notes: string) {
    if (!supabase) return;
    setSavingNotes(id);
    const { error } = await supabase.from("consultations").update({ notes }).eq("id", id);
    setSavingNotes(null);
    setMessage(error
      ? { kind: "err", text: "یادداشت ذخیره نشد." }
      : { kind: "ok", text: "یادداشت ذخیره شد." });
  }

  return (
    <AuthGate>
      <TopNav />
      <main className="container">
        <h1 className="page-title">درخواست‌های مشاوره</h1>
        <p className="page-sub">مدیریت و پیگیری درخواست‌هایی که از فرم سایت ثبت شده‌اند</p>

        <div className="tabs" role="tablist" aria-label="فیلتر وضعیت">
          {FILTERS.map((item) => (
            <button key={item.key} className={`tab${filter === item.key ? " active" : ""}`} onClick={() => setFilter(item.key)} role="tab" aria-selected={filter === item.key}>
              {item.label}
            </button>
          ))}
        </div>

        {message && <p className={`msg ${message.kind}`} role="status">{message.text}</p>}

        {loading ? (
          <p className="row-meta">در حال بارگذاری…</p>
        ) : visible.length === 0 ? (
          <div className="panel"><p className="row-body">{filter === "all" ? "هنوز درخواستی ثبت نشده است." : "در این وضعیت موردی نیست."}</p></div>
        ) : (
          visible.map((row) => (
            <article className="row" key={row.id}>
              <div className="row-head">
                <div>
                  <span className="row-title">{row.name}</span>
                  <div className="row-meta" style={{ marginTop: 4 }}>
                    <a className="mono" href={`tel:${row.phone}`}>{row.phone}</a>
                    {row.contact_method ? ` · روش ترجیحی: ${row.contact_method}` : ""}
                    {row.duration_minutes ? ` · ${row.duration_minutes} دقیقه` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <span className="row-meta">{formatFa(row.created_at)}</span>
                  <div><span className="mono">{row.reference}</span></div>
                </div>
              </div>

              <p className="row-body"><strong>موضوع:</strong> {row.topic}{row.message ? <>{"\n"}{row.message}</> : null}</p>

              <div className="row-actions">
                <label className="f" style={{ margin: 0, minWidth: 160 }}>
                  <span>وضعیت</span>
                  <select value={row.status} onChange={(event) => changeStatus(row.id, event.target.value as ConsultationStatus)} aria-label="تغییر وضعیت درخواست">
                    {(Object.keys(CONSULTATION_STATUS) as ConsultationStatus[]).map((key) => (
                      <option key={key} value={key}>{CONSULTATION_STATUS[key]}</option>
                    ))}
                  </select>
                </label>
                <span className={`badge ${row.status}`}>{CONSULTATION_STATUS[row.status]}</span>
                {savingNotes === row.id && <span className="row-meta">در حال ذخیره…</span>}
              </div>

              <label className="f" style={{ marginTop: 10 }}>
                <span>یادداشت داخلی (فقط برای شما نمایش داده می‌شود)</span>
                <textarea
                  defaultValue={row.notes ?? ""}
                  rows={2}
                  placeholder="مثلاً: سه‌شنبه ساعت ۱۰ تماس گرفتم؛ مدارک را فرستاد."
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (value !== (row.notes ?? "")) saveNotes(row.id, value);
                  }}
                />
              </label>
            </article>
          ))
        )}
      </main>
    </AuthGate>
  );
}
