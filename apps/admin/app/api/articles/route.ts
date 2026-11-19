import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API مقالات — فهرست و «افزودن مقاله» از طریق GitHub Contents API
 * ------------------------------------------------------------------
 * مقالات در Git نگه‌داری می‌شوند؛ با هر کامیت روی main، Netlify بیلد می‌کند.
 * نیازمند GITHUB_TOKEN (توکن دسترسی ریزدانه با Permission: Contents = Read and write
 * فقط برای ریپازیتوری Leyla-abkeh) است که فقط سمت سرور استفاده می‌شود.
 * بدون توکن، پاسخ ۵۰۱ برمی‌گردد و رابط کاربری راهنمای راه‌اندازی نشان می‌دهد.
 *
 * احراز هویت: همهٔ ورودی‌ها نیازمند Bearer token نشست Supabase هستند
 * (هدر Authorization: Bearer <access_token>)؛ نقش RLS فقط برای کاربران واردشده مجاز است.
 */

const UNOAUTHENTICATED = { ok: false, message: "برای دسترسی به این بخش باید وارد پنل شده باشید." } as const;

async function requireSession(request: NextRequest): Promise<NextResponse | null> {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!token || !url || !anonKey) {
    return NextResponse.json(UNOAUTHENTICATED, { status: 401 });
  }
  try {
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      return NextResponse.json(UNOAUTHENTICATED, { status: 401 });
    }
    return null; // مجاز
  } catch {
    return NextResponse.json(UNOAUTHENTICATED, { status: 401 });
  }
}

const OWNER = "rahmaniho";
const REPO = "Leyla-abkeh";
const BRANCH = "main";
const BLOG_DIR = "src/content/blog";
const SITE_RAW = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;

function githubHeaders(token: string) {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "leyla-abkeh-admin",
  };
}

const UNAUTHENTICATED_MESSAGE =
  "GITHUB_TOKEN در تنظیمات پروژهٔ Vercel تنظیم نشده است. یک توکن ریزدانه با Contents: Read and write فقط برای این ریپازیتوری بسازید و با نام GITHUB_TOKEN اضافه کنید.";

export async function GET(request: NextRequest) {
  const denied = await requireSession(request);
  if (denied) return denied;

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: UNAUTHENTICATED_MESSAGE }, { status: 501 });
  }

  try {
    const treeRes = await fetch(`${API}/git/trees/${BRANCH}?recursive=1`, {
      headers: githubHeaders(token),
      cache: "no-store",
    });
    if (!treeRes.ok) {
      return NextResponse.json({ ok: false, message: `خطای GitHub (${treeRes.status})` }, { status: 502 });
    }
    const tree = (await treeRes.json()) as { tree?: { path: string; type: string }[] };
    const slugs = (tree.tree ?? [])
      .filter((item) => item.type === "blob" && item.path.startsWith(`${BLOG_DIR}/`) && item.path.endsWith(".md"))
      .map((item) => item.path.slice(BLOG_DIR.length + 1, -".md".length))
      .sort();

    const articles = await Promise.all(
      slugs.map(async (slug) => {
        try {
          const rawRes = await fetch(`${SITE_RAW}/${BLOG_DIR}/${slug}.md`, {
            headers: githubHeaders(token),
            cache: "no-store",
          });
          if (!rawRes.ok) return { slug, title: null, publishDate: null, draft: false };
          const head = (await rawRes.text()).slice(0, 1600);
          const titleMatch = head.match(/^title:\s*"?(.+?)"?\s*$/m);
          const dateMatch = head.match(/^publishDate:\s*"?(.+?)"?\s*$/m);
          const draftMatch = head.match(/^draft:\s*"?(.+?)"?\s*$/m);
          return {
            slug,
            title: titleMatch ? titleMatch[1] : null,
            publishDate: dateMatch ? dateMatch[1] : null,
            draft: draftMatch ? /^true$/i.test(draftMatch[1].trim()) : false,
          };
        } catch {
          return { slug, title: null, publishDate: null, draft: false };
        }
      })
    );

    return NextResponse.json({ ok: true, articles });
  } catch {
    return NextResponse.json({ ok: false, message: "ارتباط با GitHub برقرار نشد." }, { status: 502 });
  }
}

interface NewArticleBody {
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  tags?: string;
  relatedServices?: string;
  draft?: boolean;
}

function yamlEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function POST(request: NextRequest) {
  const denied = await requireSession(request);
  if (denied) return denied;

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: UNAUTHENTICATED_MESSAGE }, { status: 501 });
  }

  let payload: NewArticleBody;
  try {
    payload = (await request.json()) as NewArticleBody;
  } catch {
    return NextResponse.json({ ok: false, message: "بدنۀ درخواست معتبر نیست." }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const slug = (payload.slug ?? "").trim();
  const description = (payload.description ?? "").trim();
  const body = (payload.body ?? "").trim();
  const tags = (payload.tags ?? "").trim();
  const relatedServices = (payload.relatedServices ?? "").trim();
  const draft = payload.draft !== false;

  if (title.length < 10) return NextResponse.json({ ok: false, message: "عنوان خیلی کوتاه است." }, { status: 422 });
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    return NextResponse.json({ ok: false, message: "نشانی یکتا باید فقط حروف لاتین کوچک، رقم و خط تیره باشد." }, { status: 422 });
  }
  if (description.length < 30) return NextResponse.json({ ok: false, message: "خلاصه باید حداقل ۳۰ نویسه باشد." }, { status: 422 });
  if (body.length < 200) return NextResponse.json({ ok: false, message: "متن مقاله خیلی کوتاه است." }, { status: 422 });

  try {
    const checkRes = await fetch(`${API}/contents/${BLOG_DIR}/${slug}.md?ref=${BRANCH}`, {
      headers: githubHeaders(token),
      cache: "no-store",
    });
    if (checkRes.ok) {
      return NextResponse.json({ ok: false, message: "مقاله‌ای با این نشانی از قبل وجود دارد." }, { status: 409 });
    }
    if (checkRes.status !== 404) {
      return NextResponse.json({ ok: false, message: `خطای GitHub (${checkRes.status})` }, { status: 502 });
    }

    const now = new Date().toISOString();
    const markdown = [
      "---",
      `title: "${yamlEscape(title)}"`,
      `description: "${yamlEscape(description)}"`,
      `publishDate: "${now}"`,
      `lastReviewed: "${now}"`,
      `author: "دفتر وکالت لیلا آبکه"`,
      `seoTitle: "${yamlEscape(title.slice(0, 60))}"`,
      `metaDescription: "${yamlEscape(description.slice(0, 155))}"`,
      `tags: "${yamlEscape(tags)}"`,
      `relatedServices: "${yamlEscape(relatedServices)}"`,
      `draft: ${draft ? "true" : "false"}`,
      "---",
      "",
      body,
      "",
    ].join("\n");

    const putRes = await fetch(`${API}/contents/${BLOG_DIR}/${slug}.md`, {
      method: "PUT",
      headers: { ...githubHeaders(token), "content-type": "application/json" },
      body: JSON.stringify({
        message: `content: add ${slug} via admin dashboard`,
        content: Buffer.from(markdown, "utf8").toString("base64"),
        branch: BRANCH,
      }),
    });
    const putJson = (await putRes.json().catch(() => ({}))) as { content?: { html_url?: string }; message?: string };
    if (!putRes.ok) {
      return NextResponse.json({ ok: false, message: putJson.message ?? `خطای GitHub (${putRes.status})` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, slug, html_url: putJson.content?.html_url ?? null }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "ارتباط با GitHub برقرار نشد." }, { status: 502 });
  }
}
/**
 * حذف مقاله از مخزن (Contents API — حذف فایل .md)
 * -------------------------------------------------
 * پارامتر: ?slug=my-article — نیازمند نشست مدیر؛ Netlify پس از کامیت بیلد می‌کند.
 */
export async function DELETE(request: NextRequest) {
  const denied = await requireSession(request);
  if (denied) return denied;

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return NextResponse.json({ ok: false, message: UNAUTHENTICATED_MESSAGE }, { status: 501 });
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    return NextResponse.json({ ok: false, message: "نشانی مقاله معتبر نیست." }, { status: 400 });
  }

  try {
    const current = await fetch(`${API}/contents/${BLOG_DIR}/${slug}.md?ref=${BRANCH}`, {
      headers: githubHeaders(token),
      cache: "no-store",
    });
    if (current.status === 404) {
      return NextResponse.json({ ok: false, message: "مقاله‌ای با این نشانی یافت نشد." }, { status: 404 });
    }
    if (!current.ok) {
      return NextResponse.json({ ok: false, message: `خطای GitHub (${current.status})` }, { status: 502 });
    }
    const currentJson = (await current.json()) as { sha?: string };
    if (!currentJson.sha) {
      return NextResponse.json({ ok: false, message: "شناسهٔ فایل از GitHub دریافت نشد." }, { status: 502 });
    }

    const deleteRes = await fetch(`${API}/contents/${BLOG_DIR}/${slug}.md`, {
      method: "DELETE",
      headers: { ...githubHeaders(token), "content-type": "application/json" },
      body: JSON.stringify({
        message: `content: remove ${slug} via admin dashboard`,
        sha: currentJson.sha,
        branch: BRANCH,
      }),
    });
    if (!deleteRes.ok) {
      const deleteJson = (await deleteRes.json().catch(() => ({}))) as { message?: string };
      return NextResponse.json({ ok: false, message: deleteJson.message ?? `خطای GitHub (${deleteRes.status})` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, slug });
  } catch {
    return NextResponse.json({ ok: false, message: "ارتباط با GitHub برقرار نشد." }, { status: 502 });
  }
}
