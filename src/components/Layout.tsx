import { useEffect, useRef, useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingCall from "./FloatingCall";
import { usePathname, useRouter } from "../lib/router";
import { applyMetaInBrowser, type PageMeta } from "../lib/seo";

/**
 * چیدمان مشترک صفحات: لینک پرش، ناوبری، محتوای اصلی، پاورقی و دکمهٔ تماس.
 * همچنین مدیریت اسکرول و اعلام تغییر صفحه برای صفحه‌خوان‌ها.
 */
export default function Layout({ meta, children }: { meta: PageMeta; children: ReactNode }) {
  const pathname = usePathname();
  const { hash } = useRouter();
  const firstRender = useRef(true);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    applyMetaInBrowser(meta);
  }, [meta]);

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return;
      }
    }
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);

  useEffect(() => {
    if (firstRender.current) return;
    const timer = window.setTimeout(() => setAnnouncement(`${meta.title} — صفحه بارگذاری شد`), 150);
    return () => window.clearTimeout(timer);
  }, [pathname, meta.title]);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-ink-deep focus:shadow-gold"
      >
        پرش به محتوای اصلی
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
      <FloatingCall />

      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
