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
src/pages/          login, forgot-password, reset-password, dashboard placeholder
src/auth/           Session context, provider and route guards
src/components/     Auth shell, admin field set, new-password block, alerts
src/lib/            API client, password policy, routes and helpers
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

## Password reset (front end only)

`/forgot-password` is a four-step flow — email → 6-digit code → new password →
done — and is currently **simulated in the browser**. `src/lib/password-reset.ts`
holds the whole contract; nothing is emailed and any 6-digit code is accepted.

To go live, keep the three function signatures and point them at the real
endpoints (Resend-backed):

```
POST /api/auth/password-reset/request   { email }            → 204
POST /api/auth/password-reset/verify    { email, code }      → { ticket }
POST /api/auth/password-reset/complete  { ticket, password } → 204
```

The screens do not need to change. Password rules and the strength meter are
shared with the forced-reset screen via `src/lib/password-rules.ts` and
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

## Shared UI

Import components, hooks and helpers from the workspace package:

```tsx
import { Button } from "@workspace/ui/components/button"
```

`@/` is aliased to `src/`, and `@workspace/ui/*` maps to
`packages/ui/src/*` in `tsconfig.app.json`. To add a component:

```bash
pnpm dlx shadcn@latest add button -c apps/admin
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
