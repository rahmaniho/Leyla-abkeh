"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Theme = "light" | "dark";

/**
 * چیدمان اصلی پنل: سایدبار ثابت راست (قابل جمع‌شدن) + نوار بالای ۶۴px
 * - تم روشن/تیره با ذخیرهٔ انتخاب کاربر (پیش‌فرض: روشن؛ احترام به prefers-color-scheme)
 * - شمار اعلان‌های خوانده‌نشده و درخواست‌های جدید برای نشان‌های سایدبار (همان کوئری زنگوله)
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [unread, setUnread] = useState(0);
  const [newConsultations, setNewConsultations] = useState(0);

  // مقداردهی اولیه از localStorage / prefers-color-scheme
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("la-theme") as Theme | null;
      const savedCollapsed = window.localStorage.getItem("la-sidebar-collapsed");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(savedTheme ?? (prefersDark ? "dark" : "light"));
      setCollapsed(savedCollapsed === "1");
    } catch {
      /* localStorage در دسترس نیست */
    }
  }, []);

  // اعمال تم روی <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("la-theme", theme);
    } catch {
      /* نادیده */
    }
  }, [theme]);

  // بستن منوی موبایل هنگام تغییر مسیر
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // نشان‌های سایدبار
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let mounted = true;

    async function poll() {
      const [notifications, consultations] = await Promise.all([
        client.from("admin_notifications").select("id", { count: "exact", head: true }).eq("read", false),
        client.from("consultations").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      if (!mounted) return;
      if (!notifications.error) setUnread(notifications.count ?? 0);
      if (!consultations.error) setNewConsultations(consultations.count ?? 0);
    }

    poll();
    const timer = window.setInterval(poll, 45_000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [pathname]);

  function toggleCollapse() {
    setCollapsed((value) => {
      try {
        window.localStorage.setItem("la-sidebar-collapsed", value ? "0" : "1");
      } catch {
        /* نادیده */
      }
      return !value;
    });
  }

  return (
    <div className={`shell${collapsed ? " collapsed" : ""}`}>
      {open && <button type="button" className="side-backdrop" aria-label="بستن منو" onClick={() => setOpen(false)} />}
      <Sidebar open={open} collapsed={collapsed} unread={unread} newConsultations={newConsultations} onClose={() => setOpen(false)} />
      <div style={{ minWidth: 0 }}>
        <Topbar
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
          onOpenMobileNav={() => setOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((value) => (value === "light" ? "dark" : "light"))}
        />
        <main className="container">{children}</main>
      </div>
    </div>
  );
}
