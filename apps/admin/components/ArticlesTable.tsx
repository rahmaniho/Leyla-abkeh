"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Search, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import StatusBadge from "./StatusBadge";
import Pagination from "./Pagination";
import ConfirmModal from "./ConfirmModal";
import { ToastStack, useToasts } from "./Toast";

export interface DashboardArticle {
  slug: string;
  title: string | null;
  publishDate: string | null;
  draft: boolean;
}

export function articleStatus(article: DashboardArticle): "published" | "draft" | "scheduled" {
  if (article.draft) return "draft";
  if (article.publishDate) {
    const time = new Date(article.publishDate).getTime();
    if (!Number.isNaN(time) && time > Date.now()) return "scheduled";
  }
  return "published";
}

export const ARTICLE_STATUS_LABEL: Record<string, string> = {
  published: "منتشرشده",
  draft: "پیش‌نویس",
  scheduled: "زمان‌بندی‌شده",
};

type SortKey = "title" | "date" | "status";
type StatusFilter = "all" | "published" | "scheduled" | "draft";

const PAGE_SIZE = 8;

/** تاریخ شمسی کوتاه */
export function formatJalali(iso: string | null): string {
  if (!iso) return "—";
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "—";
  return new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(time));
}

/**
 * جدول «آخرین مقالات» — جستجو، فیلتر وضعیت، مرتب‌سازی و صفحه‌بندی واقعی روی دادهٔ GitHub
 */
export default function ArticlesTable({ articles, onChanged }: { articles: DashboardArticle[]; onChanged?: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<DashboardArticle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, push } = useToasts();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = articles.filter((article) => {
      if (filter !== "all" && articleStatus(article) !== filter) return false;
      if (!q) return true;
      return (article.title ?? "").toLowerCase().includes(q) || article.slug.toLowerCase().includes(q);
    });
    const direction = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      if (sortKey === "title") return direction * (a.title ?? a.slug).localeCompare(b.title ?? b.slug, "fa");
      if (sortKey === "status") return direction * articleStatus(a).localeCompare(articleStatus(b));
      const aTime = a.publishDate ? new Date(a.publishDate).getTime() : 0;
      const bTime = b.publishDate ? new Date(b.publishDate).getTime() : 0;
      return direction * (aTime - bTime);
    });
    return rows;
  }, [articles, query, filter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, filter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "date" ? "desc" : "asc");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      const headers: Record<string, string> = {};
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) headers.authorization = `Bearer ${token}`;
      }
      const response = await fetch(`/api/articles?slug=${encodeURIComponent(pendingDelete.slug)}`, { method: "DELETE", headers });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        push(payload.message ?? "حذف مقاله ناموفق بود.");
      } else {
        push(`مقالهٔ «${pendingDelete.title ?? pendingDelete.slug}» حذف و کامیت شد؛ Netlify بازسازی می‌کند.`);
        onChanged?.();
      }
    } catch {
      push("حذف مقاله ناموفق بود. اتصال شبکه را بررسی کنید.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return null;
    return sortDir === "asc" ? <ArrowUp size={12} strokeWidth={2.4} /> : <ArrowDown size={12} strokeWidth={2.4} />;
  }

  return (
    <>
      <div className="table-tools no-print">
        <div className="table-search">
          <Search size={15} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در عنوان یا نشانی مقاله…"
            aria-label="جستجو در مقالات"
          />
        </div>
        <select className="select-mini" value={filter} onChange={(event) => setFilter(event.target.value as StatusFilter)} aria-label="فیلتر وضعیت">
          <option value="all">همهٔ وضعیت‌ها</option>
          <option value="published">منتشرشده</option>
          <option value="scheduled">زمان‌بندی‌شده</option>
          <option value="draft">پیش‌نویس</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="row-num">#</th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("title")}>عنوان مقاله {sortIcon("title")}</button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("date")}>تاریخ انتشار {sortIcon("date")}</button>
              </th>
              <th>
                <button type="button" className="th-sort" onClick={() => toggleSort("status")}>وضعیت {sortIcon("status")}</button>
              </th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-2)", padding: "26px 12px" }}>
                  {query.trim() ? "مقاله‌ای با این مشخصات یافت نشد." : "هنوز مقاله‌ای ثبت نشده است."}
                </td>
              </tr>
            ) : (
              pageRows.map((article, index) => {
                const status = articleStatus(article);
                return (
                  <tr key={article.slug}>
                    <td className="row-num">{((page - 1) * PAGE_SIZE + index + 1).toLocaleString("fa-IR")}</td>
                    <td>
                      <div className="cell-main">{article.title ?? article.slug}</div>
                      <div className="row-meta mono" dir="ltr" style={{ textAlign: "start" }}>/articles/{article.slug}</div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatJalali(article.publishDate)}</td>
                    <td><StatusBadge type="article" status={status} /></td>
                    <td>
                      <div className="row-actions-cell">
                        {status !== "draft" && (
                          <a href={`https://leyla-abkeh.ir/articles/${article.slug}`} target="_blank" rel="noreferrer" title="مشاهده در سایت" aria-label="مشاهده در سایت">
                            <ExternalLink size={15} strokeWidth={1.8} />
                          </a>
                        )}
                        <a
                          href={`https://github.com/rahmaniho/Leyla-abkeh/edit/main/src/content/blog/${article.slug}.md`}
                          target="_blank"
                          rel="noreferrer"
                          title="ویرایش در GitHub"
                          aria-label="ویرایش در GitHub"
                        >
                          <Pencil size={15} strokeWidth={1.8} />
                        </a>
                        <button type="button" onClick={() => setPendingDelete(article)} title="حذف مقاله" aria-label="حذف مقاله">
                          <Trash2 size={15} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-foot no-print">
        <span>{visible.length.toLocaleString("fa-IR")} مقاله{query.trim() || filter !== "all" ? " (فیلترشده)" : ""}</span>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="حذف مقاله"
        body={pendingDelete ? `آیا از حذف «${pendingDelete.title ?? pendingDelete.slug}» مطمئن هستید؟ این عمل فایل مقاله را از مخزن حذف می‌کند و سایت بازسازی می‌شود.` : ""}
        confirmLabel="حذف مقاله"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        busy={deleting}
      />
      <ToastStack toasts={toasts} />
    </>
  );
}
