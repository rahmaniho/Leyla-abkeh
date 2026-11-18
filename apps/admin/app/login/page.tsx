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
    <main className="login-wrap">
      <form className="login-card" onSubmit={signIn}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="login-logo" src="/icon-192.png" alt="نشان دفتر وکالت لیلا آبکه" width={92} height={92} />
        <h1>مدیریت سایت</h1>
        <p>دفتر وکالت لیلا آبکه — ورود ویژهٔ مدیر</p>

        {!supabaseReady && (
          <p className="msg info">
            Supabase هنوز پیکربندی نشده است. متغیرهای NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
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

        <button type="submit" className="btn" disabled={loading || !supabaseReady}>
          {loading ? "در حال ورود…" : "ورود به داشبورد"}
        </button>
      </form>
    </main>
  );
}
