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

## Environment

| Variable              | Required  | Default                                       | Notes                                   |
| --------------------- | --------- | --------------------------------------------- | --------------------------------------- |
| `DATABASE_URL`        | yes       | –                                             | PostgreSQL connection string            |
| `PORT`                | no        | `4000`                                        | HTTP port                               |
| `CORS_ORIGINS`        | no        | `http://localhost:3000,http://localhost:3001` | Comma-separated allowed origins         |
| `NODE_ENV`            | no        | `development`                                 | `development` \| `test` \| `production` |
| `SEED_ADMIN_EMAIL`    | no        | `owner@yinphone.example`                      | Seed script only                        |
| `SEED_ADMIN_PASSWORD` | seed only | –                                             | Required by `db:seed`                   |

Variables are validated at boot by `src/config/env.ts` (Zod). The process exits
when a required value is missing or invalid.

## Endpoints

| Method | Path                  | Description                                   |
| ------ | --------------------- | --------------------------------------------- |
| `GET`  | `/api/health`         | Liveness plus a `SELECT 1` database ping      |
| `GET`  | `/api/categories`     | Active categories with `productCount`         |
| `GET`  | `/api/products`       | Active products, filterable and paginated     |
| `GET`  | `/api/products/:slug` | Single product (404 when missing or inactive) |
| `GET`  | `/api/channels`       | Active order channels                         |
| `POST` | `/api/orders`         | Create an order                               |
| `GET`  | `/api/orders/:code`   | Order summary by human-readable code          |

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
`AdminUser` (`OWNER` / `STAFF`, argon2 password hashes). See
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
