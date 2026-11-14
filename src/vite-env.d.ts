/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** نشانی عمومی سایت (مثال: https://laylaabkeh.ir) */
  readonly VITE_SITE_URL?: string;
  /** کلید عمومی Turnstile (اختیاری) */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
