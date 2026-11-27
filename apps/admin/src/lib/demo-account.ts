import type { LoginInput } from "@/lib/api"

/**
 * The shared demo account, advertised on the sign-in screen so a reviewer can
 * look around without being invited.
 *
 * It is hidden unless `VITE_DEMO_LOGIN` is on. That defaults to on for
 * `pnpm dev` and off for a production build, so a real shop never publishes a
 * working password it did not ask to publish; a portfolio deployment opts in at
 * build time.
 *
 * The account itself comes from `pnpm db:seed`, which creates a `STAFF` user
 * from `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` (defaults
 * `staff@yinphone.shop` / `lumi1234`). If you override either, set
 * `VITE_DEMO_EMAIL` / `VITE_DEMO_PASSWORD` to match — the card signs in
 * through the real login route, so a mismatch only shows the normal
 * "email or password is incorrect" banner.
 */
const enabled =
  (import.meta.env.VITE_DEMO_LOGIN ?? (import.meta.env.DEV ? "on" : "off")) ===
  "on"

export const DEMO_ACCOUNT: LoginInput | null = enabled
  ? {
      email: import.meta.env.VITE_DEMO_EMAIL || "staff@yinphone.shop",
      password: import.meta.env.VITE_DEMO_PASSWORD || "lumi1234",
    }
  : null
