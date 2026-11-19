import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import AuthGate from "../../components/AuthGate";
import DashboardLayout from "../../components/DashboardLayout";

export const metadata: Metadata = {
  title: "این بخش به‌زودی فعال می‌شود",
  robots: { index: false, follow: false },
};

const MODULES: Record<string, { title: string; hint: string }> = {
  pages: { title: "صفحات سایت", hint: "مدیریت صفحات عمومی سایت (اعلامیه‌ها، راهنماها و صفحات پرونده) پس از اتصال ماژول مدیریت صفحات فعال می‌شود." },
  categories: { title: "دسته‌بندی مقالات", hint: "تعریف و مدیریت دسته‌های مقالات پس از راه‌اندازی این ماژول در دسترس خواهد بود." },
  services: { title: "خدمات حقوقی", hint: "ویرایش محتوای صفحات خدمات حقوقی به‌زودی از همین پنل امکان‌پذیر می‌شود." },
  topics: { title: "موضوعات دعاوی", hint: "مدیریت و ویرایش موضوعات و دسته‌های دعاوی در نسخهٔ بعدی اضافه می‌شود." },
  media: { title: "رسانه‌ها", hint: "کتابخانهٔ رسانه (آپلود و مدیریت تصویر) پس از اتصال فضای ذخیره‌سازی فعال می‌شود." },
  seo: { title: "مدیریت سئو", hint: "نمایش وضعیت سئو، عنوان و توضیحات هر صفحه به‌زودی در این بخش قرار می‌گیرد." },
  settings: { title: "تنظیمات سایت", hint: "تنظیمات عمومی سایت (اطلاعات تماس، شبکه‌های اجتماعی و …) در نسخهٔ بعدی فعال می‌شود." },
  users: { title: "کاربران", hint: "مدیریت اعضا و نقش‌ها پس از تعریف سیاست‌های دسترسی اضافه می‌شود." },
};

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const { module: moduleKey } = await searchParams;
  const module: { title: string; hint: string } =
    (moduleKey ? MODULES[moduleKey] : undefined) ?? {
      title: "این بخش",
      hint: "این ماژول هنوز به پنل اضافه نشده است.",
    };

  return (
    <AuthGate>
      <DashboardLayout>
        <div className="panel soon-wrap">
          <div className="soon-icon">
            <Wrench size={30} strokeWidth={1.6} aria-hidden="true" />
          </div>
          <h1>{module.title} — به‌زودی</h1>
          <p>{module.hint}</p>
          <p style={{ marginTop: 10, fontSize: "0.7rem", color: "var(--text-2)" }}>
            هیچ دادهٔ ساختگی در این بخش نمایش داده نمی‌شود؛ به‌محض اتصال واقعی، فعال خواهد شد.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href="/" className="btn secondary">
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" /> بازگشت به داشبورد
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </AuthGate>
  );
}
