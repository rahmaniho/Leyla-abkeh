# انتشار سایت روی laylaabkeh.ir — راهنمای قدم‌به‌قدم

تاریخ: ۱۴۰۵/۰۸/۲۳ · PR: #22 (شاخهٔ `arena/460f6923-leyla-abkeh`)

⏱️ زمان تقریبی کل: ۱ تا ۳ ساعت کار + انتظار انتشار DNS (چند دقیقه تا چند ساعت).

> از این طرف همه‌چیز در کد آماده است (دامنه، canonical، sitemap، ایمیل، آزمون‌ها).
> مراحل زیر بیرون از مخزن و در پنل‌ها انجام می‌شود.

---

## گام ۰ — پیش‌نیازها

- [ ] دسترسی به حساب Netlify که سایت فعلی (پیش‌فرض `leyla-abkeh.netlify.app`) روی آن است
- [ ] دسترسی به پنل دامنهٔ `laylaabkeh.ir` (ایرنیک یا ثبت‌کنندهٔ دامنه) و امکان ویرایش رکوردهای DNS/NS
- [ ] تصمیم دربارهٔ ایمیل (گام ۲) — چون سایت `info@laylaabkeh.ir` را منتشر می‌کند
- [ ] PR #22 مرج شود (گام ۱) — وگرنه روی سایت زنده canonical قدیمی می‌ماند

---

## گام ۱ — مرج PR و اطمینان از دیپلوی main

1. PR #22 را بررسی و مرج کنید (یا از من بخواهید مرجش کنم).
2. Netlify معمولاً از شاخهٔ `main` بیلد می‌کند؛ پس از مرج، یک دیپلوی جدید در
   Netlify → Deploys ببینید و وضعیتش را **Published** کنید.
3. در لاگ همان دیپلوی، خط «پیش‌رندر کامل شد … دامنه: `https://laylaabkeh.ir`» را تأیید کنید.

> تا قبل از مرج، نگران نباشید: سایت زنده با دامنهٔ قدیمی هم کار می‌کند و canonical قدیمی نشان می‌دهد.

---

## گام ۲ — تصمیم ایمیل (قبل از انتشار رکوردها)

سایت اکنون `info@laylaabkeh.ir` را در فوتر، صفحهٔ تماس و `llms.txt` منتشر می‌کند.

- **اگر صندوق `info@laylaabkeh.ir` را می‌سازید:** ادامه دهید؛ در گام ۸ رکوردهای MX/SPF را هم اضافه کنید.
- **اگر هنوز صندوق آماده نیست:** ایمیل‌های موکلان بی‌پاسخ می‌مانند. دو راه دارید:
  1. سریعاً با یک سرویس ایمیل آن را بسازید (مثلاً Google Workspace / Zoho / هاست ایمیل ایرانی)، یا
  2. فعلاً ایمیل را از سایت حذف کنید: در `src/config/site.ts` مقدار `email` را `null` بگذارید،
     `npm run verify` بگیرید و یک PR کوچک بسازید. هر زمان آماده شد برگردانید.

---

## گام ۳ — رکوردهای DNS در ثبت‌کنندهٔ دامنه

سه روش کامل وجود دارد — شما NSها را به Cloudflare منتقل کرده‌اید، پس **روش ج** را بخوانید:

- **روش ج (سناریوی شما):** DNS روی Cloudflare؛ سایت روی Netlify — رکوردها خاکستری، گواهی از Netlify، ایمیل با رکوردهای MX/SPF در همان Cloudflare.
- روش الف: DNS ثبت‌کننده دست‌نخورده بماند (اگر NS را به Cloudflare برگردانید).
- روش ب: انتقال کامل NS به Netlify DNS (اگر از Cloudflare پشیمان شدید).

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

### روش ج — دامنه روی Cloudflare (NS به Cloudflare منتقل شده) ⭐ سناریوی فعلی

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
`laylaabkeh.ir` و سپس `www.laylaabkeh.ir`؛ یکی را **Primary** کنید (پیش‌فرض پروژه: apex) و
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
  `info@laylaabkeh.ir` را به هر آدرس دیگرتان (مثلاً Gmail شما) **فوروارد** می‌کند (رایگان؛ فقط دریافت).
  برای ارسال از همین آدرس، به یک سرویس SMTP نیاز دارید (مثلاً Resend/Zoho/Brevo) و باید آن را در
  تنظیمات «Send mail as» جیمیل اضافه کنید؛ یا همان گزینهٔ صندوق (Zoho/Workspace) را بسازید.
- SPF ساده: `TXT @ v=spf1 include:<سرویس‌دهنده> ~all` · DMARC: `TXT _dmarc v=DMARC1; p=quarantine;`

**۵) راستی‌آزمایی سریع:**

```bash
dig NS laylaabkeh.ir +short        # باید ...ns.cloudflare.com برگرداند
dig A laylaabkeh.ir +short         # خاکستری: 75.2.60.5 · نارنجی: IPهای کلودفلر
dig CNAME www.laylaabkeh.ir +short
curl -sI https://laylaabkeh.ir/    # 200 + هدر strict-transport-security و CSP
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

### روش ب — انتقال NS به Netlify DNS

1. Netlify → **Domains** → «Add a domain» → دامنه را اضافه کنید → **Set up Netlify DNS**.
2. چهار رکورد NS نشان‌داده‌شده (`dns1…` تا `dns4…nsone.net`) را در ثبت‌کننده به‌جای NSهای فعلی بگذارید.
   (مقدار دقیق را از پنل خودتان کپی کنید؛ پیشوند ممکن است `p06` یا مشابه آن باشد.)
3. **هشدار:** در این حالت تمام رکوردهای قبلی (به‌خصوص MX ایمیل) باید در DNS پنل Netlify بازسازی شوند.
   قبل از انتقال آن‌ها را یادداشت/اکسپورت کنید. همین‌جا گزینهٔ ساده برای صدور خودکار گواهی و مدیریت متمرکز است.

### تأیید انتشار DNS (از هر کامپیوتری)

```bash
dig A laylaabkeh.ir +short          # باید 75.2.60.5 (یا ALIAS resolve‌شده به IP نتلیفای) برگرداند
dig CNAME www.laylaabkeh.ir +short  # باید leyla-abkeh.netlify.app برگرداند
dig MX laylaabkeh.ir +short         # پس از تنظیم ایمیل
```

انتشار ممکن است چند دقیقه تا ۲۴–۴۸ ساعت طول بکشد؛ گام بعدی را می‌توانید هم‌زمان انجام دهید.

---

## گام ۴ — اتصال دامنه در پنل Netlify

1. Netlify → سایت → **Site configuration → Domains** (یا منوی «Domains» در نوار کناری).
2. **Add a domain** → `laylaabkeh.ir` را تایپ کنید → Confirm.
3. دوباره **Add a domain** → `www.laylaabkeh.ir` را اضافه کنید.
   - یکی را **Primary domain** کنید؛ پیش‌فرض این پروژه `laylaabkeh.ir` (apex بدون www) است.
   - دیگری را Netlify خودکار به Primary ریدایرکت می‌کند (مطمئن شوید گزینهٔ «Redirect to primary» فعال است).
4. مقابل هر دامنه، وضعیت DNS را چک کنید؛ با درست بودن رکوردها، وضعیت «Awaiting external DNS» / «Checking» به «Netlify DNS / Configured» می‌رود.
5. زیر همان صفحه → **HTTPS** → منتظر صدور خودکار گواهی Let's Encrypt بمانید (چند دقیقه پس از DNS درست)، سپس **Force HTTPS** را روشن کنید.
   (HSTS در `netlify.toml` روشن است؛ گواهی خودکار تمدید می‌شود.)
6. اگر DNS اشتباه باشد، Netlify پیام «DNS verification failed» می‌دهد — به گام ۳ برگردید و رکوردهای A/AAAA قدیمی را چک کنید.

---

## گام ۵ — متغیرهای محیطی روی Netlify

Netlify → **Site configuration → Environment variables**:

| متغیر | وضعیت | مقدار نمونه |
| --- | --- | --- |
| `VITE_SITE_URL` | توصیه‌شده | `https://laylaabkeh.ir` (بدون اسلش انتهایی) — اگر ست نشود هم مقدار پیش‌فرض کد همین است |
| `TELEGRAM_BOT_TOKEN` | یکی از سه کانال الزامی | از @BotFather |
| `TELEGRAM_CHAT_ID` | همراه توکن | عددی؛ از @userinfobot یا `getUpdates` |
| `RESEND_API_KEY` | جایگزین تلگرام | از داشبورد Resend |
| `CONSULTATION_NOTIFY_EMAIL` | همراه Resend | `info@laylaabkeh.ir` (یا صندوق دیگر) |
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
curl -sI https://laylaabkeh.ir/ | head -25
# انتظار: HTTP/2 200، وجود strict-transport-security، content-security-policy، x-content-type-options

# 2) Canonical و OG در صفحهٔ اصلی و یک صفحهٔ داخلی
curl -s https://laylaabkeh.ir/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://laylaabkeh.ir/contact/ | grep -o 'property="og:url" content="[^"]*"'
# انتظار: https://laylaabkeh.ir/ و https://laylaabkeh.ir/contact/

# 3) sitemap و robots
curl -s https://laylaabkeh.ir/sitemap.xml | head -8
curl -s https://laylaabkeh.ir/robots.txt

# 4) کد ۴۰۴ واقعی برای مسیر ناموجود
curl -s -o /dev/null -w "%{http_code}\n" https://laylaabkeh.ir/invoice-that-does-not-exist
# انتظار: 404

# 5) فرم مشاوره (باید 201 + reference بدهد؛ 503 = کانال ارسال ست نشده)
curl -i -X POST https://laylaabkeh.ir/api/consultation \
  -H 'content-type: application/json' \
  --data '{"name":"آزمون","phone":"09121234567","topic":"سایر موضوعات","message":"تست پس از انتشار","startedAt":1}'

# 6) ایمیل منتشر شده
curl -s https://laylaabkeh.ir/contact/ | grep -o 'mailto:[^"]*'
# انتظار: info@laylaabkeh.ir
```

و به‌صورت چشمی: صفحهٔ اصلی، `/services/`، یک خدمت، `/articles/` و یک مقاله، `/contact/`، `/faq/`، `/pricing/` —
فونت‌ها، تصاویر، ناوبری موبایل، دکمهٔ «درخواست مشاوره» و کنسول مرورگر (F12 → Console) بدون خطا.

---

## گام ۷ — ایندکس در موتورهای جست‌وجو

**Google Search Console** (توصیه‌شده، رایگان):

1. https://search.google.com/search-console → **Add property**.
2. اگر روش **Domain property** را انتخاب کردید: تأیید با یک رکورد `TXT` در DNS (مقدار را خودش می‌دهد؛
   مثل `google-site-verification=…`) — این حالت کل apex + www + زیردمین‌ها را پوشش می‌دهد و بهترین است.
3. یا **URL-prefix property** با نشانی `https://laylaabkeh.ir/`: تأیید با همان رکورد TXT یا فایل HTML
   (برای فایل HTML باید فایلی با نام داده‌شده در `public/` بگذارید + push + deploy؛ روش TXT ساده‌تر است).
4. پس از تأیید → **Sitemaps** → وارد کنید: `sitemap.xml` → Submit.
5. ابزار **URL Inspection** → آدرس صفحهٔ اصلی را بررسی و «Request indexing» بزنید (اختیاری).

**Bing Webmaster Tools** (اختیاری): همان مراحل؛ می‌توانید از Search Console import کنید.

> `robots.txt` فعلی سایت `Allow: /` است و فقط `/admin/` و `/api/` را مسدود می‌کند؛ مانعی برای ایندکس نیست.

---

## گام ۸ — صندوق ایمیل `info@laylaabkeh.ir`

سایت این آدرس را منتشر می‌کند؛ صندوق باید واقعاً وجود داشته باشد.

**گزینه‌ها:** Google Workspace، Zoho Mail (پلن رایگان)، یا هاست ایمیل ایرانی (مثلاً سرورهای داخل کشور).

**رکوردهایی که سرویس‌دهندهٔ ایمیل می‌دهد را به DNS اضافه کنید**؛ نمونهٔ رایج:

```text
MX    @     10 mx1.example.com.
MX    @     20 mx2.example.com.
TXT   @     v=spf1 include:_spf.example.com ~all
TXT   _dmarc v=DMARC1; p=quarantine; rua=mailto:postmaster@laylaabkeh.ir
TXT   <selector>._domainkey  v=DKIM1; k=rsa; p=MIGfMA0G…   (از پنل سرویس ایمیل)
```

**بررسی سلامت ایمیل:** https://www.mxtoolbox.com/ یا `dig MX laylaabkeh.ir`، سپس یک ایمیل تست به یک صندوق بیرونی بفرستید و تحویلش را ببینید (پوشهٔ spam را هم چک کنید).

> اگر دامنه را به Netlify DNS منتقل کردید (روش ب)، همین رکوردهای MX/SPF/DKIM را در پنل Netlify DNS ثبت کنید.

---

## گام ۹ — فعال‌سازی پنل مدیریت (`/admin/`) — Decap CMS

1. Netlify → سایت → **Identity** → **Enable Identity**.
2. Identity → **Services** → **Git Gateway** → **Enable**.
3. Identity → **Invite users** → ایمیل مدیر (مثلاً همان `info@laylaabkeh.ir` اگر صندوق دارید) → ارسال دعوت.
4. ایمیل دعوت را باز کنید → روی لینک کلیک کنید → رمز تعیین کنید → به `https://laylaabkeh.ir/admin/` بروید و وارد شوید.
5. یک مقالهٔ تستی (Draft) بسازید و مطمئن شوید «Publish» یک کامیت در `main` می‌سازد و Netlify خودکار دیپلوی می‌کند.

> ترتیب مهم است: اول ایمیل (گام ۸) → دعوت Identity؛ وگرنه ایمیل دعوت به آدرس خالی می‌رود.
> بودجه‌بندی خطای رایج: «پنل باز می‌شود ولی خالی است» = Git Gateway فعال نیست یا کاربر به مخزن دسترسی ندارد.

---

## گام ۱۰ — نگهداری پس از انتشار

- [ ] **Search Console** را هفتگی بررسی کنید (Coverage / Indexing / Core Web Vitals).
- [ ] **Uptime monitoring** رایگان بگذارید (مثلاً UptimeRobot با پینگ هر ۵ دقیقه به `https://laylaabkeh.ir/`).
- [ ] **تمدید دامنه** را در تقویم ثبت کنید (ایرنیک سالانه است؛ انقضای دامنه یعنی قطعی کامل سایت).
- [ ] گواهی SSL توسط Netlify خودکار تمدید می‌شود؛ فقط اگر Force HTTPS ناگهان خطا داد، از پنل دوباره Provision را بزنید.
- [ ] هر انتشار محتوا از `/admin/` یک کامیت در `main` می‌سازد؛ تاریخچه در GitHub باقی می‌ماند.
- [ ] بازگشت سریع (rollback): Netlify → Deploys → روی دیپلوی سالم قبلی → **Publish deploy**.
- [ ] پس از هر تغییر محتوایی مهم، یک‌بار `curl -s https://laylaabkeh.ir/sitemap.xml` و یکی از صفحات را چک کنید.

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

## چک‌لیست نهایی (کپی کنید و تیک بزنید)

- [ ] PR #22 مرج شد؛ دیپلوی main Published و دامنه در لاگ `https://laylaabkeh.ir` است
- [ ] DNS: `dig A laylaabkeh.ir` → `75.2.60.5` (یا ALIAS) · `dig CNAME www.laylaabkeh.ir` → `….netlify.app`
- [ ] Netlify Domains: apex Primary + ریدایرکت www؛ Force HTTPS روشن
- [ ] `curl -sI https://laylaabkeh.ir/` → 200 + هدرهای امنیتی
- [ ] canonical/OG همه روی `laylaabkeh.ir`
- [ ] `curl -s -o /dev/null -w "%{http_code}" https://laylaabkeh.ir/xyz` → `404`
- [ ] فرم مشاوره: `201` با `reference` (یا حداقل: پیام خطای واقعی در UI)
- [ ] `info@laylaabkeh.ir` صندوق ساخته شد؛ MX/SPF/DKIM/DMARC درست؛ ایمیل تست تحویل شد
- [ ] Search Console: ملک تأیید شد؛ `sitemap.xml` Submit شد
- [ ] `/admin/` وارد شد؛ یک draft تستی ساخته و حذف شد
- [ ] تمدید سالانهٔ دامنه در تقویم ثبت شد

---

## منابع

- Netlify — Custom domains: Domains در پنل (مقادیر دقیق DNS از خودِ پنل معتبر است؛ IP باربالانسر ممکن است تغییر کند)
- Netlify — HTTPS: صدور و تمدید خودکار Let's Encrypt + Force HTTPS
- Google Search Console: https://search.google.com/search-console
- راهنماهای داخلی: `docs/NETLIFY-SETUP.md` · `docs/CMS-SETUP.md` · `docs/ANALYTICS.md`
