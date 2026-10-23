import { renderToString } from "react-dom/server";
import App from "./App";
import { renderHeadTags } from "./lib/seo";
import { buildLlmsFile, indexablePaths, resolveRoute, sitemapEntries } from "./routes";
import { buildRssFeed } from "./lib/feed";
import { siteConfig } from "./config/site";
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

/** فید RSS آمادۀ نوشتن در ریشۀ خروجی */
export function buildFeedFile(siteUrl: string): string {
  return buildRssFeed(siteUrl, {
    name: siteConfig.site.name,
    description: siteConfig.site.defaultDescription,
  });
}

export { buildLlmsFile, indexablePaths, resolveRoute, sitemapEntries, SITE_URL };
