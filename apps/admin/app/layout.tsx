import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مدیریت سایت | دفتر وکالت لیلا آبکه",
  description: "داشبورد مدیریت سایت دفتر وکالت لیلا آبکه — ثبت مشاوره‌ها، تأیید نظرات و انتشار مقالات",
  robots: { index: false, follow: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "مدیریت سایت", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0f1c28",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
