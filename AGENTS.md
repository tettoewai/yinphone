<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI components: use shadcn, don't rebuild it

This repo is a shadcn monorepo. `components.json` exists in `apps/web` and `packages/ui` (shared style: `base-nova`, `@base-ui/react` primitives, `lucide` icons).

**Before writing any UI component, check whether shadcn already ships it. If it does, add it instead of hand-rolling one.**

- Shared components live in `packages/ui/src/components` and import as `@workspace/ui/components/<name>`. Add there by default so both `apps/web` and `apps/admin` can use them.
- Add via the pinned CLI (`shadcn` is a dependency of `packages/ui`, currently v4.23.0). Run it from the package that owns `components.json`:
  - `cd packages/ui && pnpm exec shadcn add <component>` — shared components (default)
  - `cd apps/web && pnpm exec shadcn add <component>` — view-local components for the storefront
  - Do not use `pnpm dlx shadcn@latest`; the pinned version matches the `base-nova` style the generated primitives expect.
- Check the target before writing: `pnpm exec shadcn add <component> --dry-run`.
- If the registry component is close but not exact, **copy it in and customize it** — extend the `cva` variants, add props, adjust classes. Do not discard it and write a replacement.
- Only write a component from scratch when shadcn genuinely has no equivalent, and say so in your summary.
- Components already written from scratch should be migrated to their shadcn counterpart when you touch them (e.g. the hand-rolled `bottom-sheet`, `filter-sheet`, `size-guide-dialog` → `Sheet` / `Dialog`).

Known deviations already in this repo: `packages/ui/src/lib/utils.ts` re-exports `cn` from the `cn` npm package rather than `clsx` + `tailwind-merge`. Leave that alone unless the task is about it, but keep new components using `cn` from `@workspace/ui/lib/utils`.
