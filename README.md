# وب‌سایت دفتر وکالت لیلا آبکه

وب‌سایت رسمی دفتر وکالت لیلا آبکه، وکیل پایه یک دادگستری در قزوین.

- **فناوری:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4
- **میزبانی:** Netlify (Static + Functions)
- **مدیریت محتوا:** Decap CMS (محتوا در Git، پنل در `/admin/`)
- **معماری:** چندصفحه‌ای با پیش‌رندر (SSG) در زمان بیلد

---

## اجرای محلی

```bash
npm ci
npm run dev          # http://localhost:5173
```

> در حالت توسعه، صفحات به‌صورت کلاینتی رندر می‌شوند. برای بررسی خروجی واقعی
> (HTML پیش‌رندرشده، sitemap و robots) از `npm run build` و `npm run preview` استفاده کنید.

## اسکریپت‌ها

| اسکریپت | کار |
| --- | --- |
| `npm run dev` | سرور توسعه |
| `npm run build` | typecheck + بیلد کلاینت + بیلد SSR + پیش‌رندر + sitemap/robots |
| `npm run preview` | سرو خروجی `dist` با رفتار نزدیک به Netlify (۳۰۱ مسیرهای بدون اسلش، ۴۰۴ واقعی) |
| `npm run lint` | ESLint (TypeScript + React Hooks + jsx-a11y) |
| `npm run typecheck` | بررسی نوع‌ها بدون خروجی |
| `npm run test` | آزمون‌های واحد و یکپارچه (Vitest + Testing Library) |
| `npm run verify:config` | فهرست اطلاعات نیازمند تأیید مدیر سایت |
| `npm run verify` | lint + typecheck + test + build |

## تصاویر مقالات

تصاویر شاخص در `public/images/covers` با نام `<نام>-cover.<jpg|webp|avif>` و نسخهٔ کوچک
`<نام>-cover-640.*` نگه‌داری می‌شوند (۱۲۰۰×۶۳۰ و ۶۴۰×۳۳۶). این نام‌گذاری باعث می‌شود
`<picture>` و `srcset` خودکار ساخته شود. تصویر بارگذاری‌شده از پنل در `/uploads` هم
بدون نسخه‌های چندگانه نمایش داده می‌شود.

## ساختار پروژه

```
src/
  config/          تنظیمات مرکزی سایت، تعرفه‌ها و فهرست موارد نیازمند تأیید
  content/         خدمات، سوالات متداول، نظرات، آمار و مقالات (Markdown)
  pages/           صفحات مسیرها
  components/      کامپوننت‌های مشترک (ناوبری، فرم، بخش‌های صفحه)
  lib/             مسیریابی، سئو، اعتبارسنجی، قالب‌بندی
  routes.tsx       ثبت مسیرها و متادیتای هر صفحه
  entry-client.tsx اجرای کلاینت (hydration)
  entry-server.tsx رندر زمان بیلد (پیش‌رندر)
netlify/functions/ تابع دریافت درخواست مشاوره + منطق اعتبارسنجی مشترک
scripts/           پیش‌رندر و بررسی پیکربندی
tests/             آزمون‌های واحد/یکپارچه
docs/              ممیزی، گزارش تغییرات و راهنمای استقرار
```

## اطلاعات سایت

همهٔ اطلاعات تماس، نشانی، ساعات کاری و شبکه‌های اجتماعی در `src/config/site.ts`
متمرکز شده است. برای تغییر شماره تلفن یا نشانی، فقط همین فایل را ویرایش کنید.

اطلاعاتی که هنوز تأیید نشده‌اند در `src/config/verification.json` فهرست شده‌اند:

```bash
npm run verify:config
```

## افزودن مقاله

از پنل `/admin/` (پس از فعال‌سازی Identity و Git Gateway) یا با افزودن فایل
Markdown در `src/content/blog/`؛ قالب فیلدها در `public/admin/config.yml` تعریف شده است.
پیش‌نویس‌ها (`draft: true`) در خروجی منتشر نمی‌شوند.

## استقرار

راهنمای کامل: [`docs/NETLIFY-SETUP.md`](docs/NETLIFY-SETUP.md) — راهنمای پنل مدیریت: [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md)

## گزارش‌ها

- [`docs/AUDIT.md`](docs/AUDIT.md) — ممیزی کامل پروژه پیش از تغییرات
- [`docs/REPORT.md`](docs/REPORT.md) — تغییرات، آزمون‌ها، بیلد و موارد باقی‌مانده
