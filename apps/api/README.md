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
- Admin routes not yet built (orders, products, dashboard) should use
  `AdminAuthGuard`, plus `RolesGuard` with `@Roles('OWNER')` for anything
  owner-only. Both are exported by `AuthModule`.

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

Not modelled yet: product badges, compare-at prices. The storefront shows those
from its local mock data until the schema catches up.

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
