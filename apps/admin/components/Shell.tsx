"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import NotificationBell from "./NotificationBell";
import Avatar from "./Avatar";

const NAV_SECTIONS: { section: string; items: { href: string; label: string; icon: ReactNode }[] }[] = [
  {
    section: "منوی اصلی",
    items: [
      {
        href: "/",
        label: "داشبورد",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l9-8 9 8" />
            <path d="M5 10v10h5v-6h4v6h5V10" />
          </svg>
        ),
      },
      {
        href: "/consultations",
        label: "درخواست‌های مشاوره",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="3" />
            <path d="M9 8h6M9 12h6M9 16h3" />
          </svg>
        ),
      },
      {
        href: "/comments",
        label: "نظرات",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.2L4 21l1.9-5.2A8 8 0 1 1 21 12z" />
          </svg>
        ),
      },
      {
        href: "/articles",
        label: "مقالات",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
            <path d="M14 2v6h6" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "مدیریت",
    items: [
      {
        href: "/notifications",
        label: "اعلان‌ها",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        ),
      },
      {
        href: "/reports",
        label: "گزارش‌ها",
        icon: (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
        ),
      },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "داشبورد",
  "/consultations": "درخواست‌های مشاوره",
  "/comments": "نظرات",
  "/articles": "مقالات",
  "/notifications": "اعلان‌ها",
  "/reports": "گزارش‌ها",
};

/**
 * پوستهٔ اصلی پنل: سایدبار راست‌چین + نوار بالا
 * صفحات داخل <Shell> قرار می‌گیرند؛ احراز هویت با AuthGate بیرون از آن انجام می‌شود.
 */
export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    async function poll() {
      if (!supabase) return;
      const { count, error } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      if (mounted && !error) setUnread(count ?? 0);
    }
    poll();
    const timer = window.setInterval(poll, 45_000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [pathname]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const pageTitle = PAGE_TITLES[pathname] ?? "پنل مدیریت";

  return (
    <div className="shell">
      {/* ---------- سایدبار ---------- */}
      {open && <button type="button" className="side-backdrop" aria-label="بستن منو" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="منوی مدیریت">
        <Link href="/" className="side-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="نشان دفتر وکالت لیلا آبکه" width={46} height={46} />
          <span>
            <strong>مدیریت سایت</strong>
            <small>دفتر وکالت لیلا آبکه</small>
          </span>
        </Link>

        {NAV_SECTIONS.map((group) => (
          <nav key={group.section} aria-label={group.section}>
            <div className="side-section">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`side-link${pathname === item.href ? " active" : ""}`}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <span className="side-icon">{item.icon}</span>
                {item.label}
                {item.href === "/notifications" && unread > 0 && (
                  <span className="side-badge">{unread > 99 ? "99+" : unread}</span>
                )}
              </Link>
            ))}
          </nav>
        ))}

        <div className="side-foot">
          <p>همین پنل، چیزی را در سایت عمومی تغییر نمی‌دهد مگر اینکه خودتان تأیید کنید.</p>
          <a href="https://leyla-abkeh.ir" target="_blank" rel="noreferrer">
            بازدید از سایت عمومی ←
          </a>
        </div>
      </aside>

      {/* ---------- نوار بالا + محتوا ---------- */}
      <div style={{ minWidth: 0 }}>
        <header className="topbar no-print">
          <div className="topbar-inner">
            <button type="button" className="icon-btn hamburger" aria-label="باز کردن منو" onClick={() => setOpen((value) => !value)}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <span className="topbar-title">
              پنل مدیریت <span aria-hidden="true">·</span> <b>{pageTitle}</b>
            </span>

            <div className="topbar-actions">
              <a className="chip" href="https://leyla-abkeh.ir" target="_blank" rel="noreferrer" title="مشاهدهٔ سایت عمومی">
                <span className="dot" aria-hidden="true" />
                leyla-abkeh.ir
              </a>
              <NotificationBell />
              <span className="user-chip">
                <Avatar name="مدیر" size={30} />
                <span>مدیر</span>
              </span>
              <button type="button" className="signout" onClick={signOut}>
                خروج
              </button>
            </div>
          </div>
        </header>

        <main className="container">{children}</main>
      </div>
    </div>
  );
}
