# `@workspace/eslint-config`

Shared eslint configuration for the workspace.

TypeScript sources are parsed by `@babel/eslint-parser` with the `typescript` and
`jsx` parser plugins. The core `no-undef` and `no-unused-vars` rules are switched
off for `.ts`/`.tsx` because they cannot see through type annotations; `tsc
--noEmit` (run by `pnpm typecheck`) covers both checks instead.
