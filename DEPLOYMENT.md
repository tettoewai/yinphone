# Deploying to Vercel

This repo deploys as **three Vercel Projects**, all imported from the same Git
repository. Each project sets a different **Root Directory**, so Vercel builds
and deploys one app per project:

| Project    | Root Directory | Framework preset | Build Command           | Output              |
| ---------- | -------------- | ---------------- | ----------------------- | ------------------- |
| storefront | `apps/web`     | Next.js          | `pnpm exec turbo build` | `.next` (preset)    |
| admin      | `apps/admin`   | Vite             | `pnpm exec turbo build` | `dist`              |
| api        | `apps/api`     | NestJS           | `pnpm db:generate`      | N/A (serverless fn) |

The three `vercel.json` files in those directories already carry these settings;
the dashboard fields exist so you can change them per project.

Turborepo is picked up automatically: `pnpm exec turbo build` resolves the
version pinned in the root `package.json`, and `turbo` infers the package filter
from the working directory (the Root Directory), so only the app in that project
is built — plus any workspace dependency with a `build` task.

## Before you start

1. A PostgreSQL database reachable from Vercel, with a **pooled** connection
   string (Neon pooler, Supabase pooler / pgbouncer, Prisma Postgres, …).
   Serverless functions open a connection per instance, so a direct-to-database
   URL will exhaust connections under load.
2. The repo pushed to GitHub (already `origin`).
3. Node.js 20.9+ (Vercel defaults to 22.x, which is fine). pnpm is read from
   `packageManager` in the root `package.json`.

Deploy in this order: **API → web → admin**, because both clients need the API
URL, and the API needs to be reachable with a database before the storefront can
render (its catalog pages are `force-dynamic` and fetch on every request).

## 1. API (`apps/api`)

Vercel ships a NestJS framework preset (`@vercel/nestjs`). It bundles
`src/main.ts` — including Nest's decorator metadata and the `@/…` path aliases —
and exposes the Nest app as a Node.js function. Nothing extra is needed in the
code.

**Dashboard → Add New Project → import the repo**

| Setting          | Value                  |
| ---------------- | ---------------------- |
| Root Directory   | `apps/api`             |
| Framework Preset | NestJS (auto-detected) |
| Build Command    | `pnpm db:generate`     |
| Output Directory | _leave empty_          |
| Install Command  | auto (`pnpm install`)  |

`pnpm db:generate` matters because the Prisma client is generated into
`src/generated/prisma` and is gitignored. The bundled build reads that source,
so the client must exist before Vercel bundles the function.

**Environment variables**

| Variable                                                                                 | Required | Notes                                                                                                                                    |
| ---------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                           | yes      | Pooled PostgreSQL URL. Used at runtime and by `prisma generate`.                                                                         |
| `CORS_ORIGINS`                                                                           | yes      | Comma-separated browser origins, e.g. `https://admin.yinphone.shop,https://yinphone.shop`                                                |
| `COOKIE_SECURE`                                                                          | no       | Defaults to on because Vercel runs in production mode                                                                                    |
| `COOKIE_DOMAIN`                                                                          | no       | Only if you want the session cookie shared across subdomains, e.g. `.yinphone.shop`. Leave unset for the normal `api.` + `admin.` setup. |
| `SESSION_TTL_HOURS`, `SESSION_REMEMBER_DAYS`, `LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCK_MINUTES` | no       | Defaults are in `apps/api/README.md`                                                                                                     |
| `PORT`                                                                                   | no       | Vercel manages the port; leave unset                                                                                                     |

Set these for **Production and Preview** unless you keep a separate database.

Do **not** define `NODE_ENV` as a project environment variable. Vercel already
runs builds and functions with `NODE_ENV=production` (which is what makes
`COOKIE_SECURE` default to on). Defining it explicitly makes the install step
skip devDependencies, which would remove `prisma`, `turbo`, `vite` and the
TypeScript toolchain that the builds need.

**Migrations and seed** are not run on deploy. Run them once from your machine
against the production database:

```bash
export DATABASE_URL="postgresql://…"

pnpm --filter api exec prisma migrate deploy
SEED_ADMIN_PASSWORD="<strong password>" pnpm --filter api exec prisma db seed
```

`db seed` also accepts `SEED_ADMIN_EMAIL` and the optional demo
`SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` (see `apps/api/README.md`).

Then verify:

```bash
curl https://<api-domain>/api/health   # {"status":"ok"...} with a DB ping
```

### API on serverless — what changes

The NestJS preset runs the app as Vercel Functions, not as a long-lived server:

- Cold starts are possible; use Vercel's Fluid compute / a region close to the
  database.
- No background workers, timers, WebSockets or SSE streams that outlive a
  request.
- 4.5 MB request/response body limit per invocation.
- Connection pooling is on you (see `DATABASE_URL` above).

If you later need a persistent Node process, deploy `apps/api` to a container
host (Railway, Fly, Render, a VPS) instead and keep only `web` + `admin` on
Vercel — set `NEXT_PUBLIC_API_URL` / `VITE_API_URL` to that host.

## 2. Storefront (`apps/web`)

**Dashboard → Add New Project → same repo**

| Setting          | Value                    |
| ---------------- | ------------------------ |
| Root Directory   | `apps/web`               |
| Framework Preset | Next.js (auto-detected)  |
| Build Command    | `pnpm exec turbo build`  |
| Output Directory | `.next` (preset default) |

**Environment variables**

| Variable               | Required | Notes                                                                                                 |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | yes      | API **origin only**, no `/api` suffix — the client appends `/api/…`. e.g. `https://api.yinphone.shop` |
| `NEXT_PUBLIC_SITE_URL` | yes      | Canonical storefront URL used for metadata, e.g. `https://yinphone.shop`                              |

Both are **inlined at build time**. Changing them in the dashboard does nothing
until you redeploy. They are already declared in `turbo.json` (`NEXT_PUBLIC_*`),
so Turborepo will not reuse a cache entry built with different values.

## 3. Admin (`apps/admin`)

**Dashboard → Add New Project → same repo**

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Root Directory   | `apps/admin`            |
| Framework Preset | Vite (auto-detected)    |
| Build Command    | `pnpm exec turbo build` |
| Output Directory | `dist`                  |

`apps/admin/vercel.json` adds an SPA rewrite (`/(.*)` → `/index.html`), which the
`react-router-dom` routes need. Vercel checks the filesystem first, so real
assets are still served normally.

**Environment variables**

| Variable       | Required | Notes                                                                   |
| -------------- | -------- | ----------------------------------------------------------------------- |
| `VITE_API_URL` | yes      | API base URL **including** `/api`, e.g. `https://api.yinphone.shop/api` |

Also inlined at build time, and declared in `turbo.json` as `VITE_*`.

## Domains, cookies and CORS

The admin signs in with a `yp_session` cookie marked `httpOnly`,
`sameSite=lax`, `secure`. `sameSite=lax` means the browser only sends it on
**same-site** requests, and "site" is the registrable domain. So
`admin.yinphone.shop` → `api.yinphone.shop` works, but
`admin.vercel.app` → `api.vercel.app` does **not** (different sites, and
third-party cookies are blocked anyway). Symptom: login returns 200, then
`/api/auth/me` returns `401 NOT_SIGNED_IN`.

Recommended domains:

| Domain                | Project    |
| --------------------- | ---------- |
| `yinphone.shop`       | storefront |
| `admin.yinphone.shop` | admin      |
| `api.yinphone.shop`   | api        |

Then set on the **api** project:

```
CORS_ORIGINS=https://yinphone.shop,https://admin.yinphone.shop
```

A host-only cookie on `api.yinphone.shop` is enough — you do not need
`COOKIE_DOMAIN` for this layout. Add it only if you deliberately want the cookie
visible on sibling subdomains.

### Preview deployments and sign-in

Preview URLs are `*-git-branch-team.vercel.app`, i.e. a different site from the
API, so an admin session cannot stick there. Two options:

1. **Test sign-in on a custom domain** (a preview branch domain, or just use the
   production alias).
2. **Proxy `/api` through the admin project** so the browser sees one origin.
   Add this rewrite _before_ the catch-all in `apps/admin/vercel.json` and leave
   `VITE_API_URL` unset:

   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://api.yinphone.shop/api/:path*"
       },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

   This mirrors the dev proxy in `apps/admin/vite.config.ts`: requests are
   same-origin, the cookie is first-party, and CORS stops mattering. The tradeoff
   is a hop through Vercel and a hard-coded API URL (previews then talk to the
   production API). After changing it, rebuild — `VITE_API_URL` is baked in at
   build time.

## Deploying from the CLI (optional)

Git-based deploys are the normal workflow: push to `main` and each linked project
builds with the settings above. To create and deploy the projects from a terminal
instead, run `vercel link` once per app so each directory maps to its own project:

```bash
vercel login

cd apps/web
vercel link --yes        # accept the detected monorepo root + apps/web
vercel deploy --prod

cd ../admin
vercel link --yes
vercel deploy --prod

cd ../api
vercel link --yes
vercel deploy --prod
```

Add environment variables with `vercel env add <NAME> production` (and `preview`)
from inside the app directory, or in the dashboard — they are per project, so the
API's `DATABASE_URL` and each client's URL variable must be set on their own
project. `.vercel/` is gitignored. CLI deploys always build; the Ignored Build
Step only applies to Git deploys.

## Remote caching (optional)

Vercel enables its Remote Cache for deployments automatically for team-owned
projects. To get the same cache locally:

```bash
pnpm dlx turbo login
pnpm dlx turbo link
```

For an external CI pipeline, authenticate with `TURBO_TOKEN` and `TURBO_TEAM`
instead (see Vercel's _Use Remote Caching from external CI/CD_).

## Skipping unaffected builds

Vercel configures the Ignored Build Step for monorepos on import
(`npx turbo-ignore --fallback=HEAD^1`). Check it per project under
**Settings → Git → Ignored Build Step**; if it is empty, set exactly that
command. When a push changes neither `apps/web` nor `packages/ui`, the
storefront project skips its build instead of redeploying identical output.

If automatic skipping does not fit, `turbo query affected` can drive a custom
check:

```
turbo query affected --base=$VERCEL_GIT_PREVIOUS_SHA --packages web --exit-code
```

(Write the variable literally — Vercel expands it, not your shell.)

## Verifying a deployment

1. `curl https://api.yinphone.shop/api/health` → `200` with a database ping.
2. `curl https://api.yinphone.shop/api/products?limit=1` → one product.
3. Storefront home page renders products (it fetches the API server-side).
4. Admin sign-in with the seeded owner account; reload the page and confirm the
   session survives (`GET /api/auth/me` returns the user).
5. Open `/orders/<code>` directly in the admin — the SPA rewrite keeps it from
   404ing on refresh.

## Troubleshooting

**"No Output Directory named `dist` found"** — the build was skipped or restored
from cache without outputs. Confirm `apps/admin/vercel.json` keeps
`"outputDirectory": "dist"` and that `turbo.json` lists `dist/**` in
`build.outputs` (it does). Redeploy without the Build Cache to confirm.

**API build fails with a missing Prisma client** — the API project's Build
Command must be `pnpm db:generate` (or something that runs `prisma generate`).
`src/generated/prisma` is gitignored by design. If the log says
`prisma: command not found`, check that no project environment variable sets
`NODE_ENV=production` (see the note in the API section).

**`401 NOT_SIGNED_IN` right after a successful login** — cookies/CORS. Use
subdomains of one registrable domain, set `CORS_ORIGINS`, and serve over HTTPS
(or set `COOKIE_SECURE=false` while testing over plain HTTP).

**Database connection errors at runtime** — `DATABASE_URL` must be the pooled
connection string, and the function region should be near the database.

**pnpm not detected / install fails** — the root `package.json` pins
`packageManager`, so Vercel installs pnpm 11 via corepack. If the build log says
otherwise, set `ENABLE_EXPERIMENTAL_COREPACK=1` in the project's environment
variables.

**Stale env values on the clients** — `NEXT_PUBLIC_*` and `VITE_*` are compiled
into the bundle. Redeploy after changing them; do not expect a runtime change.

## Adding new environment variables later

If a variable is read at build time and gets inlined (anything `NEXT_PUBLIC_*` or
`VITE_*`, or any `process.env` read during a build), declare it in `turbo.json`
under the relevant task's `env` (or `globalEnv`) so a build built with one value
is never served from cache for another value. Variables only read at runtime
(`DATABASE_URL`, `CORS_ORIGINS`, session settings) do not need declaring.
