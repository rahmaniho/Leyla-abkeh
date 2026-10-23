import { useEffect, useRef } from "react";
import { RouterProvider, usePathname } from "./lib/router";
import Layout from "./components/Layout";
import JsonLd from "./components/JsonLd";
import { resolveRoute } from "./routes";

function AppShell() {
  const pathname = usePathname();
  const route = resolveRoute(pathname);
  const firstRender = useRef(true);

  /*
   * جابه‌جایی بین صفحه‌ها در یک برنامۀ تک‌صفحه‌ای، موقعیت اسکرول را نگه
   * می‌دارد؛ نتیجه این است که کاربر صفحۀ تازه را از میانۀ متن می‌بیند.
   * اینجا اسکرول به بالای صفحه برمی‌گردد و تمرکز صفحه‌خوان هم روی
   * `<main>` می‌رود تا محتوای تازه از آغاز خوانده شود. اگر نشانی هش داشته
   * باشد (لنگر فهرست مطالب)، به همان سرتیتر می‌رود.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        return;
      }
    }

    window.scrollTo(0, 0);
    const main = document.getElementById("main");
    if (main) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }, [pathname]);

  return (
    <Layout meta={route.meta}>
      <JsonLd data={route.meta.jsonLd} />
      {route.element}
    </Layout>
  );
}

export default function App({ initialPath }: { initialPath?: string }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <AppShell />
    </RouterProvider>
  );
}
