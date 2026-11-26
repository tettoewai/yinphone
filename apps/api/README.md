# YinPhone API

NestJS 12 (ESM) + Prisma 7 + PostgreSQL. Serves the storefront (`apps/web`) and
admin dashboard (`apps/admin`) under the `/api` prefix.

## Requirements

- Node.js >= 20.9.0
- pnpm 11
- A PostgreSQL database

## Setup

```bash
pnpm install          # also generates the Prisma client (postinstall)
cp .env.example .env  # set DATABASE_URL and SEED_ADMIN_PASSWORD
pnpm db:migrate       # apply migrations
pnpm db:seed          # channels, categories, products, sample orders, owner user
pnpm dev              # http://localhost:4000/api
```

The seed signs in as `owner@yinphone.example` by default. To reproduce the
demo account advertised by the admin login mock, add
`SEED_STAFF_PASSWORD=lumi1234` before `pnpm db:seed`; it creates a `STAFF`
user at `SEED_STAFF_EMAIL` (default `staff@yinphone.shop`).

## Environment

| Variable                | Required  | Default                                       | Notes                                    |
| ----------------------- | --------- | --------------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`          | yes       | –                                             | PostgreSQL connection string             |
| `PORT`                  | no        | `4000`                                        | HTTP port                                |
| `CORS_ORIGINS`          | no        | `http://localhost:3000,http://localhost:3001` | Comma-separated allowed origins          |
| `NODE_ENV`              | no        | `development`                                 | `development` \| `test` \| `production`  |
| `SESSION_TTL_HOURS`     | no        | `12`                                          | Lifetime of a normal admin sign-in       |
| `SESSION_REMEMBER_DAYS` | no        | `30`                                          | Lifetime with "remember this device"     |
| `LOGIN_MAX_ATTEMPTS`    | no        | `5`                                           | Failed sign-ins before the account locks |
| `LOGIN_LOCK_MINUTES`    | no        | `5`                                           | How long a locked account stays locked   |
| `COOKIE_SECURE`         | no        | on in production                              | `true` / `false` override for the flag   |
| `COOKIE_DOMAIN`         | no        | host-only                                     | e.g. `.yinphone.shop` for subdomains     |
| `SEED_ADMIN_EMAIL`      | no        | `owner@yinphone.example`                      | Seed script only                         |
| `SEED_ADMIN_PASSWORD`   | seed only | –                                             | Required by `db:seed`                    |
| `SEED_STAFF_EMAIL`      | no        | `staff@yinphone.shop`                         | Seed script only, demo account           |
| `SEED_STAFF_PASSWORD`   | no        | –                                             | Seed only; creates the demo `STAFF` user |

Variables are validated at boot by `src/config/env.ts` (Zod). The process exits
when a required value is missing or invalid. Optional keys may be left blank —
`SESSION_TTL_HOURS=` falls back to the documented default — while
`DATABASE_URL` must always be set.

## Endpoints

| Method | Path                        | Description                                   |
| ------ | --------------------------- | --------------------------------------------- |
| `GET`  | `/api/health`               | Liveness plus a `SELECT 1` database ping      |
| `GET`  | `/api/categories`           | Active categories with `productCount`         |
| `GET`  | `/api/products`             | Active products, filterable and paginated     |
| `GET`  | `/api/products/:slug`       | Single product (404 when missing or inactive) |
| `GET`  | `/api/channels`             | Active order channels                         |
| `POST` | `/api/orders`               | Create an order                               |
| `GET`  | `/api/orders/:code`         | Order summary by human-readable code          |
| `POST` | `/api/auth/login`           | Admin sign-in; sets the session cookie        |
| `GET`  | `/api/auth/me`              | Current admin (session required)              |
| `POST` | `/api/auth/logout`          | Ends the session and clears the cookie        |
| `POST` | `/api/auth/change-password` | Change own password, revokes other sessions   |

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
- `sameSite=lax` is the CSRF control: a cross-site POST never carries the
  cookie. In development the admin app proxies `/api` to this API, so requests
  are same-origin and no `credentials: "include"` is needed.
- Admin routes live under `/api/admin` (see [Admin API](#admin-api-apiadmin))
  and use `AdminAuthGuard` plus `RolesGuard`, with `@Roles('OWNER')` on
  owner-only routes. Both guards are exported by `AuthModule`.

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

The channels and staff routes are still setup scaffolding and respond `501 Not
Implemented`. Dashboard, orders, products and categories are implemented. All
routes require a session (`AdminAuthGuard` + `RolesGuard`); rows marked OWNER
additionally carry `@Roles('OWNER')`.

| Method   | Path                                 | Roles         |
| -------- | ------------------------------------ | ------------- |
| `GET`    | `/api/admin/dashboard`               | STAFF + OWNER |
| `GET`    | `/api/admin/orders`                  | STAFF + OWNER |
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

### `GET /api/admin/products`

Responds with `{ items, total, limit, offset, counts }`. Each item is
`id`, `slug`, `nameMy`, `nameEn`, `priceMmk`, `stock`, `isActive` and its
`category` (`id`, `slug`, `nameMy`, `nameEn`). `counts` is `{ in, low, out }` —
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

## Data model

`Channel`, `Category`, `Product`, `ProductImage`, `Order`, `OrderItem`,
`AdminUser` (`OWNER` / `STAFF`, argon2 password hashes) and `AdminSession`
(hashed bearer tokens, `expiresAt`, `lastUsedAt`). See
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
E2E_DATABASE_URL=postgresql://localhost:5432/yinphone_test pnpm test:e2e
```

## Prisma

The client is generated into `src/generated/prisma` (gitignored) by the
`prisma-client` generator and runs through the `@prisma/adapter-pg` driver
adapter. CLI configuration lives in `prisma7.config.ts`.
