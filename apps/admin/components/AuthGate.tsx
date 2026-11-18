"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseReady } from "../lib/supabase";

/**
 * دروازهٔ احراز هویت داشبورد
 * اگر نشستی وجود نداشته باشد، کاربر به /login هدایت می‌شود.
 * امنیت واقعی با RLS سمت دیتابیس اعمال می‌شود؛ این فقط تجربهٔ کاربری است.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (!supabaseReady) {
    return (
      <div className="splash">
        <div className="msg err" style={{ maxWidth: 420 }}>
          Supabase پیکربندی نشده است. متغیرهای NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY را
          در تنظیمات پروژهٔ Vercel تنظیم کنید.
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="splash">در حال بررسی نشست…</div>;
  }

  return <>{children}</>;
}
