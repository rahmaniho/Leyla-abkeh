# راهنمای استقرار در Netlify

## ۱. تنظیمات بیلد

| مورد | مقدار |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | `netlify/functions` |
| Node version | `22` (در `netlify.toml` تنظیم شده) |

این مقادیر در `netlify.toml` ثبت شده‌اند و معمولاً نیازی به تنظیم دستی در پنل نیست.
اگر در پنل Netlify مقدار دیگری برای Build command ثبت شده باشد، **پنل بر فایل تنظیمات اولویت دارد**؛ آن را خالی یا مطابق بالا کنید.

## ۲. متغیرهای محیطی

در Netlify → Site settings → Environment variables تنظیم کنید:

| متغیر | ضروری | کاربرد |
| --- | --- | --- |
| `VITE_SITE_URL` | توصیه‌شده | دامنهی نهایی سایت (canonical، sitemap، OG). بدون اسلش انتهایی. |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | یکی از کانال‌ها الزامی | ارسال اعلان درخواست مشاوره به تلگرام |
| `RESEND_API_KEY` + `CONSULTATION_NOTIFY_EMAIL` + `CONSULTATION_FROM_EMAIL` | جایگزین تلگرام | ارسال ایمیل درخواست |
| `CONSULTATION_WEBHOOK_URL` (+ `CONSULTATION_WEBHOOK_SECRET`) | اختیاری | ارسال به CRM/اتوماسیون |
| `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | اختیاری | ضد‌هرزنامهی Cloudflare Turnstile |

**مهم:** تا زمانی که حداقل یکی از کانال‌های ارسال (تلگرام، ایمیل یا وب‌هوک) تنظیم نشود،
فرم مشاوره پیام موفقیت نمی‌دهد و پاسخ `503` با پیام «سامانه پیکربندی نشده است» برمی‌گرداند.
این رفتار عمدی است تا هیچ درخواستی گم نشود.

هر متغیری که با `VITE_` شروع شود در زمان بیلد داخل باندل فرانت‌اند قرار می‌گیرد؛
بنابراین **هیچ کلید محرمانه‌ای نباید با پیشوند `VITE_` تعریف شود**.

## ۳. مسیرها و صفحات

خروجی بیلد شامل فایل HTML مستقل برای هر مسیر است:

```
dist/index.html
dist/services/index.html
dist/services/khanevadeh/index.html
dist/articles/<slug>/index.html
dist/sitemap.xml
dist/robots.txt
dist/404.html
```

Netlify برای مسیرهای ناموجود، `404.html` را با کد وضعیت ۴۰۴ سرو می‌کند؛ بنابراین
هیچ «soft 404» و هیچ بازنویسی SPA لازم نیست (و نباید اضافه شود).

## ۴. تابع دریافت درخواست مشاوره

- مسیر عمومی: `POST /api/consultation` (بازنویسی به `/.netlify/functions/consultation`)
- اعتبارسنجی سرور با همان منطق فرم مرورگر
- محدودیت نرخ: حداکثر ۵ درخواست در ۱۰ دقیقه و حداقل ۱۵ ثانیه فاصله بین دو درخواست از یک IP
- محدودیت حجم بدنه: ۱۰ کیلوبایت
- ثبت لاگ فقط شامل کد پیگیری و وضعیت ارسال است (بدون اطلاعات شخصی)

**محدودیت شناخته‌شده:** محدودیت نرخ در حافظهی نمونهی تابع نگهداری می‌شود. در مقیاس بالا
(چند نمونهی هم‌زمان) ممکن است دقیق نباشد. برای محدودیت قطعی، از Netlify Blobs/Redis استفاده کنید.

### آزمون پس از استقرار

```bash
curl -i -X POST https://<domain>/api/consultation \
  -H 'content-type: application/json' \
  --data '{"name":"آزمون","phone":"09121234567","topic":"سایر موضوعات","message":"تست","startedAt":1}'
```

پاسخ موفق: `201` با `reference`. اگر `503` گرفتید، متغیرهای محیطی ارسال تنظیم نشده‌اند.

## ۵. هدرهای امنیتی

در `netlify.toml` تنظیم شده است:

- `Content-Security-Policy` (بدون اسکریپت درون‌خطی، بدون دامنهی خارجی در حالت پیش‌فرض)
- `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- `Cache-Control` تفکیک‌شده برای `assets`، `fonts`، `images` و HTML
- `X-Robots-Tag: noindex` برای `/admin/*`

### فعال‌سازی Turnstile

اگر Turnstile را فعال کردید، باید این میزبان‌ها به CSP اضافه شوند (در `netlify.toml` توضیح داده شده):

- `script-src` → `https://challenges.cloudflare.com`
- `frame-src` → `https://challenges.cloudflare.com`
- `connect-src` → `https://challenges.cloudflare.com`

بدون این تغییر، ویجت بارگذاری نمی‌شود و فرم قابل ارسال نخواهد بود.

## ۶. دامنه و سئو

1. دامنه را در Netlify (Domain management) متصل کنید.
2. `VITE_SITE_URL` را به دامنهی نهایی تغییر دهید و مجدداً deploy کنید
   تا canonical، OG و sitemap با دامنهی درست ساخته شوند.
3. `sitemap.xml` را در Google Search Console ثبت کنید.
4. پس از استقرار، `/robots.txt` و یک صفحهی نمونه را بررسی کنید.

## ۷. فهرست بررسی پس از انتشار

- [ ] صفحهی اصلی، خدمات، تماس و مقالات با تصویر و فونت درست نمایش داده می‌شوند
- [ ] فرم مشاوره واقعاً درخواست را به دفتر می‌رساند (با یک درخواست آزمایشی)
- [ ] پیام خطا در حالت نبود پیکربندی نمایش داده می‌شود (اختیاری: با حذف موقت متغیرها)
- [ ] `/admin/` باز می‌شود و ورود با Netlify Identity انجام می‌شود
- [ ] `https://<domain>/sitemap.xml` و `/robots.txt` در دسترس‌اند
- [ ] کنسول مرورگر بدون خطا است (به‌ویژه خطای hydration)
- [ ] شماره تلفن، نشانی و ساعات کاری واقعی جایگزین شده‌اند
