"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import NotificationBell from "./NotificationBell";

const LINKS = [
  { href: "/", label: "داشبورد" },
  { href: "/consultations", label: "درخواست‌های مشاوره" },
  { href: "/comments", label: "نظرات" },
  { href: "/articles", label: "مقالات" },
  { href: "/reports", label: "گزارش‌ها" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" width={34} height={34} />
          <span>
            <strong>مدیریت سایت</strong>
            <small>دفتر وکالت لیلا آبکه</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="ناوبری اصلی">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link${pathname === link.href ? " active" : ""}`}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <NotificationBell />
          <button type="button" className="signout" onClick={signOut}>
            خروج
          </button>
        </nav>
      </div>
    </header>
  );
}
