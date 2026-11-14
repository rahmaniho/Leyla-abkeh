# چک‌لیست انتشار در laylaabkeh.ir

تاریخ: ۱۴۰۵/۰۸/۲۳ · دامنۀ نهایی: **https://laylaabkeh.ir**

این سند، وضعیت آماده‌سازی انتشار را ثبت می‌کند: آنچه در کد انجام شد و آنچه
مالک سایت باید در پنل Netlify و ثبت‌کنندهٔ دامنه انجام دهد.

---

## بخش ۱ — در کد انجام شده ✅

| مورد | فایل |
| --- | --- |
| دامنۀ پیش‌فرض (canonical/sitemap/OG/llms.txt/feed) به `https://laylaabkeh.ir` تغییر کرد | `src/config/site.ts` |
| ایمیل رسمی سایت به `info@laylaabkeh.ir` تغییر کرد | `src/config/site.ts` |
| نمونۀ مقدار در راهنما به‌روزرسانی شد | `.env.example` |
| نشانی پنل مدیریت (site_url/display_url/logo_url) به‌روزرسانی شد | `public/admin/config.yml` |
| نمونۀ دامنه در تایپ‌های env به‌روزرسانی شد | `src/vite-env.d.ts` |
| مورد `site.url` از دروازهٔ تأیید حذف شد (دامنه توسط مالک اعلام شد) | `src/config/verification.json` |
| آزمون‌ها (RSS/llms/mailto) به دامنه و ایمیل جدید منتقل شدند | `tests/` |
| وضعیت اقدام ۱۵ طرح بهبود به‌روزرسانی شد | `docs/IMPROVEMENT-PLAN.md` |

خروجی بیلد (canonical، `sitemap.xml`، `robots.txt`، `feed.xml`، `llms.txt`)
همه از همین یک تنظیمات به‌صورت خودکار ساخته می‌شوند؛ پس از بیلد روی دامنهٔ جدید
هیچ نشانی قدیمی نباید در `dist` بماند (با `grep -ri 'leyla-abkeh' dist/` بررسی کنید).

## بخش ۲ — اقدامات مالک (پنل Netlify و ثبت‌کنندهٔ دامنه)

### الف. دامنه و DNS

1. از ثبت دامنهٔ `laylaabkeh.ir` و دسترسی به پنل DNS آن مطمئن شوید
   (دامنه‌های `.ir` از طریق ایرنیک/ثبت‌کننده‌های معتبر مدیریت می‌شوند).
2. در Netlify → **Domain management** → *Add a domain* هر دو را اضافه کنید:
   - `laylaabkeh.ir` (apex)
   - `www.laylaabkeh.ir` (به‌عنوان دامنۀ فرعی؛ یکی را Primary کنید و دیگری را به آن ریدایرکت کنید — پیش‌فرض سایت «apex بدون www» است)
3. رکوردهای DNS را دقیقاً همان‌طور که خودِ Netlify در همین صفحه نشان می‌دهد ثبت کنید؛
   معمول‌ترین حالت:
   - apex: رکورد `A` به IP موازن‌کنندهٔ بار Netlify (یا استفاده از قابلیت flattening/ALIAS ثبت‌کننده)، **یا**
   - انتقال NS به Netlify DNS (ساده‌ترین و پایدارترین راه برای صدور خودکار گواهی)
   - `www`: رکورد `CNAME` به `<site-name>.netlify.app`
4. در پنل DNS، مقدار TTL را روی حالت پیش‌فرض بگذارید؛ انتشار DNS را
   با `https://laylaabkeh.ir` باز کنید.
5. Netlify به‌صورت خودکار گواهی Let's Encrypt را صادر و **Force HTTPS** را پیشنهاد می‌کند؛
   آن را فعال کنید. HSTS در `netlify.toml` از قبل تنظیم شده است.

> ⚠️ این sandbox به DNS خارجی دسترسی ندارد؛ وضعیت ثبت دامنه و رکوردها را
> خودتان در پنل ایرنیک/Netlify بررسی کنید.

### ب. متغیرهای محیطی Netlify

در Netlify → Site settings → Environment variables:

| متغیر | ضرورت | توضیح |
| --- | --- | --- |
| `VITE_SITE_URL` | توصیه‌شده (هم‌اکنون مقدار پیش‌فرض کد `https://laylaabkeh.ir` است) | اگر ست شود، همان اولویت دارد؛ بدون اسلش انتهایی |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | **یکی از کانال‌ها الزامی** | بدون آن فرم مشاوره `503` برمی‌گرداند |
| یا `RESEND_API_KEY` + `CONSULTATION_NOTIFY_EMAIL` + `CONSULTATION_FROM_EMAIL` | جایگزین | ارسال ایمیل درخواست |
| یا `CONSULTATION_WEBHOOK_URL` | اختیاری | CRM/Zapier/Make |
| `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | اختیاری | ضدهرزنامه |

پس از هر تغییر، **Trigger deploy** بزنید تا در بیلد اعمال شود.

> وضعیت فعلی کانال ارسال برای مالک نامشخص است؛ قبل از اعلام عمومی سایت
> حتماً یک درخواست آزمایشی بفرستید (بخش د).

### ج. صندوق ایمیل

- سایت هم‌اکنون `info@laylaabkeh.ir` را منتشر می‌کند. مطمئن شوید این صندوق
  واقعاً وجود دارد یا فوروارد آن برقرار است (رکوردهای `MX`/`SPF` دامنه را در
  همان پنل DNS تنظیم کنید؛ اگر صندوق هنوز آماده نیست، در `src/config/site.ts`
  مقدار `email` را موقتاً `null` بگذارید و دوباره بیلد بگیرید).

### د. آزمون پس از استقرار

```bash
# صفحهٔ اصلی و یک صفحهٔ داخلی + هدرها
curl -sI https://laylaabkeh.ir/ | head -20
curl -s https://laylaabkeh.ir/ | grep -o 'canonical[^>]*'

# sitemap و robots
curl -s https://laylaabkeh.ir/sitemap.xml | head -5
curl -s https://laylaabkeh.ir/robots.txt

# فرم مشاوره (باید 201 با reference بدهد؛ 503 یعنی کانال ارسال تنظیم نشده)
curl -i -X POST https://laylaabkeh.ir/api/consultation \
  -H 'content-type: application/json' \
  --data '{"name":"آزمون","phone":"09121234567","topic":"سایر موضوعات","message":"تست پس از انتشار","startedAt":1}'
```

- [ ] صفحهٔ اصلی، خدمات، تماس، مقالات با تصویر و فونت درست نمایش داده می‌شوند
- [ ] canonical/OG/absolute URLs همگی `laylaabkeh.ir` هستند
- [ ] فرم واقعاً درخواست را به دفتر می‌رساند (`201` + reference)
- [ ] `/admin/` باز می‌شود و ورود با Netlify Identity انجام می‌شود
- [ ] کنسول مرورگر بدون خطا است (به‌ویژه hydration)
- [ ] HTTP حقیقیِ ۴۰۴ برای مسیر ناموجود (بدون soft-404)

### ه. سئو و ایندکس

1. Google Search Console: افزودن ملک `https://laylaabkeh.ir` (تأیید با رکورد TXT یا فایل HTML)
2. ثبت `https://laylaabkeh.ir/sitemap.xml` در Search Console
3. بررسی `robots.txt` (الان منتشر می‌شود و مانعی ندارد)
4. همین کارها در Bing Webmaster Tools (اختیاری ولی توصیه‌شده)
5. دامنهٔ قدیمی `rahmaniho.github.io/Leyla-abkeh/` (دمو) دست‌نخورده می‌ماند؛
   canonical همهٔ صفحات به `laylaabkeh.ir` اشاره می‌کند پس مشکلی برای سئو ندارد.
   `leyla-abkeh.netlify.app` هم پس از اتصال دامنهٔ سفارشی همچنان در دسترس است ولی
   canonical به دامنهٔ نهایی است.

## بخش ۳ — موارد «در حال تأیید» که با سایت سازگارند

این موارد هنوز تأییدنشده‌اند و عمداً از سایت/JSON-LD پنهان‌اند (تا وقتی مالک
تأیید و آن‌ها را از `verification.json` بردارد): ساعات کاری، کد پستی، شمارهٔ ثابت،
لینک شبکه‌های اجتماعی، «مشاورهٔ اولیه رایگان»، نظرات موکلان و آمار پرونده‌ها.
انتشار سایت بدون آن‌ها از نظر محتوایی مشکلی ندارد.

## بخش ۴ — کارهای خارج از دامنهٔ این مخزن

- ثبت/تمدید دامنه و DNS (ایرنیک یا ثبت‌کننده)
- اتصال دامنه و HTTPS در Netlify
- ساخت صندوق `info@laylaabkeh.ir` و رکوردهای MX/SPF
- ست‌کردن متغیرهای محیطی کانال ارسال فرم
- Search Console / Bing
