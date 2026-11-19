"use client";

import { useEffect, useState, type FormEvent } from "react";
import AuthGate from "../../components/AuthGate";
import TopNav from "../../components/TopNav";
import { supabase } from "../../lib/supabase";

async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  if (!supabase) return { ...extra };
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { ...extra, authorization: `Bearer ${token}` } : { ...extra };
}

interface ArticleItem {
  slug: string;
  title: string | null;
}

const SERVICES = [
  "khanevadeh",
  "keyfari",
  "amlak-va-sebat",
  "chek-va-esnad",
  "hoghoogh-kar",
  "sherkat-ha",
  "ers-va-varasat",
  "gharardad-va-motalebat",
];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error" | "unconfigured">("loading");
  const [listMessage, setListMessage] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [relatedServices, setRelatedServices] = useState(SERVICES[0]);
  const [asDraft, setAsDraft] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    authHeaders()
      .then((headers) => fetch("/api/articles", { headers }))
      .then(async (response) => {
        const data = (await response.json()) as { ok: boolean; articles?: ArticleItem[]; message?: string };
        if (!mounted) return;
        if (response.status === 501) {
          setListState("unconfigured");
          setListMessage(data.message ?? "GITHUB_TOKEN تنظیم نشده است.");
          return;
        }
        if (!response.ok || !data.ok) {
          setListState("error");
          setListMessage(data.message ?? "دریافت فهرست مقالات ناموفق بود.");
          return;
        }
        setArticles(data.articles ?? []);
        setListState("ready");
      })
      .catch(() => {
        if (!mounted) return;
        setListState("error");
        setListMessage("دریافت فهرست مقالات ناموفق بود.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function submitArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormMessage(null);

    if (supabase) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setFormMessage({ kind: "err", text: "نشست شما منقضی شده است؛ دوباره وارد شوید." });
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: await authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify({
          title,
          slug,
          description,
          body,
          tags,
          relatedServices,
          draft: asDraft,
        }),
      });
      const data = (await response.json()) as { ok: boolean; slug?: string; message?: string; html_url?: string };
      if (response.status === 501) {
        setFormMessage({ kind: "info", text: data.message ?? "GITHUB_TOKEN تنظیم نشده است." });
      } else if (!response.ok || !data.ok) {
        setFormMessage({ kind: "err", text: data.message ?? "ثبت مقاله ناموفق بود." });
      } else {
        setFormMessage({
          kind: "ok",
          text: `مقالهٔ «${data.slug}» در مخزن کامیت شد. Netlify به‌طور خودکار بیلد و منتشر می‌کند (معمولاً کمتر از ۲ دقیقه).`,
        });
        setTitle(""); setSlug(""); setDescription(""); setBody(""); setTags("");
      }
    } catch {
      setFormMessage({ kind: "err", text: "ثبت مقاله ناموفق بود. اتصال شبکه را بررسی کنید." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGate>
      <TopNav />
      <main className="container">
        <h1 className="page-title">مقالات</h1>
        <p className="page-sub">مقالات در Git نگه‌داری می‌شوند (Markdown در src/content/blog) و با هر کامیت، Netlify سایت را دوباره می‌سازد</p>

        <section className="panel">
          <h2>فهرست مقالات ({listState === "ready" ? articles.length : "…"})</h2>
          {listState === "loading" && <p className="row-meta">در حال دریافت فهرست…</p>}
          {(listState === "error" || listState === "unconfigured") && (
            <>
              <p className="msg info">{listMessage}</p>
              <p className="row-meta">
                تا زمانی که توکن تنظیم نشده، برای افزودن مقاله از{" "}
                <a href="https://leyla-abkeh.ir/admin/" target="_blank" rel="noopener noreferrer">/admin</a>{" "}
                (Decap CMS) یا مستقیماً از GitHub استفاده کنید.
              </p>
            </>
          )}
          {listState === "ready" && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, columns: 2, gap: 16 }}>
              {articles.map((article) => (
                <li key={article.slug} style={{ padding: "6px 0", breakInside: "avoid" }}>
                  <a href={`https://leyla-abkeh.ir/articles/${article.slug}/`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <span className="row-title" style={{ fontSize: "0.82rem" }}>{article.title ?? article.slug}</span>
                    <span className="row-meta mono" dir="ltr" style={{ display: "block" }}>{article.slug}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form className="panel" onSubmit={submitArticle}>
          <h2>افزودن مقالهٔ جدید</h2>

          <div className="form-grid">
            <label className="f">
              <span>عنوان مقاله *</span>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={10} placeholder="مثال: مهریه عندالاستطاعه؛ شرایط و مراحل مطالبه" />
            </label>
            <label className="f">
              <span>نشانی یکتا (slug) — حروف لاتین کوچک و خط تیره *</span>
              <input type="text" dir="ltr" className="mono" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]{3,80}" placeholder="mehrieh-endol-estatiaat" />
            </label>
          </div>

          <label className="f">
            <span>خلاصه (در فهرست مقالات و توضیح متا) *</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={30} rows={2} placeholder="یک یا دو جملهٔ دقیق دربارهٔ مقاله…" />
          </label>

          <label className="f">
            <span>متن مقاله (Markdown) *</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required minLength={200} rows={12} placeholder={"## عنوان بخش\n\nمتن بخش…"} />
          </label>

          <div className="form-grid">
            <label className="f">
              <span>برچسب‌ها (با ویرگول جدا کنید)</span>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="مهریه, دعاوی خانواده" />
            </label>
            <label className="f">
              <span>حوزهٔ مرتبط (برای لینک‌سازی داخلی)</span>
              <select value={relatedServices} onChange={(e) => setRelatedServices(e.target.value)}>
                {SERVICES.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", marginBottom: 12 }}>
            <input type="checkbox" checked={asDraft} onChange={(e) => setAsDraft(e.target.checked)} style={{ width: "auto" }} />
            به‌عنوان «پیش‌نویس» ذخیره شود (در سایت منتشر نمی‌شود تا زمانی که draft را خاموش کنید)
          </label>

          {formMessage && <p className={`msg ${formMessage.kind}`} role="status">{formMessage.text}</p>}

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "در حال ثبت در مخزن…" : "ثبت مقاله در مخزن"}
          </button>
        </form>
      </main>
    </AuthGate>
  );
}
