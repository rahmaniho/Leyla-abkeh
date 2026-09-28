import { useState } from "react";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";

const PHONE = "۰۹۱۲ ۱۲۳ ۴۵۶۷";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="scroll-mt-24 bg-ink py-20 text-white lg:py-28" aria-labelledby="contact-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <Reveal>
          <SectionHeader
            eyebrow="ارتباط با دفتر"
            title="اولین قدم را با آرامش بردارید"
            description="برای دریافت مشاوره، فرم را تکمیل کنید. اطلاعات شما محرمانه می‌ماند و در اولین فرصت با شما تماس می‌گیریم."
            dark
          />
          <div className="mt-8 space-y-4 text-sm text-white/70">
            <a href="tel:+989121234567" dir="ltr" className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-gold/50 hover:text-gold-light">تماس مستقیم: {PHONE}</a>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">قزوین، خیابان خیام شمالی، برج آرین، طبقهٔ ۴، واحد ۱۲</p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">شنبه تا چهارشنبه ۹ تا ۱۸ · پنجشنبه‌ها ۹ تا ۱۳</p>
          </div>
        </Reveal>

        <Reveal delay={150} direction="left">
          {submitted ? (
            <div role="status" className="rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-8 text-center">
              <h3 className="text-xl font-extrabold text-emerald-200">درخواست شما ثبت شد</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">از اعتماد شما سپاسگزاریم. در اولین فرصت با شما تماس می‌گیریم.</p>
              <button type="button" onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold text-gold-light underline">ثبت درخواست جدید</button>
            </div>
          ) : (
            <form
              name="consultation"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={() => setSubmitted(true)}
              className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-deep backdrop-blur-xl sm:p-8"
            >
              <input type="hidden" name="form-name" value="consultation" />
              <p className="hidden"><label>این فیلد را خالی بگذارید: <input name="bot-field" /></label></p>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold text-white/80">نام و نام خانوادگی<input required name="name" autoComplete="name" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold" placeholder="نام شما" /></label>
                <label className="text-sm font-semibold text-white/80">شماره تماس<input required name="phone" type="tel" inputMode="tel" autoComplete="tel" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold" placeholder="۰۹۱۲..." /></label>
              </div>
              <label className="mt-5 block text-sm font-semibold text-white/80">حوزهٔ درخواست<select name="subject" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-gold"><option className="text-ink" value="مشاوره عمومی">مشاوره عمومی</option><option className="text-ink" value="خانواده">دعاوی خانواده</option><option className="text-ink" value="کیفری">دعاوی کیفری</option><option className="text-ink" value="ملکی">امور ملکی و ثبتی</option><option className="text-ink" value="تجاری">چک، کار و شرکت‌ها</option></select></label>
              <label className="mt-5 block text-sm font-semibold text-white/80">توضیح کوتاه پیام<textarea required name="message" rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-gold" placeholder="موضوع پرونده را کوتاه توضیح دهید..." /></label>
              <button type="submit" className="mt-6 w-full rounded-xl bg-gradient-to-l from-gold-light via-gold to-gold-deep px-6 py-3.5 font-bold text-ink-deep transition hover:-translate-y-0.5">ارسال درخواست مشاوره</button>
              <p className="mt-4 text-center text-xs leading-6 text-white/45">با ارسال فرم، با تماس دفتر برای پیگیری درخواست موافقت می‌کنید.</p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
