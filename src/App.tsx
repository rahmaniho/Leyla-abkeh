import { RouterProvider, usePathname } from "./lib/router";
import Layout from "./components/Layout";
import JsonLd from "./components/JsonLd";
import { resolveRoute } from "./routes";

function AppShell() {
  const pathname = usePathname();
  const route = resolveRoute(pathname);

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
