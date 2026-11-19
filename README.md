# YinPhone Boutique

Turborepo monorepo with two Next.js apps, a NestJS API and shared packages.

## Structure

```
apps/
  web      Next.js storefront        http://localhost:3000
  admin    Next.js admin dashboard   http://localhost:3001
  api      NestJS API (ESM)          http://localhost:4000
packages/
  ui                 shadcn/ui components, hooks, lib and Tailwind theme (source-only)
  eslint-config      shared flat ESLint configs
  typescript-config  shared tsconfigs
```

`packages/ui` is consumed as source: apps point `transpilePackages` at it and
import from `@workspace/ui/*`. It has no build step.

## Requirements

- Node.js >= 20.9.0
- pnpm 11 (`corepack enable`)

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
```

Scope to a single app with a filter:

```bash
pnpm turbo dev --filter=api
pnpm turbo build --filter=web...
```

## Adding UI components

Run from the app that will use them:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Components are written to `packages/ui/src/components` and imported via:

```tsx
import { Button } from "@workspace/ui/components/button"
```

## Environment variables

`.env*` files are gitignored; `.env.example` is committed. Variables that
affect a build must be declared in `turbo.json` (`env` / `globalEnv`), otherwise
Turbo may reuse a cache entry produced with different values. `NEXT_PUBLIC_*`
is already declared for `build`.
