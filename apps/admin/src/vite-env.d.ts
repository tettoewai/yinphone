/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute base URL of the API, e.g. `https://api.yinphone.shop/api`.
   * Leave unset to call `/api` on the app's own origin (see `.env.example`).
   */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
