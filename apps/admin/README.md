# YinPhone Boutique Admin

Vite + React single-page app for the boutique dashboard. It shares the
storefront's design system: components come from `packages/ui` as source and
Tailwind v4 is compiled from `@workspace/ui/globals.css`.

## Requirements

- Node.js >= 20.9.0
- pnpm 11 (`corepack enable`)

## Commands

Run from this directory, or from the repo root with `pnpm --filter admin <task>`.

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `pnpm dev`       | Vite dev server with HMR on http://localhost:3001 |
| `pnpm build`     | Type-check (`tsc -b`) then build to `dist/`       |
| `pnpm start`     | Serve the built `dist/` on http://localhost:3001  |
| `pnpm lint`      | ESLint (flat config)                              |
| `pnpm typecheck` | `tsc -b` only, no build                           |
| `pnpm format`    | Prettier over `src/`                              |
| `pnpm clean`     | Remove `dist/`, `.turbo/` and TS build info       |

Port `3001` is pinned in `vite.config.ts` with `strictPort`, so `pnpm dev` fails
loudly instead of silently moving to another port.

## Structure

```
index.html          Vite entry document
design/             Banani design mocks (reference only, not served)
src/main.tsx        Mounts the app inside ThemeProvider, Router and SessionProvider
src/App.tsx         Route table and the auth guards
src/pages/          Sign-in, password reset, dashboard, orders, products, categories, channels, settings
src/auth/           Session context, provider and route guards
src/components/     Admin shell, dashboard panels, orders, products, categories, fields
src/lib/            API client, order/product/category/dashboard types, paging, formatters
vite.config.ts      React, React Compiler, Tailwind, `@/` and the `/api` proxy
```

## Authentication

The SPA never sees a token. `POST /api/auth/login` sets an `httpOnly` session
cookie named `yp_session`, and every request carries it because `/api` is
same-origin — the Vite dev proxy in `vite.config.ts` forwards `/api` to
`http://localhost:4000`, so no CORS or `credentials: "include"` is involved.

`SessionProvider` bootstraps from `GET /api/auth/me` on mount, where a 401 is
the normal signed-out path. Routes are wrapped in three guards:

| Guard                  | Rule                                                            |
| ---------------------- | --------------------------------------------------------------- |
| `RequireSignedOut`     | Session present → redirect to the dashboard (or the reset)      |
| `RequireAuth`          | No session → `/login`; `mustChangePassword` → `/reset-password` |
| `RequirePasswordReset` | No session → `/login`; nothing to reset → `/dashboard`          |

The forced reset (`design/reset-password.html`) has no "current password"
field, but `POST /api/auth/change-password` requires one. The password typed at
sign-in is therefore passed through `src/lib/pending-password.ts`, which holds
it **in memory only** — never in `localStorage`, `sessionStorage` or the URL.
Reloading the reset screen drops it and the user signs in again, which is the
intended failure mode for a credential.

## Password reset

`/forgot-password` is a four-step flow — email → 6-digit code → new password →
done — backed by the API (`src/lib/password-reset.ts` is a thin client over
`authApi`):

```
POST /api/auth/password-reset/request   { email }            → 204
POST /api/auth/password-reset/verify    { email, code }      → { ticket }
POST /api/auth/password-reset/complete  { ticket, password } → 204
```

`request` answers `204` for an unknown email too, so the screen behaves the
same whether or not the address has an account. The resend button honours the
server's `retryAfterSeconds` cooldown. A `RESET_TICKET_EXPIRED` error from the
last step sends the form back to the email step, because that ticket cannot be
retried. Finishing the reset ends every session for the account, which is what
the done step tells the user.

`RESET_CODE_LENGTH`, `RESET_CODE_TTL_MINUTES` and `RESEND_COOLDOWN_SECONDS` in
`src/lib/password-reset.ts` mirror the API defaults for the copy on screen; the
server remains the authority. Password rules and the strength meter are shared
with the forced-reset screen via `src/lib/password-rules.ts` and
`src/components/new-password.tsx`.

## Fonts

The Myanmar/Latin webfonts live in `packages/ui/src/fonts` so both apps use one
copy. The storefront loads them through `next/font/local`; this app imports
`@workspace/ui/fonts.css`, which declares the `@font-face` rules and the
`--font-font-body` / `--font-font-heading` variables that `globals.css` maps to
the `font-body` and `font-heading` utilities.

`fonts.css` also sets `--font-sans`, which the storefront gets from `next/font`
(Geist). Without it the `font-body` stack ends in an undefined variable, and the
whole `font-family` declaration is dropped at computed-value time.

## Dashboard, orders, products, categories and channels

`/dashboard` is wired to `GET /api/admin/dashboard`: today's orders and takings,
the all-time NEW/CONFIRMED counts, the seven-day sales chart, the channel split
and the five most recent orders all come from that one payload. `DashboardProvider`
(`src/components/dashboard/dashboard-provider.tsx`) fetches it once for the
signed-in shell, so the sidebar's gold orders chip and the dashboard page read
the same request. Cancelled orders are excluded from money figures but still
count in the channel split.

`/orders`, `/orders/:code`, `/products`, `/categories` and `/channels` are wired
to the admin API (`GET /api/admin/orders`, `GET /api/admin/products`,
`GET /api/admin/categories`, `GET /api/admin/channels`). Filtering, counting,
sorting and paging run on the server; the screens keep the previous page on screen while a newer request is in
flight (`src/hooks/use-orders.ts`, `use-products.ts`, `use-categories.ts`,
`use-dashboard.ts`). The search box is debounced by 250 ms and every request is
abortable.

Writes go straight to the API: order status changes (`PATCH .../status`), a
product's hide/show toggle and visibility switch (`PATCH .../visibility`),
duplicate (`POST .../duplicate`) and the Undo that hides the row again or
deletes the copy. The products banner keeps its 10-second Undo window. Anything
without an endpoint yet (manual order) is still a disabled placeholder.

The product editor (`/products/new` and `/products/:id/edit`) creates with
`POST /api/admin/products` and updates with `PATCH /api/admin/products/:id`.
Edit mode loads `GET /api/admin/products/:id` and seeds the same four cards;
both modes keep the draft local until Save, validate the required name, category
and price in the browser, and return to the list once the request settles. The
category select reads `GET /api/admin/categories`, and `sizes` is the S/M/L/XL
chip row (all off means one-size). Images are a full replacement: the editor
sends the ordered grid it shows, so removing a photo removes it from the
product. There is no upload endpoint yet, so a picked file only previews through
an object URL and is left out of the payload — a pasted http(s) URL is what
saves an image. The editor says so rather than implying the file was uploaded.

`/categories` creates, renames and deletes through the API; dragging a row
writes the new `sortOrder` for every row that moved. Delete stays disabled while
a category still has products and the API refuses it too. The “Saved” chip
reports the time of the last successful write. The read-only slug is derived from
the English name on create and never changes on rename.

- `/channels` reads the shop's public chat links from `GET /api/admin/channels` and
  saves the changed rows with `PATCH /api/admin/channels/:id`. Both writes are
  OWNER-only routes, so the screen is wrapped in `RequireOwner` like Settings.
  Edits are overlaid on the fetched rows so a refetch never clobbers a half-typed
  link; “Save channels” writes only the rows whose link or switch changed and then
  refetches. An enabled channel with an invalid link blocks saving.

`/settings` keeps the shop profile, logo and opening hours in local state —
there is no settings endpoint yet — but the team card is live. It reads
`GET /api/admin/staff`; an invite (`POST`) returns a one-time password that is
shown once for the owner to pass on, and role changes (`PATCH`) and removals
(`DELETE`) write through the API and refetch. The account card is live too:
“Update password” posts `POST /api/auth/change-password` (the API re-issues this
device's cookie) and “Sign out other devices” posts
`POST /api/auth/sessions/revoke-others`, which ends the rest and keeps this one.
The screen is OWNER-only, and the server refuses to demote or remove the last
owner or to change your own role; the row controls disable the same cases.

## Shared UI

Import components, hooks and helpers from the workspace package:

```tsx
import { Button } from "@workspace/ui/components/button"
```

`@/` is aliased to `src/`, and `@workspace/ui/*` maps to
`packages/ui/src/*` in `tsconfig.app.json`. Components are shared with the
storefront, so they are added to `packages/ui` with the CLI version pinned
there — this app has no `components.json` of its own:

```bash
cd packages/ui
pnpm exec shadcn add <component>
```

## Type checking

`tsconfig.app.json` extends `@workspace/typescript-config/base.json` for
`strict`, `noUncheckedIndexedAccess` and `isolatedModules`, then overrides the
module settings for Vite's bundler resolution.

## Environment variables

Copy `.env.example` to `.env` and adjust. Only `VITE_`-prefixed variables
reach the browser, and Vite inlines them into the bundle at build time, so
treat them as public — no secrets.

| Variable       | Default | Purpose                                                                                  |
| -------------- | ------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_URL` | `/api`  | Absolute API base URL. Only needed when the admin is on a different origin than the API. |

The default is same-origin, which is what `pnpm dev` and `pnpm start` proxy to
`http://localhost:4000` in `vite.config.ts`, so local development needs no
configuration. A blank value means "use the default". If you do point
`VITE_API_URL` at another origin, add that origin to the API's `CORS_ORIGINS` —
and note the session cookie is `SameSite=Lax`, so the two hosts must be
same-site for sign-in to work.

`.env*` files are gitignored; `.env.example` is committed. Because Turbo runs
tasks with `envMode: strict`, any variable that affects the build must be
declared under `build.env` in the root `turbo.json` — `VITE_*` is already listed
there.
