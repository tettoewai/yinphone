# YinPhone API

NestJS 12 (ESM) + Prisma 7 + PostgreSQL. Serves the storefront (`apps/web`) and
admin dashboard (`apps/admin`) under the `/api` prefix.

## Requirements

- Node.js >= 20.9.0
- pnpm 11
- A PostgreSQL database

## Setup

```bash
docker compose up -d  # from the repo root: Postgres on localhost:5433
pnpm install          # also generates the Prisma client (postinstall)
cp .env.example .env  # set DATABASE_URL and SEED_ADMIN_PASSWORD
pnpm db:migrate       # apply migrations
pnpm db:seed          # channels, categories, products, a week of demo orders, users
pnpm dev              # http://localhost:4000/api
```

The seed signs in as `owner@yinphone.example` by default. It also creates the
shared demo account the admin sign-in screen advertises: an `OWNER` at
`SEED_STAFF_EMAIL` (default `staff@yinphone.shop`) with
`SEED_STAFF_PASSWORD`. Outside production that password defaults to
`lumi1234` — the value `apps/admin`'s demo card uses — so a development
checkout gets a working demo login with no extra setup. In production the
account is only created when `SEED_STAFF_PASSWORD` is set, so a deployed
database never ends up with a published credential. The demo is an `OWNER` so a
reviewer sees the whole console; reseeding restores that role.

Orders are dated relative to the run so the dashboard's seven-day chart is
never empty: 16 generated orders carry a reserved `YP-DEMO-*` code and are
re-dated and re-priced on every reseed, while the three hand-written
`YP-<year>-<nnnn>` sample orders keep the timestamp they were first created
with. Real orders continue that same `YP-<year>-<nnnn>` series, so the two
ranges never collide.

## Environment

| Variable                        | Required  | Default                                       | Notes                                    |
| ------------------------------- | --------- | --------------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                  | yes       | –                                             | PostgreSQL connection string             |
| `PORT`                          | no        | `4000`                                        | HTTP port                                |
| `CORS_ORIGINS`                  | no        | `http://localhost:3000,http://localhost:3001` | Comma-separated allowed origins          |
| `NODE_ENV`                      | no        | `development`                                 | `development` \| `test` \| `production`  |
| `SESSION_TTL_HOURS`             | no        | `12`                                          | Lifetime of a normal admin sign-in       |
| `SESSION_REMEMBER_DAYS`         | no        | `30`                                          | Lifetime with "remember this device"     |
| `LOGIN_MAX_ATTEMPTS`            | no        | `5`                                           | Failed sign-ins before the account locks |
| `LOGIN_LOCK_MINUTES`            | no        | `5`                                           | How long a locked account stays locked   |
| `COOKIE_SECURE`                 | no        | on in production                              | `true` / `false` override for the flag   |
| `COOKIE_DOMAIN`                 | no        | host-only                                     | e.g. `.yinphone.shop` for subdomains     |
| `SEED_ADMIN_EMAIL`              | no        | `owner@yinphone.example`                      | Seed script only                         |
| `SEED_ADMIN_PASSWORD`           | seed only | –                                             | Required by `db:seed`                    |
| `SEED_STAFF_EMAIL`              | no        | `staff@yinphone.shop`                         | Seed script only, demo account email     |
| `SEED_STAFF_PASSWORD`           | no        | `lumi1234` in development, – in production    | Creates the demo `OWNER` account         |
| `RESEND_API_KEY`                | prod      | –                                             | Resend key for password-reset email      |
| `RESET_EMAIL_FROM`              | no        | `YinPhone Boutique <onboarding@resend.dev>`   | Verified Resend sender address           |
| `RESET_CODE_TTL_MINUTES`        | no        | `10`                                          | Code/ticket lifetime                     |
| `RESET_CODE_MAX_ATTEMPTS`       | no        | `5`                                           | Wrong-code guesses before it is burnt    |
| `RESET_RESEND_COOLDOWN_SECONDS` | no        | `30`                                          | Wait before another code per account     |

Variables are validated at boot by `src/config/env.ts` (Zod). The process exits
when a required value is missing or invalid. Optional keys may be left blank —
`SESSION_TTL_HOURS=` falls back to the documented default — while
`DATABASE_URL` must always be set.

## Endpoints

| Method | Path                                | Description                                   |
| ------ | ----------------------------------- | --------------------------------------------- |
| `GET`  | `/api/health`                       | Liveness plus a `SELECT 1` database ping      |
| `GET`  | `/api/categories`                   | Active categories with `productCount`         |
| `GET`  | `/api/products`                     | Active products, filterable and paginated     |
| `GET`  | `/api/products/:slug`               | Single product (404 when missing or inactive) |
| `GET`  | `/api/channels`                     | Active order channels                         |
| `POST` | `/api/orders`                       | Create an order                               |
| `GET`  | `/api/orders/:code`                 | Order summary by human-readable code          |
| `POST` | `/api/auth/login`                   | Admin sign-in; sets the session cookie        |
| `GET`  | `/api/auth/me`                      | Current admin (session required)              |
| `POST` | `/api/auth/logout`                  | Ends the session and clears the cookie        |
| `POST` | `/api/auth/change-password`         | Change own password, revokes other sessions   |
| `POST` | `/api/auth/sessions/revoke-others`  | Sign out other devices, keeps this session    |
| `POST` | `/api/auth/password-reset/request`  | Mail a 6-digit reset code; always `204`       |
| `POST` | `/api/auth/password-reset/verify`   | Trade the code for a ticket                   |
| `POST` | `/api/auth/password-reset/complete` | Spend the ticket on a new password            |

## Admin authentication

Sessions are server-side rows (`AdminSession`) referenced by an opaque
256-bit token. Only the SHA-256 of the token is stored, and it travels in an
`yp_session` cookie marked `httpOnly`, `sameSite=lax`, and `secure` in
production. There is no JWT and no browser storage to leak; signing out or
changing a password revokes rows immediately.

```http
POST /api/auth/login
{ "email": "staff@yinphone.shop", "password": "lumi1234", "rememberDevice": false }

200 { "user": { "id", "email", "name", "role", "mustChangePassword" }, "expiresAt" }
401 { "code": "INVALID_CREDENTIALS", "message": "...", "attemptsLeft": 2 }
429 { "code": "ACCOUNT_LOCKED", "message": "...", "retryAfterSeconds": 299, "lockedUntil" }
```

- `rememberDevice` extends the session from `SESSION_TTL_HOURS` to
  `SESSION_REMEMBER_DAYS`.
- Each wrong password increments `failedLoginAttempts`; reaching
  `LOGIN_MAX_ATTEMPTS` sets `lockedUntil` for `LOGIN_LOCK_MINUTES`. Unknown
  emails run a dummy argon2 verify so the timing and the message stay
  identical, and a locked account is refused before the password is checked.
- `change-password` requires the current password, stores a new argon2id hash,
  clears `mustChangePassword`, deletes every session, and returns a fresh
  cookie so the caller stays signed in on that device only.
- `sessions/revoke-others` deletes every `AdminSession` except the caller's and
  answers `{ "revoked": n }`; it is the same sweep as the password change,
  minus the new hash, for a device that just wants the others gone.
- `sameSite=lax` is the CSRF control: a cross-site POST never carries the
  cookie. In development the admin app proxies `/api` to this API, so requests
  are same-origin and no `credentials: "include"` is needed.
- Admin routes live under `/api/admin` (see [Admin API](#admin-api-apiadmin))
  and use `AdminAuthGuard` plus `RolesGuard`, with `@Roles('OWNER')` on
  owner-only routes. Both guards are exported by `AuthModule`.

## Password reset

The forgot-password screens drive three unguarded routes; the caller has no
session by definition.

```http
POST /api/auth/password-reset/request
{ "email": "staff@yinphone.shop" }
204

POST /api/auth/password-reset/verify
{ "email": "staff@yinphone.shop", "code": "123456" }
200 { "ticket": "<opaque 43-char token>" }
400 { "code": "INVALID_RESET_CODE", "message": "...", "attemptsLeft": 4 }
400 { "code": "RESET_CODE_EXPIRED" | "RESET_CODE_EXHAUSTED", "message": "..." }

POST /api/auth/password-reset/complete
{ "ticket": "<ticket>", "password": "a-new-password" }
204
400 { "code": "RESET_TICKET_EXPIRED", "message": "..." }
```

- Codes are 6 digits, valid for `RESET_CODE_TTL_MINUTES`, and stored only as an
  argon2 hash. The ticket is a 256-bit token stored as a SHA-256 hash, and
  `complete` spends it once.
- `request` answers `204` for an unknown email as well, so the route cannot be
  used to discover which addresses have an account. A second request inside
  `RESET_RESEND_COOLDOWN_SECONDS` answers `429 RESET_COOLDOWN` with
  `retryAfterSeconds`.
- Each wrong guess increments `attempts`; past `RESET_CODE_MAX_ATTEMPTS` the
  code is refused with `RESET_CODE_EXHAUSTED` and a new one must be requested.
  A code that verifies cannot be verified again — verifying swaps it for the
  ticket and restarts the expiry window.
- `complete` sets the new argon2id hash, clears `mustChangePassword` and any
  lockout, and deletes every `AdminSession` for the account, so no device stays
  signed in on the old password.
- Delivery goes through Resend (`POST https://api.resend.com/emails`, called
  with `fetch`). Without `RESEND_API_KEY` the code is logged at `warn` level
  instead of mailed, which is how the flow is exercised locally; in production a
  missing key answers `503 EMAIL_UNAVAILABLE`. A code whose mail failed to send
  is deleted rather than left valid.

### `GET /api/products`

| Query                   | Type                                    | Default  | Notes                                          |
| ----------------------- | --------------------------------------- | -------- | ---------------------------------------------- |
| `category`              | string                                  | –        | Category slug                                  |
| `q`                     | string                                  | –        | Matches `nameMy` or `nameEn`, case-insensitive |
| `size`                  | `S` \| `M` \| `L` \| `XL`               | –        | Products whose `sizes` include it              |
| `sort`                  | `newest` \| `price-asc` \| `price-desc` | `newest` |                                                |
| `minPrice` / `maxPrice` | integer                                 | –        | Inclusive, whole kyat                          |
| `limit`                 | integer                                 | `20`     | 1–100                                          |
| `offset`                | integer                                 | `0`      |                                                |

Responds with `{ items, total, limit, offset }`.

### `POST /api/orders`

```json
{
  "customerName": "Ma Thida",
  "customerPhone": "09400000001",
  "channel": "messenger",
  "note": "Deliver before Thingyan.",
  "items": [{ "productId": "cm...", "size": "M", "quantity": 2 }]
}
```

- `channel` is a channel **slug**.
- `size` is optional: one of `S`, `M`, `L`, `XL`. Omit it for one-size items
  such as longyi. Lines are merged per product **and** size, so an M and an L of
  the same product stay separate order rows.
- Unit prices are read from the database and the total is computed on the
  server; prices in the payload are ignored because none are accepted.
- Order codes are `YP-<year>-<0001>`. A collision on the unique `code` column is
  retried (up to 5 attempts) before responding `409`.
- Stock is **not** decremented; orders are confirmed over chat.

## Admin API (`/api/admin`)

Every route requires a session (`AdminAuthGuard` + `RolesGuard`); rows marked
OWNER additionally carry `@Roles('OWNER')`.

| Method   | Path                                 | Roles         |
| -------- | ------------------------------------ | ------------- |
| `GET`    | `/api/admin/dashboard`               | STAFF + OWNER |
| `GET`    | `/api/admin/orders`                  | STAFF + OWNER |
| `POST`   | `/api/admin/orders`                  | STAFF + OWNER |
| `GET`    | `/api/admin/orders/:code`            | STAFF + OWNER |
| `PATCH`  | `/api/admin/orders/:code/status`     | STAFF + OWNER |
| `GET`    | `/api/admin/products`                | STAFF + OWNER |
| `POST`   | `/api/admin/products`                | STAFF + OWNER |
| `GET`    | `/api/admin/products/:id`            | STAFF + OWNER |
| `PATCH`  | `/api/admin/products/:id`            | STAFF + OWNER |
| `PATCH`  | `/api/admin/products/:id/visibility` | STAFF + OWNER |
| `POST`   | `/api/admin/products/:id/duplicate`  | STAFF + OWNER |
| `DELETE` | `/api/admin/products/:id`            | STAFF + OWNER |
| `GET`    | `/api/admin/categories`              | STAFF + OWNER |
| `POST`   | `/api/admin/categories`              | STAFF + OWNER |
| `PATCH`  | `/api/admin/categories/:id`          | STAFF + OWNER |
| `DELETE` | `/api/admin/categories/:id`          | OWNER         |
| `GET`    | `/api/admin/channels`                | STAFF + OWNER |
| `POST`   | `/api/admin/channels`                | OWNER         |
| `PATCH`  | `/api/admin/channels/:id`            | OWNER         |
| `GET`    | `/api/admin/staff`                   | OWNER         |
| `POST`   | `/api/admin/staff`                   | OWNER         |
| `PATCH`  | `/api/admin/staff/:id`               | OWNER         |
| `DELETE` | `/api/admin/staff/:id`               | OWNER         |

Anonymous requests get `401 NOT_SIGNED_IN`; a signed-in admin without the
required role gets `403 FORBIDDEN`. The guard wiring is covered by
`src/admin/admin-guards.spec.ts` (boots the app with a mocked database) and by
the e2e suite against a real one.

### `GET /api/admin/dashboard`

Everything the dashboard screen renders, in one response:

- `today` — `orders`, `salesOrders`, `salesMmk`, `ordersYesterday` and
  `salesMmkYesterday`. `salesOrders` and `salesMmk` exclude `CANCELLED` orders,
  so "sales" means takings. Calendar days are Asia/Yangon (UTC+6:30).
- `pending` — all-time `new` and `confirmed` counts. The gold KPI card and the
  sidebar's orders chip read these.
- `salesLast7Days` — seven entries, oldest first, each `{ date, day, amountMmk }`
  where `date` is a Yangon `YYYY-MM-DD` and `day` its day-of-month label. Money
  excludes cancelled orders.
- `channels` — every channel with `{ slug, nameMy, nameEn, orders, sharePct }`
  over the same seven days. `sharePct` is rounded; cancelled orders count here
  because they still arrived through a channel.
- `recentOrders` — the five newest orders, each `{ id, code, customerName,
totalMmk, channel, status, createdAt }` with `channel` as a slug.
- `windowDays` — `7`, the span the chart and the split cover.

A week of rows is aggregated in TypeScript rather than with Prisma's `groupBy`,
whose typings are unreliable in this codebase. The counts and the reads run in
one `$transaction`.

### `GET /api/admin/orders`

Newest first. Responds with `{ items, total, limit, offset, counts }`, where
`counts` is `{ NEW, CONFIRMED, DELIVERED, CANCELLED }` measured over every facet
**except** status (so the screen's filter pills do not collapse to the selected
status). Each item is the admin orders row: `id`, `code`, `customerName`,
`customerPhone`, `itemCount` (summed units), `totalMmk`, `channel` (slug),
`status` and `createdAt` (ISO 8601).

| Query     | Type                                               | Default | Notes                                           |
| --------- | -------------------------------------------------- | ------- | ----------------------------------------------- |
| `q`       | string                                             | –       | Order code, customer name or phone (`contains`) |
| `channel` | string                                             | –       | Channel slug                                    |
| `status`  | `NEW` \| `CONFIRMED` \| `DELIVERED` \| `CANCELLED` | –       |                                                 |
| `range`   | `today` \| `7d` \| `30d` \| `all`                  | `7d`    | Calendar days in Asia/Yangon (UTC+6:30)         |
| `limit`   | integer                                            | `20`    | 1–100                                           |
| `offset`  | integer                                            | `0`     |                                                 |

### `GET /api/admin/orders/:code`

The list row plus `updatedAt`, the customer's checkout `note`,
`priorOrderCount` (earlier orders from the same phone) and `items`. Each line
carries its `productId`, `slug`, `nameMy`, `nameEn`, `size`, `quantity`,
`unitPriceMmk` and `lineTotalMmk`. Responds `404` when the code is unknown.

### `PATCH /api/admin/orders/:code/status`

Body `{ "status": "CONFIRMED" }`. Any status is accepted — staff correct data
by hand too — and the response is the updated order detail. There is no status
audit log yet.

### `POST /api/admin/orders`

Manual orders taken over chat. Takes the same body as the public
`POST /api/orders` (customer, phone, channel slug, optional note and the item
lines). Prices are read from the catalogue rather than the request, the order
starts as `NEW`, and the response is the `GET /api/admin/orders/:code` detail so
the screen can open what it just created. Both roles may record one.

### `GET /api/admin/products`

Responds with `{ items, total, limit, offset, counts }`. Each item is
`id`, `slug`, `nameMy`, `nameEn`, `priceMmk`, `stock`, `sizes`, `isActive` and
its `category` (`id`, `slug`, `nameMy`, `nameEn`). `sizes` rides on the row so
the manual-order picker knows which sizes to offer; it is empty for one-size
items. `counts` is `{ in, low, out }` —
the stock breakdown measured over the search, category and SHOWING view but
**before** the stock chip, so the chips do not collapse to the selected one.
`low` means `1–4` (the screen's `< 5` threshold).

| Query        | Type                                                    | Default   | Notes                                      |
| ------------ | ------------------------------------------------------- | --------- | ------------------------------------------ |
| `q`          | string                                                  | –         | Either name (`contains`, case-insensitive) |
| `category`   | string                                                  | –         | Category slug                              |
| `stock`      | `all` \| `in` \| `low` \| `out`                         | `all`     |                                            |
| `visibility` | `active` \| `hidden` \| `all`                           | `all`     | Hidden rows are kept, not deleted          |
| `sort`       | `default` \| `price-asc` \| `price-desc` \| `stock-asc` | `default` | `default` is newest first                  |
| `limit`      | integer                                                 | `20`      | 1–100                                      |
| `offset`     | integer                                                 | `0`       |                                            |

### Products — writes

- `POST /api/admin/products` — create. `slug` is derived from `nameEn` (then
  `nameMy`) when omitted. A caller-supplied slug that is taken returns `409`.
  An unknown `categoryId` returns `400`.
- `GET /api/admin/products/:id` — the row plus `descriptionMy`,
  `descriptionEn`, `sizes`, timestamps and ordered `images`. `404` if unknown.
- `PATCH /api/admin/products/:id` — absent fields are left unchanged. Supplying
  `images` replaces the whole list.
- `PATCH /api/admin/products/:id/visibility` — body `{ "isActive": false }`;
  hidden products stay on past orders.
- `POST /api/admin/products/:id/duplicate` — copies the product and its images
  as a hidden draft (`"(copy)"` name, `<slug>-copy` slug).
- `DELETE /api/admin/products/:id` — `204`. Refused with `409` when the product
  appears on any order; hide it instead.

### Categories

`GET /api/admin/categories` returns every category ordered by `sortOrder`, each
with `id`, `slug`, `nameMy`, `nameEn`, `sortOrder` and `productCount` (all
products, hidden included).

- `POST /api/admin/categories` — `slug` derived from `nameEn` when omitted.
- `PATCH /api/admin/categories/:id` — rename and/or `sortOrder`. Drag-reordering
  the screen writes `sortOrder = index + 1` for every row that moved.
- `DELETE /api/admin/categories/:id` (OWNER) — `204`. Refused with `409` while
  the category still has products.

### Channels

`GET /api/admin/channels` returns every channel — inactive ones included,
because the screen's switch edits them in place — ordered by `sortOrder`. Each
row is `id`, `slug`, `nameMy`, `nameEn`, `url`, `isActive`, `sortOrder` and
`orderCount` (the past week's orders through it, cancelled included; the same
seven Asia/Yangon days the dashboard's split covers). The storefront's public
`GET /api/channels` returns only the active rows, without the count.

- `POST /api/admin/channels` (OWNER) — `slug` derived from `nameEn` (then
  `nameMy`) when omitted; a missing `sortOrder` appends to the end. A
  caller-supplied slug that is taken returns `409`.
- `PATCH /api/admin/channels/:id` (OWNER) — absent fields are left unchanged. The
  slug is a channel's identity on its orders, so a rename leaves it alone unless
  a new one is sent; a taken slug returns `409`.

### Staff

The settings team tab. Every route is OWNER-only.

`GET /api/admin/staff` returns the roster with owners first, then by join date:
`id`, `email`, `name`, `role`, `mustChangePassword`, `lastLoginAt` (ISO 8601,
`null` until the first sign-in) and `createdAt`. The password hash is never
selected.

- `POST /api/admin/staff` — body `{ email, name, role }`; `role` defaults to
  `STAFF`. The account is created with `mustChangePassword` and a
  server-generated one-time password, returned once as
  `{ member, temporaryPassword }` for the owner to pass on out-of-band — there
  is no email delivery yet. A duplicate email returns `409`.
- `PATCH /api/admin/staff/:id` — body `{ name?, role? }`; absent fields are left
  unchanged. Changing your own role returns `403 SELF_ROLE_CHANGE`; demoting the
  last owner returns `409 LAST_OWNER`.
- `DELETE /api/admin/staff/:id` — `204`. The member's sessions cascade with the
  row. Removing your own account returns `403 SELF_REMOVE`; removing the last
  owner returns `409 LAST_OWNER`.

## Data model

`Channel`, `Category`, `Product`, `ProductImage`, `Order`, `OrderItem`,
`AdminUser` (`OWNER` / `STAFF`, argon2 password hashes), `AdminSession`
(hashed bearer tokens, `expiresAt`, `lastUsedAt`) and `PasswordResetCode`
(hashed OTP + ticket, attempt counter, expiry). See
`prisma/schema.prisma`.

Money is stored as whole kyat in `Int` columns (`priceMmk`, `totalMmk`,
`unitPriceMmk`). `unitPriceMmk` snapshots the price at order time.

`Product.sizes` is a `ProductSize[]` enum list (`S`, `M`, `L`, `XL`). An empty
list means one size fits all (e.g. longyi), not out of stock — so a `size`
filter deliberately excludes those products.

`OrderItem.size` snapshots the size the customer picked. It is nullable because
one-size items have nothing to record.

Not modelled yet: product badges, compare-at prices, a shipping address, a
delivery fee and a status audit log. The storefront shows badges and
compare-at prices from its local mock data until the schema catches up, and the
admin order detail has no address, delivery fee or activity feed for the same
reason.

## Scripts

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Watch mode on port 4000                     |
| `pnpm build`       | `nest build` + `tsc-alias`                  |
| `pnpm start`       | Run `dist/main.js`                          |
| `pnpm typecheck`   | `tsc --noEmit`                              |
| `pnpm lint`        | `oxlint --type-aware src/ test/`            |
| `pnpm test`        | Vitest unit tests (no database needed)      |
| `pnpm test:e2e`    | Vitest e2e tests (needs `E2E_DATABASE_URL`) |
| `pnpm db:generate` | Regenerate the Prisma client                |
| `pnpm db:migrate`  | `prisma migrate dev`                        |
| `pnpm db:seed`     | `prisma db seed`                            |

## Tests

Validation uses `StandardSchemaValidationPipe` with Zod schemas attached to
`@Query()` / `@Param()` / `@Body()`, so there are no DTO classes or
`class-validator` decorators.

Unit tests mock `PrismaService` and never touch a database. E2E tests boot the
real app against a separate database, so they are skipped unless one is given:

```bash
docker exec yinphone-postgres psql -U postgres -c 'CREATE DATABASE yinphone_test'
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/yinphone_test \
  pnpm --filter api exec prisma migrate deploy
E2E_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/yinphone_test \
  pnpm test:e2e
```

The suite needs the schema but not the seed data: it creates its own staff user
and session.

## Prisma

The client is generated into `src/generated/prisma` (gitignored) by the
`prisma-client` generator and runs through the `@prisma/adapter-pg` driver
adapter. CLI configuration lives in `prisma7.config.ts`.
