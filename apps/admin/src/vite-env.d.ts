/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Absolute base URL of the API, e.g. `https://api.yinphone.shop/api`.
   * Leave unset to call `/api` on the app's own origin (see `.env.example`).
   */
  readonly VITE_API_URL?: string
  /**
   * Shows the demo-account card on the sign-in screen: `on` or `off`. Defaults
   * to on under `pnpm dev` and off in a production build (see `lib/demo-account`).
   */
  readonly VITE_DEMO_LOGIN?: string
  /** Email the demo card signs in with. Defaults to `staff@yinphone.shop`. */
  readonly VITE_DEMO_EMAIL?: string
  /** Password the demo card signs in with. Defaults to `lumi1234`. */
  readonly VITE_DEMO_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
