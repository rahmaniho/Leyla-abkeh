# انتشار سایت روی leyla-abkeh.ir (+ ریدایرکت laylaabkeh.ir) — راهنمای قدم‌به‌قدم

تاریخ: ۱۴۰۵/۰۸/۲۷ · PR: #22 (شاخهٔ `arena/460f6923-leyla-abkeh`)

**دامنه‌های نهایی (اعلام مالک):**
- **`leyla-abkeh.ir`** — دامنهٔ اصلی/canonical (روی آن سایت سرو می‌شود؛ canonical/sitemap/OG/ایمیل از همین ساخته می‌شوند)
- **`laylaabkeh.ir`** — دامنهٔ دوم؛ روی همان سایت Netlify می‌نشیند و به‌صورت خودکار **۳۰۱ → leyla-abkeh.ir** ریدایرکت می‌شود
- `leylaabkeh.ir` — املای اشتباه؛ هیچ‌جا نباید بماند (از Netlify و Cloudflare حذف شود؛ راهنمای پاک‌سازی در گام ۳)

هر دو دامنه به یک سایت سرو می‌شوند؛ محتوا یکی است و جریمهٔ duplicate content نمی‌خورید.

⏱️ زمان تقریبی کل: ۱ تا ۳ ساعت کار + انتظار انتشار DNS (چند دقیقه تا چند ساعت).

> از این طرف همه‌چیز در کد آماده است (دامنه، canonical، sitemap، ایمیل، آزمون‌ها).
> مراحل زیر بیرون از مخزن و در پنل‌ها انجام می‌شود.

---

## گام ۰ — پیش‌نیازها

- [ ] دسترسی به حساب Netlify که سایت فعلی (پیش‌فرض `leyla-abkeh.netlify.app`) روی آن است
- [ ] دسترسی به پنل دامنهٔ `leyla-abkeh.ir` **و** `laylaabkeh.ir` (ایرنیک یا ثبت‌کنندهٔ دامنه) و امکان ویرایش NS هر دو
- [ ] تصمیم دربارهٔ ایمیل (گام ۲) — چون سایت `info@leyla-abkeh.ir` را منتشر می‌کند
- [ ] PR #22 مرج شود (گام ۱) — وگرنه روی سایت زنده canonical قدیمی می‌ماند

---

## گام ۱ — مرج PR و اطمینان از دیپلوی main

1. PR #22 را بررسی و مرج کنید (یا از من بخواهید مرجش کنم).
2. Netlify معمولاً از شاخهٔ `main` بیلد می‌کند؛ پس از مرج، یک دیپلوی جدید در
   Netlify → Deploys ببینید و وضعیتش را **Published** کنید.
3. در لاگ همان دیپلوی، خط «پیش‌رندر کامل شد … دامنه: `https://leyla-abkeh.ir`» را تأیید کنید.

> تا قبل از مرج، نگران نباشید: سایت زنده با دامنهٔ قدیمی هم کار می‌کند و canonical قدیمی نشان می‌دهد.

---

## گام ۲ — تصمیم ایمیل (قبل از انتشار رکوردها)

سایت اکنون `info@leyla-abkeh.ir` را در فوتر، صفحهٔ تماس و `llms.txt` منتشر می‌کند.

- **اگر صندوق `info@leyla-abkeh.ir` را می‌سازید:** ادامه دهید؛ در گام ۸ رکوردهای MX/SPF را هم اضافه کنید.
- **اگر هنوز صندوق آماده نیست:** ایمیل‌های موکلان بی‌پاسخ می‌مانند. دو راه دارید:
  1. سریعاً با یک سرویس ایمیل آن را بسازید (مثلاً Google Workspace / Zoho / هاست ایمیل ایرانی)، یا
  2. فعلاً ایمیل را از سایت حذف کنید: در `src/config/site.ts` مقدار `email` را `null` بگذارید،
     `npm run verify` بگیرید و یک PR کوچک بسازید. هر زمان آماده شد برگردانید.

---

## گام ۳ — رکوردهای DNS در ثبت‌کنندهٔ دامنه

> ⭐ **مسیر پیشنهادی برای همین پروژه: روش «Netlify DNS».** دلیل: یک پنل برای همه‌چیز، گواهی کاملاً خودکار (هر دو دامنه)، و Netlify خودش CDN سراسری با محافظت DDoS دارد؛ کلودفلر برای این سایت چیز اساسی‌ای اضافه نمی‌کند. فقط یک مسیر را برای هر دامنه انتخاب کنید؛ دو حالت موازی یعنی «Pending DNS verification» برای همیشه.
>
> **وضعیت فعلی (ثبت‌شده در ۱۴۰۵/۰۸/۲۷) — پاک‌سازی دامنهٔ اشتباه:** مالک، دامنهٔ نهایی را دو مورد اعلام کرد: `leyla-abkeh.ir` (اصلی) و `laylaabkeh.ir` (ریدایرکت). دامنهٔ `leylaabkeh.ir` (بدون خط‌تیره) که پیش‌تر به‌اشتباه در Netlify (Primary!) و Cloudflare اضافه شده بود **اشتباه است و باید به‌طور کامل حذف شود**: در Netlify → Domains → روی آن → Options → **Remove domain**؛ در Cloudflare → زون `leylaabkeh.ir` → Settings → **Delete site**. پس از آن، دو دامنهٔ درست را طبق زیر اضافه کنید.

- **روش «Netlify DNS» (✅ پیشنهاد ما برای این پروژه):** NSها را به نتلیفای بسپارید؛ هیچ رکورد دستی لازم نیست.
- روش الف: نگه‌داشتن DNS ثبت‌کننده و ثبت دستی A/CNAME (اگر نمی‌خواهید NSها را عوض کنید).
- روش ج: Cloudflare جلوی Netlify (اگر مشخصاً WAF/کش/ایمیل‌فورواردینگ رایگان کلودفلر می‌خواهید).

### روش الف — نگه‌داشتن DNS ثبت‌کننده (پیشنهادی برای ایمیل‌دار)

در پنل DNS دامنه **دقیقاً این رکوردها** را تنظیم/اضافه کنید (مقادیر Netlify همان‌اند؛ نسخهٔ نهایی را از صفحهٔ Domains پنل خودتان بخوانید):

| نوع | نام/میزبان | مقدار | هدف |
| --- | --- | --- | --- |
| `A` | `@` (ریشه/apex) | `75.2.60.5` | سایت روی apex |
| یا `ALIAS` / `ANAME` | `@` | `leyla-abkeh.netlify.app` | اگر ثبت‌کننده از flattening پشتیبانی می‌کند (بهتر از IP ثابت) |
| `CNAME` | `www` | `leyla-abkeh.netlify.app` | سایت روی www |
| `MX` | `@` | طبق سرویس ایمیل شما | ایمیل (گام ۸) |
| `TXT` | `@` | `v=spf1 include:…` | SPF (گام ۸) |

نکات حیاتی:

- **هر رکورد A یا AAAA قدیمیِ apex را حذف کنید** (پارکینگ قبلی، هاست قبلی). باقی‌ماندن
  AAAA قدیمی رایج‌ترین علت «https کار نمی‌کند» است.
- اگر رکورد **CAA** دارید، اجازهٔ گواهی Let's Encrypt را بدهید:
  `0 issue "letsencrypt.org"` (یا CAA را موقتاً حذف کنید).
- رکورد wildcard (`*`) که به جای دیگری اشاره می‌کند را بردارید.
- اگر دامنه **DNSSEC** فعال دارد و می‌خواهید NS را عوض کنید → اول DNSSEC را خاموش کنید
  (وگرنه دامنه unresolvable می‌شود). در روش الف نیازی به تغییر NS نیست.
- مقدار `www` را به `leyla-abkeh.netlify.app` بزنید؛ اگر نام سایت در Netlify شما چیز دیگری
  است، دقیقاً همان را از پنل کپی کنید.

### روش ج — دامنه روی Cloudflare جلوی Netlify (جایگزین؛ فقط در صورت نیاز به کلودفلر)

اگر نام‌سرورها را به Cloudflare تغییر داده‌اید و می‌خواهید DNS/CDN را آنجا مدیریت کنید
(سایت همچنان روی Netlify می‌ماند)، ترتیب و نکات زیر را دقیق رعایت کنید — رایج‌ترین علت
«سایت باز می‌شود ولی HTTPS مشکل دارد» همین پروکسی Cloudflare قبل از صدور گواهی Netlify است.

**۱) ابتدا رکوردها را در Cloudflare DNS درست ثبت کنید (Cloudflare → دامنه → DNS → Records):**

| نوع | نام | مقدار | وضعیت پروکسی |
| --- | --- | --- | --- |
| `A` | `@` | `75.2.60.5` | **DNS only (ابر خاکستری)** در گام اول |
| `CNAME` | `www` | `leyla-abkeh.netlify.app` | **DNS only (ابر خاکستری)** در گام اول |

- هر رکورد `A`/`AAAA`/`CNAME` قبلی یا پارکینگ/هاست قبلی را حذف کنید (فقط این دو رکورد برای وب بمانند).
- رکورد `www` را به همان `<سایت>.netlify.app` خودتان بزنید (نام سایت را از پنل Netlify کپی کنید؛
  مستندات این مخزن `leyla-abkeh.netlify.app` را نشان می‌دهند).
- `MX`/`SPF`/`DKIM`/`DMARC` ایمیل هم در همین بخش اضافه می‌شوند؛ کلودفلر فقط HTTP/S را پروکسی می‌کند
  و این رکوردها همیشه خاکستری (DNS only) هستند.

**۲) در Netlify دامنه را Add کنید:** Site configuration → Domains → Add a domain →
`leyla-abkeh.ir` و سپس `www.leyla-abkeh.ir`؛ یکی را **Primary** کنید (پیش‌فرض پروژه: apex) و
ریدایرکت دیگری به آن فعال باشد. منتظر بمانید وضعیت به **«Netlify DNS / Secured»** برود.
اگر گواهی «Pending/Failed» ماند: مطمئن شوید رکوردها **خاکستری (DNS only)** هستند، سپس
Domains → HTTPS → **Provision certificate** را بزنید. با A خاکستری، Netlify مستقیماً
به باربالانسرش می‌رسد و گواهی Let's Encrypt در چند دقیقه صادر می‌شود.

**۳) فقط پس از «Secured» شدن:** اگر می‌خواهید CDN/WAF کلودفلر فعال باشد، ابر رکوردها را
نارنجی (Proxied) کنید و حتماً در Cloudflare → **SSL/TLS → Overview** حالت را
**Full (strict)** بگذارید (هرگز Flexible — حلقهٔ ریدایرکت می‌سازد). اگر گواهی Netlify
صادر نشده باشد، orange کردن گواهی را برای همیشه خراب می‌کند.
- اگر Cloudflare «Edge Certificate» نشان می‌دهد «Pending/Initializing»، چند دقیقه صبر کنید.
- **Always Use HTTPS** را می‌توانید روشن کنید (با Netlify Force HTTPS تداخل ندارد).
- **HSTS را در Cloudflare روشن نکنید**؛ سایت هم‌اکنون HSTS را از Netlify ارسال می‌کند (`netlify.toml`).
- کش: لازم نیست دستکاری کنید؛ HTML از Netlify با `must-revalidate` می‌آید و کلودفلر آن را
  cache نمی‌کند؛ دارایی‌های هش‌دار هم آفلاین‌کش می‌شوند — بی‌خطر است. اگر خواستید Rule بزنید:
  Bypass cache برای `/admin*` و `/api/*`.

**۴) ایمیل روی همین دامنه (MX در Cloudflare ثبت می‌شود):** رکوردهای MX/SPF/DKIM را از
سرویس ایمیل‌تان بگیرید و در همین DNS Records بگذارید (مثلاً MX → `mx1.zoho.com` و …؛ مقدار واقعی
را از پنل سرویس ایمیل بردارید). نکته‌های رایج:

- کلودفلر پروکسی برای MX ندارد؛ این رکوردها اصلاً نارنجی نمی‌شوند.
- اگر صندوق کامل نمی‌خواهید: **Cloudflare → Email → Email Routing** آدرس
  `info@leyla-abkeh.ir` را به هر آدرس دیگرتان (مثلاً Gmail شما) **فوروارد** می‌کند (رایگان؛ فقط دریافت).
  برای ارسال از همین آدرس، به یک سرویس SMTP نیاز دارید (مثلاً Resend/Zoho/Brevo) و باید آن را در
  تنظیمات «Send mail as» جیمیل اضافه کنید؛ یا همان گزینهٔ صندوق (Zoho/Workspace) را بسازید.
- SPF ساده: `TXT @ v=spf1 include:<سرویس‌دهنده> ~all` · DMARC: `TXT _dmarc v=DMARC1; p=quarantine;`

**۵) راستی‌آزمایی سریع:**

```bash
dig NS leyla-abkeh.ir +short        # باید ...ns.cloudflare.com برگرداند
dig A leyla-abkeh.ir +short         # خاکستری: 75.2.60.5 · نارنجی: IPهای کلودفلر
dig CNAME www.leyla-abkeh.ir +short
curl -sI https://leyla-abkeh.ir/    # 200 + هدر strict-transport-security و CSP
```

سپس در مرورگر: بدون خطای گواهی باز شود؛ پدلاک سبز؛ و مسیر ناموجود `404` واقعی بدهد.

**عیب‌یابی حالت «گیر کرده»:**

| نشانه | علت | درمان |
| --- | --- | --- |
| خطای گواهی / `SSL_ERROR` / `ERR_SSL_VERSION` | رکورد نارنجی قبل از صدور گواهی Netlify یا حالت Flexible | رکوردها را موقتاً خاکستری کنید → Provision certificate در Netlify → بعد در صورت تمایل orange + Full (strict) |
| «This site can't be reached» (NXDOMAIN/REFUSED) | رکورد A/CNAME وجود ندارد یا به جای دیگری می‌رود | فقط A @ → 75.2.60.5 و CNAME www → site.netlify.app (+حذف بقیه) |
| حلقهٔ ریدایرکت (redirect loop) | SSL mode = Flexible + Force HTTPS در Netlify | SSL/TLS را **Full (strict)** کنید |
| orange فعال ولی 502/520/522 | کلودفلر به Netlify نمی‌رسد | خاکستری کنید؛ cert Netlify را چک کنید؛ بعد orange |
| www باز می‌شود، apex نه (یا برعکس) | یکی از دو رکورد جا مانده | هر دو رکورد را بگذارید؛ در Netlify هم هر دو را Add کنید |
| ایمیل می‌رسد ولی ارسال خطا می‌خورد | SPF/DKIM ناقص (به‌خصوص با Email Routing) | رکوردهای SPF/DKIM را از سرویس ایمیل دقیق کپی کنید |

**ترکیب نهایی پیشنهادی (بیشترین پایداری):** رکوردها خاکستری + گواهی Netlify + Force HTTPS در
Netlify + ایمیل با Email Routing/هاست معمولی. اگر بعدتر WAF/Turnstile/کش می‌خواهید:
نارنجی + Full (strict).

### روش Netlify DNS — انتقال NS هر دو دامنه به نتلیفای ✅ (مسیر پیشنهادی)

1. Netlify → سایت → **Domains** → دامنهٔ اشتباه `leylaabkeh.ir` را حذف کنید (Options → Remove domain).
2. **Add a domain** → `leyla-abkeh.ir` را تایپ کنید → Confirm → یکی را **Primary domain** کنید (همین `leyla-abkeh.ir`).
3. دوباره **Add a domain** → `laylaabkeh.ir` را به‌عنوان دامنهٔ دوم اضافه کنید — Netlify خودش آن را به Primary **۳۰۱ ریدایرکت** می‌کند (همان «Redirects automatically to primary domain» که کنار alias می‌نویسد).
4. برای هر دو دامنه **Set up Netlify DNS** را بزنید و همان چهار NS نشان‌داده‌شده را در پنل ثبت‌کنندهٔ **هر دو دامنه** وارد کنید (یک پیکربندی جدا برای هر کدام؛ ممکن است پیشوند `p09` باشد — **همان مقادیر پنل خودتان معتبر است**).
   - اگر **DNSSEC** روی هر دامنه فعال است اول خاموشش کنید.
5. به Netlify برگردید → برای هر دو دامنه **Retry DNS verification** → با انتشار NSها (چند دقیقه تا ۲۴–۴۸ ساعت) هر دو به **Secured** می‌رسند؛ گواهی Let's Encrypt خودکار صادر و تمدید می‌شود.
6. **زون(های) Cloudflare را حذف کنید** (یا مطمئن شوید NSهیچ‌کدام از دو دامنه دیگر به Cloudflare نیست).
7. رکوردهای وب را Netlify خودش می‌سازد؛ **هیچ A/CNAME دستی لازم نیست**.
8. **ایمیل (اختیاری):** رکوردهای `MX`، `TXT (SPF)`، `TXT (DKIM)` و `TXT _dmarc` را در Domains → DNS records نتلیفای برای `leyla-abkeh.ir` اضافه کنید. مقادیر را از سرویس ایمیل‌تان (Zoho رایگان، Google Workspace، یا هاست ایرانی) بگیرید.

### تأیید انتشار DNS (از هر کامپیوتری)

```bash
dig NS leyla-abkeh.ir +short    # باید هر چهار NS نتلیفای را نشان دهد
dig NS laylaabkeh.ir +short     # همین‌طور
dig A leyla-abkeh.ir +short     # باید 75.2.60.5 (باربالانسر نتلیفای) برگرداند
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://laylaabkeh.ir/
# انتظار: 301  https://leyla-abkeh.ir/
```

انتشار ممکن است چند دقیقه تا ۲۴–۴۸ ساعت طول بکشد؛ گام بعدی را می‌توانید هم‌زمان انجام دهید.

---

## گام ۴ — اتصال دامنه در پنل Netlify

1. Netlify → سایت → **Site configuration → Domains** (یا منوی «Domains» در نوار کناری).
2. **Add a domain** → `leyla-abkeh.ir` را تایپ کنید → Confirm → **Primary** شود.
3. دوباره **Add a domain** → `www.leyla-abkeh.ir` و سپس `laylaabkeh.ir` را اضافه کنید.
   - هر دو به‌طور خودکار به Primary **۳۰۱** ریدایرکت می‌شوند («Redirects automatically to primary domain»).
4. مقابل هر دامنه، وضعیت DNS را چک کنید؛ با درست بودن رکوردها، وضعیت «Awaiting external DNS» / «Checking» به «Netlify DNS / Configured» می‌رود.
5. زیر همان صفحه → **HTTPS** → منتظر صدور خودکار گواهی Let's Encrypt بمانید (چند دقیقه پس از DNS درست)، سپس **Force HTTPS** را روشن کنید.
   (HSTS در `netlify.toml` روشن است؛ گواهی خودکار تمدید می‌شود.)
6. اگر DNS اشتباه باشد، Netlify پیام «DNS verification failed» می‌دهد — به گام ۳ برگردید و رکوردهای A/AAAA قدیمی را چک کنید.

---

## گام ۵ — متغیرهای محیطی روی Netlify

Netlify → **Site configuration → Environment variables**:

| متغیر | وضعیت | مقدار نمونه |
| --- | --- | --- |
| `VITE_SITE_URL` | توصیه‌شده | `https://leyla-abkeh.ir` (بدون اسلش انتهایی) — اگر ست نشود هم مقدار پیش‌فرض کد همین است |
| `TELEGRAM_BOT_TOKEN` | یکی از سه کانال الزامی | از @BotFather |
| `TELEGRAM_CHAT_ID` | همراه توکن | عددی؛ از @userinfobot یا `getUpdates` |
| `RESEND_API_KEY` | جایگزین تلگرام | از داشبورد Resend |
| `CONSULTATION_NOTIFY_EMAIL` | همراه Resend | `info@leyla-abkeh.ir` (یا صندوق دیگر) |
| `CONSULTATION_FROM_EMAIL` | همراه Resend | آدرس فرستنده با دامنهٔ تأییدشده در Resend |
| `CONSULTATION_WEBHOOK_URL` (+`CONSULTATION_WEBHOOK_SECRET`) | اختیاری | CRM / Zapier / Make |
| `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | اختیاری ولی توصیه‌شده | از Cloudflare Turnstile |

**تنظیم کانال تلگرام (ساده‌ترین):**

1. در تلگرام به **@BotFather** پیام `/newbot` بدهید؛ نام و یوزرنیم بسازید؛ **توکن** را کپی کنید.
2. به ربات خودتان یک پیام بفرستید (مثلاً «سلام»).
3. در مرورگر باز کنید: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. در خروجی JSON، `result[0].message.chat.id` عدد **chat_id** شماست.
5. هر دو مقدار را در Netlify ست کنید.

> قانون طلایی پروژه: بدون هیچ کانالی، فرم عمداً `503 «سامانه پیکربندی نشده»` می‌دهد تا
> درخواست‌ها گم نشوند؛ داده‌ای نشت نمی‌کند.

**فعال‌سازی خودکار و اعمال تغییرات:** پس از هر تغییر متغیر → تب **Deploys** → **Trigger deploy → Deploy site** (معمولاً < ۲ دقیقه).

---

## گام ۶ — آزمون پس از دیپلوی (۱۰ دقیقه)

```bash
# 1) صفحهٔ اصلی + هدرهای امنیتی
curl -sI https://leyla-abkeh.ir/ | head -25
# انتظار: HTTP/2 200، وجود strict-transport-security، content-security-policy، x-content-type-options

# 2) Canonical و OG در صفحهٔ اصلی و یک صفحهٔ داخلی
curl -s https://leyla-abkeh.ir/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://leyla-abkeh.ir/contact/ | grep -o 'property="og:url" content="[^"]*"'
# انتظار: https://leyla-abkeh.ir/ و https://leyla-abkeh.ir/contact/

# 3) sitemap و robots
curl -s https://leyla-abkeh.ir/sitemap.xml | head -8
curl -s https://leyla-abkeh.ir/robots.txt

# 4) کد ۴۰۴ واقعی برای مسیر ناموجود
curl -s -o /dev/null -w "%{http_code}\n" https://leyla-abkeh.ir/invoice-that-does-not-exist
# انتظار: 404

# 5) فرم مشاوره (باید 201 + reference بدهد؛ 503 = کانال ارسال ست نشده)
curl -i -X POST https://leyla-abkeh.ir/api/consultation \
  -H 'content-type: application/json' \
  --data '{"name":"آزمون","phone":"09121234567","topic":"سایر موضوعات","message":"تست پس از انتشار","startedAt":1}'

# 6) ایمیل منتشر شده
curl -s https://leyla-abkeh.ir/contact/ | grep -o 'mailto:[^"]*'
# انتظار: info@leyla-abkeh.ir

# 7) دامنهٔ دوم باید 301 به اصلی بدهد
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://laylaabkeh.ir/
# انتظار: 301 https://leyla-abkeh.ir/
```

و به‌صورت چشمی: صفحهٔ اصلی، `/services/`، یک خدمت، `/articles/` و یک مقاله، `/contact/`، `/faq/`، `/pricing/` —
فونت‌ها، تصاویر، ناوبری موبایل، دکمهٔ «درخواست مشاوره» و کنسول مرورگر (F12 → Console) بدون خطا.

---

## گام ۷ — ایندکس در موتورهای جست‌وجو

**Google Search Console** (توصیه‌شده، رایگان):

1. فقط برای دامنهٔ اصلی `leyla-abkeh.ir` ملک اضافه کنید (دامنهٔ alias خودکار ۳۰۱ می‌شود و نیازی به ملک جدا ندارد؛ می‌توانید برای همان هم ملک بگذارید تا گزارش ریدایرکت‌ها را ببینید).
1. https://search.google.com/search-console → **Add property**.
2. اگر روش **Domain property** را انتخاب کردید: تأیید با یک رکورد `TXT` در DNS (مقدار را خودش می‌دهد؛
   مثل `google-site-verification=…`) — این حالت کل apex + www + زیردمین‌ها را پوشش می‌دهد و بهترین است.
3. یا **URL-prefix property** با نشانی `https://leyla-abkeh.ir/`: تأیید با همان رکورد TXT یا فایل HTML
   (برای فایل HTML باید فایلی با نام داده‌شده در `public/` بگذارید + push + deploy؛ روش TXT ساده‌تر است).
4. پس از تأیید → **Sitemaps** → وارد کنید: `sitemap.xml` → Submit.
5. ابزار **URL Inspection** → آدرس صفحهٔ اصلی را بررسی و «Request indexing» بزنید (اختیاری).

**Bing Webmaster Tools** (اختیاری): همان مراحل؛ می‌توانید از Search Console import کنید.

> `robots.txt` فعلی سایت `Allow: /` است و فقط `/admin/` و `/api/` را مسدود می‌کند؛ مانعی برای ایندکس نیست.

---

## گام ۸ — صندوق ایمیل `info@leyla-abkeh.ir`

سایت این آدرس را منتشر می‌کند؛ صندوق باید واقعاً وجود داشته باشد.

**گزینه‌ها:** Google Workspace، Zoho Mail (پلن رایگان)، یا هاست ایمیل ایرانی (مثلاً سرورهای داخل کشور).

**رکوردهایی که سرویس‌دهندهٔ ایمیل می‌دهد را به DNS اضافه کنید**؛ نمونهٔ رایج:

```text
MX    @     10 mx1.example.com.
MX    @     20 mx2.example.com.
TXT   @     v=spf1 include:_spf.example.com ~all
TXT   _dmarc v=DMARC1; p=quarantine; rua=mailto:postmaster@leyla-abkeh.ir
TXT   <selector>._domainkey  v=DKIM1; k=rsa; p=MIGfMA0G…   (از پنل سرویس ایمیل)
```

**بررسی سلامت ایمیل:** https://www.mxtoolbox.com/ یا `dig MX leyla-abkeh.ir`، سپس یک ایمیل تست به یک صندوق بیرونی بفرستید و تحویلش را ببینید (پوشهٔ spam را هم چک کنید).

> اگر NSها را به Netlify DNS منتقل کردید (مسیر پیشنهادی)، همین رکوردهای MX/SPF/DKIM را در Domains → DNS records نتلیفای ثبت کنید.

---

## گام ۹ — فعال‌سازی پنل مدیریت (`/admin/`) — Decap CMS

1. Netlify → سایت → **Identity** → **Enable Identity**.
2. Identity → **Services** → **Git Gateway** → **Enable**.
3. Identity → **Invite users** → ایمیل مدیر (مثلاً همان `info@leyla-abkeh.ir` اگر صندوق دارید) → ارسال دعوت.
4. ایمیل دعوت را باز کنید → روی لینک کلیک کنید → رمز تعیین کنید → به `https://leyla-abkeh.ir/admin/` بروید و وارد شوید.
5. یک مقالهٔ تستی (Draft) بسازید و مطمئن شوید «Publish» یک کامیت در `main` می‌سازد و Netlify خودکار دیپلوی می‌کند.

> ترتیب مهم است: اول ایمیل (گام ۸) → دعوت Identity؛ وگرنه ایمیل دعوت به آدرس خالی می‌رود.
> بودجه‌بندی خطای رایج: «پنل باز می‌شود ولی خالی است» = Git Gateway فعال نیست یا کاربر به مخزن دسترسی ندارد.

---

## گام ۱۰ — نگهداری پس از انتشار

- [ ] **Search Console** را هفتگی بررسی کنید (Coverage / Indexing / Core Web Vitals).
- [ ] **Uptime monitoring** رایگان بگذارید (مثلاً UptimeRobot با پینگ هر ۵ دقیقه به `https://leyla-abkeh.ir/`).
- [ ] **تمدید دامنه** را در تقویم ثبت کنید (ایرنیک سالانه است؛ انقضای دامنه یعنی قطعی کامل سایت).
- [ ] گواهی SSL توسط Netlify خودکار تمدید می‌شود؛ فقط اگر Force HTTPS ناگهان خطا داد، از پنل دوباره Provision را بزنید.
- [ ] هر انتشار محتوا از `/admin/` یک کامیت در `main` می‌سازد؛ تاریخچه در GitHub باقی می‌ماند.
- [ ] بازگشت سریع (rollback): Netlify → Deploys → روی دیپلوی سالم قبلی → **Publish deploy**.
- [ ] پس از هر تغییر محتوایی مهم، یک‌بار `curl -s https://leyla-abkeh.ir/sitemap.xml` و یکی از صفحات را چک کنید.

---

## خطاهای رایج و درمان

| نشانه | علت احتمالی | درمان |
| --- | --- | --- |
| HTTPS صادر نمی‌شود | DNS هنوز propagate نشده / AAAA قدیمی / DNSSEC | صبر + حذف رکوردهای قدیمی + خاموش کردن DNSSEC هنگام تعویض NS |
| apex باز می‌شود ولی `www` نه (یا برعکس) | رکورد مربوطه ناقص | CNAME برای `www` یا A/ALIAS برای apex را اصلاح کنید |
| `www` به apex ریدایرکت نمی‌کند | Primary تنظیم نشده | در Domains یکی را Primary کنید |
| فرم `503` برمی‌گرداند | هیچ کانال ارسالی ست نشده (رفتار عمدی) | گام ۵: تلگرام یا Resend را ست کنید + Trigger deploy |
| canonical هنوز دامنهٔ قدیمی را نشان می‌دهد | PR #22 مرج نشده یا دیپلوی جدید نیست | گام ۱ |
| `/admin/` سفید/خالی | Git Gateway خاموش | گام ۹ |
| دانلود فونت/تصویر خطای `net::ERR` | CSP دستکاری شده | `netlify.toml` را به نسخهٔ داخل مخزن برگردانید |
| خطای ۴۰۴ روی همهٔ مسیرها | publish directory اشتباه در پنل | Site configuration → Build → Publish: `dist` |

---

## پیوست الف — کلیک‌به‌کلیک: ثبت رکورد در Cloudflare (فقط اگر مسیر ج را انتخاب کردید)

هر رکورد را جداگانه اضافه کنید: **Cloudflare Dashboard → انتخاب `leyla-abkeh.ir` → منوی سمت چپ: DNS → Records → دکمهٔ «+ Add record»**. فرم باز می‌شود:

**فیلدهای هر ردیف:**

1. **Type** — نوع رکورد را از فهرست بازشونده انتخاب کنید (A / CNAME / MX / TXT).
2. **Name** — نام میزبان: برای دامنهٔ اصلی (apex) عبارت `@` بنویسید؛ برای `www` عبارت `www` بنویسید؛ برای `_dmarc` عبارت `_dmarc` (نقطه/نام کامل لازم نیست).
3. **IPv4 address / Target / Mail server / Content** — مقدار واقعی رکورد (جدول پایین).
4. **Priority** — فقط برای MX: عدد اولویت صندوق (مثلاً ۱۰، ۲۰).
5. **Proxy status** — آیکون ابر: **خاکستری «DNS only»** یا نارنجی «Proxied». برای وب طبق مراحل «روش ج» ابتدا خاکستری؛ برای MX/TXT/CAA/SRV اصلاً نارنجی نمی‌شود.
6. **TTL** — همان `Auto` پیش‌فرض بگذارید.
7. دکمهٔ **Save**.

**رکوردهای وب (همه خاکستری ⚪):**

| # | Type | Name | مقدار | Priority | Proxy |
| --- | --- | --- | --- | --- | --- |
| ۱ | `A` | `@` | `75.2.60.5` | — | DNS only |
| ۲ | `CNAME` | `www` | `leyla-abkeh.netlify.app` | — | DNS only |

**رکوردهای ایمیل (همیشه DNS only؛ مقادیر دقیق را از پنل سرویس ایمیل خودتان بردارید):**

| # | Type | Name | مقدار نمونه | Priority |
| --- | --- | --- | --- | --- |
| ۳ | `MX` | `@` | `mx1.zoho.com` (مثال Zoho) — یا `aspmx.l.google.com` (مثال Google) | 10 (یا 1) |
| ۴ | `MX` | `@` | `mx2.zoho.com` — یا `alt1.aspmx.l.google.com` | 20 (یا 5) |
| ۵ | `TXT` | `@` | `v=spf1 include:zoho.com ~all` (مثال Zoho) — برای Google: `v=spf1 include:_spf.google.com ~all` | — |
| ۶ | `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:postmaster@leyla-abkeh.ir` | — |
| ۷ | `TXT` | `<selector>._domainkey` | مقدار DKIM که سرویس ایمیل می‌دهد (مثل `v=DKIM1; k=rsa; p=…`) | — |

> اسامی و اولویت‌های MX/SPF/DKIM برای هر سرویس‌دهنده متفاوت است؛ ستون آخر را از همان سرویس
> کپی کنید، نه از این نمونه‌ها. اگر هنوز سرویس ایمیل انتخاب نکرده‌اید، با Email Routing کلودفلر
> (بخش Email → Email Routing) فقط دریافت به یک صندوق دیگر (مثلاً Gmail) را رایگان فعال کنید؛
> در این حالت کلودفلر خودش سه رکورد لازم (MX + TXT مالکیت/SPF) را پیشنهاد و خودکار ثبت می‌کند.

**قبل از «Add record»، رکوردهای مزاحم را حذف کنید:**

در همان صفحهٔ Records هر ردیفی که این‌ها را دارد را ردیابی و حذف کنید (دکمهٔ «…» → Delete):

- هر `A`/`AAAA` دیگری برای `@` (پارکینگ، هاست قبلی، IPهای قدیمی)
- هر `CNAME` با نام `www` به جای دیگری
- رکورد wildcard `*` اگر به غیر از Netlify اشاره می‌کند
- رکورد `CAA` اگر `letsencrypt.org` یا CA گواهی شما را مجاز نمی‌کند
  (یا آن را اصلاح کنید: `0 issue "letsencrypt.org"`)

**ترتیب پیشنهادی:** ۱ → ۲ را ثبت کنید و **صبور بمانید تا Netlify گواهی را صادر کند** (Domains → Secured)؛
بعد اگر مایل بودید ابر رکوردهای ۱ و ۲ را نارنجی کنید و SSL/TLS را **Full (strict)** بگذارید؛
در آخر رکوردهای ایمیل ۳ تا ۷.

**راستی‌آزمایی (روی کامپیوتر خودتان):**

```bash
dig A leyla-abkeh.ir +short        # خاکستری → 75.2.60.5 · نارنجی → IPهای کلودفلر
dig CNAME www.leyla-abkeh.ir +short
dig MX leyla-abkeh.ir +short
dig TXT leyla-abkeh.ir +short      # باید SPF شما را نشان دهد
dig TXT _dmarc.leyla-abkeh.ir +short
```

یا آنلاین: وب‌سایت‌هایی مثل `whatsmydns.net` (انتشار سراسری رکوردها) و `mxtoolbox.com` (سلامت MX/SPF).

**نشانه‌های موفقیت در پنل Cloudflare:** NSهای دامنه «Active» باشند؛ مقابل هر رکورد ابر درست باشد؛
در صفحهٔ Overview خطای «DNS records still pointing elsewhere» نبینید.

---

## چک‌لیست نهایی (کپی کنید و تیک بزنید)

- [ ] PR #22 مرج شد؛ دیپلوی main Published و دامنه در لاگ `https://leyla-abkeh.ir` است
- [ ] دامنهٔ اشتباه `leylaabkeh.ir` از Netlify و Cloudflare حذف شد؛ هیچ‌جا نمانده
- [ ] DNS: NS هر دو دامنه → همان چهار NS نتلیفای؛ `dig A leyla-abkeh.ir` → `75.2.60.5`
- [ ] Netlify Domains: `leyla-abkeh.ir` Primary · `laylaabkeh.ir` و `www.leyla-abkeh.ir` با ریدایرکت خودکار؛ Force HTTPS روشن
- [ ] `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" https://laylaabkeh.ir/` → `301 https://leyla-abkeh.ir/`
- [ ] `curl -sI https://leyla-abkeh.ir/` → 200 + هدرهای امنیتی
- [ ] canonical/OG همه روی `leyla-abkeh.ir`
- [ ] `curl -s -o /dev/null -w "%{http_code}" https://leyla-abkeh.ir/xyz` → `404`
- [ ] فرم مشاوره: `201` با `reference` (یا حداقل: پیام خطای واقعی در UI)
- [ ] `info@leyla-abkeh.ir` صندوق ساخته شد؛ MX/SPF/DKIM/DMARC درست؛ ایمیل تست تحویل شد
- [ ] Search Console: ملک تأیید شد؛ `sitemap.xml` Submit شد
- [ ] `/admin/` وارد شد؛ یک draft تستی ساخته و حذف شد
- [ ] تمدید سالانهٔ دامنه در تقویم ثبت شد

---

## منابع

- Netlify — Custom domains: Domains در پنل (مقادیر دقیق DNS از خودِ پنل معتبر است؛ IP باربالانسر ممکن است تغییر کند)
- Netlify — HTTPS: صدور و تمدید خودکار Let's Encrypt + Force HTTPS
- Google Search Console: https://search.google.com/search-console
- راهنماهای داخلی: `docs/NETLIFY-SETUP.md` · `docs/CMS-SETUP.md` · `docs/ANALYTICS.md`
