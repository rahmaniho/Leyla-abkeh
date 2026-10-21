import { renderToString } from "react-dom/server";
import App from "./App";
import { renderHeadTags } from "./lib/seo";
import { indexablePaths, resolveRoute, sitemapEntries } from "./routes";
import { SITE_URL } from "./config/site";

export interface RenderedPage {
  html: string;
  head: string;
  title: string;
  noindex: boolean;
}

/** رندر یک مسیر به HTML کامل (برای پیش‌رندر زمان بیلد) */
export function render(path: string): RenderedPage {
  const route = resolveRoute(path);
  const html = renderToString(<App initialPath={path} />);

  return {
    html,
    head: renderHeadTags(route.meta),
    title: route.meta.title,
    noindex: Boolean(route.meta.noindex),
  };
}

export { indexablePaths, resolveRoute, sitemapEntries, SITE_URL };
