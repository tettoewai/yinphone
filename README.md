# YinPhone Boutique

Turborepo monorepo with a Next.js storefront, a Vite + React admin dashboard, a
NestJS API and shared packages.

## Structure

```
apps/
  web      Next.js storefront           http://localhost:3000
  admin    Vite + React admin dashboard http://localhost:3001
  api      NestJS API (ESM)          http://localhost:4000
packages/
  ui                 shadcn/ui components, hooks, lib and Tailwind theme (source-only)
  eslint-config      shared flat ESLint configs
  typescript-config  shared tsconfigs
```

`packages/ui` is consumed as source: apps import from `@workspace/ui/*` and
compile it themselves, so it needs no build step. `apps/web` lists it in
`transpilePackages`; `apps/admin` resolves it through Vite.

## Requirements

- Node.js >= 20.9.0
- pnpm 11 (`corepack enable`)
- PostgreSQL 17 — `docker-compose.yml` at the root provides one

## Local database

`docker-compose.yml` runs the Postgres the API expects:

```bash
docker compose up -d   # postgres:17, database `yinphone`, host port 5433
pnpm db:migrate        # apply migrations
pnpm db:seed           # channels, categories, products, sample orders, owner user
```

The container publishes **5433** to match the `DATABASE_URL` in
`apps/api/.env`. If another Postgres already holds that port, publish it
elsewhere and point `DATABASE_URL` at the same place:

```bash
YINPHONE_DB_PORT=5434 docker compose up -d
# apps/api/.env → postgresql://postgres:postgres@localhost:5434/yinphone
```

Data lives in the `yinphone-postgres-data` volume, so `docker compose down`
keeps it and `docker compose down -v` throws it away.

## Commands

Run from the repo root — Turbo fans each task out to the packages that define it.

```bash
pnpm install
pnpm dev        # all apps in watch mode
pnpm build      # build everything (topological)
pnpm lint
pnpm typecheck
pnpm test       # vitest in apps/api
pnpm format     # prettier --write (not cached)
pnpm clean      # remove build output
pnpm db:generate  # regenerate the Prisma client
pnpm db:migrate   # apply migrations
pnpm db:seed      # seed channels, products, a week of demo orders, users
```

Scope to a single app with a filter:

```bash
pnpm turbo dev --filter=api
pnpm turbo build --filter=web...
```

## Adding UI components

`components.json` exists in `packages/ui` (shared) and `apps/web` (storefront).
Add components with the `shadcn` CLI pinned in `packages/ui` (v4.23.0,
`base-nova` style) — never `pnpm dlx shadcn@latest`, which would drift from the
style the generated primitives expect.

```bash
cd packages/ui && pnpm exec shadcn add <component>   # shared, default
cd apps/web    && pnpm exec shadcn add <component>   # only the storefront needs it
```

Both write UI primitives to `packages/ui/src/components` (the `ui` alias), so
every app imports them the same way:

```tsx
import { Button } from "@workspace/ui/components/button"
```

`apps/admin` has no `components.json`: it consumes the same primitives from
`@workspace/ui`, and keeps only admin-specific components in its own
`src/components`.

## API

`apps/api` serves the storefront under `/api`. See
[`apps/api/README.md`](apps/api/README.md) for setup, environment and payloads.

| Method | Endpoint              | Description                                  |
| ------ | --------------------- | -------------------------------------------- |
| `GET`  | `/api/health`         | Liveness plus a database ping                |
| `GET`  | `/api/categories`     | Categories with active product counts        |
| `GET`  | `/api/products`       | Category, price, search, sorting and paging  |
| `GET`  | `/api/products/:slug` | Single product                               |
| `GET`  | `/api/channels`       | Active order channels                        |
| `POST` | `/api/orders`         | Create an order; totals computed server-side |
| `GET`  | `/api/orders/:code`   | Order summary by code                        |

The web app renders every catalog surface from this API: `/`, `/catalog`,
`/products/[id]` and `/saved` are `force-dynamic` and fetch on each request, so
the storefront needs the API and its database running. It reads
`NEXT_PUBLIC_API_URL` and falls back to `http://localhost:4000` when unset (see
`apps/web/.env.example`).

`apps/admin` is a Vite + React SPA wired to `@workspace/ui` and the shared
Tailwind theme. It signs in against this API and ships the dashboard overview,
the orders list and detail screens, and the products list plus its create/edit
editor, categories, channels and settings screens. All of them are live against
`/api/admin/*`; the sign-in screen and the email-OTP password reset use
`/api/auth/*`. On settings, the shop profile, logo and hours still use
placeholder data (there is no settings endpoint yet) while the team card reads
and writes the staff routes. The design mocks live in `apps/admin/design/`.

The admin endpoints live under `/api/admin/*` (dashboard, orders, products,
categories, channels, staff) behind the session and role guards. Every route is
implemented. See [`apps/api/README.md`](apps/api/README.md) for the route and
role table.

## Environment variables

`.env*` files are gitignored; `.env.example` is committed. Variables that
affect a build must be declared in `turbo.json` (`env` / `globalEnv`), otherwise
Turbo may reuse a cache entry produced with different values. `NEXT_PUBLIC_*`
(web) and `VITE_*` (admin) are already declared for `build`.

## Deployment

The repo is set up to deploy as three Vercel Projects (one per app, each with its
own Root Directory). See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the project
settings, environment variables, domain/cookie notes and the API's serverless
caveats.
