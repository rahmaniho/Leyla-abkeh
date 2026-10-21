import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("عنصر ریشه (#root) در صفحه پیدا نشد.");
}

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);

/**
 * خروجی بیلد پیش‌رندر می‌شود و با hydrate بارگذاری می‌شود.
 * در سرور توسعه (Vite) محتوای پیش‌رندرشده‌ای وجود ندارد؛ در آن حالت
 * رندر از صفر انجام می‌شود تا خطای hydration رخ ندهد.
 */
if (container.children.length > 0) {
  hydrateRoot(container, tree);
} else {
  createRoot(container).render(tree);
}
