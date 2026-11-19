"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

/**
 * زنگولهٔ نوتیفیکیشن پنل
 * هر ۴۵ ثانیه (و هنگام باز شدن صفحه) تعداد رویدادهای خوانده‌نشده را از
 * جدول admin_notifications می‌خواند. امنیت داده با RLS سمت دیتابیس است.
 */
export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    async function poll() {
      if (!supabase) return;
      const { count, error } = await supabase
        .from("admin_notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      if (!mounted || error) return;
      const value = count ?? 0;
      setUnread((previous) => {
        if (value > previous) setPulse(true);
        return value;
      });
    }

    poll();
    const timer = window.setInterval(poll, 45_000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!pulse) return;
    const timer = window.setTimeout(() => setPulse(false), 1600);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  return (
    <Link
      href="/notifications"
      className={`bell${unread > 0 ? " has-unread" : ""}${pulse ? " pulse" : ""}`}
      aria-label={unread > 0 ? `${unread} رویداد خوانده‌نشده` : "اعلان‌ها"}
      title="اعلان‌ها"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {unread > 0 && <span className="bell-badge">{unread > 99 ? "99+" : unread}</span>}
    </Link>
  );
}
