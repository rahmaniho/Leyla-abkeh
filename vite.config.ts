import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.resolve(import.meta.dirname ?? ".");

/**
 * مسیر پایهی انتشار.
 * - Netlify / دامنهی اختصاصی: خالی → "/"
 * - GitHub Pages برای مخزن پروژه‌ای: `VITE_BASE_PATH=/Leyla-abkeh/`
 */
function normalizeBase(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

const base = normalizeBase(process.env.VITE_BASE_PATH);

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        /**
         * جداکردن کتابخانه‌های پایه از کد سایت:
         * مرورگر نسخۀ هش‌دار و تغییرناپذیر هر تکه را جدا کش می‌کند؛ با
         * انتشار مقالۀ تازه فقط تکهٔ کوچک محتوا دوباره دانلود می‌شود، نه
         * کل جاوااسکریپت.
         */
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) return "react";
            if (id.includes("marked")) return "markdown";
            return "vendor";
          }
          if (id.includes("/src/content/blog/")) return "articles-content";
          return undefined;
        },
      },
    },
  },
  // سرورهای توسعه/پیش‌نمایش باید دامنهی پروکسی محیط اجرا را بپذیرند
  // (این تنظیم روی خروجی تولید و Netlify اثری ندارد)
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
});
