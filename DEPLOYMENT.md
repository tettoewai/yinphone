# Deploying to Vercel

This repo deploys as **three Vercel Projects**, all imported from the same Git
repository. Each project sets a different **Root Directory**, so Vercel builds
and deploys one app per project:

| Project    | Vercel project   | Root Directory | Framework preset | Build Command           | Output Directory |
| ---------- | ---------------- | -------------- | ---------------- | ----------------------- | ---------------- |
| storefront | `yinphone-web`   | `apps/web`     | Next.js          | `pnpm exec turbo build` | Next.js default  |
| admin      | `yinphone-admin` | `apps/admin`   | Vite             | `pnpm exec turbo build` | `dist`           |
| api        | `yinphone-api`   | `apps/api`     | NestJS           | `pnpm exec turbo build` | `dist`           |

The three `vercel.json` files in those directories already carry these settings;
the dashboard fields exist so you can change them per project.

Turborepo is picked up automatically: `pnpm exec turbo build` resolves the
version pinned in the root `package.json`, and `turbo` infers the package filter
from the working directory (the Root Directory), so only the app in that project
is built — plus any workspace dependency with a `build` task.

### What is deployed right now

| App        | URL                               |
| ---------- | --------------------------------- |
| storefront | https://yinphone.vercel.app       |
| admin      | https://yinphone-admin.vercel.app |
| api        | https://yinphone-api.vercel.app   |

Those are the current production domains. The admin reaches the API through a
same-origin `/api` rewrite (see [Admin](#3-admin-appsadmin)), so sign-in works
without a custom domain. Switching the storefront to a real domain is a matter of
assigning it to the `yinphone-web` project and updating two environment
variables — see [Domains, cookies and CORS](#domains-cookies-and-cors).

## Before you start

1. A PostgreSQL database reachable from Vercel, with a **pooled** connection
   string (Neon pooler, Supabase pooler / pgbouncer, Prisma Postgres, …).
   Serverless functions open a connection per instance, so a direct-to-database
   URL will exhaust connections under load.
2. The repo pushed to GitHub (already `origin`).
3. Node.js 20.9+. Vercel currently defaults new projects to 26.x, which matches
   local development here. pnpm is read from `packageManager` in the root
   `package.json`.

Deploy in this order: **API → web → admin**, because both clients need the API
URL, and the API needs to be reachable with a database before the storefront can
render (its catalog pages are `force-dynamic` and fetch on every request).

## 1. API (`apps/api`)

| Setting          | Value                                   |
| ---------------- | --------------------------------------- |
| Root Directory   | `apps/api`                              |
| Framework Preset | NestJS (auto-detected)                  |
| Build Command    | `pnpm exec turbo build && pnpm db:seed` |
| Output Directory | `dist`                                  |
| Install Command  | auto (`pnpm install`)                   |

### Why the app is built to `dist` instead of letting the preset trace source

Vercel ships a NestJS preset (`@vercel/nestjs`) that finds `src/main.ts` and
transpiles the files it imports in place. It does **not** apply `tsconfig`
`paths`, and this app imports everything through `@/…`, so the emitted function
dies on boot with:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/prisma' imported from
/var/task/apps/api/src/prisma/prisma.module.js
```

So the project builds the app itself. `pnpm exec turbo build` runs the `api`
package's build script, `nest build && tsc-alias -p tsconfig.build.json`, which
compiles to `dist/` and rewrites the `@/…` aliases into relative imports. The
preset then serves `dist/main.js`. Keep `"outputDirectory": "dist"` in
`apps/api/vercel.json` — drop it and the preset goes back to the broken source
build.

The Prisma client is generated into `src/generated/prisma` and is gitignored, so
it has to exist before `nest build` compiles it. The `api` package's build script
starts with `prisma generate` for that reason:

```json
"build": "prisma generate && nest build && tsc-alias -p tsconfig.build.json"
```

Don't move that back to `postinstall` alone. Vercel restores `node_modules` from
its build cache, so a deploy can log `Already up to date` and skip the install
step entirely — including `postinstall` — and then a cache-missing Turborepo run
compiles against a missing client:

```
src/admin/orders/admin-orders.service.ts:6:8 - error TS2307:
Cannot find module '../../generated/prisma/models.js'
```

Generating inside the `build` task also means Turborepo caches the result, so a
cache hit skips both the generate and the compile.

### Seeding the demo database on deploy

The build command ends with `pnpm db:seed`, so every API deployment reseeds the
database it points at. That is deliberate for this demo: the seed is idempotent
(catalogue, channels and categories are upserted, the 16 `YP-DEMO-*` orders are
re-dated into the last seven days), so the dashboard's chart is never empty and
redeploying is the reset button after a visitor has edited the public demo.

The demo `OWNER` (`staff@yinphone.shop`) is only created when
`SEED_STAFF_PASSWORD` is set, because `NODE_ENV` is `production` during a Vercel
build. Set it on the `yinphone-api` project for Production and Preview
(`lumi1234`, matching `apps/admin/src/lib/demo-account.ts`) or the deploy will
seed everything except the demo account.

`SEED_ADMIN_PASSWORD` is only needed when the database has no shop owner yet. A
redeploy finds the existing account and restores its `OWNER` role without
touching the password hash, so the published demo password cannot take over the
real owner.

This is also the only way to seed a database whose `DATABASE_URL` is stored as a
sensitive variable: `vercel env run` and `vercel env pull` refuse to hand it to
a local command, but the build environment can use it. To seed locally instead,
set `DATABASE_URL` yourself and run `pnpm --filter api db:seed`.

The seed runs after `turbo build` as a separate command, not inside a task, so
it does not affect Turborepo's cache keys.

### `main.ts` and Vercel's server capture

Vercel's Node runtime patches `http.Server#listen` while importing the
entrypoint, captures the first server that calls it, and then starts that server
on a private port itself. `app.listen()` resolves only once the server emits
`listening` — which never happens for a captured server — so a top-level
`await app.listen(...)` hangs until the function times out. On Hobby that
timeout is 60s and the invocation fails as `INTERNAL_FUNCTION_INVOCATION_FAILED`
with **no runtime logs at all**, which makes this one hard to spot.

`apps/api/src/main.ts` therefore branches on `process.env.VERCEL`:

```ts
await app.init()
createServer(app.getHttpAdapter().getInstance()).listen(port)
```

Two details matter:

- `app.getHttpServer()` is **not** usable here: Nest fills it in inside
  `listen()`, so before that it is `undefined` and you would create a server
  with no request listener (accepts connections, never answers).
- The `listen()` call must not be awaited. The captured server is started by the
  runtime afterwards.

Locally (`pnpm dev`, `node dist/main.js`) the normal `await app.listen(port)`
branch runs, so behaviour is unchanged.

**Environment variables**

| Variable                                                                                 | Required | Notes                                                                                                                                    |
| ---------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                           | yes      | Postgres URL. Used at runtime and by `prisma generate`.                                                                                  |
| `CORS_ORIGINS`                                                                           | yes      | Comma-separated browser origins, e.g. `https://yinphone.vercel.app`                                                                      |
| `COOKIE_SECURE`                                                                          | no       | Defaults to on because Vercel runs in production mode                                                                                    |
| `COOKIE_DOMAIN`                                                                          | no       | Only if you want the session cookie shared across subdomains, e.g. `.yinphone.shop`. Leave unset for the normal `api.` + `admin.` setup. |
| `SESSION_TTL_HOURS`, `SESSION_REMEMBER_DAYS`, `LOGIN_MAX_ATTEMPTS`, `LOGIN_LOCK_MINUTES` | no       | Defaults are in `apps/api/README.md`                                                                                                     |
| `SEED_STAFF_PASSWORD`                                                                    | no       | Create the demo `OWNER` during the build's seed step. Production seeds skip that account when it is unset.                               |
| `PORT`                                                                                   | no       | Leave unset; on Vercel the port is irrelevant because the runtime chooses it                                                             |

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
curl https://<api-domain>/api/health   # {"status":"ok","db":"up"}
```

Turborepo prints a warning during the build that `DATABASE_URL` and
`CORS_ORIGINS` are set on the project but missing from `turbo.json`. That is
expected and harmless: both are read at request time by the function, never
during the build, and declaring them would only make cache keys churn. The seed
step reads `DATABASE_URL` too, but it runs after `turbo build`, outside the
cache. (If a variable ever _is_ read at build time, declare it — see
[Adding new environment variables later](#adding-new-environment-variables-later).)

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

### Database connections (read this before going live)

A serverless function does not share one connection pool: **every warm instance
keeps its own**. `pg`'s default is 10 connections per pool, so a dozen instances
ask for 120 slots and the database starts refusing connections:

```
Too many database connections opened: too many connections for role "prisma_migration"
```

Two independent things control whether that happens.

**1. The role in `DATABASE_URL`.** Prisma Postgres creates two login roles and
caps each separately (observed on this database: `max_connections` 50,
`prisma_migration` 45, `prisma_application` 30):

| Role                 | Intended for                        |
| -------------------- | ----------------------------------- |
| `prisma_migration`   | `prisma migrate deploy` / `db seed` |
| `prisma_application` | the running application             |

The URL currently deployed authenticates as `prisma_migration`, i.e. the
migration role. Its password **is not** the application role's password (proven
by trying), so this cannot be swapped by editing the username — copy the
application connection string (or, better, the pooled / Accelerate string) from
the Prisma Console and set it as `DATABASE_URL` on the `yinphone-api` project for
Production and Preview, then redeploy. Keep the migration URL locally for
`prisma migrate`.

**2. The pool size in `apps/api/src/prisma/prisma.service.ts`.** `PrismaService`
now builds its driver adapter with `max: 1`, `allowExitOnIdle: true`,
`idleTimeoutMillis: 5000`, so each instance holds at most one connection and
releases it when idle. That keeps the footprint proportional to _instances_
instead of 10× instances, which is what makes a small per-role limit survivable.
Raise `max` only if you move to a real pooler (PgBouncer, Accelerate, Neon /
Supabase pooler) — in that case the pooler owns the connections and the pool
setting stops being load-bearing.

A symptom worth recognising: while the database is saturated, the storefront
returns 500 as well, because its server components fetch the catalog and do not
catch API failures — `GET /api/products?limit=100 failed (500)` shows up in the
storefront's runtime logs.

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

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Root Directory   | `apps/admin`            |
| Framework Preset | Vite (auto-detected)    |
| Build Command    | `pnpm exec turbo build` |
| Output Directory | `dist`                  |

`apps/admin/vercel.json` contains two rewrites, in this order:

```json
[
  {
    "source": "/api/:path*",
    "destination": "https://yinphone-api.vercel.app/api/:path*"
  },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

The first proxies API calls through the admin's own origin. `apps/admin/src/lib/api.ts`
already defaults to `""` (i.e. relative `/api/…`) when `VITE_API_URL` is unset,
and `apps/admin/vite.config.ts` proxies `/api` the same way in dev and preview.
This is what makes sign-in work on `*.vercel.app`: the browser sees one origin,
so the host-only `yp_session` cookie is first-party and `SameSite=Lax` is
satisfied. CORS stops mattering for the admin.

The second rewrite is the SPA fallback `react-router-dom` needs. Vercel checks
the filesystem before applying rewrites, so real assets are served normally, and
`/api/…` is matched by the first rule.

**Environment variables**

| Variable       | Required | Notes                                                                                                                                                          |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | no       | Leave **unset** while the `/api` proxy rewrite is in place. Set it (base URL **including** `/api`) only if you switch the admin to a direct cross-origin call. |

`VITE_API_URL` is inlined at build time (and declared in `turbo.json` as
`VITE_*`), so changing it requires a rebuild.

The tradeoff of the proxy: admin API traffic takes one extra hop through Vercel,
and preview deployments talk to the **production** API because the destination is
hard-coded to the production alias. If you add `api.yinphone.shop`, update the
rewrite destination (or drop the rewrite and set `VITE_API_URL` instead — see the
next section).

## Domains, cookies and CORS

The admin signs in with a `yp_session` cookie marked `httpOnly`,
`sameSite=lax`, `secure`. `sameSite=lax` means the browser only sends it on
**same-site** requests, and "site" is the registrable domain. So
`admin.yinphone.shop` → `api.yinphone.shop` works, but
`yinphone-admin.vercel.app` → `yinphone-api.vercel.app` does **not** (public
suffix: different sites). Symptom would be login returning 200, then
`/api/auth/me` returning `401 NOT_SIGNED_IN`.

That is why the admin ships with the same-origin `/api` rewrite: the cookie is
issued to the admin's own host, so everything is first-party today.

### Moving to a custom domain

Recommended layout:

| Domain                | Project    |
| --------------------- | ---------- |
| `yinphone.shop`       | storefront |
| `admin.yinphone.shop` | admin      |
| `api.yinphone.shop`   | api        |

Then:

1. **api** project → set `CORS_ORIGINS=https://yinphone.shop,https://admin.yinphone.shop`
   (comma-separated, no trailing slash) and redeploy.
2. **web** project → `NEXT_PUBLIC_API_URL=https://api.yinphone.shop` and
   `NEXT_PUBLIC_SITE_URL=https://yinphone.shop`, then redeploy (both are inlined
   at build time).
3. **admin** project → either keep the proxy and change its rewrite destination
   to `https://api.yinphone.shop/api/:path*`, or delete the `/api` rewrite, set
   `VITE_API_URL=https://api.yinphone.shop/api` and redeploy.

A host-only cookie on `api.yinphone.shop` is enough — you do not need
`COOKIE_DOMAIN` for this layout. Add it only if you deliberately want the cookie
visible on sibling subdomains.

### Preview deployments and sign-in

Preview URLs are `*-git-branch-team.vercel.app`. With the `/api` rewrite in
place the browser still sees one origin, so admin sign-in works on previews too —
but those previews call the **production** API. If you want previews isolated,
point the rewrite at a preview API or set `VITE_API_URL` per preview environment.

## Deploying from the CLI (optional)

Git-based deploys are the normal workflow: the three projects are already
connected to `tettoewai/yinphone` (production branch `main`), so a push to `main`
deploys all three unless the Ignored Build Step skips one.

To create and deploy the projects from a terminal instead:

```bash
vercel login

# One project per app. --project creates it (and connects the repo) if missing.
cd apps/web   && vercel link --yes --project yinphone-web
cd ../admin   && vercel link --yes --project yinphone-admin
cd ../api     && vercel link --yes --project yinphone-api

# `vercel link` leaves the Root Directory as "." — set it explicitly.
vercel project update yinphone-web   --root-directory apps/web
vercel project update yinphone-admin --root-directory apps/admin
vercel project update yinphone-api   --root-directory apps/api
```

With a Root Directory set, the CLI resolves it **relative to the directory you
run it in**, so deploying from inside `apps/web` fails with
`The specified Root Directory "apps/web" does not exist`. Deploy from the repo
root instead and name the project:

```bash
vercel deploy --project yinphone-web   --prod
vercel deploy --project yinphone-admin --prod
vercel deploy --project yinphone-api   --prod
```

Environment variables are per project. `--value` keeps it non-interactive, and
piping stdin keeps secrets out of your shell history:

```bash
vercel env add CORS_ORIGINS --project yinphone-api \
  --environment production,preview \
  --value "https://yinphone.vercel.app"

cat ./database-url.txt | vercel env add DATABASE_URL --project yinphone-api \
  --environment production,preview,development
```

Notes:

- `apps/*/vercel.json` **overrides** the dashboard's Build Command and Output
  Directory. Change those in the file, not in the dashboard, or the build will
  silently ignore the dashboard value.
- `vercel link` writes `.vercel/project.json` and a `.env.local` holding a
  `VERCEL_OIDC_TOKEN` into the app directory, and appends `.vercel` / `.env*` to
  that app's `.gitignore`. Those additions would also re-ignore
  `.env.example`; the root `.gitignore` already covers `.env*` and `.vercel`, so
  they can be reverted.
- CLI deploys always build; the Ignored Build Step only applies to Git deploys.
- Run `vercel build --project yinphone-api` from the repo root if you want to
  inspect the generated function under `.vercel/output/functions` locally.

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

1. `curl https://<api-domain>/api/health` → `200 {"status":"ok","db":"up"}`.
2. `curl "https://<api-domain>/api/products?limit=1"` → one product with real data.
3. `curl https://<web-domain>/en/catalog` → HTML containing product names (the
   catalog is fetched from the API server-side).
4. `curl https://<admin-domain>/api/health` → `200` from the API, proving the
   admin proxy rewrite works.
5. Admin sign-in with the seeded owner account; reload and confirm the session
   survives (`GET /api/auth/me` returns the user). Through the deployed proxy the
   whole flow looks like: `POST /api/auth/login` `200` with a
   `yp_session` cookie (`HttpOnly; Secure; SameSite=Lax`), `GET /api/auth/me`
   `200`, `POST /api/auth/logout` `204`, then `/api/auth/me` `401`.
6. Open `/orders/<code>` directly in the admin — the SPA rewrite keeps it from
   404ing on refresh.

## Troubleshooting

**"No Output Directory named `dist` found"** — the build was skipped or restored
from cache without outputs. Confirm `apps/admin/vercel.json` keeps
`"outputDirectory": "dist"` and that `turbo.json` lists `dist/**` in
`build.outputs` (it does). Redeploy without the Build Cache to confirm.

**API returns `INTERNAL_FUNCTION_INVOCATION_FAILED` after ~60s with no runtime
logs** — the function never finished booting. On Hobby the invocation is killed
at 60s, and a bootstrap that hangs produces no logs at all. The known cause here
is the server-capture contract: a top-level `await app.listen(...)` never
resolves. Check that `src/main.ts` still has the `process.env.VERCEL` branch (see
[API](#1-api-appsapi)) and that it uses
`app.getHttpAdapter().getInstance()` — using `app.getHttpServer()` yields a
server with no request listener that accepts and never answers.

**API boot fails with `Cannot find package '@/…'`** — the preset is building from
`src` again, so `outputDirectory` was lost. Keep `"outputDirectory": "dist"` in
`apps/api/vercel.json` and keep the build script as
`nest build && tsc-alias -p tsconfig.build.json`.

**API build fails with a missing Prisma client** — the API project's build must
run `prisma generate` before `nest build`. The `api` package's `postinstall`
normally covers it; if it was skipped, check that no project environment variable
sets `NODE_ENV=production` (see the note in the API section).

**`401 NOT_SIGNED_IN` right after a successful login** — cookies/CORS. Use
subdomains of one registrable domain, set `CORS_ORIGINS`, and serve over HTTPS
(or set `COOKIE_SECURE=false` while testing over plain HTTP).

**Database connection errors at runtime** — `Too many database connections
opened` means the per-role limit is exhausted by scaled-out instances, not a
network problem. Check the role in `DATABASE_URL` and the pool size first (see
[Database connections](#database-connections-read-this-before-going-live)).
Unauthenticated probes are misleading: while the role is saturated even
`psql`/`pg` from your laptop is refused with `53300 too many connections for role`.
To see where the connections are going, connect as that role and run:

```sql
select usename, count(*), count(*) filter (where state = 'idle')
from pg_stat_activity group by 1 order by 2 desc;
```

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
