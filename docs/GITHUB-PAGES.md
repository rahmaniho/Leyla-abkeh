# انتشار روی GitHub Pages

سایت به‌صورت استاتیک پیش‌رندر می‌شود، بنابراین روی GitHub Pages هم بدون سرور اجرا می‌شود.

## نشانی زنده

**https://rahmaniho.github.io/Leyla-abkeh/**

هر push روی `main` به‌طور خودکار بیلد و منتشر می‌شود (گردش‌کار `.github/workflows/pages.yml`).
اجرای دستی هم از تب **Actions → Deploy to GitHub Pages → Run workflow** ممکن است.

## چرا تنظیم اضافه لازم بود؟

GitHub Pages یک مخزن پروژه‌ای را زیر زیرمسیر `/<repo>/` سرو می‌کند، نه ریشهٔ دامنه.
بنابراین همهٔ نشانی‌های مطلق داخلی باید پیشوند بگیرند:

| تنظیم | مقدار در Pages | مقدار در Netlify/دامنه |
| --- | --- | --- |
| `VITE_BASE_PATH` | `/Leyla-abkeh/` | خالی (`/`) |
| `VITE_SITE_URL` | `https://rahmaniho.github.io/Leyla-abkeh` | دامنهٔ نهایی |

این دو متغیر در گردش‌کار Pages از نام مخزن ساخته می‌شوند و در `vite.config.ts` به `base` تبدیل
می‌شوند. کد از `src/lib/base.ts` استفاده می‌کند:

- `withBase("/images/lawyer.jpg")` → `/Leyla-abkeh/images/lawyer.jpg`
- `withBaseSrcSet("... 560w, ... 1122w")` → نسخهٔ پیشوند‌دار `srcset`
- `stripBase(window.location.pathname)` → مسیر منطقی برای مسیریاب
- `pageHref`/`pageUrl` → لینک‌های داخلی، canonical، `og:url` و sitemap با پایه هم‌راستا

فایل‌های `dist/.nojekyll` (خاموش کردن Jekyll) و `dist/404.html` (صفحهٔ ۴۰۴ واقعی) هم در بیلد
تولید می‌شوند؛ `public/site.webmanifest` از مسیرهای نسبی استفاده می‌کند تا در هر دو حالت کار کند.

## پیش‌نمایش محلی با همان رفتار Pages

```bash
VITE_BASE_PATH=/Leyla-abkeh/ \
VITE_SITE_URL=https://rahmaniho.github.io/Leyla-abkeh \
npm run build

PREVIEW_BASE=/Leyla-abkeh npm run preview
# → http://localhost:4173/Leyla-abkeh/
```

سرور پیش‌نمایش، درخواست‌های بیرون از پایه را به پایه هدایت می‌کند و مثل Netlify مسیرهای
بدون اسلش را با `301` به نسخهٔ اسلش‌دار می‌فرستد.

## فعال‌سازی (اگر برای مخزن دیگری تکرار شد)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. گردش‌کار را push کنید؛ اولین اجرا روی `main` سایت را منتشر می‌کند.
3. اگر انتشار از شاخهٔ دیگری لازم شد، آن شاخه باید در
   **Settings → Environments → github-pages → Deployment branches** مجاز شود.

## محدودیت‌های مهم روی Pages

| موضوع | وضعیت روی Pages |
| --- | --- |
| فرم درخواست مشاوره | **کار نمی‌کند** — تابع سرورless در Netlify است. روی Pages پاسخ `/api/consultation` همان ۴۰۴ استاتیک است و فرم پیام خطای ارتباط نشان می‌دهد. برای فرم فعال، سایت باید روی Netlify (یا هر میزبان با تابع) اجرا شود. |
| پنل مدیریت `/admin/` | **کار نمی‌کند** — Decap با `git-gateway` به Netlify Identity وابسته است. |
| صفحهٔ ۴۰۴ | کار می‌کند (`404.html` سفارشی). |
| سئو (canonical/sitemap) | کار می‌کند؛ نشانی‌ها به دامنهٔ Pages اشاره می‌کنند. |
| هدرهای امنیتی | **اعمال نمی‌شوند** — Pages اجازهٔ تعریف هدر نمی‌دهد (CSP/HSTS فقط روی Netlify). |

به همین دلیل، **Netlify میزبان اصلی و تولیدی است** و Pages برای نمایش/بازبینی سریع استفاده می‌شود.
اگر خواستید Pages میزبان اصلی شود، باید فرم و پنل به یک بک‌اند دیگر (مثلاً Netlify Functions روی
دامنهٔ جدا یا یک API مستقل) منتقل شوند.

## دامنهٔ اختصاصی روی Pages

اگر دامنهٔ اختصاصی به Pages وصل شد:

1. در **Settings → Pages → Custom domain** دامنه را ثبت کنید (فایل `CNAME` هم ساخته می‌شود).
2. `VITE_BASE_PATH` را از گردش‌کار حذف کنید (پایه `/` می‌شود).
3. `VITE_SITE_URL` را به دامنهٔ نهایی تغییر دهید تا canonical و sitemap درست بمانند.
