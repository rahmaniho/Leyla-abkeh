import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.resolve(import.meta.dirname ?? ".");

// https://vite.dev/config/
export default defineConfig({
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
  },
  // سرورهای توسعه/پیش‌نمایش باید دامنهٔ پروکسی محیط اجرا را بپذیرند
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
