import { hasArticles } from "../content/articles";

export interface NavItem {
  href: string;
  label: string;
}

/** ناوبری اصلی — مواردی که محتوایشان موجود نیست به‌طور خودکار حذف می‌شوند */
export const NAV_ITEMS: NavItem[] = [
  { href: "/services", label: "خدمات حقوقی" },
  { href: "/about", label: "درباره وکیل" },
  { href: "/faq", label: "سوالات متداول" },
  { href: "/pricing", label: "تعرفه‌ها" },
  ...(hasArticles ? [{ href: "/articles", label: "مقالات" }] : []),
  { href: "/contact", label: "تماس" },
];

export const FOOTER_LEGAL_LINKS: NavItem[] = [
  { href: "/privacy", label: "سیاست حریم خصوصی" },
];
