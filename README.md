# وب‌سایت دفتر وکالت لیلا آبکه

وب‌سایت رسمی دفتر وکالت لیلا آبکه، وکیل پایه یک دادگستری در قزوین.

- **فناوری:** React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS 4
- **میزبانی:** Netlify (Static + Functions) — میزبان اصلی
- **نسخهٔ نمایشی:** GitHub Pages → https://rahmaniho.github.io/Leyla-abkeh/
- **مدیریت محتوا:** Decap CMS (محتوا در Git، پنل در `/admin/`)
- **معماری:** چندصفحه‌ای با پیش‌رندر (SSG) در زمان بیلد

---

## اجرای محلی

```bash
npm ci
npm run dev          # http://localhost:5173
```

### پیش‌نمایش با همان رفتار GitHub Pages

```bash
VITE_BASE_PATH=/Leyla-abkeh/ VITE_SITE_URL=https://rahmaniho.github.io/Leyla-abkeh npm run build
PREVIEW_BASE=/Leyla-abkeh npm run preview   # → http://localhost:4173/Leyla-abkeh/
```

جزئیات و محدودیت‌ها: [`docs/GITHUB-PAGES.md`](docs/GITHUB-PAGES.md)

> در حالت توسعه، صفحات به‌صورت کلاینتی رندر می‌شوند. برای بررسی خروجی واقعی
> (HTML پیش‌رندرشده، sitemap و robots) از `npm run build` و `npm run preview` استفاده کنید.

## اسکریپت‌ها

| اسکریپت | کار |
| --- | --- |
| `npm run dev` | سرور توسعه |
| `npm run build` | typecheck + بیلد کلاینت + بیلد SSR + پیش‌رندر + sitemap/robots |
| `npm run preview` | سرو خروجی `dist` با رفتار نزدیک به Netlify (۳۰۱ مسیرهای بدون اسلش، ۴۰۴ واقعی)؛ `PREVIEW_BASE` برای شبیه‌سازی زیرمسیر |
| `npm run lint` | ESLint (TypeScript + React Hooks + jsx-a11y) |
| `npm run typecheck` | بررسی نوع‌ها بدون خروجی |
| `npm run test` | آزمون‌های واحد و یکپارچه (Vitest + Testing Library) |
| `npm run verify:config` | فهرست اطلاعات نیازمند تأیید مدیر سایت |
| `npm run verify` | lint + typecheck + test + build |

## تصاویر مقالات

- **تصویر شاخص:** `public/images/covers/<نام>-cover.<jpg|webp|avif>` (۱۲۰۰×۶۳۰) + نسخهٔ `-640` (۶۴۰×۳۳۶)
- **تصویر داخل متن:** `public/images/articles/<نام>-1200.<jpg|webp|avif>` (۱۲۰۰×۶۷۵) + نسخهٔ `-640` (۶۴۰×۳۶۰)

این نام‌گذاری باعث می‌شود `<picture>`، `srcset` و `sizes` خودکار ساخته شوند. در متن مقاله:

```md
![متن جایگزین توصیفی](/images/articles/<نام>-1200.jpg "زیرنویس تصویر")
```

تصویر بارگذاری‌شده از پنل در `/uploads` هم بدون نسخه‌های چندگانه با یک `img` ساده نمایش
داده می‌شود.

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

## اطلاعات سایت و «دروازهٔ تأیید»

همهٔ اطلاعات تماس، نشانی، ساعات کاری و شبکه‌های اجتماعی در `src/config/site.ts`
متمرکز شده است. برای تغییر شماره تلفن یا نشانی، فقط همین فایل را ویرایش کنید.

اطلاعاتی که هنوز تأیید نشده‌اند در `src/config/verification.json` فهرست شده‌اند:

```bash
npm run verify:config
```

**این فهرست فقط مستند نیست؛ رفتار سایت را کنترل می‌کند.** هر موردی که در آن بماند
«تأییدنشده» شمرده می‌شود و:

| مورد | رفتار تا زمان تأیید |
| --- | --- |
| `contact.phone` | هیچ شماره‌ای (و هیچ لینک `tel:`/واتساپی) نمایش داده نمی‌شود؛ جای آن دکمهٔ «درخواست تماس» به فرم است |
| `contact.officePhone` | شمارهٔ ثابت نمایش داده نمی‌شود |
| `contact.address` / `contact.hours` | متن نمایش داده می‌شود اما با نشانهٔ «در حال تأیید» و **بدون** ورود به JSON-LD |
| `lawyer.barAssociation` | ادعای عضویت در کانون وکلا حذف می‌شود |
| `pricing.consultation` / `pricing.freeConsultation` | رقم تعرفه و ادعای رایگان‌بودن نمایش داده نمی‌شود |

برای انتشار یک مقدار: مقدار واقعی را در `src/config/site.ts` (یا `pricing.ts`) بگذارید و
مورد را از `verification.json` بردارید. آزمون‌ها همین قاعده را تضمین می‌کنند
(`tests/components.test.tsx` و `tests/content.test.ts`).

### حالت استقرار بدون سرور

GitHub Pages تابع Netlify را ندارد. با `VITE_FORM_MODE=static` فرم به‌جای خطای گنگ،
وضعیت واقعی «ثبت آنلاین فعال نیست» را نشان می‌دهد. سنجش رفتار (اختیاری و بی‌نام):
[`docs/ANALYTICS.md`](docs/ANALYTICS.md).

## افزودن مقاله

از پنل `/admin/` (پس از فعال‌سازی Identity و Git Gateway) یا با افزودن فایل
Markdown در `src/content/blog/`؛ قالب فیلدها در `public/admin/config.yml` تعریف شده است.
پیش‌نویس‌ها (`draft: true`) در خروجی منتشر نمی‌شوند.

## استقرار

راهنمای کامل: [`docs/NETLIFY-SETUP.md`](docs/NETLIFY-SETUP.md) — راهنمای پنل مدیریت: [`docs/CMS-SETUP.md`](docs/CMS-SETUP.md)

## گزارش‌ها

- [`docs/AUDIT.md`](docs/AUDIT.md) — ممیزی کامل پروژه پیش از تغییرات
- [`docs/REPORT.md`](docs/REPORT.md) — تغییرات، آزمون‌ها، بیلد و موارد باقی‌مانده
- [`docs/IMPROVEMENT-PLAN.md`](docs/IMPROVEMENT-PLAN.md) — ممیزی شانزده‌مرحله‌ای، اولویت‌بندی و معیارهای پذیرش
- [`docs/ANALYTICS.md`](docs/ANALYTICS.md) — طرح سنجش حریم‌خصوصی‌محور
