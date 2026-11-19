"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  FileText,
  History,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  PhoneCall,
  Search,
  Sun,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import NotificationBell from "./NotificationBell";
import Avatar from "./Avatar";

interface SearchResult {
  id: string;
  group: "مقالات" | "درخواست‌های مشاوره" | "دیدگاه‌ها";
  title: string;
  meta: string;
  href: string;
}

interface TopbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileNav: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Topbar({ collapsed, onToggleCollapse, onOpenMobileNav, theme, onToggleTheme }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const articlesCache = useRef<{ slug: string; title: string | null }[] | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // میانبر «/» برای تمرکز روی جستجو
  useEffect(() => {
    function onSlash(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        const input = boxRef.current?.querySelector("input");
        input?.focus();
      }
    }
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, []);

  // ایمیل مدیر از نشست فعلی
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user?.email ?? null));
  }, []);

  // بستن منوها با کلیک بیرون / Escape
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setFocused(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setFocused(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // جستجوی سراسری با تاخیر کوتاه
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const found: SearchResult[] = [];

      // مقالات — از کش /api/articles (GitHub)
      try {
        if (!articlesCache.current && supabase) {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const response = await fetch("/api/articles", {
            headers: token ? { authorization: `Bearer ${token}` } : {},
          });
          if (response.ok) {
            const payload = (await response.json()) as { ok: boolean; articles?: { slug: string; title: string | null }[] };
            articlesCache.current = payload.articles ?? [];
          } else {
            articlesCache.current = [];
          }
        }
        for (const article of articlesCache.current ?? []) {
          const title = article.title ?? article.slug;
          if (title.toLowerCase().includes(q.toLowerCase()) || article.slug.includes(q.toLowerCase())) {
            found.push({ id: `a-${article.slug}`, group: "مقالات", title, meta: `/articles/${article.slug}`, href: "/articles" });
          }
          if (found.filter((r) => r.group === "مقالات").length >= 4) break;
        }
      } catch {
        /* مقالات در دسترس نیست؛ بقیهٔ منابع جستجو می‌شوند */
      }

      // درخواست‌های مشاوره و دیدگاه‌ها — از Supabase
      if (supabase) {
        try {
          const pattern = `%${q}%`;
          const [consultations, comments] = await Promise.all([
            supabase
              .from("consultations")
              .select("id, reference, name, topic")
              .or(`name.ilike.${pattern},reference.ilike.${pattern},phone.ilike.${pattern},topic.ilike.${pattern}`)
              .limit(4),
            supabase
              .from("comments")
              .select("id, author_name, article_slug")
              .or(`author_name.ilike.${pattern},body.ilike.${pattern}`)
              .limit(4),
          ]);
          for (const row of (consultations.data as { id: string; reference: string | null; name: string; topic: string | null }[] | null) ?? []) {
            found.push({ id: `c-${row.id}`, group: "درخواست‌های مشاوره", title: row.name, meta: row.reference ?? row.topic ?? "", href: "/consultations" });
          }
          for (const row of (comments.data as { id: string; author_name: string; article_slug: string }[] | null) ?? []) {
            found.push({ id: `m-${row.id}`, group: "دیدگاه‌ها", title: row.author_name, meta: `/articles/${row.article_slug}`, href: "/comments" });
          }
        } catch {
          /* جستجوی پایگاه‌داده ناموفق بود */
        }
      }

      if (!cancelled) {
        setResults(found);
        setActiveIndex(-1);
        setSearching(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[activeIndex] ?? results[0];
      setFocused(false);
      setQuery("");
      if (target) router.push(target.href);
    }
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    (acc[result.group] ??= []).push(result);
    return acc;
  }, {});
  let flatIndex = -1;

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="topbar no-print">
      <div className="topbar-inner">
        <button type="button" className="icon-btn hamburger" aria-label="باز کردن منو" onClick={onOpenMobileNav}>
          <Menu size={19} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="icon-btn desktop-only"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
          title={collapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
        >
          {collapsed ? <PanelRightOpen size={18} strokeWidth={1.8} /> : <PanelRightClose size={18} strokeWidth={1.8} />}
        </button>

        {/* ---------- جستجوی سراسری ---------- */}
        <div className="search-box" ref={boxRef}>
          <Search size={17} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="text"
            role="combobox"
            aria-expanded={focused && query.trim().length >= 2}
            aria-controls="global-search-results"
            aria-label="جستجو در مقالات، درخواست‌های مشاوره و دیدگاه‌ها"
            placeholder="جستجو در مقالات، درخواست‌ها و دیدگاه‌ها…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={onSearchKeyDown}
            autoComplete="off"
          />
          <kbd className="search-kbd">/</kbd>

          {focused && query.trim().length >= 2 && (
            <div className="search-results" id="global-search-results" role="listbox">
              {searching ? (
                <p className="search-empty">در حال جستجو…</p>
              ) : results.length === 0 ? (
                <p className="search-empty">نتیجه‌ای برای «{query.trim()}» یافت نشد.</p>
              ) : (
                Object.entries(grouped).map(([group, items]) => (
                  <div key={group}>
                    <div className="search-group">{group}</div>
                    {items.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const Icon = item.group === "مقالات" ? FileText : item.group === "درخواست‌های مشاوره" ? PhoneCall : MessageSquare;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          role="option"
                          aria-selected={activeIndex === index}
                          className={`search-item${activeIndex === index ? " active" : ""}`}
                          onClick={() => {
                            setFocused(false);
                            setQuery("");
                          }}
                        >
                          <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                          <span>{item.title}</span>
                          <small className="mono">{item.meta}</small>
                        </Link>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ---------- اقدامات سمت چپ ---------- */}
        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleTheme}
            aria-label={theme === "light" ? "فعال‌سازی تم تیره" : "فعال‌سازی تم روشن"}
            title={theme === "light" ? "تم تیره" : "تم روشن"}
          >
            {theme === "light" ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
          </button>

          <NotificationBell />

          <div style={{ position: "relative" }} ref={menuRef}>
            <button type="button" className="avatar-btn" onClick={() => setMenuOpen((value) => !value)} aria-haspopup="menu" aria-expanded={menuOpen} aria-label="منوی کاربر">
              <Avatar name={userEmail ?? "مدیر"} size={32} />
              <span className="name">مدیر سایت</span>
              <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true" style={{ color: "var(--text-2)" }} />
            </button>
            {menuOpen && (
              <div className="dropdown" role="menu">
                <div className="dropdown-head">
                  <b>مدیر سایت</b>
                  {userEmail && <span className="mono">{userEmail}</span>}
                </div>
                <Link href="/notifications" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <History size={16} strokeWidth={1.8} /> گزارش فعالیت‌ها
                </Link>
                <Link href="/reports" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                  <BarChart3 size={16} strokeWidth={1.8} /> گزارش‌ها
                </Link>
                <button type="button" className="dropdown-item danger" role="menuitem" onClick={signOut}>
                  <LogOut size={16} strokeWidth={1.8} /> خروج از حساب
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
