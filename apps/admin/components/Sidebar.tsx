"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  File,
  Newspaper,
  Tags,
  Scale,
  Gavel,
  PhoneCall,
  MessageSquare,
  Image,
  TrendingUp,
  BarChart3,
  History,
  Settings,
  Users,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  soon?: boolean;
}

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  unread: number;
  newConsultations: number;
  onClose: () => void;
}

export default function Sidebar({ open, collapsed, unread, newConsultations, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sections: { section: string; items: NavItem[] }[] = [
    {
      section: "منوی اصلی",
      items: [
        { href: "/", label: "داشبورد", icon: LayoutDashboard },
        { href: "/coming-soon?module=pages", label: "صفحات سایت", icon: File, soon: true },
        { href: "/articles", label: "مقالات", icon: Newspaper },
        { href: "/coming-soon?module=categories", label: "دسته‌بندی مقالات", icon: Tags, soon: true },
        { href: "/coming-soon?module=services", label: "خدمات حقوقی", icon: Scale, soon: true },
        { href: "/coming-soon?module=topics", label: "موضوعات دعاوی", icon: Gavel, soon: true },
      ],
    },
    {
      section: "مدیریت",
      items: [
        { href: "/consultations", label: "درخواست‌های مشاوره", icon: PhoneCall, badge: newConsultations },
        { href: "/comments", label: "نظرات", icon: MessageSquare },
        { href: "/coming-soon?module=media", label: "رسانه‌ها", icon: Image, soon: true },
        { href: "/coming-soon?module=seo", label: "مدیریت سئو", icon: TrendingUp, soon: true },
        { href: "/reports", label: "گزارش‌ها", icon: BarChart3 },
        { href: "/notifications", label: "گزارش فعالیت‌ها", icon: History, badge: unread },
      ],
    },
    {
      section: "سیستم",
      items: [
        { href: "/coming-soon?module=settings", label: "تنظیمات سایت", icon: Settings, soon: true },
        { href: "/coming-soon?module=users", label: "کاربران", icon: Users, soon: true },
      ],
    },
  ];

  return (
    <aside className={`sidebar${open ? " open" : ""}`} aria-label="منوی مدیریت">
      <Link href="/" className="side-brand" onClick={onClose} title="داشبورد">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="نشان دفتر وکالت لیلا آبکه" width={44} height={44} />
        <span>
          <strong>LEYLA ABKEH</strong>
          <small>Legal Content Management</small>
        </span>
      </Link>

      <nav>
        {sections.map((group) => (
          <div key={group.section}>
            <div className="side-section">{group.section}</div>
            {group.items.map((item) => {
              const isSoon = Boolean(item.soon);
              const active = !isSoon && pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`side-link${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  <span className="lbl">{item.label}</span>
                  {isSoon ? <span className="soon-chip">به‌زودی</span> : null}
                  {item.badge && item.badge > 0 ? <span className="side-badge">{item.badge > 99 ? "99+" : item.badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <p>«LEYLA ABKEH 2.0» — سیستم مدیریت محتوای حقوقی، نهایی و پشتیبان‌گیری‌شده توسط KarenSoft</p>
        <a href="https://leyla-abkeh.ir" target="_blank" rel="noreferrer">
          بازدید از سایت <ExternalLink size={11} style={{ verticalAlign: "-1px" }} />
        </a>
      </div>
    </aside>
  );
}
