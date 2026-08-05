/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEB_TITLE: string;
  readonly VITE_WEB_TITLE_EN: string;
  readonly VITE_WEB_ENV: string;
  readonly VITE_WEB_BASE_API: string;
  readonly VITE_API_URL: string;
  readonly VITE_AI_API_BASE: string;
  readonly VITE_AI_API_KEY: string;
  readonly VITE_AI_DEFAULT_MODEL: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
