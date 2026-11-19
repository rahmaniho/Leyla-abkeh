"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseReady } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || loading) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError) {
      setError("ورود ناموفق بود. ایمیل و گذرواژه را بررسی کنید.");
      return;
    }
    router.replace("/");
  }

  return (
    <main className="login-shell">
      {/* ---------- ستون برند ---------- */}
      <aside className="login-aside">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="login-aside-logo" src="/icon-192.png" alt="نشان دفتر وکالت لیلا آبکه" width={96} height={96} />
        <div>
          <h1>اتاق فرمان<br /><em>دفتر وکالت لیلا آبکه</em></h1>
          <p>هر آنچه در سایت شما رخ می‌دهد — درخواست مشاوره، دیدگاه و بازدید — همین‌جا و یک‌جا دیده و مدیریت می‌شود.</p>
        </div>
        <div className="login-points">
          {[
            "اعلان آنی هر درخواست مشاورهٔ جدید",
            "تأیید و مدیریت دیدگاه‌های سایت",
            "گزارش عملکرد و شمارش بی‌نام بازدید",
            "انتشار مقاله مستقیماً روی سایت",
          ].map((text) => (
            <div className="login-point" key={text}>
              <span className="lp">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              {text}
            </div>
          ))}
        </div>
      </aside>

      {/* ---------- ستون ورود ---------- */}
      <div className="login-main">
        <form className="login-card" onSubmit={signIn}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="login-logo-small" src="/icon-192.png" alt="" width={52} height={52} />
          <h2 style={{ marginTop: 14 }}>ورود به پنل مدیریت</h2>
          <p>این بخش ویژهٔ مدیر سایت است؛ بدون حساب، دسترسی مقدور نیست.</p>

          {!supabaseReady && (
            <p className="msg info">
              Supabase پیکربندی نشده است. متغیرهای NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
              را در Vercel تنظیم کنید.
            </p>
          )}

          <label className="f">
            <span>ایمیل</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" placeholder="name@example.com" dir="ltr" />
          </label>
          <label className="f">
            <span>گذرواژه</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
          </label>

          {error && <p className="msg err" role="alert">{error}</p>}

          <button type="submit" className="btn gold" style={{ width: "100%", justifyContent: "center", padding: "12px 18px", fontSize: "0.88rem" }} disabled={loading || !supabaseReady}>
            {loading ? "در حال ورود…" : "ورود به داشبورد"}
          </button>
        </form>
      </div>
    </main>
  );
}
